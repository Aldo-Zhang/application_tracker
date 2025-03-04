"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { CheckCircle2, Circle, Trophy } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Problem = {
  id: string
  name: string
  difficulty: "Easy" | "Medium" | "Hard"
  completed: boolean
  url?: string
}

export function LeetcodeTracker() {
  const { data: session } = useSession()
  const [dailyGoal, setDailyGoal] = useState(3)
  const [problems, setProblems] = useState<Problem[]>([])
  const [isAddProblemOpen, setIsAddProblemOpen] = useState(false)
  const [newProblem, setNewProblem] = useState<Partial<Problem>>({
    name: "",
    difficulty: "Medium",
    completed: false,
    url: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  const completedCount = problems.filter((p) => p.completed).length
  const progress = Math.min(100, (completedCount / dailyGoal) * 100)
  const goalReached = completedCount >= dailyGoal

  // 获取用户问题列表
  useEffect(() => {
    async function fetchProblems() {
      if (session?.user) {
        try {
          const response = await fetch("/api/problems")
          if (response.ok) {
            const data = await response.json()
            setProblems(data)
          }
        } catch (error) {
          console.error("Error fetching problems:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        // 未登录用户使用示例数据
        setProblems([
          { id: "1", name: "Two Sum", difficulty: "Easy", completed: true, url: "https://leetcode.com/problems/two-sum/" },
          {
            id: "2",
            name: "Add Two Numbers",
            difficulty: "Medium",
            completed: false,
            url: "https://leetcode.com/problems/add-two-numbers/",
          },
        ])
        setIsLoading(false)
      }
    }

    fetchProblems()
  }, [session])

  // 添加问题
  const handleAddProblem = async () => {
    if (!newProblem.name) return
    if (!session?.user) {
      alert("请先登录")
      return
    }

    try {
      const response = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProblem.name,
          difficulty: newProblem.difficulty,
          url: newProblem.url,
        }),
      })

      if (response.ok) {
        const createdProblem = await response.json()
        setProblems([...problems, createdProblem])
        setNewProblem({
          name: "",
          difficulty: "Medium",
          completed: false,
          url: "",
        })
        setIsAddProblemOpen(false)
      }
    } catch (error) {
      console.error("Error adding problem:", error)
    }
  }

  // 切换问题状态
  const toggleProblemStatus = async (id: string) => {
    if (!session?.user) return
    
    const problem = problems.find(p => p.id === id)
    if (!problem) return

    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !problem.completed,
        }),
      })

      if (response.ok) {
        setProblems(
          problems.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
        )
      }
    } catch (error) {
      console.error("Error toggling problem status:", error)
    }
  }

  // 更新每日目标
  const updateDailyGoal = (value: number) => {
    if (value > 0) {
      setDailyGoal(value)
    }
  }

  // 删除问题
  const deleteProblem = async (id: string) => {
    if (!session?.user) return

    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProblems(problems.filter((problem) => problem.id !== id))
      }
    } catch (error) {
      console.error("Error deleting problem:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>LeetCode 跟踪器</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>LeetCode Tracker</CardTitle>
            <CardDescription>Track your daily coding practice</CardDescription>
          </div>
          {goalReached && <Trophy className="h-6 w-6 text-yellow-500" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Daily Goal: {completedCount}/{dailyGoal} problems
            </h3>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => updateDailyGoal(dailyGoal - 1)}
                disabled={dailyGoal <= 1}
              >
                -
              </Button>
              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateDailyGoal(dailyGoal + 1)}>
                +
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Today&apos;s Problems</h3>
            <Dialog open={isAddProblemOpen} onOpenChange={setIsAddProblemOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Add Problem
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add LeetCode Problem</DialogTitle>
                  <DialogDescription>Add a new problem to your daily tracking list</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="problem-name" className="text-right">
                      Problem
                    </Label>
                    <Input
                      id="problem-name"
                      value={newProblem.name}
                      onChange={(e) => setNewProblem({ ...newProblem, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="difficulty" className="text-right">
                      Difficulty
                    </Label>
                    <Select
                      value={newProblem.difficulty}
                      onValueChange={(value) =>
                        setNewProblem({ ...newProblem, difficulty: value as "Easy" | "Medium" | "Hard" })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="problem-url" className="text-right">
                      URL
                    </Label>
                    <Input
                      id="problem-url"
                      value={newProblem.url}
                      onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })}
                      className="col-span-3"
                      placeholder="https://leetcode.com/problems/..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddProblem}>
                    Add Problem
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {problems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No problems added yet. Click &quot;Add Problem&quot; to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {problems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => toggleProblemStatus(problem.id)}>
                      {problem.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div>
                      {problem.url ? (
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                        >
                          {problem.name}
                        </a>
                      ) : (
                        <span className="font-medium">{problem.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        problem.difficulty === "Easy"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : problem.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive/90"
                      onClick={() => deleteProblem(problem.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash-2"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        {goalReached ? (
          <div className="flex w-full items-center justify-center space-x-2 text-center">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-green-600 dark:text-green-400">
              Congratulations! You&apos;ve reached your daily goal!
            </span>
          </div>
        ) : (
          <div className="text-center w-full text-sm text-muted-foreground">
            {dailyGoal - completedCount} more problem{dailyGoal - completedCount !== 1 ? "s" : ""} to reach your daily
            goal
          </div>
        )}
      </CardFooter>
    </Card>
  )
}


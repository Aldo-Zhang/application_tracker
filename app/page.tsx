"use client"

import { CalendarTracker } from "@/components/calendar-tracker"
import { LeetcodeTracker } from "@/components/leetcode-tracker"
import { CompanyTracker } from "@/components/company-tracker"
import { ModeToggle } from "@/components/mode-toggle"
import { DataTransfer } from "@/components/data-transfer"
import { ToastProvider } from "@/components/ui/use-toast"
import { Github } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CompanyApplication } from "@/components/company-tracker"

export default function Home() {
  const [showCalendarConfirm, setShowCalendarConfirm] = useState(false)
  const [tempApplication, setTempApplication] = useState<CompanyApplication | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newApplication, setNewApplication] = useState<Partial<CompanyApplication>>({
    companyName: "",
    position: "",
    dateApplied: new Date(),
    status: "Applied",
    notes: ""
  })

  // 添加应用程序到 localStorage
  const addApplicationToStorage = (application: CompanyApplication) => {
    const savedApplications = localStorage.getItem('company-applications')
    const applications = savedApplications ? JSON.parse(savedApplications) : []
    const applicationsToSave = [...applications, {
      ...application,
      dateApplied: application.dateApplied.toISOString()
    }]
    localStorage.setItem('company-applications', JSON.stringify(applicationsToSave))
  }

  const handleAddApplication = () => {
    if (!newApplication.companyName || !newApplication.position) return

    const application: CompanyApplication = {
      id: Date.now().toString(),
      companyName: newApplication.companyName,
      position: newApplication.position,
      dateApplied: newApplication.dateApplied || new Date(),
      status: newApplication.status as CompanyApplication["status"],
      notes: newApplication.notes
    }

    setTempApplication(application)
    setShowCalendarConfirm(true)
    setIsAddDialogOpen(false)
  }

  const resetNewApplication = () => {
    setNewApplication({
      companyName: "",
      position: "",
      dateApplied: new Date(),
      status: "Applied",
      notes: ""
    })
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">JobTrack</h1>
              <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">Beta</span>
            </div>
            <div className="flex items-center gap-2">
              <DataTransfer />
              <ModeToggle />
            </div>
          </div>
        </header>
        <main 
          className="container py-6 flex-grow"
          style={{ 
            containIntrinsicSize: '0 500px',
            contentVisibility: 'auto',
          }}
        >
          <section className="mb-8 space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Application Tracker</h2>
              <p className="text-muted-foreground">Track your internship and full-time job applications in one place.</p>
            </div>
            <div className="grid gap-6">
              <CompanyTracker />
              
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-[1fr_300px]">
                <CalendarTracker />
                <LeetcodeTracker />
              </div>
            </div>
          </section>
        </main>
        <footer className="py-6 border-t">
          <div className="container flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} JobTrack. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <p>Developed by Aldo</p>
              <a 
                href="https://github.com/Aldo-Zhang"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center hover:text-foreground transition-colors"
              >
                <Github size={16} className="mr-1" />
                @Aldo-Zhang
              </a>
            </div>
          </div>
        </footer>
        <Dialog open={showCalendarConfirm} onOpenChange={setShowCalendarConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Calendar Tracker?</DialogTitle>
              <DialogDescription>
                Would you like to add this application to the Calendar Tracker as well?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (tempApplication) {
                    addApplicationToStorage(tempApplication)
                    setTempApplication(null)
                  }
                  setShowCalendarConfirm(false)
                  resetNewApplication()
                }}
              >
                Add Application Only
              </Button>
              <Button
                onClick={() => {
                  if (tempApplication) {
                    // 添加到应用程序列表
                    addApplicationToStorage(tempApplication)
                    
                    // 创建日历事件
                    const calendarEvent = {
                      id: Date.now().toString(),
                      date: tempApplication.dateApplied,
                      company: tempApplication.companyName,
                      position: tempApplication.position,
                      step: "Application Submitted", // 使用 processSteps 中的第一个状态
                      actionItems: [],
                      link: "",
                      notes: tempApplication.notes || ""
                    }
                    
                    // 添加到日历事件
                    const existingEvents = localStorage.getItem('calendar-events')
                    const events = existingEvents ? JSON.parse(existingEvents) : []
                    const updatedEvents = [...events, calendarEvent]
                    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents))
                    
                    // 强制刷新日历事件
                    window.dispatchEvent(new Event('storage'))
                    
                    setTempApplication(null)
                  }
                  setShowCalendarConfirm(false)
                  resetNewApplication()
                }}
              >
                Add to Calendar as Well
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ToastProvider>
  )
}
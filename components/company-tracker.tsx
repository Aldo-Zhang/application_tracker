"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Plus, Search, Building, CalendarIcon, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DayPicker } from "react-day-picker"

type CompanyApplication = {
  id: string
  companyName: string
  position: string
  dateApplied: Date
  status: "Applied" | "Interviewing" | "Rejected" | "Offer Received" | "Accepted" | 
          "Online Assessment" | "Phone Screen" | "Interview" | "Final Round" | 
          "Offer" | "Withdrawn"
  notes?: string
}

// Default data to ensure consistent server/client rendering
const defaultApplications: CompanyApplication[] = [
  {
    id: "1",
    companyName: "Example Tech",
    position: "Frontend Developer",
    dateApplied: new Date(),
    status: "Applied",
    notes: "Applied via company website",
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case "Applied":
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    case "Interviewing":
      return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
    case "Rejected":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    case "Offer Received":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    case "Accepted":
      return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
  }
}

export function CompanyTracker() {
  // Initialize state with default values
  const [applications, setApplications] = useState<CompanyApplication[]>(defaultApplications)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newApplication, setNewApplication] = useState<Partial<CompanyApplication>>({
    companyName: "",
    position: "",
    dateApplied: new Date(),
    status: "Applied",
    notes: ""
  })

  // Load data from localStorage on client-side only
  useEffect(() => {
    const savedApplications = localStorage.getItem('company-applications')
    if (savedApplications) {
      try {
        const parsedApplications = JSON.parse(savedApplications)
        // @ts-expect-error app not typed
        const processedApplications = parsedApplications.map((app) => ({
          ...app,
          dateApplied: new Date(app.dateApplied)
        }))
        setApplications(processedApplications)
      } catch (e) {
        console.error('Error parsing saved applications:', e)
      }
    }
  }, [])

  // Save to localStorage when applications change
  useEffect(() => {
    if (typeof window !== 'undefined' && applications !== defaultApplications) {
      try {
        const applicationsToSave = applications.map(app => ({
          ...app,
          dateApplied: app.dateApplied.toISOString()
        }))
        localStorage.setItem('company-applications', JSON.stringify(applicationsToSave))
      } catch (e) {
        console.error('Error saving applications:', e)
      }
    }
  }, [applications])

  const handleAddApplication = () => {
    if (!newApplication.companyName || !newApplication.position) return

    const application: CompanyApplication = {
      id: Date.now().toString(),
      companyName: newApplication.companyName,
      position: newApplication.position,
      dateApplied: newApplication.dateApplied || new Date(),
      status: newApplication.status as "Applied" | "Interviewing" | "Rejected" | "Offer Received" | "Accepted" | 
              "Online Assessment" | "Phone Screen" | "Interview" | "Final Round" | 
              "Offer" | "Withdrawn",
      notes: newApplication.notes
    }

    setApplications([...applications, application])
    setNewApplication({
      companyName: "",
      position: "",
      dateApplied: new Date(),
      status: "Applied",
      notes: ""
    })
    setIsAddDialogOpen(false)
  }

  const deleteApplication = (id: string) => {
    setApplications(applications.filter(app => app.id !== id))
  }

  const updateApplicationStatus = (id: string, status: CompanyApplication["status"]) => {
    setApplications(
      applications.map(app => app.id === id ? { ...app, status } : app)
    )
  }

  const filteredApplications = applications.filter(app => 
    app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group applications by company
  const groupedByCompany: Record<string, CompanyApplication[]> = {}
  filteredApplications.forEach(app => {
    if (!groupedByCompany[app.companyName]) {
      groupedByCompany[app.companyName] = []
    }
    groupedByCompany[app.companyName].push(app)
  })

  // Calculate statistics
  const totalApplications = applications.length
  const interviewCount = applications.filter(app => app.status === "Interviewing").length
  const offerCount = applications.filter(app => app.status === "Offer Received" || app.status === "Accepted").length

  // Filter companies based on search term (旧版本的过滤逻辑)
  const oldFilteredCompanies = searchTerm
    ? Object.entries(groupedByCompany)
        .filter(([company]) => company.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(([company, apps]) => ({ company, apps }))
    : Object.entries(groupedByCompany)
        .map(([company, apps]) => ({ company, apps }))

  // 分组应用的逻辑保持不变
  const groupedApplications = applications.reduce((groups, app) => {
    const key = app.companyName;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(app);
    return groups;
  }, {} as Record<string, CompanyApplication[]>);

  // 将分组转换为数组形式，用于渲染
  const groupedCompanies = Object.entries(groupedApplications).map(([companyName, apps]) => ({
    companyName,
    applications: apps
  }));

  // 过滤搜索结果
  const filteredCompanies = searchTerm
    ? groupedCompanies
        .map(company => ({
          companyName: company.companyName,
          applications: company.applications.filter(
            app => 
              app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              app.position.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }))
        .filter(company => company.applications.length > 0)
    : groupedCompanies;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Company Applications</CardTitle>
            <CardDescription>Keep track of your job applications</CardDescription>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <div className="text-sm font-medium flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                Total: {totalApplications}
              </Badge>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                Interviewing: {interviewCount}
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Offers: {offerCount}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No applications found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? "Try a different search term or " : "Start by "}
              <Button variant="link" className="h-auto p-0" onClick={() => setIsAddDialogOpen(true)}>
                adding your first application
              </Button>
            </p>
          </div>
        ) : (
          <div className="space-y-8 max-h-[600px] overflow-auto pr-1">
            {filteredCompanies.map((company) => (
              <div key={company.companyName} className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center sticky top-0 bg-card z-10 py-2">
                  <Building className="mr-2 h-4 w-4" />
                  {company.companyName}
                </h3>
                <div className="space-y-4 pl-1">
                  {company.applications.map((app) => (
                    <div 
                      key={app.id} 
                      className="border rounded-md p-4 shadow-sm space-y-3 relative"
                      style={{zIndex: 1}}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4 flex-shrink-0" />
                          <h4 className="font-medium">{app.position}</h4>
                        </div>
                        <Badge 
                          className={cn(
                            app.status === "Applied" && "bg-blue-500",
                            app.status === "Online Assessment" && "bg-purple-500",
                            app.status === "Phone Screen" && "bg-yellow-500",
                            app.status === "Interview" && "bg-amber-500",
                            app.status === "Final Round" && "bg-orange-500",
                            app.status === "Offer" && "bg-green-500",
                            app.status === "Rejected" && "bg-red-500",
                            app.status === "Withdrawn" && "bg-gray-500",
                          )}
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        Applied on {format(app.dateApplied, "MMM d, yyyy")}
                      </div>
                      {app.notes && (
                        <div className="text-sm border-t pt-2 mt-2">
                          {app.notes}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <Select
                          value={app.status}
                          onValueChange={(value) => {
                            const updatedApplications = applications.map((a) =>
                              a.id === app.id ? { ...a, status: value as CompanyApplication["status"] } : a
                            );
                            setApplications(updatedApplications);
                          }}
                        >
                          <SelectTrigger className="w-[160px] h-8">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Online Assessment">Online Assessment</SelectItem>
                            <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Final Round">Final Round</SelectItem>
                            <SelectItem value="Offer">Offer</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const updatedApplications = applications.filter((a) => a.id !== app.id);
                            setApplications(updatedApplications);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Job Application</DialogTitle>
            <DialogDescription>
              Record details about a job you&apos;ve applied for
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">
                Company
              </Label>
              <Input
                id="companyName"
                value={newApplication.companyName}
                onChange={(e) => setNewApplication({ ...newApplication, companyName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input
                id="position"
                value={newApplication.position}
                onChange={(e) => setNewApplication({ ...newApplication, position: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Date Applied
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newApplication.dateApplied ? (
                        format(newApplication.dateApplied, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DayPicker
                      mode="single"
                      selected={newApplication.dateApplied}
                      onSelect={(date) => setNewApplication({ ...newApplication, dateApplied: date || new Date() })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newApplication.status}
                onValueChange={(value) => 
                  setNewApplication({ 
                    ...newApplication, 
                    status: value as "Applied" | "Interviewing" | "Rejected" | "Offer Received" | "Accepted" | 
                            "Online Assessment" | "Phone Screen" | "Interview" | "Final Round" | 
                            "Offer" | "Withdrawn" 
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interviewing">Interviewing</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Offer Received">Offer Received</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <textarea
                id="notes"
                value={newApplication.notes}
                onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                className="col-span-3 min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddApplication}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 
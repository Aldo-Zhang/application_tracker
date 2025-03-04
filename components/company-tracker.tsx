"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Plus, Search, Building, CalendarIcon, Briefcase } from "lucide-react"

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
  status: "Applied" | "Interviewing" | "Rejected" | "Offer Received" | "Accepted"
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
      status: newApplication.status as "Applied" | "Interviewing" | "Rejected" | "Offer Received" | "Accepted",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl md:text-2xl">Company Applications</CardTitle>
            <CardDescription>
              Track and manage your job applications
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-background rounded-lg border px-3 py-1.5">
              <span className="text-sm font-medium">{totalApplications}</span>
              <span className="text-xs text-muted-foreground">Applications</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background rounded-lg border px-3 py-1.5">
              <span className="text-sm font-medium">{interviewCount}</span>
              <span className="text-xs text-muted-foreground">Interviews</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background rounded-lg border px-3 py-1.5">
              <span className="text-sm font-medium">{offerCount}</span>
              <span className="text-xs text-muted-foreground">Offers</span>
            </div>
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
                          status: value as "Applied" | "Interviewing" | "Rejected" | "Offer Received" | "Accepted" 
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies or positions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {Object.keys(groupedByCompany).length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Building className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No applications added yet. Click &quot;Add Application&quot; to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCompany).map(([company, apps]) => (
              <div key={company} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  <h3 className="text-lg font-medium">{company}</h3>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({apps.length} {apps.length === 1 ? 'position' : 'positions'})
                  </span>
                </div>
                <div className="space-y-3">
                  {apps.map((app) => (
                    <div key={app.id} className="flex flex-col space-y-2 rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{app.position}</span>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          Applied on {format(app.dateApplied, "yyyy-MM-dd")}
                        </div>
                        {app.notes && (
                          <div className="flex-1 truncate">
                            Notes: {app.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Select
                          value={app.status}
                          onValueChange={(value) => 
                            updateApplicationStatus(
                              app.id, 
                              value as "Applied" | "Interviewing" | "Rejected" | "Offer Received" | "Accepted"
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Interviewing">Interviewing</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Offer Received">Offer Received</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 text-destructive"
                          onClick={() => deleteApplication(app.id)}
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
    </Card>
  )
} 
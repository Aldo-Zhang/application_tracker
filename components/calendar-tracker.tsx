"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

type JobEvent = {
  id: string
  date: Date
  company: string
  position: string
  step: string
  actionItems: { id: string; text: string; completed: boolean; deadline?: Date }[]
  link?: string
  notes?: string
}

const processSteps = [
  "Application Submitted",
  "Online Assessment",
  "Phone Screen",
  "Interview Round 1",
  "Interview Round 2",
  "Final Round",
  "Waiting for Decision",
  "Offer Received",
  "Rejected",
]

// 默认事件数据
const defaultEvents = [
  {
    id: "1",
    date: new Date(),
    company: "Tech Corp",
    position: "Software Engineer Intern",
    step: "Online Assessment",
    actionItems: [
      { id: "task1", text: "Complete coding challenge", completed: false, deadline: undefined },
      { id: "task2", text: "Review algorithms", completed: true, deadline: undefined },
    ],
    link: "https://example.com/assessment",
    notes: "Assessment focuses on algorithms and data structures",
  },
]

export function CalendarTracker() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<JobEvent[]>(defaultEvents)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<JobEvent | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<JobEvent>>({
    date: new Date(),
    company: "",
    position: "",
    step: "",
    actionItems: [],
    link: "",
    notes: "",
  })
  const [newActionItem, setNewActionItem] = useState("")
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // 客户端加载后获取本地存储的数据
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events')
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents)
        // 处理日期对象
        const processedEvents = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          actionItems: event.actionItems.map((item: any) => ({
            ...item,
            deadline: item.deadline ? new Date(item.deadline) : undefined
          }))
        }))
        setEvents(processedEvents)
      } catch (e) {
        console.error('Error parsing saved events:', e)
      }
    }
  }, [])
  
  // 保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && events !== defaultEvents) {
      try {
        // 处理Date对象序列化
        const eventsToSave = events.map(event => ({
          ...event,
          date: event.date.toISOString(),
          actionItems: event.actionItems.map(item => ({
            ...item,
            deadline: item.deadline ? item.deadline.toISOString() : undefined
          }))
        }))
        localStorage.setItem('calendar-events', JSON.stringify(eventsToSave))
      } catch (e) {
        console.error('Error saving events:', e)
      }
    }
  }, [events])

  const selectedDayEvents = events.filter(
    (event) => selectedDay && event.date.toDateString() === selectedDay.toDateString(),
  )

  const handleAddEvent = () => {
    if (!newEvent.company || !newEvent.position || !newEvent.step) return

    const event: JobEvent = {
      id: Date.now().toString(),
      date: selectedDay || new Date(),
      company: newEvent.company || "",
      position: newEvent.position || "",
      step: newEvent.step || "",
      actionItems: newEvent.actionItems || [],
      link: newEvent.link,
      notes: newEvent.notes,
    }

    setEvents([...events, event])
    resetNewEvent()
    setIsAddEventOpen(false)
  }

  const handleEditEvent = () => {
    if (!currentEvent || !currentEvent.company || !currentEvent.position || !currentEvent.step) return

    setEvents(events.map((event) => (event.id === currentEvent.id ? currentEvent : event)))
    setIsEditEventOpen(false)
    setCurrentEvent(null)
  }

  const handleAddActionItem = () => {
    if (!newActionItem) return

    const updatedEvent = isEditEventOpen ? currentEvent : newEvent
    const updatedActionItems = [
      ...(updatedEvent?.actionItems || []),
      {
        id: Date.now().toString(),
        text: newActionItem,
        completed: false,
        deadline: undefined,
      },
    ]

    if (isEditEventOpen && currentEvent) {
      setCurrentEvent({ ...currentEvent, actionItems: updatedActionItems })
    } else {
      setNewEvent({ ...newEvent, actionItems: updatedActionItems })
    }
    setNewActionItem("")
  }

  const handleRemoveActionItem = (id: string) => {
    const updatedEvent = isEditEventOpen ? currentEvent : newEvent
    const updatedActionItems = (updatedEvent?.actionItems || []).filter((item) => item.id !== id)

    if (isEditEventOpen && currentEvent) {
      setCurrentEvent({ ...currentEvent, actionItems: updatedActionItems })
    } else {
      setNewEvent({ ...newEvent, actionItems: updatedActionItems })
    }
  }


  const handleToggleActionItem = (eventId: string, taskId: string) => {
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          return {
            ...event,
            actionItems: event.actionItems.map((item) => {
              if (item.id === taskId) {
                return { ...item, completed: !item.completed }
              }
              return item
            }),
          }
        }
        return event
      }),
    )
  }

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
  }

  const setActionItemDeadline = (itemId: string, deadline: Date | undefined) => {
    const updatedEvent = isEditEventOpen ? currentEvent : newEvent
    const updatedActionItems = (updatedEvent?.actionItems || []).map((item) =>
      item.id === itemId ? { ...item, deadline } : item,
    )

    if (isEditEventOpen && currentEvent) {
      setCurrentEvent({ ...currentEvent, actionItems: updatedActionItems })
    } else {
      setNewEvent({ ...newEvent, actionItems: updatedActionItems })
    }
  }

  const resetNewEvent = () => {
    setNewEvent({
      date: new Date(),
      company: "",
      position: "",
      step: "",
      actionItems: [],
      link: "",
      notes: "",
    })
  }

  const openEditEvent = (event: JobEvent) => {
    setCurrentEvent({ ...event })
    setIsEditEventOpen(true)
  }

  // Function to get event badge color based on process step
  const getStepColor = (step: string) => {
    switch (step) {
      case "Application Submitted":
        return "bg-blue-500 hover:bg-blue-600"
      case "Online Assessment":
        return "bg-purple-500 hover:bg-purple-600"
      case "Phone Screen":
      case "Interview Round 1":
      case "Interview Round 2":
      case "Final Round":
        return "bg-amber-500 hover:bg-amber-600"
      case "Waiting for Decision":
        return "bg-gray-500 hover:bg-gray-600"
      case "Offer Received":
        return "bg-green-500 hover:bg-green-600"
      case "Rejected":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-primary hover:bg-primary/90"
    }
  }

  // Function to render days with events
  const renderDayContent = (day: Date) => {
    const dayEvents = events.filter((event) => event.date.toDateString() === day.toDateString())

    if (dayEvents.length === 0) return null

    return (
      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
        <div className="flex gap-0.5">
          {dayEvents.slice(0, 3).map((event, i) => (
            <div key={i} className={cn("h-1.5 w-1.5 rounded-full", getStepColor(event.step))} />
          ))}
          {dayEvents.length > 3 && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </div>
      </div>
    )
  }

  const renderFullCalendar = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(calendarMonth),
      end: endOfMonth(calendarMonth),
    })

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{format(calendarMonth, "MMMM yyyy")}</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCalendarMonth((prevMonth) => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCalendarMonth((prevMonth) => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayEvents = events.filter((event) => event.date.toDateString() === day.toDateString())
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "h-24 border rounded-lg p-1 overflow-hidden",
                  day.getMonth() !== calendarMonth.getMonth() && "opacity-50",
                  selectedDay?.toDateString() === day.toDateString() && "bg-muted",
                )}
                onClick={() => setSelectedDay(day)}
              >
                <div className="font-medium text-sm">{format(day, "d")}</div>
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={cn("text-xs truncate rounded px-1 py-0.5", getStepColor(event.step))}
                    >
                      {event.company}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Calendar Tracker</CardTitle>
        <CardDescription>Track your job application process and upcoming events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDay ? format(selectedDay, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DayPicker
                      mode="single"
                      selected={selectedDay}
                      onSelect={setSelectedDay}
                      components={{
                        Day: ({ day, ...props }) => (
                          <div className="relative" {...props}>
                            {day.toString().split('T')[0]}
                            {renderDayContent(new Date(day.toString()))}
                          </div>
                        ),
                      }}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
                <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                  <DialogTrigger asChild>
                    <Button>Add Event</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add Job Application Event</DialogTitle>
                      <DialogDescription>
                        Create a new job application event for {selectedDay ? format(selectedDay, "PPP") : "today"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="company" className="text-right">
                          Company
                        </Label>
                        <Input
                          id="company"
                          value={newEvent.company}
                          onChange={(e) => setNewEvent({ ...newEvent, company: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="position" className="text-right">
                          Position
                        </Label>
                        <Input
                          id="position"
                          value={newEvent.position}
                          onChange={(e) => setNewEvent({ ...newEvent, position: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="step" className="text-right">
                          Process Step
                        </Label>
                        <Select
                          value={newEvent.step}
                          onValueChange={(value) => setNewEvent({ ...newEvent, step: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a step" />
                          </SelectTrigger>
                          <SelectContent>
                            {processSteps.map((step) => (
                              <SelectItem key={step} value={step}>
                                {step}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="link" className="text-right">
                          Link
                        </Label>
                        <Input
                          id="link"
                          value={newEvent.link}
                          onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })}
                          className="col-span-3"
                          placeholder="https://"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="notes" className="text-right pt-2">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={newEvent.notes}
                          onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Action Items</Label>
                        <div className="col-span-3 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={newActionItem}
                              onChange={(e) => setNewActionItem(e.target.value)}
                              placeholder="Add a task"
                              className="flex-1"
                            />
                            <Button type="button" onClick={handleAddActionItem} size="sm">
                              Add
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(newEvent.actionItems || []).map((item) => (
                              <div key={item.id} className="flex flex-col space-y-2 border p-2 rounded-md">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Checkbox id={item.id} checked={item.completed} />
                                    <Label htmlFor={item.id}>{item.text}</Label>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveActionItem(item.id)}>
                                    Remove
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`deadline-${item.id}`} className="text-sm">
                                    Deadline:
                                  </Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        id={`deadline-${item.id}`}
                                        variant="outline"
                                        size="sm"
                                        className="justify-start text-left font-normal h-8"
                                      >
                                        {item.deadline ? format(item.deadline, "PPP") : "Set deadline"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <DayPicker
                                        mode="single"
                                        selected={item.deadline}
                                        onSelect={(date) => setActionItemDeadline(item.id, date)}
                                        className="p-3"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddEvent}>
                        Save Event
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Dialog open={isFullCalendarOpen} onOpenChange={setIsFullCalendarOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">View Full Calendar</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Full Calendar View</DialogTitle>
                    <DialogDescription>View all your job application events in a calendar format</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">{renderFullCalendar()}</div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-6">
              <h3 className="font-medium">Events for {selectedDay ? format(selectedDay, "MMMM d, yyyy") : "Today"}</h3>
              {selectedDayEvents.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
                  <h3 className="font-medium text-muted-foreground">No events for this day</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click &quot;Add Event&quot; to create a new job application event.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {selectedDayEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{event.company}</CardTitle>
                            <CardDescription>{event.position}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn(getStepColor(event.step), "text-white")}>{event.step}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => openEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                              onClick={() => deleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-4">
                          {event.actionItems.length > 0 && (
                            <div>
                              <h4 className="mb-2 font-medium">Action Items:</h4>
                              <div className="space-y-2">
                                {event.actionItems.map((item) => (
                                  <div key={item.id} className="flex flex-col space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${event.id}-${item.id}`}
                                        checked={item.completed}
                                        onCheckedChange={() => handleToggleActionItem(event.id, item.id)}
                                      />
                                      <Label
                                        htmlFor={`${event.id}-${item.id}`}
                                        className={cn(item.completed && "line-through text-muted-foreground")}
                                      >
                                        {item.text}
                                      </Label>
                                    </div>
                                    {item.deadline && (
                                      <div className="ml-6 text-xs text-muted-foreground">
                                        Deadline: {format(item.deadline, "PPP")}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {event.link && (
                            <div>
                              <h4 className="mb-1 font-medium">Link:</h4>
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {event.link}
                              </a>
                            </div>
                          )}
                          {event.notes && (
                            <div>
                              <h4 className="mb-1 font-medium">Notes:</h4>
                              <p className="text-sm text-muted-foreground">{event.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Job Application Event</DialogTitle>
            <DialogDescription>Update the details of your job application event</DialogDescription>
          </DialogHeader>
          {currentEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-company" className="text-right">
                  Company
                </Label>
                <Input
                  id="edit-company"
                  value={currentEvent.company}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, company: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-position" className="text-right">
                  Position
                </Label>
                <Input
                  id="edit-position"
                  value={currentEvent.position}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, position: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-step" className="text-right">
                  Process Step
                </Label>
                <Select
                  value={currentEvent.step}
                  onValueChange={(value) => setCurrentEvent({ ...currentEvent, step: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a step" />
                  </SelectTrigger>
                  <SelectContent>
                    {processSteps.map((step) => (
                      <SelectItem key={step} value={step}>
                        {step}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-link" className="text-right">
                  Link
                </Label>
                <Input
                  id="edit-link"
                  value={currentEvent.link}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, link: e.target.value })}
                  className="col-span-3"
                  placeholder="https://"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  value={currentEvent.notes}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, notes: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Action Items</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newActionItem}
                      onChange={(e) => setNewActionItem(e.target.value)}
                      placeholder="Add a task"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddActionItem} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {currentEvent.actionItems.map((item) => (
                      <div key={item.id} className="flex flex-col space-y-2 border p-2 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`edit-${item.id}`}
                              checked={item.completed}
                              onCheckedChange={() => {
                                setCurrentEvent({
                                  ...currentEvent,
                                  actionItems: currentEvent.actionItems.map((actionItem) =>
                                    actionItem.id === item.id
                                      ? { ...actionItem, completed: !actionItem.completed }
                                      : actionItem,
                                  ),
                                })
                              }}
                            />
                            <Label htmlFor={`edit-${item.id}`}>{item.text}</Label>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveActionItem(item.id)}>
                            Remove
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`edit-deadline-${item.id}`} className="text-sm">
                            Deadline:
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id={`edit-deadline-${item.id}`}
                                variant="outline"
                                size="sm"
                                className="justify-start text-left font-normal h-8"
                              >
                                {item.deadline ? format(item.deadline, "PPP") : "Set deadline"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <DayPicker
                                mode="single"
                                selected={item.deadline}
                                onSelect={(date) => setActionItemDeadline(item.id, date)}
                                className="p-3"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditEvent}>
              Update Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


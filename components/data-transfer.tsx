"use client"

import { useState } from "react"
import { Download, Upload, AlertCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export function DataTransfer() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  
  const exportData = () => {
    try {
      // Collect all data from localStorage
      const dataToExport = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
          companyApplications: localStorage.getItem('company-applications'),
          calendarEvents: localStorage.getItem('calendar-events'),
          leetcodeProblems: localStorage.getItem('leetcode-problems'),
          leetcodeDailyGoal: localStorage.getItem('leetcode-daily-goal'),
        }
      }
      
      // Convert to JSON
      const jsonData = JSON.stringify(dataToExport, null, 2)
      
      // Create downloadable file
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Create download link and trigger download
      const a = document.createElement('a')
      a.href = url
      a.download = `jobtrack-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful",
        description: "Your data has been exported successfully.",
      })
      
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your data.",
      })
    }
  }
  
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)
        
        // Validate data structure
        if (!importedData.version || !importedData.data) {
          throw new Error("Invalid data format")
        }
        
        // Import data to localStorage
        if (importedData.data.companyApplications) {
          localStorage.setItem('company-applications', importedData.data.companyApplications)
        }
        
        if (importedData.data.calendarEvents) {
          localStorage.setItem('calendar-events', importedData.data.calendarEvents)
        }
        
        if (importedData.data.leetcodeProblems) {
          localStorage.setItem('leetcode-problems', importedData.data.leetcodeProblems)
        }
        
        if (importedData.data.leetcodeDailyGoal) {
          localStorage.setItem('leetcode-daily-goal', importedData.data.leetcodeDailyGoal)
        }
        
        toast({
          title: "Import successful",
          description: "Please refresh the page to see your imported data.",
        })
        
        setIsOpen(false)
      } catch (error) {
        console.error('Import error:', error)
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "The file format is invalid or corrupted.",
        })
      }
    }
    
    reader.readAsText(file)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Export/Import Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Data Transfer</DialogTitle>
          <DialogDescription>
            Export your data to transfer between devices, or import previously exported data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Importing data will overwrite your current data. Please export your current data first if you want to keep it.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-between gap-4">
            <Button 
              onClick={exportData} 
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            
            <div className="flex-1">
              <label htmlFor="import-file">
                <Button asChild className="w-full">
                  <div>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </div>
                </Button>
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importData}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
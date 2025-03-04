"use client"

import { CalendarTracker } from "@/components/calendar-tracker"
import { LeetcodeTracker } from "@/components/leetcode-tracker"
import { CompanyTracker } from "@/components/company-tracker"
import { ModeToggle } from "@/components/mode-toggle"
import { DataTransfer } from "@/components/data-transfer"
import { ToastProvider } from "@/components/ui/use-toast"
import { Github } from "lucide-react"

export default function Home() {
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
      </div>
    </ToastProvider>
  )
}
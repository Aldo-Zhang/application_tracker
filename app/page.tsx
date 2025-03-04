"use client"

import { CalendarTracker } from "@/components/calendar-tracker"
import { LeetcodeTracker } from "@/components/leetcode-tracker"
import { CompanyTracker } from "@/components/company-tracker"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">JobTrack</h1>
            <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">Beta</span>
          </div>
          <ModeToggle />
        </div>
      </header>
      <main className="container py-6">
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
    </div>
  )
}
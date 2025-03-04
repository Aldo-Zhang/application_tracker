import { CalendarTracker } from "@/components/calendar-tracker"
import { LeetcodeTracker } from "@/components/leetcode-tracker"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <section className="mb-8 space-y-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">应用跟踪器</h2>
            <p className="text-muted-foreground">在一个地方跟踪您的实习和全职工作申请。</p>
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-[1fr_300px]">
            <CalendarTracker />
            <LeetcodeTracker />
          </div>
        </section>
      </main>
    </div>
  )
}


import { Sidebar } from "@/components/layout/sidebar"
import { DashboardModules } from "@/components/dashboard/dashboard-modules"
import { UserMenu } from "@/components/user-menu"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden original:bg-slate-700">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 original:bg-slate-600 original:border-slate-500">
          <div>
            <h1 className="text-2xl font-bold text-foreground original:text-white">Dashboard</h1>
            <p className="text-sm text-muted-foreground original:text-slate-300">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent original:text-slate-300 original:hover:text-white original:hover:bg-slate-500">
              <Bell className="h-5 w-5" />
            </Button>
            <UserMenu />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <DashboardModules />
        </main>
      </div>
    </div>
  )
}

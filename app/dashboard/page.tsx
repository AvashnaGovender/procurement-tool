import { DashboardModules } from "@/components/dashboard/dashboard-modules"
import { UserMenu } from "@/components/user-menu"

export default function DashboardPage() {
  return (
    <>
      {/* Top Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 original:bg-white original:border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-foreground original:text-slate-800">Dashboard</h1>
          <p className="text-sm text-muted-foreground original:text-slate-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <DashboardModules />
      </main>
    </>
  )
}

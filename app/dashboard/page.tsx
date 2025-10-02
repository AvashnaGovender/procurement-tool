import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardModules } from "@/components/dashboard/dashboard-modules"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <DashboardModules />
        </div>
      </main>
    </div>
  )
}

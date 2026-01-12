import { LeadTimeHeader } from "@/components/lead-time/lead-time-header"
import { LeadTimeMetrics } from "@/components/lead-time/lead-time-metrics"
import { LeadTimeTrends } from "@/components/lead-time/lead-time-trends"
import { CategoryLeadTimes } from "@/components/lead-time/category-lead-times"
import { LeadTimeAlerts } from "@/components/lead-time/lead-time-alerts"

export default function LeadTimePage() {
  return (
    <div className="min-h-screen bg-background">
      <LeadTimeHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <LeadTimeMetrics />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <LeadTimeTrends />
            </div>
            <div>
              <LeadTimeAlerts />
            </div>
          </div>
          <CategoryLeadTimes />
        </div>
      </main>
    </div>
  )
}

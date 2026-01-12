import { DeliveryHeader } from "@/components/delivery/delivery-header"
import { DeliveryOverview } from "@/components/delivery/delivery-overview"
import { LeadTimeAnalysis } from "@/components/delivery/lead-time-analysis"
import { DeliveryTracking } from "@/components/delivery/delivery-tracking"
import { OptimizationInsights } from "@/components/delivery/optimization-insights"
import { SupplierDeliveryPerformance } from "@/components/delivery/supplier-delivery-performance"

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-background">
      <DeliveryHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <DeliveryOverview />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LeadTimeAnalysis />
            </div>
            <div>
              <OptimizationInsights />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DeliveryTracking />
            <SupplierDeliveryPerformance />
          </div>
        </div>
      </main>
    </div>
  )
}

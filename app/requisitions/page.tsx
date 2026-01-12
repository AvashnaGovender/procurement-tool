import { RequisitionHeader } from "@/components/requisitions/requisition-header"
import { RequisitionStats } from "@/components/requisitions/requisition-stats"
import { RequisitionList } from "@/components/requisitions/requisition-list"
import { RequisitionFilters } from "@/components/requisitions/requisition-filters"

export default function RequisitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <RequisitionHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <RequisitionStats />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <RequisitionFilters />
            </div>
            <div className="lg:col-span-3">
              <RequisitionList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

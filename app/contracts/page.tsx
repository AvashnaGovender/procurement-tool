import { ContractHeader } from "@/components/contracts/contract-header"
import { ContractOverview } from "@/components/contracts/contract-overview"
import { ContractList } from "@/components/contracts/contract-list"
import { ContractFilters } from "@/components/contracts/contract-filters"
import { RenewalAlerts } from "@/components/contracts/renewal-alerts"

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ContractHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ContractOverview />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <ContractFilters />
              <RenewalAlerts />
            </div>
            <div className="lg:col-span-3">
              <ContractList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

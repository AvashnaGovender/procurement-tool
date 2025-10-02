import { SupplierHeader } from "@/components/suppliers/supplier-header"
import { SupplierStats } from "@/components/suppliers/supplier-stats"
import { SupplierList } from "@/components/suppliers/supplier-list"
import { SupplierFilters } from "@/components/suppliers/supplier-filters"

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <SupplierStats />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <SupplierFilters />
            </div>
            <div className="lg:col-span-3">
              <SupplierList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { SupplierHeader } from "@/components/suppliers/supplier-header"
import { SupplierStats } from "@/components/suppliers/supplier-stats"
import { SupplierList } from "@/components/suppliers/supplier-list"
import { SupplierFilters } from "@/components/suppliers/supplier-filters"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import Link from "next/link"

interface FilterState {
  status: string[]
  category: string
  rating: string
  location: string
}

export default function SuppliersPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    category: "all",
    rating: "any",
    location: "all"
  })

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const isRegularUser = session?.user?.role !== 'PROCUREMENT_MANAGER' && session?.user?.role !== 'ADMIN'

  return (
    <>
      <SupplierHeader onSearchChange={handleSearchChange} searchValue={searchQuery} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {isRegularUser && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Note:</strong> To track the status of suppliers you've initiated, visit the{' '}
                <Link href="/admin/supplier-initiations" className="font-medium underline hover:text-blue-900">
                  Supplier Initiations
                </Link>{' '}
                page where you can see real-time updates on document submissions and approvals.
              </AlertDescription>
            </Alert>
          )}
          <SupplierStats />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <SupplierFilters 
                onFiltersChange={handleFiltersChange}
              />
            </div>
            <div className="lg:col-span-3">
              <SupplierList 
                searchQuery={searchQuery} 
                filters={filters}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

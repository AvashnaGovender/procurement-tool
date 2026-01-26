"use client"

import { SupplierHeader } from "@/components/suppliers/supplier-header"
import { SupplierStats } from "@/components/suppliers/supplier-stats"
import { SupplierList } from "@/components/suppliers/supplier-list"
import { SupplierFilters } from "@/components/suppliers/supplier-filters"
import { useState } from "react"

interface FilterState {
  status: string[]
  category: string
  rating: string
  location: string
}

export default function SuppliersPage() {
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

  return (
    <>
      <SupplierHeader onSearchChange={handleSearchChange} searchValue={searchQuery} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
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

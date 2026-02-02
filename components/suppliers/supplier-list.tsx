"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Phone, Mail, MoreHorizontal, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface Supplier {
  id: string
  supplierCode: string
  companyName: string | null
  contactPerson: string
  contactEmail: string
  contactPhone: string | null
  status: string
  createdAt: string
  natureOfBusiness: string | null
  sector: string
  bbbeeLevel: string | null
  numberOfEmployees: number | null
  airtableData: any
  onboarding?: {
    id: string
    revisionCount: number
    revisionRequested: boolean
    emailSent: boolean
    supplierFormSubmitted: boolean
    currentStep: string
    overallStatus: string
  }
}

interface FilterState {
  status: string[]
  category: string
  rating: string
  location: string
}

interface SupplierListProps {
  searchQuery?: string
  filters?: FilterState
}

export function SupplierList({ searchQuery = "", filters }: SupplierListProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/suppliers/list')
        const data = await response.json()
        
        if (data.success) {
          setSuppliers(data.suppliers)
          // No longer need to extract categories dynamically - using standardized list
        } else {
          setError(data.error || 'Failed to fetch suppliers')
        }
      } catch (err) {
        setError('Failed to fetch suppliers')
        console.error('Error fetching suppliers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  const handleDeleteSupplier = async (supplierId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${companyName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/suppliers/${supplierId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove from local state
        setSuppliers(prev => prev.filter(s => s.id !== supplierId))
        alert(`Supplier "${companyName}" has been successfully deleted.`)
      } else {
        alert(`Failed to delete supplier: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('An error occurred while deleting the supplier.')
    }
  }

  // Filter suppliers based on search query and filters
  useEffect(() => {
    console.log('\n🔄 Starting filter operation...')
    console.log(`   Total suppliers loaded: ${suppliers.length}`)
    console.log(`   Search query: "${searchQuery}"`)
    console.log(`   Filters:`, filters)
    
    let filtered = suppliers

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(supplier => {
        const companyName = supplier.companyName?.toLowerCase() || ''
        const contactPerson = supplier.contactPerson?.toLowerCase() || ''
        const contactEmail = supplier.contactEmail?.toLowerCase() || ''
        const supplierCode = supplier.supplierCode?.toLowerCase() || ''
        const natureOfBusiness = supplier.natureOfBusiness?.toLowerCase() || ''

        return (
          companyName.includes(searchLower) ||
          contactPerson.includes(searchLower) ||
          contactEmail.includes(searchLower) ||
          supplierCode.includes(searchLower) ||
          natureOfBusiness.includes(searchLower)
        )
      })
      console.log(`   After search filter: ${filtered.length} suppliers`)
    }

    // Apply filters
    if (filters) {
      // Status filter
      if (filters.status.length > 0) {
        const beforeCount = filtered.length
        filtered = filtered.filter(supplier => 
          filters.status.includes(supplier.status.toLowerCase())
        )
        console.log(`   Status filter (${filters.status.join(', ')}): ${beforeCount} → ${filtered.length} suppliers`)
      }

      // Products/Services filter
      if (filters.category && filters.category !== 'all') {
        console.log(`\n   🎯 Category filter active: "${filters.category}"`)
        console.log(`   Checking ${filtered.length} suppliers...`)
        
        filtered = filtered.filter(supplier => {
          const sectorMatch = supplier.sector === filters.category
          const natureMatch = supplier.natureOfBusiness === filters.category
          const matches = sectorMatch || natureMatch
          
          console.log(`      • ${supplier.companyName || 'N/A'}`)
          console.log(`        - sector: "${supplier.sector || 'NOT SET'}" ${sectorMatch ? '✅' : '❌'}`)
          console.log(`        - natureOfBusiness: "${supplier.natureOfBusiness || 'NOT SET'}" ${natureMatch ? '✅' : '❌'}`)
          console.log(`        - Result: ${matches ? '✅ INCLUDED' : '❌ EXCLUDED'}`)
          
          return matches
        })
        
        console.log(`   After category filter: ${filtered.length} suppliers\n`)
      }

      // Location filter (mock implementation)
      if (filters.location && filters.location !== 'all') {
        filtered = filtered.filter(supplier => {
          const location = getSupplierLocation(supplier).toLowerCase()
          if (filters.location === 'local') {
            return location.includes('south africa') || location.includes('cape town') || location.includes('johannesburg')
          } else if (filters.location === 'national') {
            return location.includes('south africa') && !location.includes('cape town') && !location.includes('johannesburg')
          } else if (filters.location === 'international') {
            return !location.includes('south africa')
          }
          return true
        })
      }
    }

    console.log(`\n✅ Final result: ${filtered.length} suppliers after all filters`)
    setFilteredSuppliers(filtered)
  }, [suppliers, searchQuery, filters])

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'under_review':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatStatus = (status: string) => {
    return status.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getSupplierDisplayName = (supplier: Supplier) => {
    return supplier.companyName || supplier.contactPerson || 'Unknown Supplier'
  }

  const getSupplierCategory = (supplier: Supplier) => {
    return supplier.natureOfBusiness || 'Other'
  }

  const getSupplierLocation = (supplier: Supplier) => {
    // Try to extract location from airtable data or use default
    if (supplier.airtableData?.physicalAddress) {
      return supplier.airtableData.physicalAddress
    }
    return 'South Africa' // Default location
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Suppliers</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded animate-pulse w-48 mb-2"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-32 mb-2"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-64"></div>
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Suppliers</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">Failed to load suppliers</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Suppliers ({filteredSuppliers.length}{searchQuery && ` of ${suppliers.length}`})
        </h2>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery ? 'No suppliers match your search' : 'No suppliers found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first supplier'}
          </p>
          <Button asChild>
            <Link href="/suppliers/onboard">
              Add Supplier
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => {
            const displayName = getSupplierDisplayName(supplier)
            const initials = displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
            
            // Check if user can view supplier details (PM or Admin only)
            const canViewDetails = session?.user?.role === 'PROCUREMENT_MANAGER' || session?.user?.role === 'ADMIN'
            const handleCardClick = canViewDetails ? () => router.push(`/admin/supplier-submissions/${supplier.id}`) : undefined
            
            return (
              <Card key={supplier.id} className={`bg-card border-border transition-all ${canViewDetails ? 'hover:bg-accent/50 cursor-pointer' : ''}`}>
                <CardContent className="p-6" onClick={handleCardClick}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
                          <Badge variant={getStatusBadgeVariant(supplier.status)}>
                            {formatStatus(supplier.status)}
                      </Badge>
                    </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getSupplierCategory(supplier)} • {supplier.supplierCode}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                            <span>{getSupplierLocation(supplier)}</span>
                      </div>
                          {supplier.contactPhone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                              <span>{supplier.contactPhone}</span>
                      </div>
                          )}
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                            <span>{supplier.contactEmail}</span>
                      </div>
                          {supplier.bbbeeLevel && (
                            <div className="flex items-center space-x-1">
                              <span>BBBEE: {supplier.bbbeeLevel}</span>
                            </div>
                          )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        {canViewDetails ? (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/supplier-submissions/${supplier.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/supplier-submissions/${supplier.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Supplier
                              </Link>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem disabled>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details (PM Only)
                          </DropdownMenuItem>
                        )}
                    {session?.user?.role === 'ADMIN' && (
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSupplier(supplier.id, supplier.companyName || 'Unknown')
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
            )
          })}
      </div>
      )}
    </div>
  )
}

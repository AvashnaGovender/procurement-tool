"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Loader2, 
  Eye, 
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Home,
  ClipboardList,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { SupplierInitiationStatus } from "@/components/suppliers/supplier-initiation-status"

// Helper function to get currency symbol
function getCurrencySymbol(currency: string | null | undefined, supplierLocation: string | null | undefined): string {
  if (!currency || supplierLocation === 'LOCAL') {
    return 'R'
  }
  
  switch (currency.toUpperCase()) {
    case 'USD': return '$'
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'ZAR': return 'R'
    default: return currency.toUpperCase() + ' '
  }
}

// Helper function to format annual purchase value as a range
function formatAnnualPurchaseValue(value: number | null | undefined, currency: string | null | undefined, supplierLocation: string | null | undefined): string {
  if (!value) return ''
  
  console.log('Formatting annual purchase value:', { value, currency, supplierLocation })
  const symbol = getCurrencySymbol(currency, supplierLocation)
  console.log('Currency symbol:', symbol)
  
  if (value <= 100000) {
    return `${symbol}0 - ${symbol}100,000`
  } else if (value <= 500000) {
    return `${symbol}100,000 - ${symbol}500,000`
  } else if (value <= 1000000) {
    return `${symbol}500,000 - ${symbol}1,000,000`
  } else {
    return `${symbol}1,000,000+`
  }
}

interface Supplier {
  id: string
  supplierCode: string
  companyName: string
  contactPerson: string
  contactEmail: string
  contactPhone: string | null
  status: string
  createdAt: string
  natureOfBusiness: string | null
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

interface SupplierInitiation {
  id: string
  status: string
  supplierName: string
  businessUnit: string
  requesterName: string
  submittedAt: string
  managerApproval?: {
    status: string
    approver: string
    approvedAt?: string
    comments?: string
  }
  procurementApproval?: {
    status: string
    approver: string
    approvedAt?: string
    comments?: string
  }
  regularPurchase: boolean
  annualPurchaseValue?: number
  onceOffPurchase: boolean
  onboardingReason: string
  supplierLocation?: string
  currency?: string
  customCurrency?: string
}

type SortField = 'supplierCode' | 'companyName' | 'contactPerson' | 'contactEmail' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'

export default function SupplierSubmissionsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/suppliers/list')
      const data = await response.json()
      
      if (data.success) {
        setSuppliers(data.suppliers || [])
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initiationToDelete) return

    setDeleting(true)
    try {
      console.log('Attempting to delete initiation:', initiationToDelete.id)
      const response = await fetch(`/api/suppliers/initiation/${initiationToDelete.id}`, {
        method: 'DELETE',
      })

      console.log('Delete response status:', response.status, response.statusText)
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        setDeleteDialogOpen(false)
        setInitiationToDelete(null)
        fetchInitiations() // Refresh the list
        alert('Initiation deleted successfully')
      } else {
        let errorMessage = 'Unknown error'
        const responseText = await response.text()
        console.log('Raw response body:', responseText)
        
        try {
          const errorData = JSON.parse(responseText)
          console.error('Delete error:', errorData)
          errorMessage = errorData.error || errorData.message || `Server error: ${response.status} ${response.statusText}`
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError)
          console.error('Response was not JSON:', responseText.substring(0, 500))
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        alert(`Failed to delete initiation: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error deleting initiation:', error)
      const errorMsg = error instanceof Error ? error.message : 'Network error'
      alert(`Failed to delete initiation: ${errorMsg}`)
    } finally {
      setDeleting(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const filteredSuppliers = suppliers
    .filter(supplier => {
      const matchesSearch = 
        supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesStatus = false
      if (statusFilter === "all") {
        matchesStatus = true
      } else if (statusFilter === "AWAITING_DOCUMENTS") {
        const { status, onboarding } = supplier
        matchesStatus = (status === 'PENDING' && onboarding?.overallStatus === 'AWAITING_RESPONSE') ||
                       (!onboarding?.supplierFormSubmitted && onboarding?.emailSent)
      } else {
        matchesStatus = supplier.status === statusFilter
      }

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle date sorting
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500'
      case 'UNDER_REVIEW': return 'bg-yellow-500'
      case 'REJECTED': return 'bg-red-500'
      case 'PENDING': return 'bg-gray-500'
      case 'AWAITING DOCUMENTS': return 'bg-orange-500 text-white'
      case 'AWAITING_DOCUMENTS': return 'bg-orange-500 text-white'
      default: return 'bg-blue-500'
    }
  }

  const getInitiationStatusColor = (status: string) => {
    switch (status) {
      case 'SUPPLIER_EMAILED': return 'bg-green-100 text-green-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'MANAGER_APPROVED': return 'bg-blue-100 text-blue-800'
      case 'PROCUREMENT_APPROVED': return 'bg-blue-100 text-blue-800'
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitiationStatusIcon = (status: string) => {
    switch (status) {
      case 'SUPPLIER_EMAILED':
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'MANAGER_APPROVED':
      case 'PROCUREMENT_APPROVED':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'SUBMITTED':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusDisplay = (supplier: Supplier) => {
    const { status, onboarding } = supplier
    
    // Show proper status based on workflow stage
    if (!onboarding) {
      return status.replace(/_/g, ' ')
    }

    // If form not submitted yet, show "Awaiting Documents"
    if (!onboarding.supplierFormSubmitted && onboarding.emailSent) {
      return 'AWAITING DOCUMENTS'
    }

    // If supplier was created from initiation but no form submitted yet
    if (status === 'PENDING' && onboarding.overallStatus === 'AWAITING_RESPONSE') {
      return 'AWAITING DOCUMENTS'
    }

    // If form submitted and under review, show revision count if applicable
    if (status === 'UNDER_REVIEW' && onboarding.revisionCount > 0) {
      return `UNDER REVIEW (Rev ${onboarding.revisionCount})`
    }

    return status.replace(/_/g, ' ')
  }

  const statusCounts = {
    all: suppliers.length,
    PENDING: suppliers.filter(s => s.status === 'PENDING').length,
    UNDER_REVIEW: suppliers.filter(s => s.status === 'UNDER_REVIEW').length,
    APPROVED: suppliers.filter(s => s.status === 'APPROVED').length,
    REJECTED: suppliers.filter(s => s.status === 'REJECTED').length,
    AWAITING_DOCUMENTS: suppliers.filter(s => {
      const { status, onboarding } = s
      return (status === 'PENDING' && onboarding?.overallStatus === 'AWAITING_RESPONSE') ||
             (!onboarding?.supplierFormSubmitted && onboarding?.emailSent)
    }).length,
  }

  return (
    <>
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div className="border-l border-slate-300 pl-4">
            <h1 className="text-xl font-bold text-slate-900">Supplier Submissions</h1>
            <p className="text-xs text-slate-600">Review and manage supplier onboarding applications and initiations</p>
          </div>
        </div>
        <Button onClick={() => { fetchSuppliers(); }} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-100">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white border-slate-200 hover:bg-slate-50" onClick={() => setStatusFilter('all')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{statusCounts.all}</div>
                    <div className="text-sm text-slate-600">Total Submissions</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white border-slate-200 hover:bg-slate-50" onClick={() => setStatusFilter('PENDING')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-700">{statusCounts.PENDING}</div>
                    <div className="text-sm text-slate-600">Pending</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white border-slate-200 hover:bg-slate-50" onClick={() => setStatusFilter('UNDER_REVIEW')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{statusCounts.UNDER_REVIEW}</div>
                    <div className="text-sm text-slate-600">Under Review</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white border-slate-200 hover:bg-slate-50" onClick={() => setStatusFilter('APPROVED')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{statusCounts.APPROVED}</div>
                    <div className="text-sm text-slate-600">Approved</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white border-slate-200 hover:bg-slate-50" onClick={() => setStatusFilter('REJECTED')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{statusCounts.REJECTED}</div>
                    <div className="text-sm text-slate-600">Rejected</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white border-slate-200 hover:bg-slate-50" onClick={() => setStatusFilter('AWAITING_DOCUMENTS')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{statusCounts.AWAITING_DOCUMENTS}</div>
                    <div className="text-sm text-slate-600">Awaiting Docs</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by company name, email, or supplier code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  {statusFilter !== 'all' && (
                    <Button variant="outline" onClick={() => setStatusFilter('all')}>
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Suppliers Table */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">
                  {statusFilter !== 'all' ? `${statusFilter.replace(/_/g, ' ')} Suppliers` : 'All Suppliers'}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Showing {filteredSuppliers.length} of {suppliers.length} submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : filteredSuppliers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No suppliers found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 select-none text-slate-700"
                          onClick={() => handleSort('supplierCode')}
                        >
                          <div className="flex items-center gap-2">
                            Supplier Code
                            {getSortIcon('supplierCode')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 select-none text-slate-700"
                          onClick={() => handleSort('companyName')}
                        >
                          <div className="flex items-center gap-2">
                            Company Name
                            {getSortIcon('companyName')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 select-none text-slate-700"
                          onClick={() => handleSort('contactPerson')}
                        >
                          <div className="flex items-center gap-2">
                            Contact Person
                            {getSortIcon('contactPerson')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 select-none text-slate-700"
                          onClick={() => handleSort('contactEmail')}
                        >
                          <div className="flex items-center gap-2">
                            Email
                            {getSortIcon('contactEmail')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 select-none text-slate-700"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center gap-2">
                            Submitted
                            {getSortIcon('createdAt')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-100 select-none text-slate-700"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-2">
                            Status
                            {getSortIcon('status')}
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-sm text-slate-700">{supplier.supplierCode}</TableCell>
                          <TableCell className="font-medium text-slate-900">{supplier.companyName}</TableCell>
                          <TableCell className="text-slate-700">{supplier.contactPerson}</TableCell>
                          <TableCell className="text-slate-700">{supplier.contactEmail}</TableCell>
                          <TableCell className="text-slate-700">{new Date(supplier.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(getStatusDisplay(supplier))} text-white`}>
                              {getStatusDisplay(supplier)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = `/admin/supplier-submissions/${supplier.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
        </div>
      </main>
    </>
  )
}


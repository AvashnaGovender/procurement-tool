"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  ArrowDown
} from "lucide-react"

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
      
      const matchesStatus = statusFilter === "all" || supplier.status === statusFilter

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
      default: return 'bg-blue-500'
    }
  }

  const getStatusDisplay = (supplier: Supplier) => {
    const { status, onboarding } = supplier
    
    // Show proper status based on workflow stage
    if (!onboarding) {
      return status.replace('_', ' ')
    }

    // If form not submitted yet, show "Awaiting Documents"
    if (!onboarding.supplierFormSubmitted && onboarding.emailSent) {
      return 'AWAITING DOCUMENTS'
    }

    // If form submitted and under review, show revision count if applicable
    if (status === 'UNDER_REVIEW' && onboarding.revisionCount > 0) {
      return `UNDER REVIEW (Rev ${onboarding.revisionCount})`
    }

    return status.replace('_', ' ')
  }

  const statusCounts = {
    all: suppliers.length,
    PENDING: suppliers.filter(s => s.status === 'PENDING').length,
    UNDER_REVIEW: suppliers.filter(s => s.status === 'UNDER_REVIEW').length,
    APPROVED: suppliers.filter(s => s.status === 'APPROVED').length,
    REJECTED: suppliers.filter(s => s.status === 'REJECTED').length,
  }

  return (
    <div className="min-h-screen bg-slate-700 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Supplier Submissions</h1>
              <p className="text-slate-300 mt-2">Review and manage supplier onboarding applications</p>
            </div>
            <Button onClick={fetchSuppliers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-slate-600 border-slate-500 hover:bg-slate-550" onClick={() => setStatusFilter('all')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{statusCounts.all}</div>
                <div className="text-sm text-slate-300">Total Submissions</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-slate-600 border-slate-500 hover:bg-slate-550" onClick={() => setStatusFilter('PENDING')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">{statusCounts.PENDING}</div>
                <div className="text-sm text-slate-300">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-slate-600 border-slate-500 hover:bg-slate-550" onClick={() => setStatusFilter('UNDER_REVIEW')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{statusCounts.UNDER_REVIEW}</div>
                <div className="text-sm text-slate-300">Under Review</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-slate-600 border-slate-500 hover:bg-slate-550" onClick={() => setStatusFilter('APPROVED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{statusCounts.APPROVED}</div>
                <div className="text-sm text-slate-300">Approved</div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-slate-600 border-slate-500 hover:bg-slate-550" onClick={() => setStatusFilter('REJECTED')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{statusCounts.REJECTED}</div>
                <div className="text-sm text-slate-300">Rejected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-slate-600 border-slate-500">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by company name, email, or supplier code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-500 text-white placeholder:text-slate-400"
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
        <Card className="bg-slate-600 border-slate-500">
          <CardHeader>
            <CardTitle className="text-white">
              {statusFilter !== 'all' ? `${statusFilter.replace('_', ' ')} Suppliers` : 'All Suppliers'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              Showing {filteredSuppliers.length} of {suppliers.length} submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No suppliers found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-500 select-none text-slate-200"
                      onClick={() => handleSort('supplierCode')}
                    >
                      <div className="flex items-center gap-2">
                        Supplier Code
                        {getSortIcon('supplierCode')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-500 select-none text-slate-200"
                      onClick={() => handleSort('companyName')}
                    >
                      <div className="flex items-center gap-2">
                        Company Name
                        {getSortIcon('companyName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-500 select-none text-slate-200"
                      onClick={() => handleSort('contactPerson')}
                    >
                      <div className="flex items-center gap-2">
                        Contact Person
                        {getSortIcon('contactPerson')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-500 select-none text-slate-200"
                      onClick={() => handleSort('contactEmail')}
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {getSortIcon('contactEmail')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-500 select-none text-slate-200"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Submitted
                        {getSortIcon('createdAt')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-500 select-none text-slate-200"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right text-slate-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-slate-500/50">
                      <TableCell className="font-mono text-sm text-slate-200">{supplier.supplierCode}</TableCell>
                      <TableCell className="font-medium text-slate-200">{supplier.companyName}</TableCell>
                      <TableCell className="text-slate-200">{supplier.contactPerson}</TableCell>
                      <TableCell className="text-slate-200">{supplier.contactEmail}</TableCell>
                      <TableCell className="text-slate-200">{new Date(supplier.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(supplier.status)} text-white`}>
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
    </div>
  )
}


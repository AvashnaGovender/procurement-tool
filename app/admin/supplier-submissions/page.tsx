"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
}

type SortField = 'supplierCode' | 'companyName' | 'contactPerson' | 'contactEmail' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'

export default function SupplierSubmissionsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [initiations, setInitiations] = useState<SupplierInitiation[]>([])
  const [loading, setLoading] = useState(true)
  const [initiationsLoading, setInitiationsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [initiationToDelete, setInitiationToDelete] = useState<SupplierInitiation | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewInitiation, setViewInitiation] = useState<SupplierInitiation | null>(null)

  useEffect(() => {
    fetchSuppliers()
    fetchInitiations()
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

  const fetchInitiations = async () => {
    setInitiationsLoading(true)
    try {
      const response = await fetch('/api/suppliers/initiations')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setInitiations(data)
      }
    } catch (error) {
      console.error('Error fetching initiations:', error)
    } finally {
      setInitiationsLoading(false)
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
        <Button onClick={() => { fetchSuppliers(); fetchInitiations(); }} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-100">
        <div className="max-w-7xl mx-auto">
        {/* Main Tabs */}
        <Tabs defaultValue="initiations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border-slate-200">
            <TabsTrigger value="initiations" className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <ClipboardList className="h-4 w-4" />
              Supplier Initiations ({initiations.length})
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Users className="h-4 w-4" />
              Supplier Submissions ({suppliers.length})
            </TabsTrigger>
          </TabsList>

          {/* Initiations Tab */}
          <TabsContent value="initiations" className="space-y-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Supplier Initiation Requests</CardTitle>
                <CardDescription className="text-slate-600">
                  Review and approve supplier onboarding initiation requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {initiationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : initiations.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No initiation requests found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {initiations.map((initiation) => (
                      <Card key={initiation.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {getInitiationStatusIcon(initiation.status)}
                              <div>
                                <h3 className="font-semibold text-slate-900">{initiation.supplierName}</h3>
                                <p className="text-sm text-slate-600">
                                  Requested by {initiation.requesterName}
                                </p>
                              </div>
                            </div>
                            <Badge className={getInitiationStatusColor(initiation.status)}>
                              {initiation.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-slate-600">Business Unit</p>
                              <p className="text-sm">
                                {initiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
                                  ? 'Schauenburg Systems (Pty) Ltd 300' 
                                  : 'Schauenburg (Pty) Ltd 200'
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Purchase Type</p>
                              <p className="text-sm">
                                {initiation.regularPurchase && 'Regular Purchase'}
                                {initiation.regularPurchase && initiation.onceOffPurchase && ', '}
                                {initiation.onceOffPurchase && 'Once-off Purchase'}
                                {initiation.annualPurchaseValue && ` (R${initiation.annualPurchaseValue.toLocaleString()})`}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Submitted</p>
                              <p className="text-sm">
                                {new Date(initiation.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-slate-600">Manager Approval</p>
                              <div className="flex items-center gap-2">
                                {getInitiationStatusIcon(initiation.managerApproval?.status || 'PENDING')}
                                <span className="text-sm">
                                  {initiation.managerApproval?.status || 'PENDING'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Procurement Approval</p>
                              <div className="flex items-center gap-2">
                                {getInitiationStatusIcon(initiation.procurementApproval?.status || 'PENDING')}
                                <span className="text-sm">
                                  {initiation.procurementApproval?.status || 'PENDING'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-slate-600">
                              <p className="font-medium">Reason:</p>
                              <p className="line-clamp-2">{initiation.onboardingReason}</p>
                            </div>
                            
                            <div className="flex gap-2">
                              {/* View button - always show */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setViewInitiation(initiation)
                                  setViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              
                              {/* Only show delete button for deletable statuses */}
                              {['SUBMITTED', 'MANAGER_APPROVED', 'PROCUREMENT_APPROVED', 'REJECTED'].includes(initiation.status) && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setInitiationToDelete(initiation)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
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
          </TabsContent>
        </Tabs>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Supplier Initiation Details</DialogTitle>
              <DialogDescription>
                Complete details of the supplier initiation request
              </DialogDescription>
            </DialogHeader>
            
            {viewInitiation && (
              <SupplierInitiationStatus initiationId={viewInitiation.id} />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Supplier Initiation</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this supplier initiation request? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {initiationToDelete && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Initiation Details:</h4>
                  <p className="text-sm text-red-800">
                    <strong>Supplier:</strong> {initiationToDelete.supplierName}
                  </p>
                  <p className="text-sm text-red-800">
                    <strong>Requested by:</strong> {initiationToDelete.requesterName}
                  </p>
                  <p className="text-sm text-red-800">
                    <strong>Status:</strong> {initiationToDelete.status.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </main>
    </>
  )
}


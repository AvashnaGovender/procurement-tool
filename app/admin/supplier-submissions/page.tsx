"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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
    initiationId?: string | null
    initiation?: {
      id: string
      emailSent: boolean
      status: string
    } | null
  }
}

interface SupplierInitiation {
  id: string
  status: string
  supplierName: string
  businessUnit: string | string[]
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
  purchaseType: string
  annualPurchaseValue?: number
  onboardingReason: string
}

type SortField = 'supplierCode' | 'companyName' | 'contactPerson' | 'contactEmail' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'

export default function SupplierSubmissionsPage() {
  const { data: session } = useSession()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [initiations, setInitiations] = useState<SupplierInitiation[]>([])
  const [loading, setLoading] = useState(true)
  const [initiationsLoading, setInitiationsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>('companyName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
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
      const response = await fetch(`/api/suppliers/initiation/${initiationToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDeleteDialogOpen(false)
        setInitiationToDelete(null)
        fetchInitiations() // Refresh the list
        alert('Initiation deleted successfully')
      } else {
        const errorData = await response.json()
        console.error('Delete error:', errorData)
        alert(`Failed to delete initiation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting initiation:', error)
      alert('Failed to delete initiation: Network error')
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
      case 'PENDING': return 'bg-muted text-muted-foreground'
      case 'AWAITING DOCUMENTS': return 'bg-orange-500'
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
      default: return 'bg-muted text-muted-foreground'
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
        return <Clock className="h-4 w-4 text-muted-foreground" />
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

    // If supplier was created from initiation but no form submitted yet
    if (status === 'PENDING' && onboarding.overallStatus === 'AWAITING_RESPONSE') {
      return 'AWAITING DOCUMENTS'
    }

    // If form submitted and under review, show revision count if applicable
    if (status === 'UNDER_REVIEW' && onboarding.revisionCount > 0) {
      return `UNDER REVIEW (Rev ${onboarding.revisionCount})`
    }

    return status.replace('_', ' ')
  }

  // Check if email failed for approved suppliers
  const hasEmailFailed = (supplier: Supplier): boolean => {
    if (supplier.status !== 'APPROVED') return false
    
    // Check if supplier is approved but email wasn't sent
    // This happens when email fails during approval
    if (supplier.onboarding?.initiation) {
      // If initiation exists and emailSent is false, email failed
      return !supplier.onboarding.initiation.emailSent
    }
    
    // If no initiation record, check onboarding emailSent
    return supplier.onboarding ? !supplier.onboarding.emailSent : false
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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Supplier Submissions</h1>
                <p className="text-muted-foreground mt-2">Review and manage supplier onboarding applications and initiations</p>
              </div>
            </div>
            <Button onClick={() => { fetchSuppliers(); fetchInitiations(); }} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="initiations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="initiations" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
              <ClipboardList className="h-4 w-4" />
              Supplier Initiations ({initiations.length})
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
              <Users className="h-4 w-4" />
              Supplier Submissions ({suppliers.length})
            </TabsTrigger>
          </TabsList>

          {/* Initiations Tab */}
          <TabsContent value="initiations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Initiation Requests</CardTitle>
                <CardDescription>
                  Review and approve supplier onboarding initiation requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {initiationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : initiations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
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
                                <h3 className="font-semibold text-foreground">{initiation.supplierName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Requested by {initiation.requesterName}
                                </p>
                              </div>
                            </div>
                            <Badge className={getInitiationStatusColor(initiation.status)}>
                              {initiation.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Business Unit{Array.isArray(initiation.businessUnit) && initiation.businessUnit.length > 1 ? 's' : ''}</p>
                              <p className="text-sm text-foreground">
                                {Array.isArray(initiation.businessUnit) 
                                  ? initiation.businessUnit.map(unit => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300').join(', ')
                                  : (initiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
                                      ? 'Schauenburg Systems 200' 
                                      : 'Schauenburg (Pty) Ltd 300')
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Purchase Type</p>
                              <p className="text-sm text-foreground">
                                {initiation.purchaseType === 'REGULAR' ? 'Regular Purchase' : initiation.purchaseType === 'ONCE_OFF' ? 'Once-off Purchase' : 'Shared IP'}
                                {initiation.annualPurchaseValue && ` (R${initiation.annualPurchaseValue.toLocaleString()})`}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                              <p className="text-sm text-foreground">
                                {new Date(initiation.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Manager Approval</p>
                              <div className="flex items-center gap-2">
                                {getInitiationStatusIcon(initiation.managerApproval?.status || 'PENDING')}
                                <span className="text-sm text-foreground">
                                  {initiation.managerApproval?.status || 'PENDING'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Procurement Approval</p>
                              <div className="flex items-center gap-2">
                                {getInitiationStatusIcon(initiation.procurementApproval?.status || 'PENDING')}
                                <span className="text-sm text-foreground">
                                  {initiation.procurementApproval?.status || 'PENDING'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="text-sm text-muted-foreground">
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
                              
                              {/* Show delete button for ADMIN and PM - they can delete any initiation that doesn't have a submitted supplier form */}
                              {(session?.user?.role === 'ADMIN' || session?.user?.role === 'PROCUREMENT_MANAGER') && (
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
              <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-muted/50" onClick={() => setStatusFilter('all')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{statusCounts.all}</div>
                    <div className="text-sm text-muted-foreground">Total Submissions</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-muted/50" onClick={() => setStatusFilter('PENDING')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{statusCounts.PENDING}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-muted/50" onClick={() => setStatusFilter('UNDER_REVIEW')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{statusCounts.UNDER_REVIEW}</div>
                    <div className="text-sm text-muted-foreground">Under Review</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-muted/50" onClick={() => setStatusFilter('APPROVED')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">{statusCounts.APPROVED}</div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-muted/50" onClick={() => setStatusFilter('REJECTED')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">{statusCounts.REJECTED}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow hover:bg-muted/50" onClick={() => setStatusFilter('AWAITING_DOCUMENTS')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">{statusCounts.AWAITING_DOCUMENTS}</div>
                    <div className="text-sm text-muted-foreground">Awaiting Docs</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by company name, email, or supplier code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
            <Card>
              <CardHeader>
                <CardTitle>
                  {statusFilter !== 'all' ? `${statusFilter.replace('_', ' ')} Suppliers` : 'All Suppliers'}
                </CardTitle>
                <CardDescription>
                  Showing {filteredSuppliers.length} of {suppliers.length} submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredSuppliers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No suppliers found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort('supplierCode')}
                        >
                          <div className="flex items-center gap-2">
                            Supplier Code
                            {getSortIcon('supplierCode')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort('companyName')}
                        >
                          <div className="flex items-center gap-2">
                            Company Name
                            {getSortIcon('companyName')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort('contactPerson')}
                        >
                          <div className="flex items-center gap-2">
                            Contact Person
                            {getSortIcon('contactPerson')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort('contactEmail')}
                        >
                          <div className="flex items-center gap-2">
                            Email
                            {getSortIcon('contactEmail')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center gap-2">
                            Submitted
                            {getSortIcon('createdAt')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted select-none"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-2">
                            Status
                            {getSortIcon('status')}
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers.map((supplier) => {
                        const emailFailed = hasEmailFailed(supplier)
                        return (
                          <TableRow key={supplier.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-sm text-foreground">{supplier.supplierCode}</TableCell>
                            <TableCell className="font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                {supplier.companyName}
                                {emailFailed && (
                                  <Badge variant="destructive" className="text-xs">
                                    Email Failed
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground">{supplier.contactPerson}</TableCell>
                            <TableCell className="text-foreground">{supplier.contactEmail}</TableCell>
                            <TableCell className="text-foreground">{new Date(supplier.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(supplier.status)} text-white`}>
                                {getStatusDisplay(supplier)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.location.href = `/admin/supplier-submissions/${supplier.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'PROCUREMENT_MANAGER') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300"
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to delete "${supplier.companyName}"? This action cannot be undone.`)) {
                                        try {
                                          const response = await fetch(`/api/suppliers/${supplier.id}/delete`, {
                                            method: 'DELETE',
                                            headers: { 'Content-Type': 'application/json' }
                                          })
                                          const data = await response.json()
                                          if (data.success) {
                                            await fetchSuppliers()
                                          } else {
                                            alert(`Failed to delete: ${data.error}`)
                                          }
                                        } catch (error) {
                                          console.error('Error deleting supplier:', error)
                                          alert('Failed to delete supplier. Please try again.')
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
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
                    <strong>Status:</strong> {initiationToDelete.status.replace('_', ' ')}
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
    </div>
  )
}


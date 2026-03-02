"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, User, Building2, DollarSign, AlertCircle, Eye, ChevronDown, ChevronRight, FileCheck, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Home, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getPurchaseTypeDisplayName } from "@/lib/document-requirements"

interface SupplierInitiation {
  id: string
  status: string
  supplierName: string
  supplierEmail: string
  supplierContactPerson: string
  businessUnit: string | string[]
  requesterName: string
  submittedAt: string
  isDelegated?: boolean
  delegationType?: 'MANAGER' | 'PROCUREMENT' | 'BOTH' | null
  managerApproval?: {
    status: string
    approver: string
    approverId?: string
    approvedAt?: string
    comments?: string
  }
  procurementApproval?: {
    status: string
    approver: string
    approverId?: string
    approvedAt?: string
    comments?: string
  }
  initiatedById?: string
  purchaseType?: string
  paymentMethod?: string
  codReason?: string | null
  regularPurchase: boolean
  annualPurchaseValue?: number
  onceOffPurchase: boolean
  onboardingReason: string
  processReadUnderstood: boolean
  dueDiligenceCompleted: boolean
  productServiceCategory: string
  relationshipDeclaration: string
  creditApplication: boolean
  creditApplicationReason?: string
  supplierLocation?: string
  currency?: string
  customCurrency?: string
}

interface Supplier {
  id: string
  supplierCode: string
  companyName: string
  contactEmail: string
  contactPerson: string
  status: string
  createdAt: string
  onboarding?: {
    id: string
    revisionCount: number
    revisionRequested: boolean
    revisionRequestedAt?: string | null
    supplierFormSubmittedAt?: string | null
    emailSent: boolean
    supplierFormSubmitted: boolean
    currentStep: string
    overallStatus: string
    initiation?: {
      annualPurchaseValue?: number
      supplierLocation?: string
      currency?: string
      customCurrency?: string
    }
  }
}

type SortField = 'supplierCode' | 'companyName' | 'status' | 'createdAt'
type SortDirection = 'asc' | 'desc'

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
  
  const symbol = getCurrencySymbol(currency, supplierLocation)
  
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

export default function ApprovalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initiation Approvals tab state
  const [initiations, setInitiations] = useState<SupplierInitiation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInitiation, setSelectedInitiation] = useState<SupplierInitiation | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [approvalRole, setApprovalRole] = useState<'MANAGER' | 'PROCUREMENT_MANAGER'>('MANAGER')
  const [approvalComments, setApprovalComments] = useState('')
  const [submittingApproval, setSubmittingApproval] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  
  // Document Reviews tab state
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Tab control
  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'initiations')

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Check authentication and role access
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      // Redirect to login with return URL
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/admin/approvals')}`
      return
    }
    
    // Only MANAGER, PROCUREMENT_MANAGER and ADMIN can access this page
    if (session && session.user.role !== 'MANAGER' && session.user.role !== 'PROCUREMENT_MANAGER' && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
    
    // If Manager tries to access reviews tab, redirect to initiations tab
    if (session && session.user.role === 'MANAGER' && activeTab === 'reviews') {
      setActiveTab('initiations')
    }
  }, [status, session, router, activeTab])

  useEffect(() => {
    if (status === 'authenticated') {
      if (activeTab === 'initiations') {
        fetchInitiations()
      } else if (activeTab === 'reviews') {
        fetchSuppliers()
      }
    }
  }, [status, activeTab])

  const fetchInitiations = async () => {
    // Don't fetch if not authenticated
    if (status !== 'authenticated') {
      return
    }
    
    setLoading(true)
    try {
      console.log('🔄 Fetching initiations...')
      const response = await fetch('/api/suppliers/initiations')
      const data = await response.json()
      
      console.log(`✅ Received ${Array.isArray(data) ? data.length : 0} initiations`)
      
      if (Array.isArray(data)) {
        // Log summary of initiations for debugging
        data.forEach((init, index) => {
          console.log(`   [${index + 1}] ${init.supplierName}`)
          console.log(`       Status: ${init.status}`)
          console.log(`       Manager Approval: ${init.managerApproval?.status || 'N/A'} (Approver: ${init.managerApproval?.approver || 'N/A'})`)
          console.log(`       Procurement Approval: ${init.procurementApproval?.status || 'N/A'} (Approver: ${init.procurementApproval?.approver || 'N/A'})`)
        })
        setInitiations(data)
      } else {
        console.error('❌ Response is not an array:', data)
      }
    } catch (error) {
      console.error('❌ Error fetching initiations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    setSuppliersLoading(true)
    try {
      const response = await fetch('/api/suppliers/list')
      const data = await response.json()
      
      if (data.success) {
        setSuppliers(data.suppliers || [])
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setSuppliersLoading(false)
    }
  }

  const handleApproval = async () => {
    if (!selectedInitiation) return

    setSubmittingApproval(true)
    try {
      const response = await fetch(`/api/suppliers/initiation/${selectedInitiation.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: approvalAction,
          comments: approvalComments,
          approverRole: approvalRole
        }),
      })

      if (response.ok) {
        setApprovalDialogOpen(false)
        setSelectedInitiation(null)
        setApprovalComments('')
        fetchInitiations() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to process approval')
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Failed to process approval')
    } finally {
      setSubmittingApproval(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SUPPLIER_EMAILED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING':
      case 'SUBMITTED':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
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

  const canApproveAsManager = (initiation: SupplierInitiation) => {
    const userId = session?.user?.id
    const userRole = session?.user?.role
    
    // CRITICAL: Initiator cannot approve their own request
    if (initiation.initiatedById === userId) {
      return false
    }
    
    const managerStatus = initiation.managerApproval?.status
    const managerApproverId = initiation.managerApproval?.approverId
    
    // Manager approval must be PENDING
    if (managerStatus !== 'PENDING') return false
    
    // Check if user is directly assigned as manager approver
    const isDirectlyAssigned = managerApproverId === userId
    
    // Check if user has delegated manager authority
    const hasDelegatedAuthority = initiation.isDelegated && 
                                   (initiation.delegationType === 'MANAGER' || 
                                    initiation.delegationType === 'BOTH')
    
    // User can approve if they're directly assigned OR have delegated authority
    return isDirectlyAssigned || hasDelegatedAuthority
  }

  const canApproveAsProcurement = (initiation: SupplierInitiation) => {
    // Procurement approval step has been removed from the workflow
    // This function is kept for backward compatibility but always returns false
    return false
  }

  const getApprovalStatus = (initiation: SupplierInitiation) => {
    const { managerApproval } = initiation
    
    if (managerApproval?.status === 'APPROVED') {
      return 'Approved'
    }
    
    if (managerApproval?.status === 'REJECTED') {
      return 'Rejected'
    }
    
    // Manager approval is pending
    if (managerApproval?.status === 'PENDING') {
      return 'Awaiting Manager Approval'
    }
    
    return 'Pending'
  }

  // Display status for Document Reviews: includes PENDING REVISION and REVISED from onboarding state
  const getStatusDisplay = (supplier: Supplier) => {
    const { status, onboarding } = supplier
    if (!onboarding) return status.replace(/_/g, ' ')
    if (onboarding.revisionRequested) return 'PENDING REVISION'
    const revAt = onboarding.revisionRequestedAt ? new Date(onboarding.revisionRequestedAt).getTime() : 0
    const submittedAt = onboarding.supplierFormSubmittedAt ? new Date(onboarding.supplierFormSubmittedAt).getTime() : 0
    if (revAt > 0 && submittedAt > revAt && status === 'UNDER_REVIEW') return 'REVISED'
    return status.replace(/_/g, ' ')
  }

  const getSupplierStatusColor = (status: string) => {
    switch (status.toUpperCase().replace(/\s/g, '_')) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800'
      case 'PENDING_REVISION': return 'bg-amber-100 text-amber-800'
      case 'REVISED': return 'bg-indigo-100 text-indigo-800'
      case 'AWAITING_FINAL_APPROVAL': return 'bg-purple-100 text-purple-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSupplierStatusIcon = (status: string) => {
    const key = status.toUpperCase().replace(/\s/g, '_')
    switch (key) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'UNDER_REVIEW': return <Eye className="h-4 w-4" />
      case 'PENDING_REVISION': return <AlertCircle className="h-4 w-4" />
      case 'REVISED': return <RefreshCw className="h-4 w-4" />
      case 'AWAITING_FINAL_APPROVAL': return <AlertCircle className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const sortSuppliers = (suppliers: Supplier[]) => {
    return [...suppliers].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'supplierCode':
          comparison = a.supplierCode.localeCompare(b.supplierCode)
          break
        case 'companyName':
          comparison = a.companyName.localeCompare(b.companyName)
          break
        case 'status':
          comparison = getStatusDisplay(a).localeCompare(getStatusDisplay(b))
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
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
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />
  }

  const filteredSuppliers = sortSuppliers(
    suppliers.filter(supplier => {
      const matchesSearch = supplierSearchTerm === "" || 
        supplier.companyName.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        supplier.supplierCode.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        supplier.contactEmail.toLowerCase().includes(supplierSearchTerm.toLowerCase())
      const displayStatus = getStatusDisplay(supplier)
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "PENDING REVISION" ? displayStatus === 'PENDING REVISION' :
         statusFilter === "REVISED" ? displayStatus === 'REVISED' :
         supplier.status === statusFilter)
      return matchesSearch && matchesStatus
    })
  )

  const statusCounts = {
    all: suppliers.length,
    PENDING: suppliers.filter(s => s.status === 'PENDING').length,
    UNDER_REVIEW: suppliers.filter(s => s.status === 'UNDER_REVIEW').length,
    'PENDING REVISION': suppliers.filter(s => getStatusDisplay(s) === 'PENDING REVISION').length,
    REVISED: suppliers.filter(s => getStatusDisplay(s) === 'REVISED').length,
    AWAITING_FINAL_APPROVAL: suppliers.filter(s => s.status === 'AWAITING_FINAL_APPROVAL').length,
    APPROVED: suppliers.filter(s => s.status === 'APPROVED').length,
    REJECTED: suppliers.filter(s => s.status === 'REJECTED').length,
  }

  const filteredInitiations = initiations.filter(initiation => {
    const matchesSearch = 
      initiation.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      initiation.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      initiation.productServiceCategory.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message if user doesn't have proper role
  if (session && session.user.role !== 'MANAGER' && session.user.role !== 'PROCUREMENT_MANAGER' && session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Access Restricted</CardTitle>
            </div>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              This page is only accessible to Managers, Procurement Managers and Administrators.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if current user is PM or Admin (can see both tabs)
  const isPMOrAdmin = session?.user.role === 'PROCUREMENT_MANAGER' || session?.user.role === 'ADMIN'

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
        {session && (
          <div className="text-sm text-gray-500">
            {session.user.email} ({session.user.role})
          </div>
        )}
      </header>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {isPMOrAdmin ? 'PM Approvals' : 'Approvals'}
            </h1>
            <p className="text-slate-600 mt-2">
              {isPMOrAdmin 
                ? 'Review initiation approvals and supplier document submissions' 
                : 'Review and approve supplier initiation requests'}
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="initiations" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Initiation Approvals
                {filteredInitiations.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{filteredInitiations.length}</Badge>
                )}
              </TabsTrigger>
              {isPMOrAdmin && (
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Document Reviews
                  {suppliers.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{suppliers.length}</Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            {/* Initiation Approvals Tab */}
            <TabsContent value="initiations">
              {/* Search */}
              <Card className="mb-6 bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by supplier name, requester, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Initiations Table */}
              <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredInitiations.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No initiation requests found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Business Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInitiations.map((initiation) => {
                    const isExpanded = expandedRows.has(initiation.id)
                    return (
                      <React.Fragment key={initiation.id}>
                        <TableRow 
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => toggleRow(initiation.id)}
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{initiation.supplierName}</TableCell>
                          <TableCell>{initiation.requesterName}</TableCell>
                          <TableCell>
                            {Array.isArray(initiation.businessUnit)
                              ? initiation.businessUnit.map(unit => 
                                  unit === 'SCHAUENBURG_SYSTEMS_200' 
                                    ? 'Schauenburg Systems (Pty) Ltd 300' 
                                    : 'Schauenburg (Pty) Ltd 200'
                                ).join(', ')
                              : initiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
                                ? 'Schauenburg Systems (Pty) Ltd 300' 
                                : 'Schauenburg (Pty) Ltd 200'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(initiation.status.replace(/_/g, ' '))}>
                              {initiation.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(initiation.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              {(canApproveAsManager(initiation) || canApproveAsProcurement(initiation)) && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedInitiation(initiation)
                                      setApprovalAction('reject')
                                      setApprovalRole(canApproveAsManager(initiation) ? 'MANAGER' : 'PROCUREMENT_MANAGER')
                                      setApprovalDialogOpen(true)
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedInitiation(initiation)
                                      setApprovalAction('approve')
                                      setApprovalRole(canApproveAsManager(initiation) ? 'MANAGER' : 'PROCUREMENT_MANAGER')
                                      setApprovalDialogOpen(true)
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-slate-50 p-6">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">Contact Person</p>
                                    <p className="text-sm">{initiation.supplierContactPerson || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">Email</p>
                                    <p className="text-sm">{initiation.supplierEmail}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">Category</p>
                                    <p className="text-sm">{initiation.productServiceCategory}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">Supplier Location</p>
                                    <p className="text-sm">
                                      {initiation.supplierLocation === 'LOCAL' ? 'Local' : initiation.supplierLocation === 'FOREIGN' ? 'Foreign' : 'Not specified'}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {initiation.supplierLocation === 'FOREIGN' && initiation.currency && (
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">Currency</p>
                                      <p className="text-sm">{initiation.currency}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">Purchase Type</p>
                                    <p className="text-sm">
                                      {getPurchaseTypeDisplayName(initiation.purchaseType) || (initiation.regularPurchase && 'Regular Purchase') || (initiation.onceOffPurchase && 'Once-off Purchase') || '—'}
                                    </p>
                                  </div>
                                  {initiation.annualPurchaseValue && (
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">Annual Purchase Value</p>
                                      <p className="text-sm">{formatAnnualPurchaseValue(initiation.annualPurchaseValue, initiation.currency, initiation.supplierLocation)}</p>
                                    </div>
                                  )}
                                  {((initiation.purchaseType === 'COD' || initiation.purchaseType === 'COD_IP_SHARED') || initiation.paymentMethod === 'COD') && (
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">Reason for COD</p>
                                      <p className="text-sm">{initiation.codReason || '—'}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">Credit Application</p>
                                    <p className="text-sm">
                                      {initiation.creditApplication ? 'Yes' : 'No'}
                                      {!initiation.creditApplication && initiation.creditApplicationReason && (
                                        <span className="text-xs text-slate-500 block mt-1">
                                          {initiation.creditApplicationReason}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">Relationship Declaration</p>
                                    <p className="text-sm">{initiation.relationshipDeclaration}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {initiation.processReadUnderstood ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <p className="text-sm">Process Read & Understood</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {initiation.dueDiligenceCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <p className="text-sm">Due Diligence Completed</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">Manager Approval</p>
                                    <div className="flex items-center gap-2 mb-1">
                                      {getStatusIcon(initiation.managerApproval?.status || 'PENDING')}
                                      <span className="text-sm">
                                        {initiation.managerApproval?.status || 'PENDING'}
                                      </span>
                                    </div>
                                    {initiation.managerApproval?.approver && (
                                      <p className="text-xs text-slate-500">by {initiation.managerApproval.approver}</p>
                                    )}
                                    {initiation.managerApproval?.status === 'REJECTED' && initiation.managerApproval?.comments && (
                                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-xs font-medium text-red-900 mb-1">Rejection Reason:</p>
                                        <p className="text-xs text-red-800">{initiation.managerApproval.comments}</p>
                                      </div>
                                    )}
                                    {initiation.managerApproval?.status === 'APPROVED' && initiation.managerApproval?.comments && (
                                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                        <p className="text-xs font-medium text-green-900 mb-1">Comments:</p>
                                        <p className="text-xs text-green-800">{initiation.managerApproval.comments}</p>
                                      </div>
                                    )}
                                  </div>
                                  {/* Procurement approval removed from workflow */}
                                </div>
                                <div className="pt-4 border-t">
                                  <p className="text-sm font-medium text-slate-600 mb-2">Reason for Onboarding Supplier:</p>
                                  <p className="text-sm text-slate-700">{initiation.onboardingReason}</p>
                                </div>
                                <div className="pt-4 border-t">
                                  <p className="text-sm font-medium text-slate-600">Approval Status:</p>
                                  <p className="text-sm text-slate-800">{getApprovalStatus(initiation)}</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Supplier Initiation
                {approvalRole === 'MANAGER' ? ' (Manager Approval)' : ' (Procurement Manager Approval)'}
              </DialogTitle>
              <DialogDescription>
                {approvalAction === 'approve' 
                  ? `Please confirm your ${approvalRole === 'MANAGER' ? 'Manager' : 'Procurement Manager'} approval of this supplier initiation request.`
                  : `Please provide a reason for rejecting this supplier initiation request as ${approvalRole === 'MANAGER' ? 'Manager' : 'Procurement Manager'}.`
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedInitiation && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-slate-900 mb-3">Complete Initiation Details:</h4>
                  
                  {/* Basic Information */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Supplier Information</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Supplier Name:</strong> {selectedInitiation.supplierName}</p>
                        <p><strong>Contact Person:</strong> {selectedInitiation.supplierContactPerson || 'N/A'}</p>
                        <p><strong>Email:</strong> {selectedInitiation.supplierEmail}</p>
                      </div>
                      <div>
                        <p><strong>Category:</strong> {selectedInitiation.productServiceCategory}</p>
                        <p><strong>Business Unit(s):</strong> {
                          Array.isArray(selectedInitiation.businessUnit)
                            ? selectedInitiation.businessUnit.map(unit => 
                                unit === 'SCHAUENBURG_SYSTEMS_200' 
                                  ? 'Schauenburg Systems (Pty) Ltd 300' 
                                  : 'Schauenburg (Pty) Ltd 200'
                              ).join(', ')
                            : selectedInitiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
                              ? 'Schauenburg Systems (Pty) Ltd 300' 
                              : 'Schauenburg (Pty) Ltd 200'
                        }</p>
                      </div>
                    </div>
                  </div>

                  {/* Requester Information */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Requester Information</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Requester:</strong> {selectedInitiation.requesterName}</p>
                        <p><strong>Submitted:</strong> {new Date(selectedInitiation.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Information */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Purchase Information</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Purchase Type:</strong></p>
                        <p className="text-slate-700">
                          {getPurchaseTypeDisplayName(selectedInitiation.purchaseType) || (selectedInitiation.regularPurchase && 'Regular Purchase') || (selectedInitiation.onceOffPurchase && 'Once-off Purchase') || '—'}
                        </p>
                        {selectedInitiation.annualPurchaseValue && (
                          <p className="mt-1"><strong>Annual Value:</strong> {formatAnnualPurchaseValue(selectedInitiation.annualPurchaseValue, selectedInitiation.currency, selectedInitiation.supplierLocation)}</p>
                        )}
                      </div>
                      <div>
                        <p><strong>Credit Application:</strong> {selectedInitiation.creditApplication ? 'Yes' : 'No'}</p>
                        {!selectedInitiation.creditApplication && selectedInitiation.creditApplicationReason && (
                          <p className="mt-1 text-slate-600">
                            <strong>Reason:</strong> {selectedInitiation.creditApplicationReason}
                          </p>
                        )}
                      </div>
                    </div>
                    {((selectedInitiation.purchaseType === 'COD' || selectedInitiation.purchaseType === 'COD_IP_SHARED') || selectedInitiation.paymentMethod === 'COD') && (
                      <div className="mt-3 text-sm">
                        <p><strong>Reason for COD:</strong></p>
                        <p className="text-slate-700">{selectedInitiation.codReason || '—'}</p>
                      </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Checklist</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        {selectedInitiation.processReadUnderstood ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>Process Read & Understood</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedInitiation.dueDiligenceCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>Due Diligence Completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Relationship Declaration */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Relationship Declaration</p>
                    <p className="text-sm text-slate-700">{selectedInitiation.relationshipDeclaration}</p>
                  </div>

                  {/* Onboarding Reason */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Reason for Onboarding</p>
                    <p className="text-sm text-slate-700">{selectedInitiation.onboardingReason}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comments">
                    {approvalAction === 'approve' ? 'Comments (Optional)' : 'Reason for Rejection *'}
                  </Label>
                  <Textarea
                    id="comments"
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    placeholder={
                      approvalAction === 'approve' 
                        ? 'Add any comments about your approval...'
                        : 'Please explain why you are rejecting this request...'
                    }
                    className="min-h-[100px]"
                    required={approvalAction === 'reject'}
                  />
                </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setApprovalDialogOpen(false)}
                    disabled={submittingApproval}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApproval}
                    disabled={submittingApproval || (approvalAction === 'reject' && !approvalComments.trim())}
                    variant={approvalAction === 'reject' ? 'destructive' : 'default'}
                  >
                    {submittingApproval ? 'Processing...' : `${approvalAction === 'approve' ? 'Approve' : 'Reject'}`}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* Document Reviews Tab */}
      <TabsContent value="reviews">
        {/* Search and Filter */}
        <Card className="mb-6 bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by company name, code, or email..."
                  value={supplierSearchTerm}
                  onChange={(e) => setSupplierSearchTerm(e.target.value)}
                  className="bg-white border-slate-300"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchSuppliers}
                disabled={suppliersLoading}
              >
                <RefreshCw className={`h-4 w-4 ${suppliersLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All ({statusCounts.all})
              </Button>
              <Button
                variant={statusFilter === "PENDING" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("PENDING")}
              >
                Pending ({statusCounts.PENDING})
              </Button>
              <Button
                variant={statusFilter === "UNDER_REVIEW" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("UNDER_REVIEW")}
              >
                Under Review ({statusCounts.UNDER_REVIEW})
              </Button>
              <Button
                variant={statusFilter === "PENDING REVISION" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("PENDING REVISION")}
              >
                Pending Revision ({statusCounts['PENDING REVISION']})
              </Button>
              <Button
                variant={statusFilter === "REVISED" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("REVISED")}
              >
                Revised ({statusCounts.REVISED})
              </Button>
              <Button
                variant={statusFilter === "AWAITING_FINAL_APPROVAL" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("AWAITING_FINAL_APPROVAL")}
              >
                Final Approval ({statusCounts.AWAITING_FINAL_APPROVAL})
              </Button>
              <Button
                variant={statusFilter === "APPROVED" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("APPROVED")}
              >
                Approved ({statusCounts.APPROVED})
              </Button>
              <Button
                variant={statusFilter === "REJECTED" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("REJECTED")}
              >
                Rejected ({statusCounts.REJECTED})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Table */}
        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            {suppliersLoading ? (
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
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleSort('supplierCode')}
                    >
                      Supplier Code {getSortIcon('supplierCode')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleSort('companyName')}
                    >
                      Company Name {getSortIcon('companyName')}
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created {getSortIcon('createdAt')}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.supplierCode}</TableCell>
                      <TableCell>{supplier.companyName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{supplier.contactPerson}</div>
                          <div className="text-slate-500">{supplier.contactEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const displayStatus = getStatusDisplay(supplier)
                          return (
                            <Badge className={getSupplierStatusColor(displayStatus)}>
                              {getSupplierStatusIcon(displayStatus)}
                              <span className="ml-1">{displayStatus}</span>
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        {new Date(supplier.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/supplier-submissions/${supplier.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
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
        </div>
      </div>
    </div>
  )
}



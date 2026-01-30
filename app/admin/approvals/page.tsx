"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, User, Building2, DollarSign, AlertCircle, Eye, ChevronDown, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"

interface SupplierInitiation {
  id: string
  status: string
  supplierName: string
  supplierEmail: string
  supplierContactPerson: string
  businessUnit: string
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

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login with return URL
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/admin/approvals')}`
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInitiations()
    }
  }, [status])

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

  return (
    <div className="bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Approvals</h1>
          <p className="text-slate-600 mt-2">Review and approve supplier initiation requests</p>
          {/* Debug: Show current user */}
          {session && (
            <div className="mt-2 text-sm text-gray-500">
              Logged in as: {session.user.email} ({session.user.role})
            </div>
          )}
        </div>

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
                      <>
                        <TableRow 
                          key={initiation.id} 
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
                            {initiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
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
                                      {initiation.regularPurchase && 'Regular Purchase'}
                                      {initiation.regularPurchase && initiation.onceOffPurchase && ', '}
                                      {initiation.onceOffPurchase && 'Once-off Purchase'}
                                    </p>
                                  </div>
                                  {initiation.annualPurchaseValue && (
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">Annual Purchase Value</p>
                                      <p className="text-sm">{formatAnnualPurchaseValue(initiation.annualPurchaseValue, initiation.currency, initiation.supplierLocation)}</p>
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
                      </>
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
                        <p><strong>Business Unit:</strong> {
                          selectedInitiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
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
                          {selectedInitiation.regularPurchase && 'Regular Purchase'}
                          {selectedInitiation.regularPurchase && selectedInitiation.onceOffPurchase && ', '}
                          {selectedInitiation.onceOffPurchase && 'Once-off Purchase'}
                        </p>
                        {selectedInitiation.annualPurchaseValue && (
                          <p className="mt-1"><strong>Annual Value:</strong> R{selectedInitiation.annualPurchaseValue.toLocaleString()}</p>
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
      </div>
    </div>
  )
}



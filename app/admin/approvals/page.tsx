"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, User, Building2, DollarSign, AlertCircle, Eye } from "lucide-react"
import { useSession } from "next-auth/react"

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
  purchaseType: string
  annualPurchaseValue?: number
  onboardingReason: string
  processReadUnderstood: boolean
  dueDiligenceCompleted: boolean
  productServiceCategory: string
  relationshipDeclaration: string
  creditApplication: boolean
  creditApplicationReason?: string
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
    const userId = session?.user?.id
    const userRole = session?.user?.role
    
    // CRITICAL: Initiator cannot approve their own request
    if (initiation.initiatedById === userId) {
      return false
    }
    
    const procurementStatus = initiation.procurementApproval?.status
    const procurementApproverId = initiation.procurementApproval?.approverId
    
    // Procurement approval must be PENDING
    if (procurementStatus !== 'PENDING') return false
    
    // Check if user is directly assigned as procurement approver
    const isDirectlyAssigned = procurementApproverId === userId
    
    // Check if user has delegated procurement authority
    const hasDelegatedAuthority = initiation.isDelegated && 
                                   (initiation.delegationType === 'PROCUREMENT' || 
                                    initiation.delegationType === 'BOTH')
    
    // User can approve if they're directly assigned OR have delegated authority
    return isDirectlyAssigned || hasDelegatedAuthority
  }

  const getApprovalStatus = (initiation: SupplierInitiation) => {
    const { managerApproval, procurementApproval } = initiation
    
    if (managerApproval?.status === 'APPROVED' && procurementApproval?.status === 'APPROVED') {
      return 'Both Approved'
    }
    
    if (managerApproval?.status === 'REJECTED' || procurementApproval?.status === 'REJECTED') {
      return 'Rejected'
    }
    
    if (managerApproval?.status === 'APPROVED' && !procurementApproval) {
      return 'Manager Approved - Awaiting Procurement'
    }
    
    if (procurementApproval?.status === 'APPROVED' && !managerApproval) {
      return 'Procurement Approved - Awaiting Manager'
    }
    
    return 'Awaiting Approvals'
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
      <div className="flex items-center justify-center min-h-screen">
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
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

        {/* Initiations List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredInitiations.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No initiation requests found
            </div>
          ) : (
            filteredInitiations.map((initiation) => (
              <Card key={initiation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(initiation.status)}
                      <div>
                        <h3 className="font-semibold text-slate-900">{initiation.supplierName}</h3>
                        <p className="text-sm text-slate-600">
                          Requested by {initiation.requesterName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {initiation.isDelegated && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                          🔄 Delegated
                        </Badge>
                      )}
                      <Badge className={getStatusColor(initiation.status)}>
                        {initiation.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Business Unit{Array.isArray(initiation.businessUnit) && initiation.businessUnit.length > 1 ? 's' : ''}</p>
                      <p className="text-sm">
                        {Array.isArray(initiation.businessUnit) 
                          ? initiation.businessUnit.map(unit => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300').join(', ')
                          : (initiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
                              ? 'Schauenburg Systems 200' 
                              : 'Schauenburg (Pty) Ltd 300')
                        }
                      </p>
                    </div>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Purchase Type</p>
                      <p className="text-sm">
                        {initiation.purchaseType === 'REGULAR' ? 'Regular Purchase' : initiation.purchaseType === 'ONCE_OFF' ? 'Once-off Purchase' : 'Shared IP'}
                        {initiation.annualPurchaseValue && ` (R${initiation.annualPurchaseValue.toLocaleString()})`}
                      </p>
                    </div>
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
                      <p className="text-sm font-medium text-slate-600">Submitted</p>
                      <p className="text-sm">
                        {new Date(initiation.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-600">Relationship Declaration</p>
                    <p className="text-sm text-slate-700 mt-1">{initiation.relationshipDeclaration}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Manager Approval</p>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(initiation.managerApproval?.status || 'PENDING')}
                        <span className="text-sm">
                          {initiation.managerApproval?.status || 'PENDING'}
                        </span>
                      </div>
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
                    <div>
                      <p className="text-sm font-medium text-slate-600">Procurement Approval</p>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(initiation.procurementApproval?.status || 'PENDING')}
                        <span className="text-sm">
                          {initiation.procurementApproval?.status || 'PENDING'}
                        </span>
                      </div>
                      {initiation.procurementApproval?.status === 'REJECTED' && initiation.procurementApproval?.comments && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs font-medium text-red-900 mb-1">Rejection Reason:</p>
                          <p className="text-xs text-red-800">{initiation.procurementApproval.comments}</p>
                        </div>
                      )}
                      {initiation.procurementApproval?.status === 'APPROVED' && initiation.procurementApproval?.comments && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs font-medium text-green-900 mb-1">Comments:</p>
                          <p className="text-xs text-green-800">{initiation.procurementApproval.comments}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 pt-4 border-t">
                    <p className="text-sm font-medium text-slate-600">Reason for Onboarding Supplier:</p>
                    <p className="text-sm text-slate-700 mt-1 line-clamp-2">{initiation.onboardingReason}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">Approval Status:</p>
                      <p className="text-slate-800">{getApprovalStatus(initiation)}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedInitiation(initiation)
                          setApprovalDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {canApproveAsManager(initiation) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInitiation(initiation)
                              setApprovalAction('reject')
                              setApprovalRole('MANAGER')
                              setApprovalDialogOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject (Manager)
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInitiation(initiation)
                              setApprovalAction('approve')
                              setApprovalRole('MANAGER')
                              setApprovalDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve (Manager)
                          </Button>
                        </>
                      )}
                      
                      {canApproveAsProcurement(initiation) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInitiation(initiation)
                              setApprovalAction('reject')
                              setApprovalRole('PROCUREMENT_MANAGER')
                              setApprovalDialogOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject (Procurement)
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedInitiation(initiation)
                              setApprovalAction('approve')
                              setApprovalRole('PROCUREMENT_MANAGER')
                              setApprovalDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve (Procurement)
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
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
              <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-2">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-slate-900 mb-3">Complete Initiation Details:</h4>
                  
                  {/* Basic Information */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Supplier Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Supplier Name:</strong> {selectedInitiation.supplierName}</p>
                        <p><strong>Contact Person:</strong> {selectedInitiation.supplierContactPerson || 'N/A'}</p>
                        <p><strong>Email:</strong> {selectedInitiation.supplierEmail}</p>
                      </div>
                      <div>
                        <p><strong>Category:</strong> {selectedInitiation.productServiceCategory}</p>
                        <p><strong>Business Unit{Array.isArray(selectedInitiation.businessUnit) && selectedInitiation.businessUnit.length > 1 ? 's' : ''}:</strong> {
                          Array.isArray(selectedInitiation.businessUnit) 
                            ? selectedInitiation.businessUnit.map(unit => unit === 'SCHAUENBURG_SYSTEMS_200' ? 'Schauenburg Systems 200' : 'Schauenburg (Pty) Ltd 300').join(', ')
                            : (selectedInitiation.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
                                ? 'Schauenburg Systems 200' 
                                : 'Schauenburg (Pty) Ltd 300')
                        }</p>
                      </div>
                    </div>
                  </div>

                  {/* Requester Information */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Requester Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Requester:</strong> {selectedInitiation.requesterName}</p>
                        <p><strong>Submitted:</strong> {new Date(selectedInitiation.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Information */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Purchase Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Purchase Type:</strong></p>
                        <p className="text-slate-700">
                          {selectedInitiation.purchaseType === 'REGULAR' && 'Regular Purchase'}
                          {selectedInitiation.purchaseType === 'ONCE_OFF' && 'Once-off Purchase'}
                          {selectedInitiation.purchaseType === 'SHARED_IP' && 'Shared IP'}
                        </p>
                        {selectedInitiation.purchaseType === 'REGULAR' && selectedInitiation.annualPurchaseValue && (
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
            )}
            
            <div className="flex justify-end gap-2 flex-shrink-0 pt-4 border-t">
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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}



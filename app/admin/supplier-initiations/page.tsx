"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, User, Building2, DollarSign, AlertCircle, Trash2, Eye, Home, ChevronDown, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { SupplierInitiationStatus } from "@/components/suppliers/supplier-initiation-status"

interface SupplierInitiation {
  id: string
  status: string
  supplierName: string
  businessUnit: string
  requesterName: string
  submittedAt: string
  initiatedById: string
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
  purchaseType?: string
  regularPurchase: boolean
  annualPurchaseValue?: number
  onceOffPurchase: boolean
  onboardingReason: string
}

export default function SupplierInitiationsPage() {
  const { data: session } = useSession()
  const [initiations, setInitiations] = useState<SupplierInitiation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInitiation, setSelectedInitiation] = useState<SupplierInitiation | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [approvalComments, setApprovalComments] = useState('')
  const [submittingApproval, setSubmittingApproval] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [initiationToDelete, setInitiationToDelete] = useState<SupplierInitiation | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewInitiation, setViewInitiation] = useState<SupplierInitiation | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  useEffect(() => {
    fetchInitiations()
  }, [])

  const fetchInitiations = async () => {
    try {
      const response = await fetch('/api/suppliers/initiations')
      if (response.ok) {
        const data = await response.json()
        setInitiations(data)
      }
    } catch (error) {
      console.error('Error fetching initiations:', error)
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
          comments: approvalComments
        }),
      })

      if (response.ok) {
        setApprovalDialogOpen(false)
        setSelectedInitiation(null)
        setApprovalComments('')
        fetchInitiations() // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({}))
        setErrorMessage(errorData.error || 'Failed to process approval')
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      setErrorMessage('Failed to process approval')
      setErrorDialogOpen(true)
    } finally {
      setSubmittingApproval(false)
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
      } else {
        const errorData = await response.json().catch(() => ({}))
        setErrorMessage(errorData.error || 'Failed to delete initiation')
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error deleting initiation:', error)
      setErrorMessage('Failed to delete initiation')
      setErrorDialogOpen(true)
    } finally {
      setDeleting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SUPPLIER_EMAILED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SUPPLIER_EMAILED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canApprove = (initiation: SupplierInitiation) => {
    if (!session?.user) return false
    
    // Check if user is manager or procurement manager
    const isManager = session.user.role === 'ADMIN' || session.user.role === 'APPROVER'
    const isProcurementManager = session.user.role === 'PROCUREMENT_MANAGER'
    
    if (isManager && initiation.managerApproval?.status === 'PENDING') return true
    if (isProcurementManager && initiation.procurementApproval?.status === 'PENDING') return true
    
    return false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 original:bg-white original:border-slate-200">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground original:text-slate-800">Supplier Initiations</h1>
            <p className="text-sm text-muted-foreground original:text-slate-600">Manage supplier onboarding initiation requests</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : initiations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
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
                {initiations.map((initiation) => {
                  const isExpanded = expandedRows.has(initiation.id)
                  return (
                    <React.Fragment key={initiation.id}>
                      <TableRow 
                        className="hover:bg-gray-50 cursor-pointer"
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
                            
                            {/* Show Edit button for drafts and rejected initiations created by current user */}
                            {(initiation.status === 'DRAFT' || initiation.status === 'REJECTED') && initiation.initiatedById === session?.user?.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <Link href={`/suppliers/onboard?draftId=${initiation.id}`}>
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  {initiation.status === 'DRAFT' ? 'Continue Editing' : 'Revise & Resubmit'}
                                </Link>
                              </Button>
                            )}
                            
                            {canApprove(initiation) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedInitiation(initiation)
                                    setApprovalAction('reject')
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
                                    setApprovalDialogOpen(true)
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </>
                            )}
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
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-gray-50 p-6">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Purchase Type</Label>
                                  <p className="text-sm">
                                    {initiation.purchaseType === 'REGULAR' && 'Regular Purchase'}
                                    {initiation.purchaseType === 'ONCE_OFF' && 'Once-off Purchase'}
                                    {initiation.purchaseType === 'SHARED_IP' && 'Shared IP'}
                                    {!initiation.purchaseType && (initiation.regularPurchase ? 'Regular Purchase' : initiation.onceOffPurchase ? 'Once-off Purchase' : 'N/A')}
                                    {initiation.annualPurchaseValue && ` (R${initiation.annualPurchaseValue.toLocaleString()})`}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Manager Approval</Label>
                                  <div className="flex items-center gap-2 mb-1">
                                    {getStatusIcon(initiation.managerApproval?.status || 'PENDING')}
                                    <span className="text-sm">
                                      {initiation.managerApproval?.status || 'PENDING'}
                                    </span>
                                  </div>
                                  {initiation.managerApproval?.approver && (
                                    <p className="text-xs text-gray-500">by {initiation.managerApproval.approver}</p>
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
                                {/* Only show Procurement Approval if Manager has approved */}
                                {initiation.managerApproval?.status === 'APPROVED' && (
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Procurement Approval</Label>
                                    <div className="flex items-center gap-2 mb-1">
                                      {getStatusIcon(initiation.procurementApproval?.status || 'PENDING')}
                                      <span className="text-sm">
                                        {initiation.procurementApproval?.status || 'PENDING'}
                                      </span>
                                    </div>
                                    {initiation.procurementApproval?.approver && (
                                      <p className="text-xs text-gray-500">by {initiation.procurementApproval.approver}</p>
                                    )}
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
                                )}
                              </div>
                              <div className="pt-4 border-t">
                                <Label className="text-sm font-medium text-gray-600 mb-2">Reason for Onboarding:</Label>
                                <p className="text-sm text-gray-700">{initiation.onboardingReason}</p>
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
      </main>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Supplier Initiation
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? 'Are you sure you want to approve this supplier initiation?'
                : 'Are you sure you want to reject this supplier initiation?'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Add any comments about your decision..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setApprovalDialogOpen(false)}
                disabled={submittingApproval}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproval}
                disabled={submittingApproval}
                variant={approvalAction === 'reject' ? 'destructive' : 'default'}
              >
                {submittingApproval ? 'Processing...' : `${approvalAction === 'approve' ? 'Approve' : 'Reject'}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setErrorDialogOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle, User, Mail, AlertCircle } from "lucide-react"

interface SupplierInitiationStatusProps {
  initiationId: string
}

interface InitiationData {
  id: string
  status: string
  supplierName: string
  businessUnit: string | string[]
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
  emailSent: boolean
  emailSentAt?: string
  onboarding?: {
    id: string
    overallStatus: string
    currentStep: string
    supplierFormSubmitted: boolean
    supplierFormSubmittedAt?: string
    revisionRequested: boolean
    revisionCount: number
    approvedAt?: string
    rejectedAt?: string
  }
}

export function SupplierInitiationStatus({ initiationId }: SupplierInitiationStatusProps) {
  const [initiationData, setInitiationData] = useState<InitiationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInitiationData = async () => {
      try {
        const response = await fetch(`/api/suppliers/initiation/${initiationId}`)
        if (response.ok) {
          const data = await response.json()
          setInitiationData(data)
        }
      } catch (error) {
        console.error('Error fetching initiation data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitiationData()
  }, [initiationId])

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!initiationData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Failed to load initiation data
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Supplier Initiation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600">Supplier Name</h4>
              <p className="text-lg">{initiationData.supplierName}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600">Business Unit{Array.isArray(initiationData.businessUnit) && initiationData.businessUnit.length > 1 ? 's' : ''}</h4>
              <p className="text-lg">
                {Array.isArray(initiationData.businessUnit)
                  ? initiationData.businessUnit.map(unit => 
                      unit === 'SCHAUENBURG_SYSTEMS_200' 
                        ? 'Schauenburg Systems (Pty) Ltd 300' 
                        : 'Schauenburg (Pty) Ltd 200'
                    ).join(', ')
                  : initiationData.businessUnit === 'SCHAUENBURG_SYSTEMS_200' 
                    ? 'Schauenburg Systems (Pty) Ltd 300' 
                    : 'Schauenburg (Pty) Ltd 200'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-600">Overall Status:</span>
            <Badge className={getStatusColor(initiationData.status)}>
              {initiationData.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manager Approval */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(initiationData.managerApproval?.status || 'PENDING')}
                <span className="font-medium">Manager Approval</span>
              </div>
              <Badge className={getStatusColor(initiationData.managerApproval?.status || 'PENDING')}>
                {initiationData.managerApproval?.status || 'PENDING'}
              </Badge>
            </div>
            {initiationData.managerApproval && (
              <div className="text-sm text-gray-600 space-y-2">
                <p>Approver: {initiationData.managerApproval.approver}</p>
                {initiationData.managerApproval.approvedAt && (
                  <p>
                    {initiationData.managerApproval.status === 'APPROVED' ? 'Approved: ' : 
                     initiationData.managerApproval.status === 'REJECTED' ? 'Rejected: ' : 'Date: '}
                    {new Date(initiationData.managerApproval.approvedAt).toLocaleString()}
                  </p>
                )}
                {initiationData.managerApproval.comments && initiationData.managerApproval.status === 'REJECTED' && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs font-medium text-red-900 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-800">{initiationData.managerApproval.comments}</p>
                  </div>
                )}
                {initiationData.managerApproval.comments && initiationData.managerApproval.status === 'APPROVED' && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs font-medium text-green-900 mb-1">Comments:</p>
                    <p className="text-sm text-green-800">{initiationData.managerApproval.comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Procurement Approval - REMOVED FROM WORKFLOW */}
          {/* Procurement manager approval is no longer part of the workflow */}
        </CardContent>
      </Card>

      {/* Email Status */}
      {(initiationData.status === 'APPROVED' || initiationData.status === 'SUPPLIER_EMAILED') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initiationData.emailSent ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Email sent to supplier on {new Date(initiationData.emailSentAt!).toLocaleString()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <Clock className="h-4 w-4" />
                <span>Waiting for manager approval to send email to supplier</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Onboarding Progress */}
      {initiationData.onboarding && (
        <Card>
          <CardHeader>
            <CardTitle>Document Submission Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-gray-600">Current Status:</span>
              <Badge className={
                initiationData.onboarding.overallStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                initiationData.onboarding.overallStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                initiationData.onboarding.revisionRequested ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }>
                {initiationData.onboarding.overallStatus === 'AWAITING_RESPONSE' && !initiationData.onboarding.supplierFormSubmitted && 'Awaiting Supplier Documents'}
                {initiationData.onboarding.overallStatus === 'AWAITING_RESPONSE' && initiationData.onboarding.supplierFormSubmitted && 'Under PM Review'}
                {initiationData.onboarding.overallStatus === 'UNDER_REVIEW' && 'Under PM Review'}
                {initiationData.onboarding.revisionRequested && 'Revision Requested'}
                {initiationData.onboarding.overallStatus === 'APPROVED' && 'Approved'}
                {initiationData.onboarding.overallStatus === 'REJECTED' && 'Rejected'}
              </Badge>
            </div>

            {/* Document Submission */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {initiationData.onboarding.supplierFormSubmitted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="font-medium">Supplier Document Submission</span>
                </div>
                <Badge className={initiationData.onboarding.supplierFormSubmitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {initiationData.onboarding.supplierFormSubmitted ? 'Submitted' : 'Pending'}
                </Badge>
              </div>
              {initiationData.onboarding.supplierFormSubmitted && initiationData.onboarding.supplierFormSubmittedAt && (
                <p className="text-sm text-gray-600">
                  Submitted on: {new Date(initiationData.onboarding.supplierFormSubmittedAt).toLocaleString()}
                </p>
              )}
              {initiationData.onboarding.revisionCount > 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  Revisions requested: {initiationData.onboarding.revisionCount}
                </p>
              )}
            </div>

            {/* PM Review Status */}
            {initiationData.onboarding.supplierFormSubmitted && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {initiationData.onboarding.approvedAt ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : initiationData.onboarding.rejectedAt ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="font-medium">Procurement Manager Review</span>
                  </div>
                  <Badge className={
                    initiationData.onboarding.approvedAt ? 'bg-green-100 text-green-800' :
                    initiationData.onboarding.rejectedAt ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {initiationData.onboarding.approvedAt ? 'Approved' :
                     initiationData.onboarding.rejectedAt ? 'Rejected' :
                     'In Progress'}
                  </Badge>
                </div>
                {initiationData.onboarding.approvedAt && (
                  <p className="text-sm text-gray-600">
                    Approved on: {new Date(initiationData.onboarding.approvedAt).toLocaleString()}
                  </p>
                )}
                {initiationData.onboarding.rejectedAt && (
                  <p className="text-sm text-gray-600">
                    Rejected on: {new Date(initiationData.onboarding.rejectedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {initiationData.status === 'SUPPLIER_EMAILED' && initiationData.emailSent && !initiationData.onboarding?.approvedAt && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            {!initiationData.onboarding?.supplierFormSubmitted ? (
              <>
                <p className="text-gray-600">
                  The supplier has been notified and can now proceed with the onboarding process. 
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  ⏳ <strong>Waiting for:</strong> Supplier to upload required documents
                </p>
              </>
            ) : initiationData.onboarding?.revisionRequested ? (
              <>
                <p className="text-gray-600">
                  The Procurement Manager has requested revisions from the supplier.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  ⏳ <strong>Waiting for:</strong> Supplier to resubmit documents with requested changes
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600">
                  The supplier has submitted their documents and they are currently being reviewed by the Procurement Manager.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  ⏳ <strong>Waiting for:</strong> Procurement Manager to review and approve documents
                </p>
              </>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              You can continue to monitor the status of this initiation from this page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completion Message */}
      {initiationData.onboarding?.approvedAt && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Onboarding Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800">
              The supplier onboarding process has been successfully completed! The supplier is now approved and can proceed with business operations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Loader2, 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  Building2,
  Eye,
  Edit,
  UserCheck,
  Trash2,
  Brain,
  Play,
  CheckCheck,
  AlertCircle
} from "lucide-react"
import { workerClient } from "@/lib/worker-client"
import { getMandatoryDocuments, type PurchaseType } from "@/lib/document-requirements"

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
  supplierName?: string | null
  tradingName?: string | null
  registrationNumber?: string | null
  physicalAddress?: string | null
  postalAddress?: string | null
  associatedCompany?: string | null
  productsAndServices?: string | null
  associatedCompanyRegNo?: string | null
  associatedCompanyBranchName?: string | null
  branchesContactNumbers?: string | null
  bankAccountName?: string | null
  bankName?: string | null
  branchName?: string | null
  branchNumber?: string | null
  accountNumber?: string | null
  typeOfAccount?: string | null
  rpBanking?: string | null
  rpBankingPhone?: string | null
  rpBankingEmail?: string | null
  rpQuality?: string | null
  rpQualityPhone?: string | null
  rpQualityEmail?: string | null
  rpSHE?: string | null
  rpSHEPhone?: string | null
  rpSHEEmail?: string | null
  rpBBBEE?: string | null
  rpBBBEEPhone?: string | null
  rpBBBEEEmail?: string | null
  qualityManagementCert?: boolean | null
  sheCertification?: boolean | null
  authorizationAgreement?: boolean | null
  onboarding?: {
    requiredDocuments?: string[]
    initiation?: {
      purchaseType?: string
      creditApplication?: boolean
      initiatedById?: string
    } | null
  } | null
}

export default function SupplierDetailPage({ params }: { params: Promise<{ supplierId: string }> }) {
  const router = useRouter()
  const { data: session } = useSession()
  const resolvedParams = use(params)
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCompletion, setShowCompletion] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyNameConfirm, setCompanyNameConfirm] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState("")
  const [revisionSubmitting, setRevisionSubmitting] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Supplier>>({})
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // AI Insights state
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiLogs, setAiLogs] = useState<string[]>([])
  const [aiSummary, setAiSummary] = useState<any>(null)
  const [aiMode, setAiMode] = useState<string>('unknown')
  const [aiJobId, setAiJobId] = useState<string | null>(null)
  const [aiProgress, setAiProgress] = useState(0)
  const [aiCurrentStep, setAiCurrentStep] = useState<string | null>(null)

  // Document verification state
  const [documentVerifications, setDocumentVerifications] = useState<Record<string, boolean>>({})
  // Document incorrect state - tracks which documents are marked as incorrect
  const [incorrectDocuments, setIncorrectDocuments] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchSupplier()
  }, [])

  useEffect(() => {
    if (supplier?.id) {
      fetchDocumentVerifications()
      checkExistingAnalysisJob()
    }
  }, [supplier?.id])

  // Handle browser back button to redirect to dashboard
  useEffect(() => {
    const handlePopState = () => {
      router.push('/dashboard')
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [router])

  // Poll for analysis job status
  useEffect(() => {
    if (!aiJobId || !supplier?.id) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/suppliers/${supplier.id}/ai-analysis/status`)
        const data = await response.json()
        
        if (data.success && data.job) {
          const job = data.job
          
          // Update logs
          if (job.logs && Array.isArray(job.logs)) {
            setAiLogs(job.logs)
          }
          
          // Update progress
          setAiProgress(job.progress || 0)
          setAiCurrentStep(job.currentStep || null)
          
          // Update AI mode
          if (job.aiMode) {
            setAiMode(job.aiMode)
          }
          
          // Check if job is complete
          if (job.status === 'COMPLETED') {
            setAiProcessing(false)
            setAiSummary(job.results || job.summary)
            clearInterval(pollInterval)
          } else if (job.status === 'FAILED') {
            setAiProcessing(false)
            setErrorMessage(job.errorMessage || 'AI analysis failed')
            setErrorDialogOpen(true)
            clearInterval(pollInterval)
          } else if (job.status === 'IN_PROGRESS' || job.status === 'PENDING') {
            setAiProcessing(true)
          }
        }
      } catch (error) {
        console.error('Error polling analysis status:', error)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [aiJobId, supplier?.id])

  const checkExistingAnalysisJob = async () => {
    if (!supplier?.id) return
    
    try {
      const response = await fetch(`/api/suppliers/${supplier.id}/ai-analysis/status`)
      const data = await response.json()
      
      if (data.success && data.job) {
        const job = data.job
        
        // If there's an in-progress job, resume monitoring
        if (job.status === 'IN_PROGRESS' || job.status === 'PENDING') {
          setAiJobId(job.id)
          setAiProcessing(true)
          setAiLogs(job.logs || [])
          setAiProgress(job.progress || 0)
          setAiCurrentStep(job.currentStep || null)
          if (job.aiMode) {
            setAiMode(job.aiMode)
          }
        } else if (job.status === 'COMPLETED') {
          // Load completed results
          setAiSummary(job.results || job.summary)
          setAiLogs(job.logs || [])
          setAiProgress(100)
          if (job.aiMode) {
            setAiMode(job.aiMode)
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing analysis job:', error)
    }
  }

  const fetchSupplier = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/suppliers/${resolvedParams.supplierId}`)
      const data = await response.json()
      
      if (data.success) {
        setSupplier(data.supplier)
      }
    } catch (error) {
      console.error('Error fetching supplier:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentVerifications = async () => {
    if (!supplier?.id) return
    
    try {
      const response = await fetch(`/api/suppliers/documents/verify?supplierId=${supplier.id}`)
      const data = await response.json()
      
      if (data.success) {
        setDocumentVerifications(data.verifications)
      }
    } catch (error) {
      console.error('Error fetching document verifications:', error)
    }
  }

  const handleVerificationToggle = async (version: number, category: string, fileName: string, currentState: boolean) => {
    try {
      const response = await fetch('/api/suppliers/documents/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: supplier?.id,
          version,
          category,
          fileName,
          isVerified: !currentState
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        const key = `${version}-${category}-${fileName}`
        setDocumentVerifications(prev => ({
          ...prev,
          [key]: !currentState
        }))
      } else {
        setErrorMessage('Failed to update verification status')
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error updating verification:', error)
      setErrorMessage('Failed to update verification status')
      setErrorDialogOpen(true)
    }
  }

  const handleIncorrectToggle = (version: number, category: string, fileName: string, currentState: boolean) => {
    const key = `${version}-${category}-${fileName}`
    setIncorrectDocuments(prev => ({
      ...prev,
      [key]: !currentState
    }))
  }

  const handleApproveClick = () => {
    setApproveDialogOpen(true)
  }


  const handleRejectClick = () => {
    setRejectDialogOpen(true)
    setRejectReason("")
  }

  const confirmApprove = async () => {
    try {
      // Check if user is PM approving, or initiator requesting final approval
      const isPmApproving = session?.user?.role === 'PROCUREMENT_MANAGER' && supplier?.status === 'AWAITING_FINAL_APPROVAL'
      
      if (isPmApproving) {
        // PM is approving the supplier
        const response = await fetch('/api/suppliers/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            supplierId: supplier?.id, 
            status: 'APPROVED'
          })
        })

        const data = await response.json()
        
        if (data.success) {
          setShowCompletion(true)
          setSuccessMessage(`Supplier approved successfully!\n\nAn approval email has been sent to ${supplier?.contactEmail}`)
          setSuccessDialogOpen(true)
          await fetchSupplier()
        } else {
          setErrorMessage(`Failed to approve supplier: ${data.error}`)
          setErrorDialogOpen(true)
        }
      } else {
        // Initiator is requesting final approval
        const response = await fetch('/api/suppliers/request-final-approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            supplierId: supplier?.id
          })
        })

        const data = await response.json()
        
        if (data.success) {
          setSuccessMessage(`Final approval request sent successfully!\n\nAn email has been sent to the Procurement Manager for final approval.`)
          setSuccessDialogOpen(true)
          await fetchSupplier()
        } else {
          setErrorMessage(`Failed to request final approval: ${data.error}`)
          setErrorDialogOpen(true)
        }
      }
    } catch (error) {
      console.error('Error in approval process:', error)
      setErrorMessage('Failed to process request. Please try again.')
      setErrorDialogOpen(true)
    } finally {
      setApproveDialogOpen(false)
    }
  }

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      setErrorMessage('Rejection reason is required. Please provide a reason for rejection.')
      setErrorDialogOpen(true)
      return
    }

    try {
      const response = await fetch('/api/suppliers/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supplierId: supplier?.id, 
          status: 'REJECTED',
          rejectionReason: rejectReason.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(`Supplier rejected successfully!\n\nA rejection notification email with your feedback has been sent to ${supplier?.contactEmail}`)
        setSuccessDialogOpen(true)
        await fetchSupplier()
      } else {
        setErrorMessage(`Failed to reject supplier: ${data.error}`)
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      setErrorMessage('Failed to update supplier status. Please try again.')
      setErrorDialogOpen(true)
    } finally {
      setRejectDialogOpen(false)
      setRejectReason("")
    }
  }

  const handleEditClick = () => {
    if (supplier) {
      setEditData({ ...supplier })
      setIsEditing(true)
      setActiveTab("details") // Switch to details tab
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handleSaveEdit = async () => {
    if (!supplier) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/suppliers/${supplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      const data = await response.json()
      
      if (data.success) {
        setSupplier(data.supplier)
        setIsEditing(false)
        setEditData({})
        setSuccessMessage('Supplier information updated successfully!')
        setSuccessDialogOpen(true)
      } else {
        setErrorMessage(`Failed to update supplier: ${data.error}`)
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
      setErrorMessage('Failed to update supplier. Please try again.')
      setErrorDialogOpen(true)
    } finally {
      setSaving(false)
    }
  }

  const handleRevisionClick = (missingDocsList?: Array<{ name: string, icon: string }>, incorrectDocsList?: Array<{ version: number, category: string, fileName: string }>) => {
    setRevisionDialogOpen(true)
    
    // If incorrect documents are provided, pre-fill the revision notes
    if (incorrectDocsList && incorrectDocsList.length > 0) {
      const documentNames = incorrectDocsList.map(doc => {
        const categoryName = doc.category.replace(/([A-Z])/g, ' $1').trim()
        return `${categoryName}: ${doc.fileName}`
      })
      
      const preFilledNotes = `Dear ${supplier?.contactPerson || 'Supplier'},

We have reviewed your submission and found that the following documents require correction:

${documentNames.map((name, idx) => `${idx + 1}. ${name}`).join('\n')}

Please review and correct these documents. The issues may include:
- Document is not clear or legible
- Document is expired or outdated
- Document does not match the required format
- Information in the document is incorrect or incomplete
- Document is not the correct type required

Please upload corrected versions of these documents by logging into the supplier portal using the link provided in your original onboarding email.

If you have any questions or need clarification, please don't hesitate to contact us.

Best regards,
Procurement Team`
      setRevisionNotes(preFilledNotes)
    }
    // If missing documents are provided, pre-fill the revision notes
    else if (missingDocsList && missingDocsList.length > 0) {
      const preFilledNotes = `Dear ${supplier?.contactPerson || 'Supplier'},

We have reviewed your submission and found that the following compulsory documents are missing:

${missingDocsList.map((doc, idx) => `${idx + 1}. ${doc.name}`).join('\n')}

Please upload these mandatory documents to complete your supplier onboarding application. All documents should be:
- Clear and legible
- Current and valid (not expired)
- In PDF format where possible

You can upload the documents by logging into the supplier portal using the link provided in your original onboarding email.

If you have any questions or need clarification, please don't hesitate to contact us.

Best regards,
Procurement Team`
      setRevisionNotes(preFilledNotes)
    } else {
      setRevisionNotes("")
    }
  }

  const confirmRevision = async () => {
    if (!revisionNotes.trim()) {
      setErrorMessage('Revision notes are required. Please specify what needs to be revised.')
      setErrorDialogOpen(true)
      return
    }

    // Prevent multiple submissions
    if (revisionSubmitting) {
      return
    }

    setRevisionSubmitting(true)
    try {
      const response = await fetch('/api/suppliers/request-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supplierId: supplier?.id, 
          revisionNotes: revisionNotes.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(`Revision request sent successfully!\n\nAn email with your feedback has been sent to ${supplier?.contactEmail}`)
        setSuccessDialogOpen(true)
        await fetchSupplier()
        setRevisionDialogOpen(false)
        setRevisionNotes("")
      } else {
        setErrorMessage(`Failed to send revision request: ${data.error}`)
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error requesting revision:', error)
      setErrorMessage('Failed to send revision request. Please try again.')
      setErrorDialogOpen(true)
    } finally {
      setRevisionSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
    setCompanyNameConfirm("")
  }

  const confirmDelete = async () => {
    if (companyNameConfirm !== supplier?.companyName) {
      setErrorMessage('Company name does not match. Please try again.')
      setErrorDialogOpen(true)
      return
    }

    try {
      const response = await fetch(`/api/suppliers/${supplier?.id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(`Supplier "${supplier?.companyName}" has been permanently deleted. Redirecting to suppliers list...`)
        setSuccessDialogOpen(true)
        setTimeout(() => {
          router.push('/suppliers/onboard?tab=review')
        }, 2000)
      } else {
        setErrorMessage(`Failed to delete supplier: ${data.error}`)
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      setErrorMessage('Failed to delete supplier. Please try again.')
      setErrorDialogOpen(true)
    } finally {
      setDeleteDialogOpen(false)
      setCompanyNameConfirm("")
    }
  }

  const handleAIAnalysis = async () => {
    if (!supplier?.airtableData?.allVersions || supplier.airtableData.allVersions.length === 0) {
      setErrorMessage('No documents available to analyze.')
      setErrorDialogOpen(true)
      return
    }

    try {
      // Start background analysis job
      const response = await fetch(`/api/suppliers/${supplier.id}/ai-analysis/start`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAiJobId(data.jobId)
        setAiProcessing(true)
        setAiLogs(['🚀 Starting AI analysis in background...'])
        setAiSummary(null)
        setAiProgress(0)
        setAiCurrentStep('Initializing...')
      } else {
        setErrorMessage(data.error || 'Failed to start AI analysis')
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error starting AI analysis:', error)
      setErrorMessage('Failed to start AI analysis. Please try again.')
      setErrorDialogOpen(true)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500'
      case 'UNDER_REVIEW': return 'bg-yellow-500'
      case 'AWAITING_FINAL_APPROVAL': return 'bg-orange-500'
      case 'REJECTED': return 'bg-red-500'
      case 'PENDING': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Supplier not found</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Completion Dialog */}
      <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-semibold">Onboarding Successful!</DialogTitle>
            <DialogDescription className="text-center">
              The supplier has been successfully added to your database.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-5 p-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-9 w-9 text-green-600" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-4 text-center">
                  <div className="text-sm font-medium text-green-800">Database Entry</div>
                  <div className="text-xs text-green-700">Supplier profile created</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-4 text-center">
                  <div className="text-sm font-medium text-green-800">Notification Sent</div>
                  <div className="text-xs text-green-700">Approval email delivered</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-4 text-center">
                  <div className="text-sm font-medium text-green-800">Documents Stored</div>
                  <div className="text-xs text-green-700">All files archived securely</div>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <Button variant="outline" onClick={() => router.push('/suppliers')}>View All Suppliers</Button>
              <Button onClick={() => router.push('/suppliers/onboard?tab=review')}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{supplier.companyName}</h1>
                <p className="text-sm text-gray-600">Supplier Code: {supplier.supplierCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  disabled={supplier.status === 'REJECTED'}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Supplier
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            <Badge className={`${getStatusColor(supplier.status)} text-white px-4 py-2`}>
              {supplier.status.replace('_', ' ')}
            </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="ai-insights">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Supplier Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.supplierName || ''}
                        onChange={(e) => setEditData({ ...editData, supplierName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.supplierName || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Contact Person</label>
                    {isEditing ? (
                      <Input
                        value={editData.contactPerson || ''}
                        onChange={(e) => setEditData({ ...editData, contactPerson: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.contactPerson || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Name of Business</label>
                    {isEditing ? (
                      <Input
                        value={editData.companyName || ''}
                        onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.companyName || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Trading Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.tradingName || ''}
                        onChange={(e) => setEditData({ ...editData, tradingName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.tradingName || 'N/A'}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Company Registration No.</label>
                    {isEditing ? (
                      <Input
                        value={editData.registrationNumber || ''}
                        onChange={(e) => setEditData({ ...editData, registrationNumber: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.registrationNumber || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Address & Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Physical Address</label>
                    {isEditing ? (
                      <Textarea
                        value={editData.physicalAddress || ''}
                        onChange={(e) => setEditData({ ...editData, physicalAddress: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                    <p className="text-sm font-medium whitespace-pre-wrap">{supplier.physicalAddress || 'N/A'}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Postal Address</label>
                    {isEditing ? (
                      <Textarea
                        value={editData.postalAddress || ''}
                        onChange={(e) => setEditData({ ...editData, postalAddress: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                    <p className="text-sm font-medium whitespace-pre-wrap">{supplier.postalAddress || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Contact Number</label>
                    {isEditing ? (
                      <Input
                        value={editData.contactPhone || ''}
                        onChange={(e) => setEditData({ ...editData, contactPhone: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.contactPhone || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">E-mail Address</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editData.contactEmail || ''}
                        onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.contactEmail || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Nature of Business</label>
                    {isEditing ? (
                      <Input
                        value={editData.natureOfBusiness || ''}
                        onChange={(e) => setEditData({ ...editData, natureOfBusiness: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.natureOfBusiness || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Associated Company</label>
                    {isEditing ? (
                      <Input
                        value={editData.associatedCompany || ''}
                        onChange={(e) => setEditData({ ...editData, associatedCompany: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.associatedCompany || 'N/A'}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Products and/or Services</label>
                    {isEditing ? (
                      <Textarea
                        value={editData.productsAndServices || ''}
                        onChange={(e) => setEditData({ ...editData, productsAndServices: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                    <p className="text-sm font-medium whitespace-pre-wrap">{supplier.productsAndServices || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Associated Company Registration No.</label>
                    {isEditing ? (
                      <Input
                        value={editData.associatedCompanyRegNo || ''}
                        onChange={(e) => setEditData({ ...editData, associatedCompanyRegNo: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.associatedCompanyRegNo || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Associated Company Branch Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.associatedCompanyBranchName || ''}
                        onChange={(e) => setEditData({ ...editData, associatedCompanyBranchName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.associatedCompanyBranchName || 'N/A'}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Branches Contact Numbers</label>
                    {isEditing ? (
                      <Textarea
                        value={editData.branchesContactNumbers || ''}
                        onChange={(e) => setEditData({ ...editData, branchesContactNumbers: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                    <p className="text-sm font-medium whitespace-pre-wrap">{supplier.branchesContactNumbers || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Bank Account Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.bankAccountName || ''}
                        onChange={(e) => setEditData({ ...editData, bankAccountName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.bankAccountName || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Bank Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.bankName || ''}
                        onChange={(e) => setEditData({ ...editData, bankName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.bankName || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Branch Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.branchName || ''}
                        onChange={(e) => setEditData({ ...editData, branchName: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.branchName || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Branch Number</label>
                    {isEditing ? (
                      <Input
                        value={editData.branchNumber || ''}
                        onChange={(e) => setEditData({ ...editData, branchNumber: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.branchNumber || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Account Number</label>
                    {isEditing ? (
                      <Input
                        value={editData.accountNumber || ''}
                        onChange={(e) => setEditData({ ...editData, accountNumber: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.accountNumber || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Type of Account</label>
                    {isEditing ? (
                      <Input
                        value={editData.typeOfAccount || ''}
                        onChange={(e) => setEditData({ ...editData, typeOfAccount: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.typeOfAccount || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsible Persons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  Responsible Persons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Banking RP */}
                <div>
                  <h4 className="font-semibold text-sm text-blue-600 mb-3">Banking</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Name</label>
                      {isEditing ? (
                        <Input
                          value={editData.rpBanking || ''}
                          onChange={(e) => setEditData({ ...editData, rpBanking: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpBanking || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Telephone</label>
                      {isEditing ? (
                        <Input
                          value={editData.rpBankingPhone || ''}
                          onChange={(e) => setEditData({ ...editData, rpBankingPhone: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpBankingPhone || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editData.rpBankingEmail || ''}
                          onChange={(e) => setEditData({ ...editData, rpBankingEmail: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpBankingEmail || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quality Management RP */}
                <div>
                  <h4 className="font-semibold text-sm text-blue-600 mb-3">Quality Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Name</label>
                      {isEditing ? (
                        <Input
                          value={editData.rpQuality || ''}
                          onChange={(e) => setEditData({ ...editData, rpQuality: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpQuality || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Telephone</label>
                      {isEditing ? (
                        <Input
                          value={editData.rpQualityPhone || ''}
                          onChange={(e) => setEditData({ ...editData, rpQualityPhone: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpQualityPhone || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editData.rpQualityEmail || ''}
                          onChange={(e) => setEditData({ ...editData, rpQualityEmail: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpQualityEmail || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SHE RP */}
                <div>
                  <h4 className="font-semibold text-sm text-blue-600 mb-3">Safety, Health and Environment (SHE)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Name</label>
                      {isEditing ? (
                        <Input
                          value={editData.rpSHE || ''}
                          onChange={(e) => setEditData({ ...editData, rpSHE: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpSHE || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Telephone</label>
                      {isEditing ? (
                        <Input
                          value={editData.rpSHEPhone || ''}
                          onChange={(e) => setEditData({ ...editData, rpSHEPhone: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpSHEPhone || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editData.rpSHEEmail || ''}
                          onChange={(e) => setEditData({ ...editData, rpSHEEmail: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpSHEEmail || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BBBEE RP */}
                <div>
                  <h4 className="font-semibold text-sm text-blue-600 mb-3">BBBEE</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Name</label>
                      {isEditing ? (
                        <Input
                          value={editData.rpBBBEE || ''}
                          onChange={(e) => setEditData({ ...editData, rpBBBEE: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpBBBEE || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Telephone</label>
                      {isEditing ? (
                        <Input
                          value={editData.rpBBBEEPhone || ''}
                          onChange={(e) => setEditData({ ...editData, rpBBBEEPhone: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpBBBEEPhone || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editData.rpBBBEEEmail || ''}
                          onChange={(e) => setEditData({ ...editData, rpBBBEEEmail: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                      <p className="text-sm font-medium">{supplier.rpBBBEEEmail || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BBBEE & Employment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  BBBEE & Employment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">BBBEE Status</label>
                    {isEditing ? (
                      <Input
                        value={editData.bbbeeLevel || ''}
                        onChange={(e) => setEditData({ ...editData, bbbeeLevel: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.bbbeeLevel || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Number of Employees</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.numberOfEmployees || ''}
                        onChange={(e) => setEditData({ ...editData, numberOfEmployees: e.target.value ? parseInt(e.target.value) : null })}
                        className="mt-1"
                      />
                    ) : (
                    <p className="text-sm font-medium">{supplier.numberOfEmployees || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Certifications & Agreements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Checkbox
                        checked={editData.qualityManagementCert || false}
                        onCheckedChange={(checked) => setEditData({ ...editData, qualityManagementCert: checked as boolean })}
                      />
                    ) : (
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${supplier.qualityManagementCert ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {supplier.qualityManagementCert && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    )}
                    <span className="text-sm">Quality Management Certification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Checkbox
                        checked={editData.sheCertification || false}
                        onCheckedChange={(checked) => setEditData({ ...editData, sheCertification: checked as boolean })}
                      />
                    ) : (
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${supplier.sheCertification ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {supplier.sheCertification && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    )}
                    <span className="text-sm">Safety, Health and Environment (SHE) Certification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Checkbox
                        checked={editData.authorizationAgreement || false}
                        onCheckedChange={(checked) => setEditData({ ...editData, authorizationAgreement: checked as boolean })}
                      />
                    ) : (
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${supplier.authorizationAgreement ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {supplier.authorizationAgreement && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    )}
                    <span className="text-sm">Authorization Agreement Signed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            {supplier.airtableData?.allVersions ? (
              <div className="space-y-6">
                {/* Check for missing mandatory documents across all versions */}
                {(() => {
                  // Combine uploaded files from all versions
                  const allUploadedFiles: Record<string, string[]> = {}
                  supplier.airtableData.allVersions.forEach((version: any) => {
                    const versionFiles = version.uploadedFiles || {}
                    Object.entries(versionFiles).forEach(([category, files]) => {
                      if (!allUploadedFiles[category]) {
                        allUploadedFiles[category] = []
                      }
                      // Add files from this version if not already present
                      const fileArray = files as string[]
                      fileArray.forEach(file => {
                        if (!allUploadedFiles[category].includes(file)) {
                          allUploadedFiles[category].push(file)
                        }
                      })
                    })
                  })
                  
                  // Get purchase type from supplier onboarding data
                  // Priority: 1) initiation.purchaseType (most reliable), 2) infer from requiredDocuments, 3) default to REGULAR
                  let purchaseType: PurchaseType = 'REGULAR' // Default to REGULAR
                  
                  // Try to get purchase type from onboarding initiation (most reliable source)
                  if (supplier.onboarding?.initiation?.purchaseType) {
                    purchaseType = supplier.onboarding.initiation.purchaseType as PurchaseType
                  } 
                  // Otherwise, infer from requiredDocuments in onboarding
                  else if (supplier.onboarding?.requiredDocuments && supplier.onboarding.requiredDocuments.length > 0) {
                    const requiredDocs = supplier.onboarding.requiredDocuments as string[]
                    // If requiredDocuments includes 'nda', it's SHARED_IP
                    if (requiredDocs.includes('nda')) {
                      purchaseType = 'SHARED_IP'
                    } 
                    // If only 2 documents required, it's ONCE_OFF
                    else if (requiredDocs.length <= 2) {
                      purchaseType = 'ONCE_OFF'
                    } 
                    // Otherwise, it's REGULAR
                    else {
                      purchaseType = 'REGULAR'
                    }
                  }
                  // Fallback: infer from uploaded documents (last resort - not reliable)
                  else {
                    const documentCount = Object.keys(allUploadedFiles).length
                    // Don't infer SHARED_IP just because NDA exists - might be from old version
                    // Only infer ONCE_OFF if very few documents
                    if (documentCount <= 2 && allUploadedFiles.bankConfirmation && allUploadedFiles.companyRegistration) {
                      purchaseType = 'ONCE_OFF'
                    }
                    // Default to REGULAR
                  }
                  
                  // Get credit application status
                  const creditApplication = supplier.onboarding?.initiation?.creditApplication || false
                  
                  // Get mandatory documents based on purchase type and credit application
                  const mandatoryDocKeys = getMandatoryDocuments(purchaseType, creditApplication)
                  
                  // Map document keys to display format with names and icons
                  const docDisplayMap: Record<string, { name: string, icon: string }> = {
                    'nda': { name: 'Non-Disclosure Agreement (NDA)', icon: '📝' },
                    'companyRegistration': { name: 'Company Registration (CIPC Documents)', icon: '📋' },
                    'taxClearance': { name: 'Tax Clearance Certificate', icon: '💼' },
                    'goodStanding': { name: 'Letter of Good Standing', icon: '💼' },
                    'bankConfirmation': { name: 'Bank Confirmation Letter', icon: '🏦' },
                    'bbbeeAccreditation': { name: 'B-BBEE Certificate', icon: '⭐' }
                  }
                  
                  // Build mandatory documents list
                  const mandatoryDocs: Array<{ key: string, name: string, icon: string, checkKeys?: string[] }> = []
                  
                  mandatoryDocKeys.forEach(docKey => {
                    if (docKey === 'taxClearance') {
                      // Tax clearance or good standing (either one accepted)
                      mandatoryDocs.push({
                        key: 'taxOrGoodStanding',
                        name: 'Tax Clearance Certificate OR Letter of Good Standing',
                        icon: '💼',
                        checkKeys: ['taxClearance', 'goodStanding']
                      })
                    } else {
                      const display = docDisplayMap[docKey]
                      if (display) {
                        mandatoryDocs.push({
                          key: docKey,
                          name: display.name,
                          icon: display.icon
                        })
                      }
                    }
                  })
                  
                  // Remove duplicates (in case taxClearance and goodStanding both exist)
                  const uniqueMandatoryDocs = mandatoryDocs.filter((doc, index, self) =>
                    index === self.findIndex(d => d.key === doc.key)
                  )
                  
                  const missingDocs = uniqueMandatoryDocs.filter(doc => {
                    if (doc.checkKeys) {
                      // For tax/good standing, check if either exists across all versions
                      return !doc.checkKeys.some(key => allUploadedFiles[key] && allUploadedFiles[key].length > 0)
                    }
                    return !allUploadedFiles[doc.key] || allUploadedFiles[doc.key].length === 0
                  })
                  
                  if (missingDocs.length > 0) {
                    return (
                      <div className="space-y-4 mb-6">
                        <Alert className="bg-red-50 border-red-300">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <div>
                                <strong className="text-red-900 text-base block mb-2">
                                  ⚠️ Missing Compulsory Documents ({missingDocs.length} of {mandatoryDocs.length})
                                </strong>
                                <p className="text-sm text-red-800 mb-3">
                                  The following mandatory documents have not been uploaded by the supplier. Please request these documents before approving.
                                </p>
                              </div>
                              <div className="space-y-2">
                                {missingDocs.map((doc, idx) => (
                                  <div key={idx} className="bg-white border border-red-200 rounded p-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xl">{doc.icon}</span>
                                      <span className="font-semibold text-red-900">{doc.name}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                        {supplier.status !== 'APPROVED' && supplier.status !== 'REJECTED' && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleRevisionClick(missingDocs)}
                              className="w-full sm:w-auto border-orange-500 text-orange-700 hover:bg-orange-50"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Request Revision - Missing Documents
                            </Button>
                            {(() => {
                              // Collect incorrect documents
                              const incorrectDocsList: Array<{ version: number, category: string, fileName: string }> = []
                              Object.keys(incorrectDocuments).forEach(key => {
                                if (incorrectDocuments[key]) {
                                  // Key format: "version-category-fileName"
                                  // We need to split carefully since fileName might contain dashes
                                  const parts = key.split('-')
                                  if (parts.length >= 3) {
                                    const version = parts[0]
                                    const category = parts[1]
                                    const fileName = parts.slice(2).join('-') // Rejoin remaining parts as fileName
                                    incorrectDocsList.push({
                                      version: parseInt(version),
                                      category,
                                      fileName
                                    })
                                  }
                                }
                              })
                              
                              if (incorrectDocsList.length > 0) {
                                return (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRevisionClick(undefined, incorrectDocsList)}
                                    className="w-full sm:w-auto border-red-500 text-red-700 hover:bg-red-50"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Request Revision - Incorrect Documents ({incorrectDocsList.length})
                                  </Button>
                                )
                              }
                              return null
                            })()}
                          </div>
                        )}
                      </div>
                    )
                  } else {
                    return (
                      <div className="space-y-4 mb-6">
                        <Alert className="bg-green-50 border-green-300">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <AlertDescription>
                            <strong className="text-green-900">✅ All Compulsory Documents Uploaded</strong>
                            <p className="text-sm text-green-800 mt-1">
                              All {mandatoryDocs.length} mandatory documents have been provided. Review each document for accuracy and completeness.
                            </p>
                          </AlertDescription>
                        </Alert>
                        {(() => {
                          // Collect incorrect documents
                          const incorrectDocsList: Array<{ version: number, category: string, fileName: string }> = []
                          Object.keys(incorrectDocuments).forEach(key => {
                            if (incorrectDocuments[key]) {
                              // Key format: "version-category-fileName"
                              // We need to split carefully since fileName might contain dashes
                              const parts = key.split('-')
                              if (parts.length >= 3) {
                                const version = parts[0]
                                const category = parts[1]
                                const fileName = parts.slice(2).join('-') // Rejoin remaining parts as fileName
                                incorrectDocsList.push({
                                  version: parseInt(version),
                                  category,
                                  fileName
                                })
                              }
                            }
                          })
                          
                          if (incorrectDocsList.length > 0 && supplier.status !== 'APPROVED' && supplier.status !== 'REJECTED') {
                            return (
                              <Button
                                variant="outline"
                                onClick={() => handleRevisionClick(undefined, incorrectDocsList)}
                                className="w-full sm:w-auto border-red-500 text-red-700 hover:bg-red-50"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Request Revision - Incorrect Documents ({incorrectDocsList.length})
                              </Button>
                            )
                          }
                          
                          // Show general Request Revision button if no missing or incorrect documents
                          if (incorrectDocsList.length === 0 && supplier.status !== 'APPROVED' && supplier.status !== 'REJECTED') {
                            return (
                              <Button
                                variant="outline"
                                onClick={() => handleRevisionClick()}
                                className="w-full sm:w-auto border-blue-500 text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Request Revision
                              </Button>
                            )
                          }
                          return null
                        })()}
                      </div>
                    )
                  }
                })()}
                
                {/* Show all versions - sort by version number descending (newest first) */}
                {[...(supplier.airtableData.allVersions || [])]
                  .sort((a: any, b: any) => b.version - a.version)
                  .map((versionData: any, versionIndex: number) => {
                    const isLatestVersion = versionIndex === 0
                    const isOldVersion = !isLatestVersion
                    
                    return (
                  <Card 
                    key={versionIndex} 
                    className={`${isLatestVersion ? 'border-blue-500 border-2' : ''} ${isOldVersion ? 'opacity-60 bg-gray-50' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Version {versionData.version} {isLatestVersion && <Badge className="ml-2 bg-blue-500">Current</Badge>}
                          {isOldVersion && <Badge variant="outline" className="ml-2 text-gray-500">Previous</Badge>}
                        </CardTitle>
                        <div className="text-sm text-gray-500">
                          {new Date(versionData.date).toLocaleString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(versionData.uploadedFiles || {}).map(([category, files]: [string, any]) => (
                          <div key={category}>
                            <h4 className="font-semibold text-sm mb-2 capitalize">
                              {category.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <div className="space-y-2 pl-4">
                              {files.map((file: string, index: number) => {
                                const fileExt = file.toLowerCase().split('.').pop()
                                const isPdf = fileExt === 'pdf'
                                const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')
                                const fileUrl = `/api/suppliers/documents/${supplier.supplierCode}/v${versionData.version}/${category}/${file}`
                                const verificationKey = `${versionData.version}-${category}-${file}`
                                const isVerified = documentVerifications[verificationKey] || false
                                const isIncorrect = incorrectDocuments[verificationKey] || false
                          
                          return (
                            <div key={index} className={`flex items-center justify-between p-3 rounded transition-colors ${isOldVersion ? 'bg-gray-100 opacity-75' : 'bg-gray-50 hover:bg-gray-100'}`}>
                              <div className="flex items-center gap-3 flex-1">
                                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm truncate">{file}</span>
                                {isPdf && (
                                  <Badge variant="outline" className="ml-2">PDF</Badge>
                                )}
                                {isImage && (
                                  <Badge variant="outline" className="ml-2">Image</Badge>
                                )}
                                {isVerified && (
                                  <Badge className="ml-2 bg-green-500 text-white">Verified</Badge>
                                )}
                                {isIncorrect && (
                                  <Badge className="ml-2 bg-red-500 text-white">Incorrect</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`verify-${verificationKey}`}
                                    checked={isVerified}
                                    onCheckedChange={() => handleVerificationToggle(versionData.version, category, file, isVerified)}
                                  />
                                  <label
                                    htmlFor={`verify-${verificationKey}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    Verified
                                  </label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`incorrect-${verificationKey}`}
                                    checked={isIncorrect}
                                    onCheckedChange={() => handleIncorrectToggle(versionData.version, category, file, isIncorrect)}
                                  />
                                  <label
                                    htmlFor={`incorrect-${verificationKey}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-red-600"
                                  >
                                    Incorrect
                                  </label>
                                </div>
                                {(isPdf || isImage) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`/admin/supplier-submissions/${supplier.id}/preview/${supplier.supplierCode}/v${versionData.version}/${category}/${encodeURIComponent(file)}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Preview
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                      </div>
                    </CardContent>
                  </Card>
                    )
                  })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-gray-500">
                  No documents uploaded
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai-insights">
            <div className="space-y-6">
              {/* AI Mode Indicator */}
              {aiMode !== 'unknown' && (
                <Alert className={aiMode === 'ollama' ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}>
                  <AlertDescription className="flex items-center gap-2">
                    {aiMode === 'ollama' ? (
                      <>
                        <Brain className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-900">Ollama Active:</span>
                        <span className="text-green-800">Using local AI model for full analysis</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-900">Fallback Mode:</span>
                        <span className="text-yellow-800">Ollama unavailable - using basic analysis</span>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* AI Analysis Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    AI Document Analysis
                  </CardTitle>
                  <CardDescription>
                    Use AI to automatically analyze supplier documents, verify compliance, and assess risk
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleAIAnalysis}
                    disabled={aiProcessing}
                    className="w-full sm:w-auto"
                  >
                    {aiProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing in Background...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start AI Analysis
                      </>
                    )}
                  </Button>
                  
                  {aiProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{aiProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${aiProgress}%` }}
                        />
                      </div>
                      {aiCurrentStep && (
                        <p className="text-sm text-gray-600">{aiCurrentStep}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        💡 You can navigate away - the analysis will continue in the background
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Processing Logs */}
              {aiLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Processing Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                      {aiLogs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))}
                      {aiProcessing && (
                        <div className="flex items-center gap-2 animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Summary */}
              {aiSummary && (
                <Card className="border-blue-500 border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCheck className="h-5 w-5 text-green-600" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overall Score */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">Overall Supplier Score</div>
                        <div className={`text-5xl font-bold ${
                          (aiSummary.overallScore ?? 0) >= 80 ? 'text-green-600' : 
                          (aiSummary.overallScore ?? 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {(aiSummary.overallScore ?? 0).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">out of 100</div>
                      </div>
                    </div>

                    {/* Compliance Check */}
                    {aiSummary.complianceCheck && (
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Compliance Verification
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="pt-6 text-center">
                            <div className="text-2xl font-bold text-blue-900">
                              {aiSummary.complianceCheck.providedDocuments ?? 0}/{aiSummary.complianceCheck.requiredDocuments ?? 0}
                            </div>
                            <div className="text-sm text-blue-700">Required Documents</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="pt-6 text-center">
                            <div className="text-2xl font-bold text-green-900">
                              {(aiSummary.complianceCheck.complianceScore ?? 0).toFixed(0)}%
                            </div>
                            <div className="text-sm text-green-700">Compliance Score</div>
                          </CardContent>
                        </Card>
                        <Card className={`${
                          (aiSummary.complianceCheck.missingDocuments?.length ?? 0) === 0 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-orange-50 border-orange-200'
                        }`}>
                          <CardContent className="pt-6 text-center">
                            <div className={`text-2xl font-bold ${
                              (aiSummary.complianceCheck.missingDocuments?.length ?? 0) === 0 
                                ? 'text-green-900' 
                                : 'text-orange-900'
                            }`}>
                              {aiSummary.complianceCheck.missingDocuments?.length ?? 0}
                            </div>
                            <div className={`text-sm ${
                              (aiSummary.complianceCheck.missingDocuments?.length ?? 0) === 0 
                                ? 'text-green-700' 
                                : 'text-orange-700'
                            }`}>
                              Missing Documents
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      {aiSummary.complianceCheck.missingDocuments && aiSummary.complianceCheck.missingDocuments.length > 0 && (
                        <Alert className="mt-4 bg-red-50 border-red-400">
                          <AlertDescription>
                            <div className="space-y-3">
                              <strong className="text-red-900 text-base">Missing MANDATORY Documents ({aiSummary.complianceCheck.missingDocuments.length}/5):</strong>
                              <div className="space-y-3 mt-3">
                                {aiSummary.complianceCheck.missingDocuments.map((doc: string) => {
                                  let docInfo = { title: '', required: '', icon: '🔴' }
                                  const supplier_bbbee = supplier.bbbeeLevel || 'Not specified'
                                  const supplier_bank = supplier.bankName || 'Not specified'
                                  const supplier_account = supplier.accountNumber ? `****${supplier.accountNumber.slice(-4)}` : 'Not specified'
                                  const supplier_branch = supplier.branchName || 'Not specified'
                                  
                                  if (doc === 'companyRegistration') {
                                    docInfo = {
                                      title: 'CIPC Registration Documents',
                                      required: `Must validate: Company name "${supplier.companyName}", Registration # "${supplier.registrationNumber}", Physical address`,
                                      icon: '📋'
                                    }
                                  } else if (doc === 'bbbeeAccreditation') {
                                    docInfo = {
                                      title: 'B-BBEE Certificate',
                                      required: `Must validate: Status Level "${supplier_bbbee}", Black ownership %, Black female %, Certificate not expired`,
                                      icon: '⭐'
                                    }
                                  } else if (doc === 'taxClearance') {
                                    docInfo = {
                                      title: 'Tax Clearance Certificate OR Letter of Good Standing',
                                      required: `Either document accepted. Must validate: Taxpayer name matches "${supplier.companyName}", Purpose says "Good Standing", Age < 3 months, SARS authenticity`,
                                      icon: '💼'
                                    }
                                  } else if (doc === 'bankConfirmation') {
                                    docInfo = {
                                      title: 'Bank Confirmation Letter',
                                      required: `Must validate: Bank "${supplier_bank}", Account # "${supplier_account}", Branch "${supplier_branch}", Account type, Age < 3 months`,
                                      icon: '🏦'
                                    }
                                  } else if (doc === 'nda') {
                                    docInfo = {
                                      title: 'Non-Disclosure Agreement (NDA)',
                                      required: 'Must be signed and initialed on all pages. Download template from supplier portal.',
                                      icon: '📝'
                                    }
                                  }
                                  
                                  return (
                                    <div key={doc} className="bg-white border border-red-200 rounded p-3">
                                      <div className="flex items-start gap-2">
                                        <span className="text-xl">{docInfo.icon}</span>
                                        <div className="flex-1">
                                          <div className="font-semibold text-red-900">{docInfo.title}</div>
                                          <div className="text-xs text-red-700 mt-1">{docInfo.required}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Show claimed but missing certifications */}
                      {aiSummary.complianceCheck.claimedButMissing && aiSummary.complianceCheck.claimedButMissing.length > 0 && (
                        <Alert className="mt-4 bg-orange-50 border-orange-400">
                          <AlertDescription>
                            <div className="space-y-3">
                              <strong className="text-orange-900 text-base">⚠️ Claimed Certifications Not Uploaded ({aiSummary.complianceCheck.claimedButMissing.length}):</strong>
                              <div className="text-sm text-orange-800 mb-2">
                                Supplier indicated they have these certifications in the form but did not upload the certificates.
                              </div>
                              <div className="space-y-2 mt-3">
                                {aiSummary.complianceCheck.claimedButMissing.map((item: { doc: string, certName: string }) => (
                                  <div key={item.doc} className="bg-white border border-orange-200 rounded p-3">
                                    <div className="flex items-start gap-2">
                                      <span className="text-xl">⚠️</span>
                                      <div className="flex-1">
                                        <div className="font-semibold text-orange-900">{item.certName}</div>
                                        <div className="text-xs text-orange-700 mt-1">Please request certificate upload or clarify if supplier no longer has this certification.</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Show optional documents status */}
                      {aiSummary.complianceCheck.optionalDocuments && aiSummary.complianceCheck.optionalDocuments.length > 0 && (
                        <Alert className="mt-4 bg-blue-50 border-blue-300">
                          <AlertDescription>
                            <strong>Optional Documents Provided ({aiSummary.complianceCheck.optionalDocsCount}):</strong>
                            <ul className="list-disc list-inside mt-2">
                              {aiSummary.complianceCheck.optionalDocuments.map((doc: string) => (
                                <li key={doc} className="text-sm text-blue-900">
                                  ✓ {doc.replace(/([A-Z])/g, ' $1').trim()}
                                </li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    )}

                    {/* Document Type Mismatches */}
                    {aiSummary.documentAnalysis && (() => {
                      const mismatches: Array<{category: string, fileName: string, expected: string, actual: string, findings: string}> = []
                      
                      Object.entries(aiSummary.documentAnalysis).forEach(([category, categoryResults]: [string, any]) => {
                        if (Array.isArray(categoryResults)) {
                          categoryResults.forEach((result: any) => {
                            if (result.findings && result.findings.includes('DOCUMENT TYPE MISMATCH DETECTED')) {
                              // Extract mismatch info from findings
                              const expectedMatch = result.findings.match(/Expected:\s*([^\n]+)/)
                              const actualMatch = result.findings.match(/Actual:\s*([^\n]+)/)
                              if (expectedMatch && actualMatch) {
                                mismatches.push({
                                  category,
                                  fileName: result.fileName || 'Unknown',
                                  expected: expectedMatch[1].trim(),
                                  actual: actualMatch[1].trim(),
                                  findings: result.findings
                                })
                              }
                            }
                          })
                        }
                      })
                      
                      return mismatches.length > 0 && (
                        <Alert className="mb-4 bg-red-50 border-red-400 border-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <strong className="text-red-900 text-base">⚠️ DOCUMENT TYPE MISMATCHES DETECTED ({mismatches.length}):</strong>
                              <div className="text-sm text-red-800 mb-2">
                                The following documents were uploaded to incorrect categories. Please verify the correct documents were uploaded.
                              </div>
                              <div className="space-y-3 mt-3">
                                {mismatches.map((mismatch, idx) => (
                                  <div key={idx} className="bg-white border border-red-300 rounded p-4">
                                    <div className="font-semibold text-red-900 mb-2">{mismatch.fileName}</div>
                                    <div className="text-sm space-y-1">
                                      <div><strong>Uploaded as:</strong> <span className="text-red-700">{mismatch.expected}</span></div>
                                      <div><strong>Actually is:</strong> <span className="text-red-700">{mismatch.actual}</span></div>
                                      <div className="mt-2 text-xs text-red-600 italic">
                                        Category: {mismatch.category.replace(/([A-Z])/g, ' $1').trim()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )
                    })()}

                    {/* Risk Assessment */}
                    {aiSummary.riskAssessment && (
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Risk Assessment
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(aiSummary.riskAssessment).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                            <span className="text-sm font-medium text-gray-700">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <Badge className={`${
                              value === 'LOW' || value === 'VERIFIED' || value === 'ACCEPTABLE' || value === 'NO_ISSUES'
                                ? 'bg-green-500' 
                                : value === 'MEDIUM' || value === 'PENDING'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            } text-white`}>
                              {value.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    )}

                    {/* Recommendation */}
                    <Alert className={`${
                      (aiSummary.overallScore ?? 0) >= 80 ? 'bg-green-50 border-green-300' : 
                      (aiSummary.overallScore ?? 0) >= 60 ? 'bg-yellow-50 border-yellow-300' : 
                      'bg-red-50 border-red-300'
                    }`}>
                      <AlertDescription>
                        <strong>AI Recommendation:</strong>
                        <p className="mt-2">
                          {(aiSummary.overallScore ?? 0) >= 80 
                            ? '✅ This supplier meets all requirements and is recommended for approval.' 
                            : (aiSummary.overallScore ?? 0) >= 60 
                            ? '⚠️ This supplier has minor issues. Review and request clarifications before approval.'
                            : '❌ This supplier has significant compliance gaps. Additional documentation is required.'}
                        </p>
                        {(() => {
                          // Check if NDA is uploaded in any version
                          const allVersionFiles: Record<string, string[]> = {}
                          supplier?.airtableData?.allVersions?.forEach((version: any) => {
                            const versionFiles = version.uploadedFiles || {}
                            Object.entries(versionFiles).forEach(([category, files]) => {
                              if (!allVersionFiles[category]) {
                                allVersionFiles[category] = []
                              }
                              const fileArray = files as string[]
                              fileArray.forEach((file: string) => {
                                if (!allVersionFiles[category].includes(file)) {
                                  allVersionFiles[category].push(file)
                                }
                              })
                            })
                          })
                          const hasNDA = allVersionFiles?.nda && allVersionFiles.nda.length > 0
                          
                          return hasNDA && (
                            <div className="mt-3 pt-3 border-t border-current/20">
                              <p className="font-semibold text-sm flex items-center gap-2">
                                <span className="text-lg">🔍</span>
                                CRITICAL: Manual NDA Verification Required
                              </p>
                              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                                <li>Verify NDA document is signed by authorized signatory</li>
                                <li>Confirm all pages are initialed</li>
                                <li>Check signature dates are present and valid</li>
                                <li>AI cannot validate handwritten signatures - manual review is essential</li>
                              </ul>
                            </div>
                          )
                        })()}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Actions</CardTitle>
                <CardDescription>Update the supplier status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    Current Status: <strong>{supplier.status}</strong>
                  </AlertDescription>
                </Alert>
                
                {/* Only show action buttons if supplier is not approved or rejected */}
                {supplier.status !== 'APPROVED' && supplier.status !== 'REJECTED' ? (
                  <div className="flex flex-col gap-4">
                    {/* Show "Request Final Approval" if current user is the initiator and status is not AWAITING_FINAL_APPROVAL */}
                    {supplier.onboarding?.initiation?.initiatedById === session?.user?.id && supplier.status !== 'AWAITING_FINAL_APPROVAL' && (
                      <Button onClick={handleApproveClick}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Request Final Approval
                      </Button>
                    )}
                    
                    {/* Show "Approve Supplier" if current user is PM and status is AWAITING_FINAL_APPROVAL */}
                    {session?.user?.role === 'PROCUREMENT_MANAGER' && supplier.status === 'AWAITING_FINAL_APPROVAL' && (
                      <Button onClick={handleApproveClick} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Supplier
                      </Button>
                    )}
                    
                    {/* Show message if user is not initiator and status is not AWAITING_FINAL_APPROVAL */}
                    {supplier.onboarding?.initiation?.initiatedById !== session?.user?.id && 
                     supplier.status !== 'AWAITING_FINAL_APPROVAL' && 
                     session?.user?.role !== 'PROCUREMENT_MANAGER' && (
                      <Alert>
                        <AlertDescription>
                          Only the initiator can request final approval for this supplier.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Show message if PM and not AWAITING_FINAL_APPROVAL */}
                    {session?.user?.role === 'PROCUREMENT_MANAGER' && supplier.status !== 'AWAITING_FINAL_APPROVAL' && (
                      <Alert>
                        <AlertDescription>
                          Waiting for initiator to request final approval.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Alert className={supplier.status === 'APPROVED' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}>
                    <AlertDescription className={supplier.status === 'APPROVED' ? 'text-green-800' : 'text-red-800'}>
                      {supplier.status === 'APPROVED' 
                        ? '✅ This supplier has been approved. No further actions are available.' 
                        : '❌ This supplier has been rejected. No further actions are available.'}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Delete button - only available for admin */}
                {session?.user?.role === 'ADMIN' && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleDeleteClick}
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Supplier
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Supplier</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the supplier and all associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Supplier Information:</h4>
              <div className="text-sm text-red-800 space-y-1">
                <div><strong>Company:</strong> {supplier?.companyName}</div>
                <div><strong>Email:</strong> {supplier?.contactEmail}</div>
                <div><strong>Status:</strong> {supplier?.status}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                To confirm deletion, type the company name:
              </label>
              <Input
                placeholder={supplier?.companyName}
                value={companyNameConfirm}
                onChange={(e) => setCompanyNameConfirm(e.target.value)}
                className="border-red-300 focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={companyNameConfirm !== supplier?.companyName}
            >
              Delete Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              {session?.user?.role === 'PROCUREMENT_MANAGER' && supplier?.status === 'AWAITING_FINAL_APPROVAL' 
                ? 'Approve Supplier' 
                : 'Request Final Approval'}
            </DialogTitle>
            <DialogDescription>
              {session?.user?.role === 'PROCUREMENT_MANAGER' && supplier?.status === 'AWAITING_FINAL_APPROVAL' 
                ? 'Are you sure you want to approve this supplier? An approval email will be automatically sent to the supplier.'
                : 'Are you sure you want to request final approval for this supplier? An email will be automatically sent to the Procurement Manager for final approval.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Supplier Information:</h4>
              <div className="text-sm text-green-800 space-y-1">
                <div><strong>Company:</strong> {supplier?.companyName}</div>
                <div><strong>Email:</strong> {supplier?.contactEmail}</div>
                <div><strong>Status:</strong> {supplier?.status}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>
              {session?.user?.role === 'PROCUREMENT_MANAGER' && supplier?.status === 'AWAITING_FINAL_APPROVAL' 
                ? 'Approve Supplier' 
                : 'Request Final Approval'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Supplier</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this supplier. This reason will be included in the rejection email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Supplier Information:</h4>
              <div className="text-sm text-red-800 space-y-1">
                <div><strong>Company:</strong> {supplier?.companyName}</div>
                <div><strong>Email:</strong> {supplier?.contactEmail}</div>
                <div><strong>Status:</strong> {supplier?.status}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rejection Reason:
              </label>
              <Textarea
                placeholder="Please specify why this supplier is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="border-red-300 focus:border-red-500"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Reject Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Request Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-orange-600">Request Revision</DialogTitle>
            <DialogDescription>
              Please specify what needs to be updated or corrected. This feedback will be sent to the supplier.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Supplier Information:</h4>
              <div className="text-sm text-orange-800 space-y-1">
                <div><strong>Company:</strong> {supplier?.companyName}</div>
                <div><strong>Email:</strong> {supplier?.contactEmail}</div>
                <div><strong>Status:</strong> {supplier?.status}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Revision Notes:
              </label>
              <p className="text-xs text-gray-600 mb-2">
                The notes below have been pre-filled with missing document information. You can edit them as needed.
              </p>
              <Textarea
                placeholder="Please specify what needs to be updated or corrected..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="border-orange-300 focus:border-orange-500 min-h-[300px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setRevisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={confirmRevision}
              disabled={revisionSubmitting}
            >
              {revisionSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Revision Request'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Success</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-800 whitespace-pre-line">
                {successMessage}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setSuccessDialogOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Error</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-800 whitespace-pre-line">
                {errorMessage}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setErrorDialogOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


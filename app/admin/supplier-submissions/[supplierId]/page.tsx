"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Download,
  Eye,
  Edit,
  UserCheck
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
}

export default function SupplierDetailPage({ params }: { params: Promise<{ supplierId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupplier()
  }, [])

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

  const updateSupplierStatus = async (newStatus: string, rejectionReason?: string) => {
    try {
      // Show confirmation for approval
      if (newStatus === 'APPROVED') {
        const confirmed = window.confirm(
          `Are you sure you want to approve "${supplier?.companyName}"?\n\n` +
          `An approval email will be automatically sent to: ${supplier?.contactEmail}`
        )
        if (!confirmed) return
      }

      // Show prompt for rejection reason
      if (newStatus === 'REJECTED') {
        const reason = window.prompt(
          `Please provide a reason for rejecting "${supplier?.companyName}":\n\n` +
          `This reason will be included in the rejection email sent to: ${supplier?.contactEmail}\n\n` +
          `Rejection Reason:`,
          ''
        )
        
        if (reason === null) return // User cancelled
        
        if (!reason || reason.trim() === '') {
          alert('❌ Rejection reason is required. Please provide a reason for rejection.')
          return
        }
        
        rejectionReason = reason.trim()
      }

      const response = await fetch('/api/suppliers/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supplierId: supplier?.id, 
          status: newStatus,
          rejectionReason: rejectionReason 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        if (newStatus === 'APPROVED') {
          alert(`✅ Supplier approved successfully!\n\nAn approval notification email has been sent to ${supplier?.contactEmail}`)
        } else if (newStatus === 'REJECTED') {
          alert(`Supplier rejected.\n\nA rejection notification email with your feedback has been sent to ${supplier?.contactEmail}`)
        }
        await fetchSupplier()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update supplier status. Please try again.')
    }
  }

  const requestRevision = async () => {
    try {
      const revisionNotes = window.prompt(
        `Request revisions from "${supplier?.companyName}":\n\n` +
        `Please specify what needs to be updated or corrected.\n` +
        `This will be sent to: ${supplier?.contactEmail}\n\n` +
        `Revision Request:`,
        ''
      )
      
      if (revisionNotes === null) return // User cancelled
      
      if (!revisionNotes || revisionNotes.trim() === '') {
        alert('❌ Revision notes are required. Please specify what needs to be revised.')
        return
      }

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
        alert(`✅ Revision request sent successfully!\n\nAn email with your feedback has been sent to ${supplier?.contactEmail}`)
        await fetchSupplier()
      } else {
        alert(`Failed to send revision request: ${data.error}`)
      }
    } catch (error) {
      console.error('Error requesting revision:', error)
      alert('Failed to send revision request. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500'
      case 'UNDER_REVIEW': return 'bg-yellow-500'
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
          <Button onClick={() => router.push('/admin/supplier-submissions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/supplier-submissions')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{supplier.companyName}</h1>
                <p className="text-sm text-gray-600">Supplier Code: {supplier.supplierCode}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(supplier.status)} text-white px-4 py-2`}>
              {supplier.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
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
                    <p className="text-sm font-medium">{supplier.supplierName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Contact Person</label>
                    <p className="text-sm font-medium">{supplier.contactPerson || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Name of Business</label>
                    <p className="text-sm font-medium">{supplier.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Trading Name</label>
                    <p className="text-sm font-medium">{supplier.tradingName || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Company Registration No.</label>
                    <p className="text-sm font-medium">{supplier.registrationNumber || 'N/A'}</p>
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
                    <p className="text-sm font-medium whitespace-pre-wrap">{supplier.physicalAddress || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Postal Address</label>
                    <p className="text-sm font-medium whitespace-pre-wrap">{supplier.postalAddress || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Contact Number</label>
                    <p className="text-sm font-medium">{supplier.contactPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">E-mail Address</label>
                    <p className="text-sm font-medium">{supplier.contactEmail || 'N/A'}</p>
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
                    <p className="text-sm font-medium">{supplier.natureOfBusiness || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Associated Company</label>
                    <p className="text-sm font-medium">{supplier.associatedCompany || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Products and/or Services</label>
                    <p className="text-sm font-medium whitespace-pre-wrap">{supplier.productsAndServices || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Associated Company Registration No.</label>
                    <p className="text-sm font-medium">{supplier.associatedCompanyRegNo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Associated Company Branch Name</label>
                    <p className="text-sm font-medium">{supplier.associatedCompanyBranchName || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Branches Contact Numbers</label>
                    <p className="text-sm font-medium whitespace-pre-wrap">{supplier.branchesContactNumbers || 'N/A'}</p>
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
                    <p className="text-sm font-medium">{supplier.bankAccountName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Bank Name</label>
                    <p className="text-sm font-medium">{supplier.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Branch Name</label>
                    <p className="text-sm font-medium">{supplier.branchName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Branch Number</label>
                    <p className="text-sm font-medium">{supplier.branchNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Account Number</label>
                    <p className="text-sm font-medium">{supplier.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Type of Account</label>
                    <p className="text-sm font-medium">{supplier.typeOfAccount || 'N/A'}</p>
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
                      <p className="text-sm font-medium">{supplier.rpBanking || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Telephone</label>
                      <p className="text-sm font-medium">{supplier.rpBankingPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      <p className="text-sm font-medium">{supplier.rpBankingEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Quality Management RP */}
                <div>
                  <h4 className="font-semibold text-sm text-blue-600 mb-3">Quality Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Name</label>
                      <p className="text-sm font-medium">{supplier.rpQuality || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Telephone</label>
                      <p className="text-sm font-medium">{supplier.rpQualityPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      <p className="text-sm font-medium">{supplier.rpQualityEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* SHE RP */}
                <div>
                  <h4 className="font-semibold text-sm text-blue-600 mb-3">Safety, Health and Environment (SHE)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Name</label>
                      <p className="text-sm font-medium">{supplier.rpSHE || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Telephone</label>
                      <p className="text-sm font-medium">{supplier.rpSHEPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      <p className="text-sm font-medium">{supplier.rpSHEEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* BBBEE RP */}
                <div>
                  <h4 className="font-semibold text-sm text-blue-600 mb-3">BBBEE</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Name</label>
                      <p className="text-sm font-medium">{supplier.rpBBBEE || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Telephone</label>
                      <p className="text-sm font-medium">{supplier.rpBBBEEPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      <p className="text-sm font-medium">{supplier.rpBBBEEEmail || 'N/A'}</p>
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
                    <p className="text-sm font-medium">{supplier.bbbeeLevel || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Number of Employees</label>
                    <p className="text-sm font-medium">{supplier.numberOfEmployees || 'N/A'}</p>
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
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${supplier.qualityManagementCert ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {supplier.qualityManagementCert && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm">Quality Management Certification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${supplier.sheCertification ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {supplier.sheCertification && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm">Safety, Health and Environment (SHE) Certification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${supplier.authorizationAgreement ? 'bg-green-500' : 'bg-gray-300'}`}>
                      {supplier.authorizationAgreement && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm">Authorization Agreement Signed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            {supplier.airtableData?.allVersions ? (
              <div className="space-y-6">
                {/* Show all versions */}
                {supplier.airtableData.allVersions.map((versionData: any, versionIndex: number) => (
                  <Card key={versionIndex} className={versionIndex === supplier.airtableData.allVersions.length - 1 ? 'border-blue-500 border-2' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Version {versionData.version} {versionIndex === supplier.airtableData.allVersions.length - 1 && <Badge className="ml-2 bg-blue-500">Current</Badge>}
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
                          
                          return (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-2 flex-1">
                                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-sm truncate">{file}</span>
                                {isPdf && (
                                  <Badge variant="outline" className="ml-2">PDF</Badge>
                                )}
                                {isImage && (
                                  <Badge variant="outline" className="ml-2">Image</Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
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
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(fileUrl, '_blank')}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
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
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-gray-500">
                  No documents uploaded
                </CardContent>
              </Card>
            )}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Button
                    className="h-20 flex flex-col bg-green-600 hover:bg-green-700"
                    onClick={() => updateSupplierStatus('APPROVED')}
                    disabled={supplier.status === 'APPROVED'}
                  >
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Approve Supplier</span>
                    <span className="text-xs mt-1 opacity-90">Email notification will be sent</span>
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-20 flex flex-col"
                    onClick={() => updateSupplierStatus('REJECTED')}
                    disabled={supplier.status === 'REJECTED'}
                  >
                    <XCircle className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Reject Supplier</span>
                    <span className="text-xs mt-1 opacity-90">Email notification will be sent</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={requestRevision}
                    disabled={supplier.status === 'APPROVED' || supplier.status === 'REJECTED'}
                  >
                    <Edit className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Request Revision</span>
                    <span className="text-xs mt-1 opacity-90">Email notification will be sent</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


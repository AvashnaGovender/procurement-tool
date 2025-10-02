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
  Eye
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

  const updateSupplierStatus = async (newStatus: string) => {
    try {
      const response = await fetch('/api/suppliers/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId: supplier?.id, status: newStatus })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchSupplier()
      }
    } catch (error) {
      console.error('Error updating status:', error)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{supplier.contactEmail}</span>
                  </div>
                  {supplier.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{supplier.contactPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{supplier.contactPerson}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Nature of Business:</span>
                    <div className="text-sm font-medium">{supplier.natureOfBusiness || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">BBBEE Level:</span>
                    <div className="text-sm font-medium">{supplier.bbbeeLevel || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Employees:</span>
                    <div className="text-sm font-medium">{supplier.numberOfEmployees || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {supplier.airtableData && (
              <Card>
                <CardHeader>
                  <CardTitle>Full Submission Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(supplier.airtableData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents">
            {supplier.airtableData?.uploadedFiles ? (
              <div className="space-y-4">
                {Object.entries(supplier.airtableData.uploadedFiles).map(([category, files]: [string, any]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {files.map((file: string, index: number) => {
                          const fileExt = file.toLowerCase().split('.').pop()
                          const isPdf = fileExt === 'pdf'
                          const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')
                          const fileUrl = `/api/suppliers/documents/${supplier.supplierCode}/${category}/${file}`
                          
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
                                    onClick={() => router.push(`/admin/supplier-submissions/${supplier.id}/preview/${supplier.supplierCode}/${category}/${encodeURIComponent(file)}`)}
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
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    className="h-20 flex flex-col"
                    onClick={() => updateSupplierStatus('APPROVED')}
                    disabled={supplier.status === 'APPROVED'}
                  >
                    <CheckCircle className="h-6 w-6 mb-2" />
                    Approve Supplier
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-20 flex flex-col"
                    onClick={() => updateSupplierStatus('REJECTED')}
                    disabled={supplier.status === 'REJECTED'}
                  >
                    <XCircle className="h-6 w-6 mb-2" />
                    Reject Supplier
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col"
                    onClick={() => updateSupplierStatus('UNDER_REVIEW')}
                    disabled={supplier.status === 'UNDER_REVIEW'}
                  >
                    <Clock className="h-6 w-6 mb-2" />
                    Mark Under Review
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


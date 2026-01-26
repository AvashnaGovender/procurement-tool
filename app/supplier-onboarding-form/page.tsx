"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle, AlertCircle, FileIcon, X } from "lucide-react"
import Image from "next/image"

function SupplierOnboardingForm() {
  const searchParams = useSearchParams()
  const onboardingToken = searchParams.get('token')
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState("")
  const [revisionNotes, setRevisionNotes] = useState<string | null>(null)
  const [documentsToRevise, setDocumentsToRevise] = useState<string[]>([])
  const [existingFiles, setExistingFiles] = useState<{[key: string]: string[]}>({})
  const [creditApplication, setCreditApplication] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information (Fields 1-4)
    supplierName: "",
    contactPerson: "",
    nameOfBusiness: "",
    tradingName: "",
    
    // Address (Fields 5-6)
    physicalAddress: "",
    postalAddress: "",
    
    // Contact (Fields 7-8)
    contactNumber: "",
    emailAddress: "",
    
    // Business Details (Field 9)
    natureOfBusiness: "",
    
    // BBBEE (Field 10)
    bbbeeStatus: "",
    
    // Authorization (Field 11)
    authorizationAgreement: false,
    field39: "",
  })

  // File uploads state
  const [files, setFiles] = useState<{[key: string]: File[]}>({
    cm29Directors: [],
    shareholderCerts: [],
    proofOfShareholding: [],
    bbbeeAccreditation: [],
    bbbeeScorecard: [],
    taxClearance: [],
    vatCertificate: [],
    bankConfirmation: [],
    nda: [],
    healthSafety: [],
    creditApplication: [],
    qualityCert: [],
    goodStanding: [],
    sectorRegistrations: [],
    organogram: [],
    companyProfile: [],
  })

  // Fetch existing data if token is provided
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!onboardingToken) return

      setLoadingData(true)
      try {
        const response = await fetch(`/api/suppliers/get-by-token?token=${onboardingToken}`)
        const data = await response.json()

        if (data.success) {
          // Pre-populate form with existing data
          setFormData(data.formData)
          setExistingFiles(data.uploadedFiles || {})
          setCreditApplication(data.creditApplication || false)
          if (data.revisionNotes) {
            setRevisionNotes(data.revisionNotes)
          }
          if (data.documentsToRevise && Array.isArray(data.documentsToRevise)) {
            setDocumentsToRevise(data.documentsToRevise)
          }
        } else {
          console.error('Failed to load existing data:', data.error)
        }
      } catch (error) {
        console.error('Error fetching existing data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchExistingData()
  }, [onboardingToken])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (category: string, fileList: FileList | null) => {
    if (fileList) {
      const newFiles = Array.from(fileList)
      
      // Validate that all files are PDFs
      const invalidFiles = newFiles.filter(file => {
        const fileExtension = file.name.toLowerCase().split('.').pop()
        const mimeType = file.type.toLowerCase()
        return fileExtension !== 'pdf' && mimeType !== 'application/pdf'
      })
      
      if (invalidFiles.length > 0) {
        setError(`Only PDF files are accepted. The following files are not PDFs: ${invalidFiles.map(f => f.name).join(', ')}`)
        return
      }
      
      setFiles(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), ...newFiles]
      }))
      setError("") // Clear any previous errors
    }
  }

  const removeFile = (category: string, index: number) => {
    setFiles(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }))
  }

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate credit application document if required
    if (creditApplication && (!files.creditApplication || files.creditApplication.length === 0)) {
      setError("Credit Application Form is required when credit application is selected. Please upload the document.")
      return
    }
    
    setShowPreview(true)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    // Validate credit application document if required
    if (creditApplication && (!files.creditApplication || files.creditApplication.length === 0)) {
      setError("Credit Application Form is required when credit application is selected. Please upload the document.")
      setLoading(false)
      return
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add onboarding token if available
      if (onboardingToken) {
        submitData.append('onboardingToken', onboardingToken)
      }
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value?.toString() || "")
      })

      // Add all files
      Object.entries(files).forEach(([category, fileList]) => {
        fileList.forEach((file, index) => {
          submitData.append(`${category}[${index}]`, file)
        })
      })

      const response = await fetch('/api/supplier-form/submit', {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit form')
      }

      setSubmitted(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-6">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {revisionNotes ? 'Application Updated!' : 'Thank You!'}
              </h2>
              <p className="text-lg text-gray-600">
                {revisionNotes 
                  ? 'Your updated supplier information has been submitted successfully.'
                  : 'Your supplier onboarding form has been submitted successfully.'
                }
              </p>
              <p className="text-gray-500">
                {revisionNotes
                  ? 'Our procurement team will review your updates and contact you shortly.'
                  : 'Our procurement team will review your submission and contact you shortly.'
                }
              </p>
              <div className="pt-4">
                <p className="text-sm text-gray-400">
                  You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Preview/Review Screen
  if (showPreview) {
    const totalFiles = Object.values(files).reduce((acc, fileList) => acc + fileList.length, 0)
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Submission</CardTitle>
              <CardDescription>Please review all information before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Supplier Name:</strong> {formData.supplierName}</div>
                  <div><strong>Contact Person:</strong> {formData.contactPerson}</div>
                  <div><strong>Name of Business:</strong> {formData.nameOfBusiness}</div>
                  <div><strong>Trading Name:</strong> {formData.tradingName || 'N/A'}</div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Email:</strong> {formData.emailAddress}</div>
                  <div><strong>Phone:</strong> {formData.contactNumber}</div>
                  <div className="col-span-2"><strong>Physical Address:</strong> {formData.physicalAddress}</div>
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Business Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Nature of Business:</strong> {formData.natureOfBusiness}</div>
                  <div><strong>BBBEE Status:</strong> {formData.bbbeeStatus}</div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Uploaded Documents</h3>
                <div className="text-sm">
                  <strong>{totalFiles} files uploaded</strong>
                  <div className="mt-2 space-y-1">
                    {Object.entries(files).filter(([_, fileList]) => fileList.length > 0).map(([category, fileList]) => (
                      <div key={category} className="bg-gray-50 p-2 rounded">
                        <strong className="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}:</strong> {fileList.length} file(s)
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Authorization */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Authorization</h3>
                <div className="space-y-2 text-sm">
                  <div>✓ Authorization Agreement: {formData.authorizationAgreement ? 'Agreed' : 'Not Agreed'}</div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPreview(false)}
                  disabled={loading}
                >
                  ← Back to Edit
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Confirm & Submit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show loading state while fetching data
  if (loadingData) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg text-gray-600">Loading your application data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={240}
              height={240}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {revisionNotes ? 'Update Your Application' : 'Supplier Onboarding Form'}
          </h1>
          <p className="text-lg text-gray-600">
            {revisionNotes ? 'Please update the required information below' : 'Please complete all required fields'}
          </p>
        </div>

        {/* Revision Notice */}
        {revisionNotes && (
          <Alert className="mb-6 border-orange-500 bg-orange-50">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="ml-2">
              <div className="font-semibold text-orange-900 mb-2">Revision Requested</div>
              <div className="text-orange-800 whitespace-pre-wrap">{revisionNotes}</div>
              <div className="mt-3 text-sm text-orange-700">
                Your form has been pre-filled with your previous submission. Please review and update the information as needed.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Document Re-upload Notice for Revisions */}
        {revisionNotes && documentsToRevise.length > 0 && (
          <Alert className="mb-6 border-blue-500 bg-blue-50">
            <FileIcon className="h-5 w-5 text-blue-600" />
            <AlertDescription className="ml-2">
              <div className="font-semibold text-blue-900 mb-2">Document Upload Required</div>
              <div className="text-blue-800 text-sm">
                Only the documents listed below need to be revised. Your previous documents have been archived 
                and will be available to our procurement team for reference.
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePreview} className="space-y-6">
          {/* Only show form fields if not in revision mode or if revision mode but no specific documents to revise */}
          {(!revisionNotes || documentsToRevise.length === 0) && (
            <>
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>1. Basic Information</CardTitle>
              <CardDescription>General company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName">Supplier Name *</Label>
                  <Input
                    id="supplierName"
                    required
                    value={formData.supplierName}
                    onChange={(e) => handleInputChange('supplierName', e.target.value)}
                    placeholder="e.g., The Innoverse"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="nameOfBusiness">Name of Business *</Label>
                  <Input
                    id="nameOfBusiness"
                    required
                    value={formData.nameOfBusiness}
                    onChange={(e) => handleInputChange('nameOfBusiness', e.target.value)}
                    placeholder="Registered business name"
                  />
                </div>
                <div>
                  <Label htmlFor="tradingName">Trading Name</Label>
                  <Input
                    id="tradingName"
                    value={formData.tradingName}
                    onChange={(e) => handleInputChange('tradingName', e.target.value)}
                    placeholder="Trading as..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Address Details */}
          <Card>
            <CardHeader>
              <CardTitle>2. Address Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="physicalAddress">Physical Address *</Label>
                <Textarea
                  id="physicalAddress"
                  required
                  value={formData.physicalAddress}
                  onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                  placeholder="Street address, city, postal code"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="postalAddress">Postal Address</Label>
                <Textarea
                  id="postalAddress"
                  value={formData.postalAddress}
                  onChange={(e) => handleInputChange('postalAddress', e.target.value)}
                  placeholder="P.O. Box or same as physical address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>3. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="0784588458"
                  />
                </div>
                <div>
                  <Label htmlFor="emailAddress">E-mail Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    required
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                    placeholder="email@company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>4. Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="natureOfBusiness">Nature of Business *</Label>
                <Input
                  id="natureOfBusiness"
                  required
                  value={formData.natureOfBusiness}
                  onChange={(e) => handleInputChange('natureOfBusiness', e.target.value)}
                  placeholder="e.g., AI Consulting, Manufacturing"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 5: BBBEE */}
          <Card>
            <CardHeader>
              <CardTitle>5. BBBEE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bbbeeStatus">BBBEE Status *</Label>
                <Input
                  id="bbbeeStatus"
                  required
                  value={formData.bbbeeStatus}
                  onChange={(e) => handleInputChange('bbbeeStatus', e.target.value)}
                  placeholder="e.g., Level 1, Level 2"
                />
              </div>
            </CardContent>
          </Card>
          </>
          )}

          {/* Section 6: Document Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>{revisionNotes && documentsToRevise.length > 0 ? 'Documents to Revise' : '6. Required Documents'}</CardTitle>
              <CardDescription>
                {revisionNotes && documentsToRevise.length > 0 
                  ? 'Please upload the documents that need revision as specified in the revision notes above.'
                  : 'Please upload all required documents.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'cm29Directors', label: 'Copy of CM29 - List of Directors', required: false },
                { key: 'shareholderCerts', label: 'Shareholder Certificates', required: false },
                { key: 'proofOfShareholding', label: 'Proof of Shareholding', required: false },
                { key: 'bbbeeAccreditation', label: 'BBBEE Accreditation *', required: true },
                { key: 'bbbeeScorecard', label: 'BBBEE Scorecard Report', required: false },
                { key: 'taxClearance', label: 'Tax Clearance Certificate *', required: true },
                { key: 'vatCertificate', label: 'VAT Registration Certificate', required: false },
                { key: 'bankConfirmation', label: 'Bank Confirmation Letter *', required: true },
                { key: 'nda', label: 'Non-Disclosure Agreement (NDA) - Signed *', required: true },
                { key: 'healthSafety', label: 'Health and Safety Policy', required: false },
                { key: 'creditApplication', label: 'Credit Application Form', required: creditApplication },
                { key: 'qualityCert', label: 'Quality Certification', required: false },
                { key: 'goodStanding', label: 'Letter of Good Standing', required: false },
                { key: 'sectorRegistrations', label: 'Sector Registrations', required: false },
                { key: 'organogram', label: 'Updated Company Organogram', required: false },
                { key: 'companyProfile', label: 'Company Profile', required: false },
              ]
              // Filter to show only documents that need revision if in revision mode
              .filter(({ key }) => {
                // If no revision requested, show all documents
                if (!revisionNotes || documentsToRevise.length === 0) {
                  return true
                }
                // If revision requested, only show documents that need revision
                return documentsToRevise.includes(key)
              })
              .map(({ key, label, required }) => {
                // Override required for creditApplication based on creditApplication state
                const isRequired = key === 'creditApplication' ? creditApplication : required
                const displayLabel = isRequired ? `${label.replace(' *', '')} *` : label
                
                return (
                <div key={key} className="border rounded-lg p-4">
                  <Label className="mb-2 block">{displayLabel}</Label>
                  
                  {/* NDA Download Section */}
                  {key === 'nda' && (
                    <Alert className="mb-3 bg-blue-50 border-blue-200">
                      <FileIcon className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="ml-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Please download our standard NDA template</p>
                            <p className="text-xs text-blue-700">Download → Sign manually → Upload signed version</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-4 shrink-0"
                            onClick={() => window.open('/templates/standard-nda.pdf', '_blank')}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Download NDA
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={(e) => handleFileChange(key, e.target.files)}
                      className="cursor-pointer"
                    />
                    {files[key]?.length > 0 && (
                      <div className="space-y-1">
                        {files[key].map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-2">
                              <FileIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(key, index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Section 7: Authorization */}
          <Card>
            <CardHeader>
              <CardTitle>7. Authorization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="authorizationAgreement"
                  required
                  checked={formData.authorizationAgreement}
                  onCheckedChange={(checked) => handleInputChange('authorizationAgreement', checked)}
                />
                <Label htmlFor="authorizationAgreement" className="font-normal leading-relaxed">
                  The Supplier hereby authorises the undersigned to act on behalf of the Supplier, 
                  and agrees that all the information contained herein is accurate and correct. *
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full md:w-auto min-w-[300px]"
            >
              <>
                Review Form →
              </>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SupplierOnboardingFormPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading supplier onboarding form...</p>
        </div>
      </div>
    }>
      <SupplierOnboardingForm />
    </Suspense>
  )
}

"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle, AlertCircle, FileIcon, Download } from "lucide-react"

function CreditApplicationForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  
  // Form state
  const [signedCreditApplicationFile, setSignedCreditApplicationFile] = useState<File | null>(null)
  const [creditAccountInfo, setCreditAccountInfo] = useState("")
  
  // Data from API
  const [supplierData, setSupplierData] = useState<any>(null)
  const [signedCreditAppUrl, setSignedCreditAppUrl] = useState<string | null>(null)

  // Fetch existing data if token is provided
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Invalid access token. Please use the link provided in your email.")
        return
      }

      setLoadingData(true)
      try {
        const response = await fetch(`/api/suppliers/credit-application/get-by-token?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setSupplierData(data.supplier)
          setCreditAccountInfo(data.creditAccountInfo || "")
          if (data.signedCreditAppUrl) {
            setSignedCreditAppUrl(data.signedCreditAppUrl)
          }
          if (data.submitted) {
            setSubmitted(true)
          }
        } else {
          setError(data.error || 'Failed to load form data')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load form data. Please try again.')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [token])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted for the Credit Application.')
        e.target.value = ''
        return
      }
      setSignedCreditApplicationFile(file)
      setError("")
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    // Validate required fields
    if (!signedCreditApplicationFile) {
      setError("Please upload the fully signed Credit Application document.")
      setLoading(false)
      return
    }

    if (!creditAccountInfo.trim()) {
      setError("Please provide information about the credit account.")
      setLoading(false)
      return
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add token
      if (token) {
        submitData.append('token', token)
      }
      
      // Add credit account information
      submitData.append('creditAccountInfo', creditAccountInfo)

      // Add signed credit application file
      submitData.append('signedCreditApplication', signedCreditApplicationFile)

      const response = await fetch('/api/suppliers/credit-application/submit', {
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading form...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Application Submitted Successfully</h2>
              <p className="text-gray-600 mb-6">
                Thank you for submitting your credit application. We have received your fully signed document and credit account information.
              </p>
              <p className="text-sm text-gray-500">
                Our credit team will review your application and contact you if any additional information is required.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="text-2xl">Credit Application Form</CardTitle>
            <CardDescription className="text-blue-100">
              Please sign the credit application document and provide credit account information
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Supplier Information */}
            {supplierData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Supplier Information</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Company:</strong> {supplierData.companyName}</p>
                  <p><strong>Supplier Code:</strong> {supplierData.supplierCode}</p>
                </div>
              </div>
            )}

            {/* Download Signed Credit Application */}
            {signedCreditAppUrl && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">Step 1: Download and Review</h3>
                    <p className="text-sm text-amber-800 mb-3">
                      Please download the credit application document that has been signed by Schauenburg Systems. 
                      Review the document, sign it on your behalf, and then upload the fully signed copy below.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(signedCreditAppUrl, '_blank')}
                      className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Signed Credit Application
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Fully Signed Credit Application */}
            <div className="space-y-2">
              <Label htmlFor="signedCreditApplication" className="text-base font-semibold">
                Upload Fully Signed Credit Application *
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                Please upload the credit application document that has been signed by both Schauenburg Systems and your company.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Input
                  id="signedCreditApplication"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label
                  htmlFor="signedCreditApplication"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {signedCreditApplicationFile 
                      ? signedCreditApplicationFile.name 
                      : 'Click to upload PDF file'}
                  </span>
                  <span className="text-xs text-gray-500">PDF only, max 10MB</span>
                </Label>
              </div>
              {signedCreditApplicationFile && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle className="h-4 w-4" />
                  <span>File selected: {signedCreditApplicationFile.name}</span>
                </div>
              )}
            </div>

            {/* Credit Account Information */}
            <div className="space-y-2">
              <Label htmlFor="creditAccountInfo" className="text-base font-semibold">
                Credit Account Information *
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                Please provide any pertinent information that Schauenburg Systems needs to know regarding the credit account. 
                This may include credit limits, payment terms, banking details, or any other relevant information.
              </p>
              <Textarea
                id="creditAccountInfo"
                value={creditAccountInfo}
                onChange={(e) => setCreditAccountInfo(e.target.value)}
                placeholder="Enter credit account information, payment terms, credit limits, banking details, or any other relevant information..."
                rows={8}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={loading || !signedCreditApplicationFile || !creditAccountInfo.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Credit Application
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

export default function CreditApplicationFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <CreditApplicationForm />
    </Suspense>
  )
}


"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Eye,
  Download,
  Upload,
  UserCheck,
  Loader2,
  UserPlus,
} from "lucide-react"

interface AIOnboardingWorkflowProps {
  step: "initiate" | "pending" | "review" | "complete"
  onStepComplete: (nextStep: string) => void
}

export function AIOnboardingWorkflow({ step, onStepComplete }: AIOnboardingWorkflowProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [sector, setSector] = useState("")
  const [aiDraftedEmail, setAiDraftedEmail] = useState("")

  const businessTypes = [
    {
      value: "pty-ltd",
      label: "Pty Ltd",
      docs: [
        "Company Registration Documents (CM1/CK1/CK2)",
        "Copy of CM29 - List of Directors",
        "Shareholder Certificates and Proof of Shareholding",
        "BBBEE Accreditation /Letter from your Auditor",
        "BBBEE Scorecard Report from an Accredited Agency (If no affidavit)",
        "Tax Clearance Certificate (Not older than 3 months)",
        "VAT Registration Certificate (If VAT registered)",
        "Bank Confirmation Letter (Not older than 3 months)",
        "Non-Disclosure Agreement (NDA) (Initial all pages)",
        "Health and Safety Policy",
        "Credit Application Form (If applicable)",
        "Quality Certification (If available)",
        "Letter of Good Standing (If available)",
        "Sector Registrations (where applicable)",
        "Updated Company Organogram",
        "Company Profile"
      ],
    },
    {
      value: "sole-prop",
      label: "Sole Proprietorship",
      docs: [
        "Company Registration Documents (CM1/CK1/CK2)",
        "Copy of CM29 - List of Directors",
        "Shareholder Certificates and Proof of Shareholding",
        "BBBEE Accreditation /Letter from your Auditor",
        "BBBEE Scorecard Report from an Accredited Agency (If no affidavit)",
        "Tax Clearance Certificate (Not older than 3 months)",
        "VAT Registration Certificate (If VAT registered)",
        "Bank Confirmation Letter (Not older than 3 months)",
        "Non-Disclosure Agreement (NDA) (Initial all pages)",
        "Health and Safety Policy",
        "Credit Application Form (If applicable)",
        "Quality Certification (If available)",
        "Letter of Good Standing (If available)",
        "Sector Registrations (where applicable)",
        "Updated Company Organogram",
        "Company Profile"
      ],
    },
    {
      value: "partnership",
      label: "Partnership",
      docs: [
        "Company Registration Documents (CM1/CK1/CK2)",
        "Copy of CM29 - List of Directors",
        "Shareholder Certificates and Proof of Shareholding",
        "BBBEE Accreditation /Letter from your Auditor",
        "BBBEE Scorecard Report from an Accredited Agency (If no affidavit)",
        "Tax Clearance Certificate (Not older than 3 months)",
        "VAT Registration Certificate (If VAT registered)",
        "Bank Confirmation Letter (Not older than 3 months)",
        "Non-Disclosure Agreement (NDA) (Initial all pages)",
        "Health and Safety Policy",
        "Credit Application Form (If applicable)",
        "Quality Certification (If available)",
        "Letter of Good Standing (If available)",
        "Sector Registrations (where applicable)",
        "Updated Company Organogram",
        "Company Profile"
      ],
    },
    {
      value: "close-corp",
      label: "Close Corporation",
      docs: [
        "Company Registration Documents (CM1/CK1/CK2)",
        "Copy of CM29 - List of Directors",
        "Shareholder Certificates and Proof of Shareholding",
        "BBBEE Accreditation /Letter from your Auditor",
        "BBBEE Scorecard Report from an Accredited Agency (If no affidavit)",
        "Tax Clearance Certificate (Not older than 3 months)",
        "VAT Registration Certificate (If VAT registered)",
        "Bank Confirmation Letter (Not older than 3 months)",
        "Non-Disclosure Agreement (NDA) (Initial all pages)",
        "Health and Safety Policy",
        "Credit Application Form (If applicable)",
        "Quality Certification (If available)",
        "Letter of Good Standing (If available)",
        "Sector Registrations (where applicable)",
        "Updated Company Organogram",
        "Company Profile"
      ],
    },
  ]

  const sectors = [
    { value: "manufacturing", label: "Manufacturing" },
    { value: "services", label: "Professional Services" },
    { value: "technology", label: "Technology/IT" },
    { value: "construction", label: "Construction" },
    { value: "retail", label: "Retail/Distribution" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "finance", label: "Finance/Banking" },
    { value: "agriculture", label: "Agriculture" },
    { value: "mining", label: "Mining" },
    { value: "energy", label: "Energy" },
    { value: "transport", label: "Transport/Logistics" },
    { value: "tourism", label: "Tourism/Hospitality" },
    { value: "media", label: "Media/Entertainment" },
    { value: "other", label: "Other" },
  ]

  const handleInitiateWorkflow = async () => {
    setIsProcessing(true)

    try {
      // Load email templates from settings
      const response = await fetch('/api/settings/email-templates')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error('Failed to load email templates')
      }

      const selectedBusiness = businessTypes.find((b) => b.value === businessType)
      const selectedSector = sectors.find((s) => s.value === sector)
      
      // Get company info from SMTP settings
      const smtpResponse = await fetch('/api/settings/smtp')
      const smtpData = await smtpResponse.json()
      
      const companyName = (smtpData.success ? smtpData.config?.companyName : smtpData.companyName) || 'Our Company'
      const companyWebsite = (smtpData.success ? smtpData.config?.companyWebsite : smtpData.companyWebsite) || 'https://company.com'

      // Use the onboarding template and replace variables (except {formLink} which is replaced on backend)
      let draftEmail = data.templates.onboarding.content
        .replace(/{supplierName}/g, contactName)
        .replace(/{companyName}/g, companyName)
        .replace(/{businessType}/g, selectedBusiness?.label || businessType)
        .replace(/{companyWebsite}/g, companyWebsite)

      setAiDraftedEmail(draftEmail)
      setIsProcessing(false)
    } catch (error) {
      console.error('Error loading email template:', error)
      
      // Fallback to default template if settings not configured
      const selectedBusiness = businessTypes.find((b) => b.value === businessType)
      const selectedSector = sectors.find((s) => s.value === sector)
      
      const draftEmail = `Dear ${contactName},

Thank you for your interest in becoming a supplier partner. We're excited to begin the onboarding process with your ${selectedBusiness?.label} business in the ${selectedSector?.label} sector.

Please click the link below to complete your supplier registration form and upload the required documents.

{formLink}

If you have any questions, please don't hesitate to contact our procurement team.

Best regards,
Procurement Team`

      setAiDraftedEmail(draftEmail)
      setIsProcessing(false)
    }
  }

  const handleSendEmail = async (emailContent?: string) => {
    setIsProcessing(true)
    
    try {
      // Use provided content or state content
      const contentToSend = emailContent || aiDraftedEmail
      
      if (!contentToSend) {
        throw new Error('Email content is empty')
      }
      
      console.log('Sending email with content length:', contentToSend.length)
      
      // Create onboarding record with supplier
      const onboardingResponse = await fetch('/api/onboarding/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactName,
          contactEmail,
          businessType,
          sector,
          emailContent: contentToSend,
          requiredDocuments: businessTypes.find(b => b.value === businessType)?.docs || []
        }),
      })

      const onboardingResult = await onboardingResponse.json()
      
      if (!onboardingResult.success) {
        throw new Error(onboardingResult.error || 'Failed to create onboarding record')
      }

      console.log('Onboarding record created:', onboardingResult.onboarding.id)
      
      // Send email using configured SMTP settings with onboarding token
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactEmail,
          subject: 'Supplier Onboarding - Welcome to Our Procurement System',
          content: contentToSend,
          supplierName: contactName,
          businessType: businessType,
          sector: sector,
          onboardingId: onboardingResult.onboarding.id,
          onboardingToken: onboardingResult.token,
          simulate: false  // Send actual email using SMTP settings
        }),
      })

      const emailResult = await emailResponse.json()
      
      if (emailResult.success) {
        console.log('Email sent successfully:', emailResult.emailId)
        
        // Update onboarding record with email sent status
        await fetch('/api/onboarding/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            onboardingId: onboardingResult.onboarding.id,
            emailSent: true,
            emailMessageId: emailResult.emailId
          }),
        })
        
        // Store onboarding ID for tracking
        localStorage.setItem('currentOnboardingId', onboardingResult.onboarding.id)
        onStepComplete("pending")
      } else {
        console.error('Failed to send email:', emailResult.message, emailResult.error)
        const errorMessage = emailResult.error || emailResult.message || 'Unknown error occurred'
        alert(`Failed to send email: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Error sending email: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInitiateAndSend = async () => {
    setIsProcessing(true)
    
    try {
      // Load email templates from settings
      const response = await fetch('/api/settings/email-templates')
      const data = await response.json()
      
      let emailContent = ''
      
      if (data.success && data.templates?.onboarding) {
        const selectedBusiness = businessTypes.find((b) => b.value === businessType)
        
        // Get company info from SMTP settings
        const smtpResponse = await fetch('/api/settings/smtp')
        const smtpData = await smtpResponse.json()
        
        const companyName = (smtpData.success ? smtpData.config?.companyName : smtpData.companyName) || 'Schauenburg Systems'
        const companyWebsite = (smtpData.success ? smtpData.config?.companyWebsite : smtpData.companyWebsite) || 'http://localhost:3000'

        // Use the onboarding template and replace variables
        emailContent = data.templates.onboarding.content
          .replace(/{supplierName}/g, contactName)
          .replace(/{companyName}/g, companyName)
          .replace(/{businessType}/g, selectedBusiness?.label || businessType)
          .replace(/{companyWebsite}/g, companyWebsite)
      } else {
        // Fallback template
        const selectedBusiness = businessTypes.find((b) => b.value === businessType)
        
        emailContent = `Dear ${contactName},

Thank you for your interest in becoming a supplier partner with Schauenburg Systems. We're excited to begin the onboarding process with you.

To complete your supplier registration, please click the link below to access our supplier portal and complete the registration form with your company details.

{formLink}

If you have any questions or need assistance, please don't hesitate to contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team`
      }
      
      console.log('Loaded email content length:', emailContent.length)
      console.log('Email content preview:', emailContent.substring(0, 100))
      
      // Now send the email with the loaded content
      await handleSendEmail(emailContent)
      
    } catch (error) {
      console.error('Error in handleInitiateAndSend:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
      setIsProcessing(false)
    }
  }

  if (step === "initiate") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            <CardTitle>Initiate Supplier Onboarding</CardTitle>
          </div>
          <CardDescription>
            Provide supplier contact details to begin the onboarding process. An email with the registration form will be sent automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactName">Contact Person Name *</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email Address *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessType">Type of Business *</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sector">Sector *</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sectorOption) => (
                    <SelectItem key={sectorOption.value} value={sectorOption.value}>
                      {sectorOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleInitiateAndSend}
              disabled={!contactName || !contactEmail || !businessType || !sector || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sending Onboarding Email...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Onboarding Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === "pending") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <CardTitle>Step 2: Awaiting Supplier Response</CardTitle>
          </div>
          <CardDescription>
            Email sent to supplier. Waiting for form completion, NDA signature, and document uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="font-medium">Email Sent</span>
              </div>
              <p className="text-sm text-gray-600">Onboarding email delivered to {contactEmail}</p>
              <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">
                Complete
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Form Completion</span>
              </div>
              <p className="text-sm text-gray-600">Supplier registration form</p>
              <Badge variant="outline" className="mt-2 bg-yellow-50 text-yellow-700">
                Pending
              </Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Upload className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Document Upload</span>
              </div>
              <p className="text-sm text-gray-600">Required business documents</p>
              <Badge variant="outline" className="mt-2 bg-yellow-50 text-yellow-700">
                Pending
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for Supplier Response</h3>
            <p className="text-gray-600 mb-4">
              The supplier will receive an email with instructions to complete their registration.
            </p>

            {/* Simulate completion for demo */}
            <Button variant="outline" onClick={() => onStepComplete("review")} className="mt-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              Simulate Supplier Completion (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === "review") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-orange-500" />
            <CardTitle>Step 3: Procurement Specialist Review</CardTitle>
          </div>
          <CardDescription>Review submitted forms and documents. Approve or request changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Submitted Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Name:</span>
                  <span>ABC Manufacturing Ltd.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Type:</span>
                  <span>Manufacturing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact Person:</span>
                  <span>{contactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{contactEmail}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Uploaded Documents</h4>
              <div className="space-y-2">
                {["Business License", "ISO Certifications", "Safety Compliance", "Insurance Certificate"].map(
                  (doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">NDA Status</h4>
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700">NDA signed and completed</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
            <Button onClick={() => onStepComplete("complete")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Add to Database
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === "complete") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle>Step 4: Onboarding Complete</CardTitle>
          </div>
          <CardDescription>Supplier successfully added to database. Completion notification sent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Onboarding Successful!</h3>
            <p className="text-gray-600 mb-6">The supplier has been successfully added to your database.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <UserCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Database Entry</p>
                <p className="text-xs text-gray-600">Supplier profile created</p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <Mail className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Notification Sent</p>
                <p className="text-xs text-gray-600">Welcome email delivered</p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Documents Stored</p>
                <p className="text-xs text-gray-600">All files archived securely</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" asChild>
                <a href="/suppliers">View All Suppliers</a>
              </Button>
              <Button asChild>
                <a href="/suppliers/onboard">Start New Onboarding</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

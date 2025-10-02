"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, Eye, RotateCcw, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EmailTemplate {
  subject: string
  content: string
}

interface EmailTemplates {
  onboarding: EmailTemplate
  revision: EmailTemplate
  approval: EmailTemplate
  rejection: EmailTemplate
  confirmation: EmailTemplate
}

export function EmailTemplateManager() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState("")
  const [activeTab, setActiveTab] = useState("onboarding")

  const [templates, setTemplates] = useState<EmailTemplates>({
    onboarding: {
      subject: "Welcome to Schauenburg Systems - Supplier Onboarding",
      content: `Dear {supplierName},

Thank you for your interest in becoming a supplier partner with Schauenburg Systems. We're excited to begin the onboarding process with you.

To complete your supplier registration, please click the link below to access our supplier portal and complete the registration form with your company details.

{formLink}

If you have any questions or need assistance, please don't hesitate to contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team`
    },
    revision: {
      subject: "Action Required: Supplier Registration Revisions - Schauenburg Systems",
      content: `Dear {supplierName},

After reviewing your application, our procurement team has identified some items that require updates or additional information.

Required Revisions:
{revisionNotes}

Please review the requirements and update your submission using the link below:

{formLink}

We appreciate your cooperation in providing the necessary updates.

Best regards,
Schauenburg Systems Procurement Team`
    },
    approval: {
      subject: "Supplier Onboarding Approved - Welcome to Schauenburg Systems",
      content: `Dear {supplierName},

We are pleased to inform you that your application to become a supplier for Schauenburg Systems has been reviewed and approved.

Your Supplier Details:
- Company Name: {companyName}
- Supplier Code: {supplierCode}
- Status: APPROVED

You are now registered as an approved supplier in our system. Our procurement team may contact you regarding specific projects and tenders.

Best regards,
Schauenburg Systems Procurement Team`
    },
    rejection: {
      subject: "Supplier Registration Update - Schauenburg Systems",
      content: `Dear {supplierName},

Thank you for your interest in becoming a supplier for Schauenburg Systems.

After careful review of your application, we regret to inform you that we are unable to proceed with your supplier registration at this time.

Feedback:
{rejectionReason}

You may address the concerns mentioned and consider reapplying in the future. If you have any questions, please contact our procurement team.

Best regards,
Schauenburg Systems Procurement Team`
    },
    confirmation: {
      subject: "Supplier Onboarding Submission Received - Schauenburg Systems",
      content: `Dear {supplierName},

Thank you for submitting your supplier onboarding application. We have successfully received your information and documentation.

Submission Summary:
- Supplier Code: {supplierCode}
- Company: {companyName}
- Documents Submitted: {documentCount} files
- Submission Date: {submissionDate}

What Happens Next:
1. Review - Our procurement team will review your submission
2. Verification - We will verify your documents and credentials
3. Approval - Once approved, you will be added to our supplier database
4. Notification - You will receive an email with your approval status

Estimated Processing Time: 1-2 business days

Best regards,
Schauenburg Systems Procurement Team`
    }
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/email-templates')
      const data = await response.json()
      
      if (data.success && data.templates) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const saveTemplates = async () => {
    setSaving(true)
    setError("")
    setSuccess(false)
    
    try {
      const response = await fetch('/api/settings/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Failed to save templates')
      }
    } catch (error) {
      setError('Failed to save templates')
    } finally {
      setSaving(false)
    }
  }

  const updateTemplate = (type: keyof EmailTemplates, field: 'subject' | 'content', value: string) => {
    setTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  const resetToDefault = (type: keyof EmailTemplates) => {
    // Reset logic would reload defaults
    loadTemplates()
  }

  const showPreview = (type: keyof EmailTemplates) => {
    const template = templates[type]
    // Create a sample preview with placeholder data
    let preview = template.content
      .replace(/{supplierName}/g, 'John Doe')
      .replace(/{companyName}/g, 'ABC Company Ltd')
      .replace(/{supplierCode}/g, 'SUP-2025-001')
      .replace(/{formLink}/g, '<a href="#">Click here to access the form</a>')
      .replace(/{revisionNotes}/g, 'Please update your BBBEE certificate - current one is expired.')
      .replace(/{rejectionReason}/g, 'Missing required tax clearance certificate.')
      .replace(/{documentCount}/g, '12')
      .replace(/{submissionDate}/g, new Date().toLocaleString())
      .replace(/\n/g, '<br>')

    setPreviewContent(preview)
    setPreviewOpen(true)
  }

  const getTabDescription = (type: string) => {
    switch(type) {
      case 'onboarding': return 'Initial email sent when workflow is initiated'
      case 'revision': return 'Email sent when requesting document revisions'
      case 'approval': return 'Email sent when supplier is approved'
      case 'rejection': return 'Email sent when supplier is rejected'
      case 'confirmation': return 'Auto-reply sent after form submission'
      default: return ''
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <p className="text-sm text-gray-600">Customize email templates for different stages of the onboarding process</p>
        </div>
        <Button onClick={saveTemplates} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : success ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Templates
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Templates saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
              <TabsTrigger value="revision">Revision</TabsTrigger>
              <TabsTrigger value="approval">Approval</TabsTrigger>
              <TabsTrigger value="rejection">Rejection</TabsTrigger>
              <TabsTrigger value="confirmation">Confirmation</TabsTrigger>
            </TabsList>

            {Object.entries(templates).map(([type, template]) => (
              <TabsContent key={type} value={type} className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{getTabDescription(type)}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showPreview(type as keyof EmailTemplates)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetToDefault(type as keyof EmailTemplates)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`${type}-subject`}>Email Subject</Label>
                    <Input
                      id={`${type}-subject`}
                      value={template.subject}
                      onChange={(e) => updateTemplate(type as keyof EmailTemplates, 'subject', e.target.value)}
                      placeholder="Email subject line"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`${type}-content`}>Email Content</Label>
                    <Textarea
                      id={`${type}-content`}
                      value={template.content}
                      onChange={(e) => updateTemplate(type as keyof EmailTemplates, 'content', e.target.value)}
                      placeholder="Email content (HTML supported)"
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Available variables: {'{'}supplierName{'}'}, {'{'}companyName{'}'}, {'{'}supplierCode{'}'}, {'{'}formLink{'}'}, {'{'}revisionNotes{'}'}, {'{'}rejectionReason{'}'}, {'{'}documentCount{'}'}, {'{'}submissionDate{'}'}
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              This is how the email will appear to recipients (with sample data)
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="bg-white rounded shadow-sm p-6">
              <div 
                dangerouslySetInnerHTML={{ __html: previewContent }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


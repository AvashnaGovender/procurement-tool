"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Eye, EyeOff } from "lucide-react"

interface EmailTemplate {
  subject: string
  content: string
}

export function EmailTemplates() {
  const [template, setTemplate] = useState<EmailTemplate>({
    subject: "",
    content: ""
  })
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadTemplate()
  }, [])

  const loadTemplate = async () => {
    try {
      const response = await fetch('/api/settings/email-template')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.template) {
          setTemplate(data.template)
        }
      }
    } catch (error) {
      console.error('Failed to load email template:', error)
    }
  }

  const saveTemplate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/email-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email template saved successfully",
        })
      } else {
        throw new Error('Failed to save template')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetToDefault = () => {
    setTemplate({
      subject: "Supplier Onboarding - Welcome to Our Procurement System",
      content: `Dear {supplierName},

Thank you for your interest in becoming a supplier partner with {companyName}. We're excited to begin the onboarding process with your {businessType} business.

To complete your supplier registration, please:

1. Click the link below to access our supplier portal
2. Complete the registration form with your company details
3. Upload all required documents
4. Review and sign our Non-Disclosure Agreement (NDA)

[Supplier Registration Portal Link]

Required documents for {businessType} businesses:
• Company Registration Documents (CM1/CK1/CK2)
• Copy of CM29 - List of Directors
• Shareholder Certificates and Proof of Shareholding
• BBBEE Accreditation / Letter from your Auditor
• Tax Clearance Certificate (Not older than 3 months)
• Bank Confirmation Letter (Not older than 3 months)
• Non-Disclosure Agreement (NDA) (Initial all pages)
• Health and Safety Policy
• Updated Company Organogram
• Company Profile

If you have any questions or need assistance, please don't hesitate to contact our procurement team.

Best regards,
Procurement Team
{companyName}
{companyWebsite}`
    })
  }

  const getPreviewContent = () => {
    return template.content
      .replace(/{supplierName}/g, "John Doe")
      .replace(/{companyName}/g, "The Innoverse")
      .replace(/{businessType}/g, "Manufacturing")
      .replace(/{companyWebsite}/g, "www.theinnoverse.co.za")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
        <CardDescription>
          Customize the email template used for supplier onboarding communications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            value={template.subject}
            onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
            placeholder="Supplier Onboarding - Welcome to Our Procurement System"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Email Content</Label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
              >
                Reset to Default
              </Button>
            </div>
          </div>
          
          {previewMode ? (
            <div className="border rounded-md p-4 bg-gray-50 min-h-[300px] whitespace-pre-wrap">
              <div className="font-medium mb-2">Preview:</div>
              {getPreviewContent()}
            </div>
          ) : (
            <Textarea
              id="content"
              value={template.content}
              onChange={(e) => setTemplate({ ...template, content: e.target.value })}
              placeholder="Enter your email template content..."
              className="min-h-[300px]"
            />
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Template Variables</h4>
          <p className="text-sm text-yellow-800 mb-2">
            You can use the following variables in your template:
          </p>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li><code className="bg-yellow-100 px-1 rounded">{"{supplierName}"}</code> - Name of the supplier</li>
            <li><code className="bg-yellow-100 px-1 rounded">{"{companyName}"}</code> - Your company name</li>
            <li><code className="bg-yellow-100 px-1 rounded">{"{businessType}"}</code> - Type of business</li>
            <li><code className="bg-yellow-100 px-1 rounded">{"{companyWebsite}"}</code> - Your company website</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Button onClick={saveTemplate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

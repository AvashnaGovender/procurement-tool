"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Upload, Building2, User, MapPin, FileText, Shield } from "lucide-react"

export function SupplierOnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Supplier onboarding request submitted successfully!")
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Information */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Company Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input id="companyName" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="typeOfBusiness">Type of Business *</Label>
            <Select required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select type of business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pty-ltd">Pty Ltd</SelectItem>
                <SelectItem value="cc">CC (Close Corporation)</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="trust">Trust</SelectItem>
                <SelectItem value="non-profit">Non-Profit Organization</SelectItem>
                <SelectItem value="government">Government Entity</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sector">Sector *</Label>
            <Select required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="it-technology">IT & Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance & Banking</SelectItem>
                <SelectItem value="retail">Retail & Wholesale</SelectItem>
                <SelectItem value="transportation">Transportation & Logistics</SelectItem>
                <SelectItem value="professional-services">Professional Services</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="energy">Energy & Utilities</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="mining">Mining</SelectItem>
                <SelectItem value="tourism">Tourism & Hospitality</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="taxId">Tax ID/EIN *</Label>
            <Input id="taxId" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="yearEstablished">Year Established</Label>
            <Input id="yearEstablished" type="number" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea id="description" className="mt-1" rows={3} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Primary Contact</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactName">Full Name *</Label>
            <Input id="contactName" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="contactTitle">Job Title *</Label>
            <Input id="contactTitle" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="contactEmail">Email Address *</Label>
            <Input id="contactEmail" type="email" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="contactPhone">Phone Number *</Label>
            <Input id="contactPhone" type="tel" required className="mt-1" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Address Information */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Business Address</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input id="address" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input id="city" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="state">State/Province *</Label>
            <Input id="state" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
            <Input id="zipCode" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="mx">Mexico</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Business Categories */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Business Categories</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            "IT Equipment",
            "Office Supplies",
            "Professional Services",
            "Maintenance & Repair",
            "Construction",
            "Manufacturing",
            "Transportation",
            "Consulting",
            "Other",
          ].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={category.toLowerCase().replace(/\s+/g, "-")} />
              <Label htmlFor={category.toLowerCase().replace(/\s+/g, "-")} className="text-sm">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Required Documents */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Required Documents</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="font-medium">Company Registration Documents (CM1/CK1/CK2) *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Copy of CM29 - List of Directors *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Shareholder Certificates and Proof of Shareholding *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">BBBEE Accreditation / Letter from your Auditor *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">BBBEE Scorecard Report from an Accredited Agency (If no affidavit)</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Tax Clearance Certificate (Not older than 3 months) *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">VAT Registration Certificate (If VAT registered)</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Bank Confirmation Letter (Not older than 3 months) *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Non-Disclosure Agreement (NDA) (Initial all pages) *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Health and Safety Policy *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Credit Application Form (If applicable)</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Quality Certification (If available)</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Letter of Good Standing (If available)</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Sector Registrations (where applicable)</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Updated Company Organogram *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          <div>
            <Label className="font-medium">Company Profile *</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Input type="file" accept=".pdf,application/pdf" required />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" required />
          <Label htmlFor="terms" className="text-sm">
            I agree to the{" "}
            <a href="#" className="text-primary hover:underline">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="accuracy" required />
          <Label htmlFor="accuracy" className="text-sm">
            I certify that all information provided is accurate and complete
          </Label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
}

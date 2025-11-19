"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, AlertCircle, Users, DollarSign, ArrowLeft, Home } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PRODUCT_SERVICE_CATEGORIES } from "@/lib/product-service-categories"

interface SupplierInitiationFormProps {
  onSubmissionComplete?: (initiationId: string) => void
}

export function SupplierInitiationForm({ onSubmissionComplete }: SupplierInitiationFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    businessUnit: "",
    processReadUnderstood: false,
    dueDiligenceCompleted: false,
    supplierName: "",
    supplierEmail: "",
    supplierContactPerson: "",
    productServiceCategory: "",
    requesterName: session?.user?.name || "",
    relationshipDeclaration: "",
    regularPurchase: false,
    annualPurchaseValue: "",
    creditApplication: false,
    creditApplicationReason: "",
    onceOffPurchase: false,
    onboardingReason: ""
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/suppliers/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        onSubmissionComplete?.(result.initiationId)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`Failed to submit initiation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting initiation:', error)
      alert(`Failed to submit initiation: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    // Check all required fields
    const hasBusinessUnit = !!formData.businessUnit
    const hasChecklist = formData.processReadUnderstood && formData.dueDiligenceCompleted
    const hasSupplierInfo = !!formData.supplierName && !!formData.supplierEmail && !!formData.supplierContactPerson && !!formData.productServiceCategory && !!formData.requesterName && !!formData.relationshipDeclaration
    const hasPurchaseType = formData.regularPurchase || formData.onceOffPurchase
    const hasAnnualValue = !formData.regularPurchase || (formData.regularPurchase && formData.annualPurchaseValue && parseFloat(formData.annualPurchaseValue) > 0)
    const hasCreditReason = formData.creditApplication || (!formData.creditApplication && formData.creditApplicationReason)
    const hasOnboardingReason = !!formData.onboardingReason

    return hasBusinessUnit && hasChecklist && hasSupplierInfo && hasPurchaseType && hasAnnualValue && hasCreditReason && hasOnboardingReason
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/suppliers')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Suppliers
          </Button>
        </div>
        <div className="text-sm text-slate-600">
          Complete all fields to submit for approval
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Unit Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Unit Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessUnit">Business Unit *</Label>
            <Select 
              value={formData.businessUnit} 
              onValueChange={(value) => handleInputChange('businessUnit', value)}
            >
              <SelectTrigger className={!formData.businessUnit ? "border-red-300" : ""}>
                <SelectValue placeholder="Select Business Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHAUENBURG_SYSTEMS_200">Schauenburg Systems 200</SelectItem>
                <SelectItem value="SCHAUENBURG_PTY_LTD_300">Schauenburg (Pty) Ltd 300</SelectItem>
              </SelectContent>
            </Select>
            {!formData.businessUnit && (
              <p className="text-sm text-red-600">Please select a business unit</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Supplier Onboarding Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="processReadUnderstood"
              checked={formData.processReadUnderstood}
              onCheckedChange={(checked) => handleInputChange('processReadUnderstood', checked)}
            />
            <Label htmlFor="processReadUnderstood" className={!formData.processReadUnderstood ? "text-red-600" : ""}>
              Supplier Onboarding Process – Read & Understood *
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="dueDiligenceCompleted"
              checked={formData.dueDiligenceCompleted}
              onCheckedChange={(checked) => handleInputChange('dueDiligenceCompleted', checked)}
            />
            <Label htmlFor="dueDiligenceCompleted" className={!formData.dueDiligenceCompleted ? "text-red-600" : ""}>
              Due diligence done to see if an existing supplier can supply or provide the same service *
            </Label>
          </div>
          
          {(!formData.processReadUnderstood || !formData.dueDiligenceCompleted) && (
            <p className="text-sm text-red-600">Please check both checklist items to proceed</p>
          )}
        </CardContent>
      </Card>

      {/* Supplier Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supplier Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name *</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="Enter supplier name"
                className={!formData.supplierName ? "border-red-300" : ""}
              />
              {!formData.supplierName && (
                <p className="text-sm text-red-600">Please enter supplier name</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplierEmail">Supplier Email *</Label>
              <Input
                id="supplierEmail"
                type="email"
                value={formData.supplierEmail}
                onChange={(e) => handleInputChange('supplierEmail', e.target.value)}
                placeholder="Enter supplier email address"
                className={!formData.supplierEmail ? "border-red-300" : ""}
              />
              {!formData.supplierEmail && (
                <p className="text-sm text-red-600">Please enter supplier email address</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierContactPerson">Supplier Contact Person *</Label>
              <Input
                id="supplierContactPerson"
                value={formData.supplierContactPerson}
                onChange={(e) => handleInputChange('supplierContactPerson', e.target.value)}
                placeholder="Enter contact person name"
                className={!formData.supplierContactPerson ? "border-red-300" : ""}
              />
              {!formData.supplierContactPerson && (
                <p className="text-sm text-red-600">Please enter supplier contact person</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productServiceCategory">Product/Service Category *</Label>
              <Select 
                value={formData.productServiceCategory} 
                onValueChange={(value) => handleInputChange('productServiceCategory', value)}
              >
                <SelectTrigger 
                  id="productServiceCategory"
                  className={!formData.productServiceCategory ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Select product/service category" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.productServiceCategory && (
                <p className="text-sm text-red-600">Please select product/service category</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterName">Requester Name *</Label>
            <Input
              id="requesterName"
              value={formData.requesterName}
              onChange={(e) => handleInputChange('requesterName', e.target.value)}
              placeholder="Enter requester name"
              className={!formData.requesterName ? "border-red-300" : ""}
            />
            {!formData.requesterName && (
              <p className="text-sm text-red-600">Please enter requester name</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationshipDeclaration">Relationship Declaration *</Label>
            <Textarea
              id="relationshipDeclaration"
              value={formData.relationshipDeclaration}
              onChange={(e) => handleInputChange('relationshipDeclaration', e.target.value)}
              placeholder="Describe the relationship with this supplier"
              rows={3}
              className={!formData.relationshipDeclaration ? "border-red-300" : ""}
            />
            {!formData.relationshipDeclaration && (
              <p className="text-sm text-red-600">Please describe the relationship with this supplier</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Purchase Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Purchase Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="regularPurchase"
              checked={formData.regularPurchase}
              onCheckedChange={(checked) => handleInputChange('regularPurchase', checked)}
            />
            <Label htmlFor="regularPurchase" className={!formData.regularPurchase && !formData.onceOffPurchase ? "text-red-600" : ""}>
              Regular Purchase *
            </Label>
          </div>

          {formData.regularPurchase && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="annualPurchaseValue">Annual Purchase Value (R) *</Label>
              <Input
                id="annualPurchaseValue"
                type="number"
                value={formData.annualPurchaseValue}
                onChange={(e) => handleInputChange('annualPurchaseValue', e.target.value)}
                placeholder="Enter annual purchase value"
                className={formData.regularPurchase && (!formData.annualPurchaseValue || parseFloat(formData.annualPurchaseValue) <= 0) ? "border-red-300" : ""}
              />
              {formData.regularPurchase && (!formData.annualPurchaseValue || parseFloat(formData.annualPurchaseValue) <= 0) && (
                <p className="text-sm text-red-600">Please enter a valid annual purchase value</p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="creditApplication"
              checked={formData.creditApplication}
              onCheckedChange={(checked) => handleInputChange('creditApplication', checked)}
            />
            <Label htmlFor="creditApplication">Credit Application *</Label>
          </div>

          {!formData.creditApplication && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="creditApplicationReason">Reason for No Credit Application *</Label>
              <Textarea
                id="creditApplicationReason"
                value={formData.creditApplicationReason}
                onChange={(e) => handleInputChange('creditApplicationReason', e.target.value)}
                placeholder="Provide reason for not requiring credit application"
                rows={2}
                className={!formData.creditApplication && !formData.creditApplicationReason ? "border-red-300" : ""}
              />
              {!formData.creditApplication && !formData.creditApplicationReason && (
                <p className="text-sm text-red-600">Please provide a reason for not requiring credit application</p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="onceOffPurchase"
              checked={formData.onceOffPurchase}
              onCheckedChange={(checked) => handleInputChange('onceOffPurchase', checked)}
            />
            <Label htmlFor="onceOffPurchase" className={!formData.regularPurchase && !formData.onceOffPurchase ? "text-red-600" : ""}>
              Once-off Purchase *
            </Label>
          </div>
          
          {!formData.regularPurchase && !formData.onceOffPurchase && (
            <p className="text-sm text-red-600">Please select at least one purchase type (Regular or Once-off)</p>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="onboardingReason">Reason for Onboarding this Supplier *</Label>
            <Textarea
              id="onboardingReason"
              value={formData.onboardingReason}
              onChange={(e) => handleInputChange('onboardingReason', e.target.value)}
              placeholder="Provide detailed reason for onboarding this supplier"
              rows={4}
              className={!formData.onboardingReason ? "border-red-300" : ""}
            />
            {!formData.onboardingReason && (
              <p className="text-sm text-red-600">Please provide a detailed reason for onboarding this supplier</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submission */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isFormValid() ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready to Submit
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Complete Required Fields
                </Badge>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={!isFormValid() || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </form>
    </div>
  )
}

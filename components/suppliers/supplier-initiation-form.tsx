"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, AlertCircle, Users, DollarSign, ArrowLeft, Home, Plus, Check, ChevronsUpDown } from "lucide-react"
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
  const [customCategoryInput, setCustomCategoryInput] = useState("")
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [categorySearchOpen, setCategorySearchOpen] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    businessUnit: [] as string[],
    processReadUnderstood: false,
    dueDiligenceCompleted: false,
    supplierName: "",
    supplierEmail: "",
    supplierContactPerson: "",
    productServiceCategory: "",
    requesterName: session?.user?.name || "",
    relationshipDeclaration: "",
    purchaseType: "",
    annualPurchaseValue: "",
    creditApplication: false,
    creditApplicationReason: "",
    onboardingReason: ""
  })

  // Auto-fill requester name from session when it loads
  useEffect(() => {
    if (session?.user?.name) {
      setFormData(prev => ({
        ...prev,
        requesterName: session.user.name || ""
      }))
    }
  }, [session?.user?.name])

  // Fetch custom categories from database
  useEffect(() => {
    const fetchCustomCategories = async () => {
      try {
        const response = await fetch('/api/custom-options?type=PRODUCT_SERVICE_CATEGORY')
        const data = await response.json()
        if (data.success) {
          setCustomCategories(data.options || [])
        }
      } catch (error) {
        console.error('Error fetching custom categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCustomCategories()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBusinessUnitChange = (value: string, checked: boolean) => {
    setFormData(prev => {
      const currentUnits = prev.businessUnit || []
      if (checked) {
        // Add the business unit if it's not already in the array
        return {
          ...prev,
          businessUnit: [...currentUnits, value]
        }
      } else {
        // Remove the business unit from the array
        return {
          ...prev,
          businessUnit: currentUnits.filter(unit => unit !== value)
        }
      }
    })
  }

  const handleAddCustomCategory = async () => {
    const trimmedInput = customCategoryInput.trim()
    if (trimmedInput && !customCategories.includes(trimmedInput) && !PRODUCT_SERVICE_CATEGORIES.includes(trimmedInput as any)) {
      try {
        const response = await fetch('/api/custom-options', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            optionType: 'PRODUCT_SERVICE_CATEGORY',
            value: trimmedInput,
          }),
        })

        const data = await response.json()
        if (data.success) {
          // Add to local state
          setCustomCategories(prev => [...prev, data.option].sort((a, b) => 
            a.localeCompare(b, undefined, { sensitivity: 'base' })
          ))
          // Set the newly added category as selected (replacing "Other Products/Services")
          handleInputChange('productServiceCategory', data.option)
          // Clear the input and close the popover
          setCustomCategoryInput("")
          setCategorySearchOpen(false)
        } else {
          alert(data.error || 'Failed to add custom category')
        }
      } catch (error) {
        console.error('Error adding custom category:', error)
        alert('Failed to add custom category. Please try again.')
      }
    }
  }

  // Combine standard and custom categories, then sort alphabetically
  const allCategories = [...PRODUCT_SERVICE_CATEGORIES, ...customCategories].sort((a, b) => 
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare submission data - exclude credit application fields for Once-off Purchase
      const submissionData = { ...formData }
      if (formData.purchaseType === 'ONCE_OFF') {
        // For Once-off Purchase, set credit application to false and clear reason
        submissionData.creditApplication = false
        submissionData.creditApplicationReason = ''
      }
      
      const response = await fetch('/api/suppliers/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        const result = await response.json()
        onSubmissionComplete?.(result.initiationId)
      } else {
        let errorMessage = 'Unknown error'
        const contentType = response.headers.get('content-type')
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            console.error('API Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData
            })
            
            // Handle empty object or various error formats
            if (errorData && typeof errorData === 'object') {
              errorMessage = errorData.error || 
                           errorData.message || 
                           errorData.details ||
                           (Object.keys(errorData).length === 0 ? `Server error (${response.status})` : JSON.stringify(errorData))
            } else {
              errorMessage = `Server error (${response.status}): ${response.statusText}`
            }
          } else {
            // Try to get text response
            const text = await response.text()
            errorMessage = text || `Server error (${response.status}): ${response.statusText}`
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
          errorMessage = `Server error (${response.status}): ${response.statusText || 'Unknown error'}`
        }
        
        console.error('Final error message:', errorMessage)
        alert(`Failed to submit initiation: ${errorMessage}`)
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
    const hasBusinessUnit = Array.isArray(formData.businessUnit) && formData.businessUnit.length > 0
    const hasChecklist = formData.processReadUnderstood && formData.dueDiligenceCompleted
    // For productServiceCategory, if "Other Products/Services" is selected, it must be replaced with a custom category
    const hasValidCategory = formData.productServiceCategory && 
      formData.productServiceCategory !== "Other Products/Services" &&
      (allCategories.includes(formData.productServiceCategory))
    const hasSupplierInfo = !!formData.supplierName && !!formData.supplierEmail && !!formData.supplierContactPerson && hasValidCategory && !!formData.requesterName && !!formData.relationshipDeclaration
    const hasPurchaseType = !!formData.purchaseType
    const hasAnnualValue = formData.purchaseType !== "REGULAR" || (formData.purchaseType === "REGULAR" && formData.annualPurchaseValue && parseFloat(formData.annualPurchaseValue) > 0)
    // Credit application is not required for Once-off Purchase
    const hasCreditReason = formData.purchaseType === 'ONCE_OFF' || 
      formData.creditApplication || 
      (!formData.creditApplication && formData.creditApplicationReason)
    const hasOnboardingReason = !!formData.onboardingReason

    return hasBusinessUnit && hasChecklist && hasSupplierInfo && hasPurchaseType && hasAnnualValue && hasCreditReason && hasOnboardingReason
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-muted p-4 rounded-lg border border-border">
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
        <div className="text-sm text-muted-foreground">
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
          <div className="space-y-3">
            <Label>Business Unit *</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="businessUnit200"
                  checked={formData.businessUnit.includes("SCHAUENBURG_SYSTEMS_200")}
                  onCheckedChange={(checked) => handleBusinessUnitChange("SCHAUENBURG_SYSTEMS_200", checked === true)}
                />
                <Label htmlFor="businessUnit200" className="font-normal cursor-pointer">
                  Schauenburg Systems 200
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="businessUnit300"
                  checked={formData.businessUnit.includes("SCHAUENBURG_PTY_LTD_300")}
                  onCheckedChange={(checked) => handleBusinessUnitChange("SCHAUENBURG_PTY_LTD_300", checked === true)}
                />
                <Label htmlFor="businessUnit300" className="font-normal cursor-pointer">
                  Schauenburg (Pty) Ltd 300
                </Label>
              </div>
            </div>
            {(!formData.businessUnit || formData.businessUnit.length === 0) && (
              <p className="text-sm text-red-600">Please select at least one business unit</p>
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
              <Popover open={categorySearchOpen} onOpenChange={setCategorySearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categorySearchOpen}
                    className={`w-full justify-between ${!formData.productServiceCategory || formData.productServiceCategory === "Other Products/Services" ? "border-red-300" : ""}`}
                  >
                    {formData.productServiceCategory
                      ? allCategories.find((cat) => cat === formData.productServiceCategory) || formData.productServiceCategory
                      : "Select product/service category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {allCategories.map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => {
                              handleInputChange('productServiceCategory', category)
                              // Clear custom input when selecting a different option
                              if (category !== "Other Products/Services") {
                                setCustomCategoryInput("")
                              }
                              setCategorySearchOpen(false)
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${formData.productServiceCategory === category ? "opacity-100" : "opacity-0"}`}
                            />
                            {category}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {formData.productServiceCategory === "Other Products/Services" && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Type custom service category"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomCategory()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomCategory}
                    disabled={!customCategoryInput.trim() || customCategories.includes(customCategoryInput.trim()) || PRODUCT_SERVICE_CATEGORIES.includes(customCategoryInput.trim() as any)}
                    size="default"
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!formData.productServiceCategory && (
                <p className="text-sm text-red-600">Please select product/service category</p>
              )}
              {formData.productServiceCategory === "Other Products/Services" && (
                <p className="text-sm text-red-600">Please type and add a custom service category using the input field above</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterName">Requester Name *</Label>
            <Input
              id="requesterName"
              value={formData.requesterName}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Auto-filled from your account</p>
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
          <div className="space-y-2">
            <Label htmlFor="purchaseType">Purchase Type *</Label>
            <Select 
              value={formData.purchaseType} 
              onValueChange={(value) => {
                handleInputChange('purchaseType', value)
                // Clear annual purchase value if not Regular Purchase
                if (value !== "REGULAR") {
                  handleInputChange('annualPurchaseValue', "")
                }
                // For Once-off Purchase, clear credit application fields
                if (value === "ONCE_OFF") {
                  handleInputChange('creditApplication', false)
                  handleInputChange('creditApplicationReason', "")
                }
              }}
            >
              <SelectTrigger 
                id="purchaseType"
                className={!formData.purchaseType ? "border-red-300" : ""}
              >
                <SelectValue placeholder="Select purchase type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Regular Purchase</SelectItem>
                <SelectItem value="ONCE_OFF">Once-off Purchase</SelectItem>
                <SelectItem value="SHARED_IP">Shared IP</SelectItem>
              </SelectContent>
            </Select>
            {!formData.purchaseType && (
              <p className="text-sm text-red-600">Please select a purchase type</p>
            )}
          </div>

          {formData.purchaseType === "REGULAR" && (
            <div className="space-y-2">
              <Label htmlFor="annualPurchaseValue">Annual Purchase Value (R) *</Label>
              <Input
                id="annualPurchaseValue"
                type="number"
                value={formData.annualPurchaseValue}
                onChange={(e) => handleInputChange('annualPurchaseValue', e.target.value)}
                placeholder="Enter annual purchase value"
                className={(!formData.annualPurchaseValue || parseFloat(formData.annualPurchaseValue) <= 0) ? "border-red-300" : ""}
              />
              {(!formData.annualPurchaseValue || parseFloat(formData.annualPurchaseValue) <= 0) && (
                <p className="text-sm text-red-600">Please enter a valid annual purchase value</p>
              )}
            </div>
          )}

          {formData.purchaseType !== 'ONCE_OFF' && (
            <>
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
            </>
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

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Building2, CheckCircle, AlertCircle, Users, DollarSign, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PRODUCT_SERVICE_CATEGORIES } from "@/lib/product-service-categories"

interface SupplierInitiationFormProps {
  onSubmissionComplete?: (initiationId: string) => void
  draftId?: string // Optional: ID of draft to edit
}

export function SupplierInitiationForm({ onSubmissionComplete, draftId }: SupplierInitiationFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId || null)
  const [loadingDraft, setLoadingDraft] = useState(!!draftId)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    // Load custom categories from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customProductCategories')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [customCurrencyInput, setCustomCurrencyInput] = useState('')
  const [customCurrencies, setCustomCurrencies] = useState<string[]>(() => {
    // Load custom currencies from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customCurrencies')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
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
    relationshipDeclarationOther: "",
    purchaseType: "", // "REGULAR" or "SHARED_IP"
    paymentMethod: "", // "COD" or "AC"
    codReason: "",
    annualPurchaseValue: "",
    creditApplication: false,
    creditApplicationReason: "",
    onboardingReason: "",
    supplierLocation: "", // "LOCAL" or "FOREIGN"
    currency: "", // USD, GBP, EUR, or custom
    customCurrency: ""
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

  // Load draft data if draftId is provided
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId)
    }
  }, [draftId])

  const loadDraft = async (id: string) => {
    setLoadingDraft(true)
    try {
      const response = await fetch(`/api/suppliers/initiation/draft?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Draft data received:', data)
        if (data.success && data.initiation) {
          const draft = data.initiation
          console.log('💰 Annual Purchase Value from API:', draft.annualPurchaseValue)
          setCurrentDraftId(draft.id)
          
          // Convert businessUnit to array (handle both array and single value)
          const businessUnit = Array.isArray(draft.businessUnit) 
            ? draft.businessUnit 
            : (draft.businessUnit ? [draft.businessUnit] : [])

          // Determine purchase type from draft
          const purchaseType = draft.purchaseType || (draft.regularPurchase ? 'REGULAR' : (draft.onceOffPurchase ? 'ONCE_OFF' : 'SHARED_IP'))
          // Convert ONCE_OFF to SHARED_IP for new structure
          const normalizedPurchaseType = purchaseType === 'ONCE_OFF' ? 'SHARED_IP' : (purchaseType === 'REGULAR' ? 'REGULAR' : 'SHARED_IP')
          
          // The API already converts the numeric value to string format, so just use it directly
          const annualPurchaseValueStr = draft.annualPurchaseValue || ""
          console.log('💰 Annual Purchase Value for form:', annualPurchaseValueStr)
          
          setFormData({
            businessUnit: businessUnit || [],
            processReadUnderstood: draft.processReadUnderstood || false,
            dueDiligenceCompleted: draft.dueDiligenceCompleted || false,
            supplierName: draft.supplierName || "",
            supplierEmail: draft.supplierEmail || "",
            supplierContactPerson: draft.supplierContactPerson || "",
            productServiceCategory: draft.productServiceCategory || "",
            requesterName: draft.requesterName || session?.user?.name || "",
            relationshipDeclaration: draft.relationshipDeclaration || "",
            relationshipDeclarationOther: draft.relationshipDeclarationOther || "",
            purchaseType: normalizedPurchaseType,
            paymentMethod: draft.paymentMethod || "",
            codReason: draft.codReason || "",
            annualPurchaseValue: annualPurchaseValueStr,
            creditApplication: draft.creditApplication || false,
            creditApplicationReason: draft.creditApplicationReason || "",
            onboardingReason: draft.onboardingReason || "",
            supplierLocation: draft.supplierLocation || "",
            currency: draft.currency || "",
            customCurrency: draft.customCurrency || ""
          })
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    } finally {
      setLoadingDraft(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddCustomCategory = () => {
    if (!customCategory.trim()) return
    
    const newCategory = customCategory.trim()
    
    // Check if category already exists (case-insensitive)
    const existsInStandard = PRODUCT_SERVICE_CATEGORIES.some(
      cat => cat.toLowerCase() === newCategory.toLowerCase()
    )
    const existsInCustom = customCategories.some(
      cat => cat.toLowerCase() === newCategory.toLowerCase()
    )
    
    if (existsInStandard || existsInCustom) {
      // If it already exists, just select it
      setFormData(prev => ({
        ...prev,
        productServiceCategory: existsInStandard 
          ? PRODUCT_SERVICE_CATEGORIES.find(cat => cat.toLowerCase() === newCategory.toLowerCase()) || newCategory
          : customCategories.find(cat => cat.toLowerCase() === newCategory.toLowerCase()) || newCategory
      }))
      setCustomCategory('')
      return
    }
    
    // Add to custom categories list and sort alphabetically
    const updatedCategories = [...customCategories, newCategory].sort((a, b) => a.localeCompare(b))
    
    // Update state
    setCustomCategories(updatedCategories)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('customProductCategories', JSON.stringify(updatedCategories))
    }
    
    // Set as selected value
    setFormData(prev => ({
      ...prev,
      productServiceCategory: newCategory
    }))
    
    // Clear input
    setCustomCategory('')
  }

  const handleAddCustomCurrency = () => {
    if (!customCurrencyInput.trim()) return
    
    const newCurrency = customCurrencyInput.trim().toUpperCase()
    
    // Standard currencies list
    const standardCurrencies = ['USD', 'GBP', 'EUR', 'ZAR']
    
    // Check if currency already exists (case-insensitive)
    const existsInStandard = standardCurrencies.some(
      cur => cur.toUpperCase() === newCurrency
    )
    const existsInCustom = customCurrencies.some(
      cur => cur.toUpperCase() === newCurrency
    )
    
    if (existsInStandard || existsInCustom) {
      // If it already exists, just select it
      setFormData(prev => ({
        ...prev,
        currency: newCurrency,
        customCurrency: ""
      }))
      setCustomCurrencyInput('')
      return
    }
    
    // Add to custom currencies list and sort alphabetically
    const updatedCurrencies = [...customCurrencies, newCurrency].sort((a, b) => a.localeCompare(b))
    
    // Update state
    setCustomCurrencies(updatedCurrencies)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('customCurrencies', JSON.stringify(updatedCurrencies))
    }
    
    // Set as selected value
    setFormData(prev => ({
      ...prev,
      currency: newCurrency,
      customCurrency: ""
    }))
    
    // Clear input
    setCustomCurrencyInput('')
  }

  const handleBusinessUnitChange = (unit: string, checked: boolean) => {
    setFormData(prev => {
      const currentUnits = prev.businessUnit || []
      if (checked) {
        // Add unit if not already in array
        return {
          ...prev,
          businessUnit: [...currentUnits, unit]
        }
      } else {
        // Remove unit from array
        return {
          ...prev,
          businessUnit: currentUnits.filter(u => u !== unit)
        }
      }
    })
  }

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingDraft(true)

    try {
      // Combine relationship declaration: if "OTHER" is selected, use the "Other" text value
      const relationshipDeclarationValue = formData.relationshipDeclaration === "OTHER" 
        ? formData.relationshipDeclarationOther 
        : formData.relationshipDeclaration

      const submitData = {
        ...(currentDraftId && { id: currentDraftId }),
        businessUnit: Array.isArray(formData.businessUnit) ? formData.businessUnit : (formData.businessUnit ? [formData.businessUnit] : []),
        processReadUnderstood: formData.processReadUnderstood,
        dueDiligenceCompleted: formData.dueDiligenceCompleted,
        supplierName: formData.supplierName,
        supplierEmail: formData.supplierEmail,
        supplierContactPerson: formData.supplierContactPerson,
        productServiceCategory: formData.productServiceCategory,
        requesterName: formData.requesterName,
        relationshipDeclaration: relationshipDeclarationValue,
        relationshipDeclarationOther: formData.relationshipDeclarationOther,
        purchaseType: formData.purchaseType || 'REGULAR',
        paymentMethod: formData.paymentMethod,
        codReason: formData.paymentMethod === 'COD' ? formData.codReason : null,
        annualPurchaseValue: formData.annualPurchaseValue, // Send string value, API will convert to number
        creditApplication: formData.creditApplication,
        creditApplicationReason: formData.paymentMethod === 'COD' ? 'COD payment - credit not required' : formData.creditApplicationReason,
        regularPurchase: formData.purchaseType === 'REGULAR',
        onceOffPurchase: false,
        onboardingReason: formData.onboardingReason
      }

      const response = await fetch('/api/suppliers/initiation/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        setCurrentDraftId(result.initiationId)
        setSuccessMessage('Draft saved successfully!')
        setSuccessDialogOpen(true)
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        setErrorMessage(errorData.error || errorData.message || 'Failed to save draft')
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save draft: Network error')
      setErrorDialogOpen(true)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Combine relationship declaration: if "OTHER" is selected, use the "Other" text value
      const relationshipDeclarationValue = formData.relationshipDeclaration === "OTHER" 
        ? formData.relationshipDeclarationOther 
        : formData.relationshipDeclaration

      const submitData = {
        ...(currentDraftId && { id: currentDraftId }),
        businessUnit: Array.isArray(formData.businessUnit) ? formData.businessUnit : (formData.businessUnit ? [formData.businessUnit] : []),
        processReadUnderstood: formData.processReadUnderstood,
        dueDiligenceCompleted: formData.dueDiligenceCompleted,
        supplierName: formData.supplierName,
        supplierEmail: formData.supplierEmail,
        supplierContactPerson: formData.supplierContactPerson,
        productServiceCategory: formData.productServiceCategory,
        requesterName: formData.requesterName,
        relationshipDeclaration: relationshipDeclarationValue,
        purchaseType: formData.purchaseType || 'REGULAR',
        paymentMethod: formData.paymentMethod,
        codReason: formData.paymentMethod === 'COD' ? formData.codReason : null,
        annualPurchaseValue: formData.annualPurchaseValue, // Send string value, API will convert to number
        creditApplication: formData.creditApplication,
        creditApplicationReason: formData.paymentMethod === 'COD' ? 'COD payment - credit not required' : formData.creditApplicationReason,
        regularPurchase: formData.purchaseType === 'REGULAR',
        onceOffPurchase: false, // No longer used, but keep for backward compatibility
        onboardingReason: formData.onboardingReason
      }

      const response = await fetch('/api/suppliers/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        onSubmissionComplete?.(result.initiationId)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        // Show more detailed error message if available
        const errorMsg = errorData.message || errorData.error || 'Failed to submit initiation'
        setErrorMessage(errorMsg)
        setErrorDialogOpen(true)
      }
    } catch (error) {
      console.error('Error submitting initiation:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit initiation: Network error')
      setErrorDialogOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    // Check all required fields
    const hasBusinessUnit = Array.isArray(formData.businessUnit) && formData.businessUnit.length > 0
    const hasChecklist = formData.processReadUnderstood && formData.dueDiligenceCompleted
    const hasRelationshipDeclaration = formData.relationshipDeclaration === "OTHER" 
      ? !!formData.relationshipDeclarationOther 
      : !!formData.relationshipDeclaration
    const hasSupplierLocation = !!formData.supplierLocation
    const hasCurrency = formData.supplierLocation !== 'FOREIGN' || !!formData.currency // Foreign requires currency
    const hasSupplierInfo = !!formData.supplierName && !!formData.supplierEmail && !!formData.supplierContactPerson && !!formData.productServiceCategory && !!formData.requesterName && hasRelationshipDeclaration && hasSupplierLocation && hasCurrency
    const hasPurchaseType = !!formData.purchaseType // Must be REGULAR or SHARED_IP
    const hasPaymentMethod = !!formData.paymentMethod // Must be COD or AC
    const hasCodReason = formData.paymentMethod !== 'COD' || !!formData.codReason // COD requires reason
    const hasAnnualValue = formData.purchaseType !== 'REGULAR' || !!formData.annualPurchaseValue // Regular requires annual value
    // If COD, credit reason is not required (COD reason covers it). Otherwise, check credit application reason
    const hasCreditReason = formData.paymentMethod === 'COD' || formData.creditApplication || (!formData.creditApplication && formData.creditApplicationReason)
    const hasOnboardingReason = !!formData.onboardingReason

    return hasBusinessUnit && hasChecklist && hasSupplierInfo && hasPurchaseType && hasPaymentMethod && hasCodReason && hasAnnualValue && hasCreditReason && hasOnboardingReason
  }

  if (loadingDraft) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading draft...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {currentDraftId && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-900 font-medium">
            📝 Editing draft - Save or Submit when ready
          </p>
        </div>
      )}

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
                  id="businessUnit-200"
                  checked={formData.businessUnit.includes("SCHAUENBURG_PTY_LTD_300")}
                  onCheckedChange={(checked) => handleBusinessUnitChange("SCHAUENBURG_PTY_LTD_300", checked as boolean)}
                />
                <Label
                  htmlFor="businessUnit-200"
                  className="text-sm font-normal cursor-pointer"
                >
                  Schauenburg (Pty) Ltd 200
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="businessUnit-300"
                  checked={formData.businessUnit.includes("SCHAUENBURG_SYSTEMS_200")}
                  onCheckedChange={(checked) => handleBusinessUnitChange("SCHAUENBURG_SYSTEMS_200", checked as boolean)}
                />
                <Label
                  htmlFor="businessUnit-300"
                  className="text-sm font-normal cursor-pointer"
                >
                  Schauenburg Systems (Pty) Ltd 300
                </Label>
              </div>
            </div>
            {formData.businessUnit.length === 0 && (
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
                  {customCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.productServiceCategory && (
                <p className="text-sm text-red-600">Please select product/service category</p>
              )}
              
              {/* Show custom category input when "Other Products/Services" is selected */}
              {formData.productServiceCategory === "Other Products/Services" && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomCategory()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomCategory}
                    disabled={!customCategory.trim()}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierLocation">Supplier Location *</Label>
              <Select 
                value={formData.supplierLocation} 
                onValueChange={(value) => {
                  handleInputChange('supplierLocation', value)
                  // Clear currency fields when switching to LOCAL
                  if (value === 'LOCAL') {
                    handleInputChange('currency', '')
                    handleInputChange('customCurrency', '')
                  }
                }}
              >
                <SelectTrigger 
                  id="supplierLocation"
                  className={!formData.supplierLocation ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Select supplier location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOCAL">Local</SelectItem>
                  <SelectItem value="FOREIGN">Foreign</SelectItem>
                </SelectContent>
              </Select>
              {!formData.supplierLocation && (
                <p className="text-sm text-red-600">Please select supplier location</p>
              )}
            </div>

            {/* Currency selection - only show if FOREIGN */}
            {formData.supplierLocation === 'FOREIGN' && (
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => {
                    handleInputChange('currency', value)
                    // Clear custom currency input when switching away from "Other"
                    if (value !== 'OTHER') {
                      handleInputChange('customCurrency', '')
                    }
                  }}
                >
                  <SelectTrigger 
                    id="currency"
                    className={!formData.currency ? "border-red-300" : ""}
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    {customCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {!formData.currency && (
                  <p className="text-sm text-red-600">Please select currency</p>
                )}
                
                {/* Show custom currency input when "Other" is selected */}
                {formData.currency === 'OTHER' && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={customCurrencyInput}
                      onChange={(e) => setCustomCurrencyInput(e.target.value.toUpperCase())}
                      placeholder="Enter currency code (e.g., JPY)"
                      className="flex-1"
                      maxLength={10}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomCurrency()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomCurrency}
                      disabled={!customCurrencyInput.trim()}
                      size="sm"
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterName">Requester Name *</Label>
            <Input
              id="requesterName"
              value={formData.requesterName}
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Auto-filled from your account</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationshipDeclaration">Relationship Declaration *</Label>
            <Select 
              value={formData.relationshipDeclaration} 
              onValueChange={(value) => {
                handleInputChange('relationshipDeclaration', value)
                // Clear "Other" text when switching away from "OTHER"
                if (value !== "OTHER") {
                  handleInputChange('relationshipDeclarationOther', "")
                }
              }}
            >
              <SelectTrigger 
                id="relationshipDeclaration"
                className={!formData.relationshipDeclaration || (formData.relationshipDeclaration === "OTHER" && !formData.relationshipDeclarationOther) ? "border-red-300" : ""}
              >
                <SelectValue placeholder="Select relationship declaration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO_EXISTING_RELATIONSHIP">No existing relationship</SelectItem>
                <SelectItem value="PREVIOUS_SUPPLIER">Previous supplier</SelectItem>
                <SelectItem value="RELATED_PARTY">Related party</SelectItem>
                <SelectItem value="FAMILY_MEMBER">Family member</SelectItem>
                <SelectItem value="BUSINESS_PARTNER">Business partner</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {formData.relationshipDeclaration === "OTHER" && (
              <div className="mt-2">
                <Label htmlFor="relationshipDeclarationOther">Please specify *</Label>
                <Textarea
                  id="relationshipDeclarationOther"
                  value={formData.relationshipDeclarationOther}
                  onChange={(e) => handleInputChange('relationshipDeclarationOther', e.target.value)}
                  placeholder="Describe the relationship with this supplier"
                  rows={3}
                  className={!formData.relationshipDeclarationOther ? "border-red-300" : ""}
                />
                {!formData.relationshipDeclarationOther && (
                  <p className="text-sm text-red-600 mt-1">Please describe the relationship with this supplier</p>
                )}
              </div>
            )}
            {!formData.relationshipDeclaration && (
              <p className="text-sm text-red-600">Please select a relationship declaration</p>
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
          {/* Purchase Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="purchaseType">Purchase Type *</Label>
            <Select 
              value={formData.purchaseType} 
              onValueChange={(value) => {
                handleInputChange('purchaseType', value)
                // Clear payment method when purchase type changes
                handleInputChange('paymentMethod', "")
                handleInputChange('codReason', "")
              }}
            >
              <SelectTrigger 
                id="purchaseType"
                className={!formData.purchaseType ? "border-red-300" : ""}
              >
                <SelectValue placeholder="Select purchase type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="SHARED_IP">Shared IP</SelectItem>
              </SelectContent>
            </Select>
            {!formData.purchaseType && (
              <p className="text-sm text-red-600">Please select a purchase type</p>
            )}
          </div>

          {/* Annual Purchase Value - Only for Regular */}
          {formData.purchaseType === 'REGULAR' && (
            <div className="space-y-2">
              <Label htmlFor="annualPurchaseValue">Annual Purchase Value (R) *</Label>
              <Select 
                value={formData.annualPurchaseValue} 
                onValueChange={(value) => handleInputChange('annualPurchaseValue', value)}
              >
                <SelectTrigger 
                  id="annualPurchaseValue"
                  className={!formData.annualPurchaseValue ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Select annual purchase value range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100k">R0 - R100,000</SelectItem>
                  <SelectItem value="100k-500k">R100,000 - R500,000</SelectItem>
                  <SelectItem value="500k-1M">R500,000 - R1,000,000</SelectItem>
                  <SelectItem value="1M+">R1,000,000+</SelectItem>
                </SelectContent>
              </Select>
              {!formData.annualPurchaseValue && (
                <p className="text-sm text-red-600">Please select an annual purchase value range</p>
              )}
            </div>
          )}

          {/* Payment Method - Required for both Regular and Shared IP */}
          {formData.purchaseType && (
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => {
                  handleInputChange('paymentMethod', value)
                  // Clear COD reason if switching away from COD
                  if (value !== 'COD') {
                    handleInputChange('codReason', "")
                  } else {
                    // If COD is selected, automatically set credit application to false
                    handleInputChange('creditApplication', false)
                    handleInputChange('creditApplicationReason', "")
                  }
                }}
              >
                <SelectTrigger 
                  id="paymentMethod"
                  className={!formData.paymentMethod ? "border-red-300" : ""}
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">A/C (Account)</SelectItem>
                  <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                </SelectContent>
              </Select>
              {!formData.paymentMethod && (
                <p className="text-sm text-red-600">Please select a payment method</p>
              )}
            </div>
          )}

          {/* COD Reason - Required if COD is selected */}
          {formData.paymentMethod === 'COD' && (
            <div className="space-y-2">
              <Label htmlFor="codReason">Reason for COD *</Label>
              <Textarea
                id="codReason"
                value={formData.codReason}
                onChange={(e) => handleInputChange('codReason', e.target.value)}
                placeholder="Provide reason for requiring COD payment"
                rows={3}
                className={!formData.codReason ? "border-red-300" : ""}
              />
              {!formData.codReason && (
                <p className="text-sm text-red-600">Please provide a reason for requiring COD payment</p>
              )}
            </div>
          )}

          <Separator />

          {/* Credit Application */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="creditApplication"
              checked={formData.creditApplication}
              onCheckedChange={(checked) => handleInputChange('creditApplication', checked)}
              disabled={formData.paymentMethod === 'COD'}
            />
            <Label htmlFor="creditApplication" className={formData.paymentMethod === 'COD' ? "text-gray-400" : ""}>
              Credit Application *
              {formData.paymentMethod === 'COD' && (
                <span className="ml-2 text-xs text-gray-500">(Not applicable for COD)</span>
              )}
            </Label>
          </div>

          {!formData.creditApplication && formData.paymentMethod !== 'COD' && (
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
            
            <div className="flex items-center gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                Save Draft
              </Button>
              <Button 
                type="submit" 
                disabled={!isFormValid() || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </form>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setErrorDialogOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Success
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setSuccessDialogOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
import { Building2, CheckCircle, AlertCircle, Users, DollarSign, Plus, XCircle } from "lucide-react"
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
  const [rejectionInfo, setRejectionInfo] = useState<{
    status: string
    comments?: string
    rejectedBy?: string
    rejectedByName?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    businessUnit: ["SCHAUENBURG_PTY_LTD_300", "SCHAUENBURG_SYSTEMS_200"] as string[],
    processReadUnderstood: false,
    dueDiligenceCompleted: false,
    supplierName: "",
    supplierEmail: "",
    supplierContactPerson: "",
    productServiceCategory: "",
    requesterName: session?.user?.name || "",
    relationshipDeclaration: "",
    relationshipDeclarationOther: "",
    purchaseType: "", // "COD" | "COD_IP_SHARED" | "CREDIT_TERMS" | "CREDIT_TERMS_IP_SHARED"
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
          console.log('💰 Annual Purchase Value from API:', draft.annualPurchaseValue, 'Type:', typeof draft.annualPurchaseValue)
          console.log('📋 Full draft object:', JSON.stringify(draft, null, 2))
          setCurrentDraftId(draft.id)
          
          // Check if this is a rejected initiation and store rejection info
          if (draft.status === 'REJECTED' && draft.managerApproval) {
            setRejectionInfo({
              status: draft.status,
              comments: draft.managerApproval.comments,
              rejectedBy: typeof draft.managerApproval.approver === 'string' 
                ? draft.managerApproval.approver 
                : draft.managerApproval.approver?.name,
              rejectedByName: typeof draft.managerApproval.approver === 'object'
                ? draft.managerApproval.approver?.name
                : draft.managerApproval.approver
            })
          }
          
          // Convert businessUnit to array (handle both array and single value)
          const businessUnit = Array.isArray(draft.businessUnit) 
            ? draft.businessUnit 
            : (draft.businessUnit ? [draft.businessUnit] : [])

          // Map draft purchase type to new 4-category purchase type
          const legacyPurchaseType = draft.purchaseType || (draft.regularPurchase ? 'REGULAR' : (draft.onceOffPurchase ? 'ONCE_OFF' : 'SHARED_IP'))
          const legacyPaymentMethod = draft.paymentMethod || 'AC'
          const isLegacy = ['REGULAR', 'ONCE_OFF', 'SHARED_IP'].includes(legacyPurchaseType)
          const normalizedPurchaseType = isLegacy
            ? (legacyPurchaseType === 'REGULAR' && legacyPaymentMethod === 'COD')
              ? 'COD'
              : (legacyPurchaseType === 'REGULAR' && legacyPaymentMethod === 'AC')
                ? 'CREDIT_TERMS'
                : ((legacyPurchaseType === 'SHARED_IP' || legacyPurchaseType === 'ONCE_OFF') && legacyPaymentMethod === 'COD')
                  ? 'COD_IP_SHARED'
                  : 'CREDIT_TERMS_IP_SHARED'
            : (draft.purchaseType as string) // already COD, COD_IP_SHARED, CREDIT_TERMS, CREDIT_TERMS_IP_SHARED
          console.log('📝 Purchase type from draft:', { legacyPurchaseType, legacyPaymentMethod, normalizedPurchaseType })

          const annualPurchaseValueStr = draft.annualPurchaseValue || ""
          
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
    console.log(`📝 handleInputChange called - Field: ${field}, Value:`, value)
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      console.log(`📝 Updated formData for ${field}:`, (newData as any)[field])
      return newData
    })
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
        purchaseType: formData.purchaseType || '',
        codReason: (formData.purchaseType === 'COD' || formData.purchaseType === 'COD_IP_SHARED') ? formData.codReason : null,
        annualPurchaseValue: formData.annualPurchaseValue,
        creditApplication: formData.creditApplication,
        creditApplicationReason: (formData.purchaseType === 'COD' || formData.purchaseType === 'COD_IP_SHARED') ? 'COD - credit not required' : formData.creditApplicationReason,
        regularPurchase: formData.purchaseType === 'COD' || formData.purchaseType === 'CREDIT_TERMS',
        onceOffPurchase: false,
        onboardingReason: formData.onboardingReason,
        supplierLocation: formData.supplierLocation,
        currency: formData.currency,
        customCurrency: formData.customCurrency
      }
      
      console.log('💾 Saving draft with purchaseType:', formData.purchaseType, 'annualPurchaseValue:', formData.annualPurchaseValue)
      console.log('💾 Full submitData:', submitData)

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
        purchaseType: formData.purchaseType || '',
        codReason: (formData.purchaseType === 'COD' || formData.purchaseType === 'COD_IP_SHARED') ? formData.codReason : null,
        annualPurchaseValue: formData.annualPurchaseValue,
        creditApplication: formData.creditApplication,
        creditApplicationReason: (formData.purchaseType === 'COD' || formData.purchaseType === 'COD_IP_SHARED') ? 'COD - credit not required' : formData.creditApplicationReason,
        regularPurchase: formData.purchaseType === 'COD' || formData.purchaseType === 'CREDIT_TERMS',
        onceOffPurchase: false,
        onboardingReason: formData.onboardingReason,
        supplierLocation: formData.supplierLocation,
        currency: formData.currency,
        customCurrency: formData.customCurrency
      }
      
      console.log('📤 Submitting with purchaseType:', formData.purchaseType, 'annualPurchaseValue:', formData.annualPurchaseValue)
      console.log('📤 Full submitData:', submitData)

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
        const responseText = await response.text()
        let errorData: { message?: string; error?: string } = {}
        try {
          errorData = responseText ? JSON.parse(responseText) : {}
        } catch {
          console.error('API Error (non-JSON response):', response.status, responseText?.slice(0, 500))
        }
        if (Object.keys(errorData).length > 0) {
          console.error('API Error:', response.status, errorData)
        }
        const errorMsg =
          errorData.message ||
          errorData.error ||
          (response.status === 500 && 'Server error. Please try again or contact support.') ||
          `Request failed (${response.status}). ${responseText?.slice(0, 200) || 'Please try again.'}`
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
    const isCodType = formData.purchaseType === 'COD' || formData.purchaseType === 'COD_IP_SHARED'
    const isCreditTermsType = formData.purchaseType === 'CREDIT_TERMS' || formData.purchaseType === 'CREDIT_TERMS_IP_SHARED'
    const hasPurchaseType = !!formData.purchaseType
    const hasCodReason = !isCodType || !!formData.codReason
    const hasCreditReason = !isCreditTermsType || formData.creditApplication || (!formData.creditApplication && !!formData.creditApplicationReason)
    const hasOnboardingReason = !!formData.onboardingReason

    return hasBusinessUnit && hasChecklist && hasSupplierInfo && hasPurchaseType && hasCodReason && hasCreditReason && hasOnboardingReason
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
      {rejectionInfo ? (
        <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Initiation Rejected - Revision Required
              </h3>
              <p className="text-sm text-red-800 mb-3">
                Your supplier initiation was rejected by {rejectionInfo.rejectedByName || rejectionInfo.rejectedBy || 'the manager'}. 
                Please review the rejection reason below, make the necessary changes, and resubmit.
              </p>
              {rejectionInfo.comments && (
                <div className="bg-white p-4 rounded border border-red-200">
                  <p className="text-xs font-medium text-red-900 mb-2">Rejection Reason:</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{rejectionInfo.comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : currentDraftId ? (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-900 font-medium">
            📝 Editing draft - Save or Submit when ready
          </p>
        </div>
      ) : null}

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
          {/* Purchase Type Selection - 4 categories */}
          <div className="space-y-2">
            <Label htmlFor="purchaseType">Purchase Type *</Label>
            <Select 
              value={formData.purchaseType} 
              onValueChange={(value) => {
                handleInputChange('purchaseType', value)
                if (value !== 'COD' && value !== 'COD_IP_SHARED') {
                  handleInputChange('codReason', "")
                }
                if (value !== 'CREDIT_TERMS' && value !== 'CREDIT_TERMS_IP_SHARED') {
                  handleInputChange('annualPurchaseValue', "")
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
                <SelectItem value="COD">COD</SelectItem>
                <SelectItem value="COD_IP_SHARED">COD IP Shared</SelectItem>
                <SelectItem value="CREDIT_TERMS">Credit Terms</SelectItem>
                <SelectItem value="CREDIT_TERMS_IP_SHARED">Credit Terms IP Shared</SelectItem>
              </SelectContent>
            </Select>
            {!formData.purchaseType && (
              <p className="text-sm text-red-600">Please select a purchase type</p>
            )}
          </div>

          {/* COD Reason - Required for COD and COD IP Shared */}
          {(formData.purchaseType === 'COD' || formData.purchaseType === 'COD_IP_SHARED') && (
            <div className="space-y-2">
              <Label htmlFor="codReason">Reason for COD *</Label>
              <Textarea
                id="codReason"
                value={formData.codReason}
                onChange={(e) => handleInputChange('codReason', e.target.value)}
                placeholder={formData.purchaseType === 'COD_IP_SHARED' ? "Provide reason for requiring COD IP Shared" : "Provide reason for requiring COD payment"}
                rows={3}
                className={!formData.codReason ? "border-red-300" : ""}
              />
              {!formData.codReason && (
                <p className="text-sm text-red-600">Please provide a reason for requiring COD</p>
              )}
            </div>
          )}

          {/* Annual Purchase Value - Only for Credit Terms types */}
          {(formData.purchaseType === 'CREDIT_TERMS' || formData.purchaseType === 'CREDIT_TERMS_IP_SHARED') && (
            <div className="space-y-2">
              <Label htmlFor="annualPurchaseValue">Annual Purchase Value Range (optional)</Label>
              <Select 
                value={formData.annualPurchaseValue} 
                onValueChange={(value) => handleInputChange('annualPurchaseValue', value)}
              >
                <SelectTrigger id="annualPurchaseValue">
                  <SelectValue placeholder="Select annual purchase value range (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const getCurrencySymbol = () => {
                      if (formData.supplierLocation === 'LOCAL' || !formData.currency) return 'R'
                      switch (formData.currency.toUpperCase()) {
                        case 'USD': return '$'
                        case 'EUR': return '€'
                        case 'GBP': return '£'
                        case 'ZAR': return 'R'
                        default: return formData.customCurrency || formData.currency.toUpperCase() + ' '
                      }
                    }
                    const symbol = getCurrencySymbol()
                    return (
                      <>
                        <SelectItem value="0-100k">{symbol}0 - {symbol}100,000</SelectItem>
                        <SelectItem value="100k-500k">{symbol}100,000 - {symbol}500,000</SelectItem>
                        <SelectItem value="500k-1M">{symbol}500,000 - {symbol}1,000,000</SelectItem>
                        <SelectItem value="1M+">{symbol}1,000,000+</SelectItem>
                      </>
                    )
                  })()}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Credit Application - Only for Credit Terms types */}
          {(formData.purchaseType === 'CREDIT_TERMS' || formData.purchaseType === 'CREDIT_TERMS_IP_SHARED') && (
            <>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="creditApplication"
              checked={formData.creditApplication}
              onCheckedChange={(checked) => handleInputChange('creditApplication', checked)}
            />
            <Label htmlFor="creditApplication">
              Credit Application *
            </Label>
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
                {isSubmitting ? "Submitting..." : rejectionInfo ? "Resubmit for Approval" : "Submit for Approval"}
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

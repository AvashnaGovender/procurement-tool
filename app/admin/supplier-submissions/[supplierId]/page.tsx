"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Loader2, 
  ArrowLeft,
  CheckCircle, 
  XCircle,
  X,
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  Building2,
  Eye,
  Edit,
  UserCheck,
  Trash2,
  Brain,
  Play,
  CheckCheck,
  AlertCircle
} from "lucide-react"
import { workerClient } from "@/lib/worker-client"
import { getMandatoryDocuments, type PurchaseType } from "@/lib/document-requirements"
import { assignCreditController, getCreditControllers } from "@/lib/credit-controller-assignment"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Supplier {
  id: string
  supplierCode: string
  companyName: string
  contactPerson: string
  contactEmail: string
  contactPhone: string | null
  status: string
  createdAt: string
  natureOfBusiness: string | null
  bbbeeLevel: string | null
  numberOfEmployees: number | null
  airtableData: any
  supplierName?: string | null
  tradingName?: string | null
  registrationNumber?: string | null
  physicalAddress?: string | null
  postalAddress?: string | null
  associatedCompany?: string | null
  productsAndServices?: string | null
  associatedCompanyRegNo?: string | null
  associatedCompanyBranchName?: string | null
  branchesContactNumbers?: string | null
  bankAccountName?: string | null
  bankName?: string | null
  branchName?: string | null
  branchNumber?: string | null
  accountNumber?: string | null
  typeOfAccount?: string | null
  rpBanking?: string | null
  rpBankingPhone?: string | null
  rpBankingEmail?: string | null
  rpQuality?: string | null
  rpQualityPhone?: string | null
  rpQualityEmail?: string | null
  rpSHE?: string | null
  rpSHEPhone?: string | null
  rpSHEEmail?: string | null
  rpBBBEE?: string | null
  rpBBBEEPhone?: string | null
  rpBBBEEEmail?: string | null
  qualityManagementCert?: boolean | null
  sheCertification?: boolean | null
  authorizationAgreement?: boolean | null
  onboarding?: {
    requiredDocuments?: string[]
    initiation?: {
      purchaseType?: string
      creditApplication?: boolean
      initiatedById?: string
    } | null
  } | null
}

export default function SupplierDetailPage({ params }: { params: Promise<{ supplierId: string }> }) {
  const router = useRouter()
  const { data: session } = useSession()
  const resolvedParams = use(params)
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSupplier()
  }, [])

  const fetchSupplier = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/suppliers/${resolvedParams.supplierId}`)
      const data = await response.json()
      
      if (data.success) {
        setSupplier(data.supplier)
      }
    } catch (error) {
      console.error('Error fetching supplier:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Supplier not found</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Top Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
        <div>
          <h1 className="text-xl font-bold">Supplier: {supplier.companyName}</h1>
          <p className="text-sm text-muted-foreground">Code: {supplier.supplierCode}</p>
        </div>
        <Badge className="bg-blue-500 text-white px-4 py-2">
          {supplier.status.replace(/_/g, ' ')}
        </Badge>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Details</CardTitle>
            <CardDescription>Full details page is being rebuilt to fix layout issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Contact Person:</strong> {supplier.contactPerson}
              </div>
              <div>
                <strong>Email:</strong> {supplier.contactEmail}
              </div>
              <div>
                <strong>Phone:</strong> {supplier.contactPhone || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

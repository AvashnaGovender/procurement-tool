"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Home, Settings, Plus, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { AIOnboardingWorkflow } from "@/components/suppliers/ai-onboarding-workflow"
import { SupplierInitiationForm } from "@/components/suppliers/supplier-initiation-form"
import { SupplierInitiationStatus } from "@/components/suppliers/supplier-initiation-status"
import { SMTPConfiguration } from "@/components/settings/smtp-configuration"

export default function SupplierOnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [workflowStatus, setWorkflowStatus] = useState<"initiate" | "pending" | "review" | "complete">("initiate")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [waitingOpen, setWaitingOpen] = useState(false)
  const [initiationId, setInitiationId] = useState<string | null>(null)
  const [showInitiationForm, setShowInitiationForm] = useState(true)
  
  // Initialize tab state - default to 'new' to match server render
  const [mainTab, setMainTab] = useState<"new" | "review">("new")
  
  // Update tab from URL params after mount (client-side only)
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'review') {
      setMainTab('review')
    }
  }, [searchParams])

  const steps = [
    { id: 1, title: "Initiation", description: "Checklist & approval workflow" },
    { id: 2, title: "Supplier Response", description: "Form completion & document upload" },
    { id: 3, title: "Review", description: "Procurement specialist approval" },
    { id: 4, title: "Complete", description: "Database entry & notification" },
  ]


  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-500"
      case "review":
        return "bg-yellow-500"
      case "pending":
        return "bg-blue-500"
      default:
        return "bg-gray-300"
    }
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => router.push('/suppliers')}
            >
              <Home className="h-4 w-4 mr-2" />
              Suppliers
            </Button>
            <div className="border-l border-slate-300 pl-4">
              <h1 className="text-xl font-bold text-slate-900">Supplier Onboarding</h1>
              <p className="text-xs text-slate-600">AI-powered workflow with intelligent document processing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-slate-300">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">SMTP Configuration</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Configure SMTP server settings for sending supplier onboarding emails
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <SMTPConfiguration />
                </div>
              </DialogContent>
            </Dialog>
            <Badge className={`${getStatusColor(workflowStatus)} text-white border-0`}>
              {workflowStatus.charAt(0).toUpperCase() + workflowStatus.slice(1)}
            </Badge>
          </div>
        </header>

        {/* Breadcrumb Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              Dashboard
            </button>
            <span className="text-slate-400">/</span>
            <button 
              onClick={() => router.push('/suppliers')}
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              Suppliers
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-medium">Onboarding</span>
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Main Tabs: New Onboarding vs Review Submissions */}
          <Tabs value={mainTab} onValueChange={(value) => setMainTab(value as typeof mainTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border-slate-200">
              <TabsTrigger value="new" className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <Plus className="h-4 w-4" />
                Initiate New Onboarding
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                <List className="h-4 w-4" />
                Review Submissions
              </TabsTrigger>
            </TabsList>

            {/* New Onboarding Tab */}
            <TabsContent value="new">
              {showInitiationForm ? (
                <div className="space-y-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-900">Step 1: Supplier Onboarding Initiation</CardTitle>
                      <p className="text-blue-700">
                        Complete the checklist and submit for approval before proceeding with supplier onboarding.
                      </p>
                    </CardHeader>
                  </Card>
                  
                  <SupplierInitiationForm
                    onSubmissionComplete={(id) => {
                      setInitiationId(id)
                      setShowInitiationForm(false)
                    }}
                  />
                </div>
              ) : initiationId ? (
                <div className="space-y-6">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-900">Initiation Submitted Successfully</CardTitle>
                      <p className="text-green-700">
                        Your supplier initiation has been submitted and is awaiting approval.
                      </p>
                    </CardHeader>
                  </Card>
                  
                  <SupplierInitiationStatus initiationId={initiationId} />
                  
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowInitiationForm(true)
                        setInitiationId(null)
                      }}
                    >
                      Start New Initiation
                    </Button>
                    <Button 
                      onClick={() => {
                        setWorkflowStatus("pending")
                        setCurrentStep(2)
                        setWaitingOpen(true)
                      }}
                    >
                      Continue to Supplier Onboarding
                    </Button>
                  </div>
                </div>
              ) : (
                <AIOnboardingWorkflow
                  step="initiate"
                  onStepComplete={() => {
                    setWorkflowStatus("pending")
                    setCurrentStep(2)
                    setWaitingOpen(true)
                  }}
                />
              )}
            </TabsContent>

            {/* Review Submissions Tab */}
            <TabsContent value="review">
              <div className="space-y-6">
                {/* Submissions Dashboard */}
                <Card className="bg-white border-slate-200 shadow-lg">
                  <CardHeader className="border-b border-slate-200 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-slate-900 text-xl">Supplier Submissions</CardTitle>
                        <p className="text-slate-600 text-sm mt-1">Review and manage all supplier onboarding submissions</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/admin/supplier-submissions')}
                      >
                        Open Full Dashboard
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="bg-slate-50 rounded-b-lg overflow-hidden">
                      <iframe 
                        src="/admin/supplier-submissions" 
                        className="w-full border-0"
                        style={{ minHeight: "calc(100vh - 450px)", height: "700px" }}
                        title="Supplier Submissions Dashboard"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Waiting Dialog after initiation send */}
      <Dialog open={waitingOpen} onOpenChange={setWaitingOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-300">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Waiting for Supplier</DialogTitle>
            <DialogDescription className="text-slate-600">
              Waiting for supplier to complete next step. You will be notified for review.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 p-4">
            <div className="flex gap-3 justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => setWaitingOpen(false)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white"
              >
                Close
              </Button>
              <Button 
                onClick={() => { setWaitingOpen(false); setMainTab('review') }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

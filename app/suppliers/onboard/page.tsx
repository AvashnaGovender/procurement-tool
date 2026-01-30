"use client"

import React, { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { AIOnboardingWorkflow } from "@/components/suppliers/ai-onboarding-workflow"
import { SupplierInitiationForm } from "@/components/suppliers/supplier-initiation-form"
import { SupplierInitiationStatus } from "@/components/suppliers/supplier-initiation-status"
import { SMTPConfiguration } from "@/components/settings/smtp-configuration"

function SupplierOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [workflowStatus, setWorkflowStatus] = useState<"initiate" | "pending" | "review" | "complete">("initiate")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [waitingOpen, setWaitingOpen] = useState(false)
  const [initiationId, setInitiationId] = useState<string | null>(null)
  const [showInitiationForm, setShowInitiationForm] = useState(true)
  
  // Update initiation ID from URL params after mount (client-side only)
  useEffect(() => {
    const draftId = searchParams.get('draftId')
    if (draftId) {
      setInitiationId(draftId)
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
    <div className="flex flex-col h-full">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
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
                    draftId={searchParams.get('draftId') || undefined}
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
        </main>
        
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
                  onClick={() => setWaitingOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}

export default function SupplierOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading supplier onboarding...</p>
        </div>
      </div>
    }>
      <SupplierOnboardingContent />
    </Suspense>
  )
}

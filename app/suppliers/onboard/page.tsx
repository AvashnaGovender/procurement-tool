"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
import { AIOnboardingWorkflow } from "@/components/suppliers/ai-onboarding-workflow"
import { SMTPConfiguration } from "@/components/settings/smtp-configuration"
import { EmailTemplates } from "@/components/settings/email-templates"

export default function SupplierOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [workflowStatus, setWorkflowStatus] = useState<"initiate" | "pending" | "review" | "complete">("initiate")
  const [settingsOpen, setSettingsOpen] = useState(false)

  const steps = [
    { id: 1, title: "Initiate", description: "Contact details & business type" },
    { id: 2, title: "Supplier Response", description: "Form completion & document upload" },
    { id: 3, title: "Review", description: "Procurement specialist approval" },
    { id: 4, title: "Complete", description: "Database entry & notification" },
  ]

  const getProgressValue = () => {
    switch (workflowStatus) {
      case "initiate":
        return 25
      case "pending":
        return 50
      case "review":
        return 75
      case "complete":
        return 100
      default:
        return 25
    }
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/suppliers">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Suppliers
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI-Powered Supplier Onboarding</h1>
                <p className="text-gray-600">Automated workflow with intelligent document processing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Email Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Email Configuration</DialogTitle>
                    <DialogDescription>
                      Configure SMTP settings and email templates for supplier onboarding
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-8 py-4">
                    <SMTPConfiguration />
                    <EmailTemplates />
                  </div>
                </DialogContent>
              </Dialog>
              <Badge variant="outline" className={`${getStatusColor(workflowStatus)} text-white`}>
                {workflowStatus.charAt(0).toUpperCase() + workflowStatus.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Onboarding Progress</CardTitle>
              <span className="text-sm text-gray-500">{getProgressValue()}% Complete</span>
            </div>
            <Progress value={getProgressValue()} className="w-full" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border ${
                    index + 1 <= currentStep ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index + 1 <= currentStep ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Tabs */}
        <Tabs value={workflowStatus} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="initiate" disabled={workflowStatus !== "initiate"}>
              Step 1: Initiate
            </TabsTrigger>
            <TabsTrigger value="pending" disabled={workflowStatus !== "pending"}>
              Step 2: Pending Response
            </TabsTrigger>
            <TabsTrigger value="review" disabled={workflowStatus !== "review"}>
              Step 3: Review
            </TabsTrigger>
            <TabsTrigger value="complete" disabled={workflowStatus !== "complete"}>
              Step 4: Complete
            </TabsTrigger>
          </TabsList>

          <TabsContent value="initiate" className="mt-6">
            <AIOnboardingWorkflow
              step="initiate"
              onStepComplete={(nextStep) => {
                setWorkflowStatus(nextStep as any)
                setCurrentStep(2)
              }}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <AIOnboardingWorkflow
              step="pending"
              onStepComplete={(nextStep) => {
                setWorkflowStatus(nextStep as any)
                setCurrentStep(3)
              }}
            />
          </TabsContent>

          <TabsContent value="review" className="mt-6">
            <AIOnboardingWorkflow
              step="review"
              onStepComplete={(nextStep) => {
                setWorkflowStatus(nextStep as any)
                setCurrentStep(4)
              }}
            />
          </TabsContent>

          <TabsContent value="complete" className="mt-6">
            <AIOnboardingWorkflow step="complete" onStepComplete={() => {}} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

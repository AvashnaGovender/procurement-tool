"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Bot, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { AIProcessingTrigger } from './ai-processing-trigger'
import { AIProcessingStatus } from './ai-processing-status'

interface Document {
  id: string
  documentType: string
  fileName: string
  filePath: string
  fileSize: number
  uploadedAt: Date
}

interface OnboardingStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  description: string
}

interface EnhancedOnboardingWorkflowProps {
  supplierId: string
  onboardingId: string
  documents: Document[]
  onComplete?: (results: any) => void
}

export function EnhancedOnboardingWorkflow({
  supplierId,
  onboardingId,
  documents,
  onComplete
}: EnhancedOnboardingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [processingStarted, setProcessingStarted] = useState(false)
  const [processingResults, setProcessingResults] = useState<any>(null)
  const [submissionId] = useState(`submission_${onboardingId}_${Date.now()}`)

  const steps: OnboardingStep[] = [
    {
      id: 'upload',
      title: 'Document Upload',
      status: documents.length > 0 ? 'completed' : 'pending',
      description: 'Upload all required supplier documents'
    },
    {
      id: 'ai-processing',
      title: 'AI Processing',
      status: processingStarted ? (processingResults ? 'completed' : 'in-progress') : 'pending',
      description: 'AI analyzes documents for compliance and risk assessment'
    },
    {
      id: 'review',
      title: 'Admin Review',
      status: processingResults ? 'pending' : 'pending',
      description: 'Admin reviews AI analysis and makes final decision'
    },
    {
      id: 'approval',
      title: 'Approval',
      status: 'pending',
      description: 'Final approval and supplier activation'
    }
  ]

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepBadge = (step: OnboardingStep) => {
    switch (step.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const handleProcessingStarted = () => {
    setProcessingStarted(true)
    setCurrentStep(1)
  }

  const handleProcessingComplete = (results: any) => {
    setProcessingResults(results)
    setCurrentStep(2)
    onComplete?.(results)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'High Risk', color: 'text-red-500', bgColor: 'bg-red-50' }
    if (score >= 60) return { level: 'Medium Risk', color: 'text-yellow-500', bgColor: 'bg-yellow-50' }
    return { level: 'Low Risk', color: 'text-green-500', bgColor: 'bg-green-50' }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Supplier Onboarding Workflow</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStepIcon(step)}
                  <span className="font-medium">{step.title}</span>
                  {getStepBadge(step)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Uploaded Documents</span>
            <Badge variant="outline">{documents.length} files</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.documentType} • {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No documents uploaded yet. Please upload required documents to proceed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Processing Section */}
      {documents.length > 0 && (
        <AIProcessingTrigger
          submissionId={submissionId}
          supplierId={supplierId}
          onboardingId={onboardingId}
          documents={documents}
          onProcessingStarted={handleProcessingStarted}
          onProcessingComplete={handleProcessingComplete}
        />
      )}

      {/* Processing Status */}
      {processingStarted && (
        <AIProcessingStatus
          submissionId={submissionId}
          onResultsReady={handleProcessingComplete}
        />
      )}

      {/* Results Summary */}
      {processingResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Analysis Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Assessment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Assessment</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{processingResults.risk_score}/100</span>
                  <Badge 
                    variant={processingResults.risk_score >= 60 ? "destructive" : "default"}
                    className={processingResults.risk_score >= 60 ? "bg-red-500" : "bg-green-500"}
                  >
                    {getRiskLevel(processingResults.risk_score).level}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Decision Summary */}
            <div className="space-y-2">
              <span className="font-medium">Decision Summary</span>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{processingResults.decision_summary}</p>
              </div>
            </div>

            {/* Document Analysis Summary */}
            {processingResults.extracted_data?.documents && (
              <div className="space-y-2">
                <span className="font-medium">Document Analysis</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {processingResults.extracted_data.documents.map((doc: any, index: number) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{doc.document_type}</span>
                        <Badge variant="outline">
                          {Math.round(doc.confidence_score * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.extracted_fields?.length || 0} fields extracted
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Next Steps</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>AI analysis completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span>Admin review required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Final approval pending</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



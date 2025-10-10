"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Sparkles
} from 'lucide-react'

interface Document {
  id: string
  documentType: string
  fileName: string
  filePath: string
  fileSize: number
}

interface AIProcessingTriggerProps {
  submissionId: string
  supplierId: string
  onboardingId: string
  documents: Document[]
  onProcessingStarted?: () => void
  onProcessingComplete?: (results: any) => void
}

export function AIProcessingTrigger({
  submissionId,
  supplierId,
  onboardingId,
  documents,
  onProcessingStarted,
  onProcessingComplete
}: AIProcessingTriggerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const startAIProcessing = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/worker/process-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          supplierId,
          onboardingId,
          documents,
          adminEmails: [] // Will be fetched automatically
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start AI processing')
      }

      const result = await response.json()
      setSuccess(true)
      onProcessingStarted?.()

      // Start polling for results
      pollForResults()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start processing')
    } finally {
      setIsProcessing(false)
    }
  }

  const pollForResults = async () => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/worker/status/${submissionId}`)
        if (!response.ok) return

        const status = await response.json()
        
        if (status.status === 'completed') {
          // Fetch results
          const resultsResponse = await fetch(`/api/worker/results/${submissionId}`)
          if (resultsResponse.ok) {
            const results = await resultsResponse.json()
            onProcessingComplete?.(results)
          }
          return
        }

        if (status.status === 'failed') {
          setError(status.error_message || 'Processing failed')
          return
        }

        // Continue polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          setError('Processing timeout - please check status manually')
        }
      } catch (err) {
        setError('Failed to check processing status')
      }
    }

    setTimeout(poll, 5000) // Start polling after 5 seconds
  }

  const getDocumentSummary = () => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0)
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1)
    
    return {
      count: documents.length,
      size: sizeInMB,
      types: [...new Set(documents.map(doc => doc.documentType))]
    }
  }

  const docSummary = getDocumentSummary()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>AI Document Processing</span>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by CrewAI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Summary */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Documents Ready for Processing</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Count:</span>
              <p className="font-medium">{docSummary.count} files</p>
            </div>
            <div>
              <span className="text-muted-foreground">Size:</span>
              <p className="font-medium">{docSummary.size} MB</p>
            </div>
            <div>
              <span className="text-muted-foreground">Types:</span>
              <p className="font-medium">{docSummary.types.length} types</p>
            </div>
          </div>
        </div>

        {/* Processing Features */}
        <div className="space-y-2">
          <span className="font-medium text-sm">AI Processing Features:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>OCR Text Extraction</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Compliance Checking</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Risk Assessment</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Decision Summary</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              AI processing started successfully! Processing documents and generating analysis...
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            onClick={startAIProcessing}
            disabled={isProcessing || documents.length === 0}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting AI Processing...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Start AI Processing
              </>
            )}
          </Button>
        </div>

        {/* Processing Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• AI will analyze all uploaded documents</p>
          <p>• Extract key information and check compliance</p>
          <p>• Generate risk assessment and recommendations</p>
          <p>• Admin will be notified when processing is complete</p>
        </div>
      </CardContent>
    </Card>
  )
}


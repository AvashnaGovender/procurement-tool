"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'

interface ProcessingStatus {
  submission_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_started_at?: string
  processing_completed_at?: string
  error_message?: string
}

interface ProcessingResults {
  submission_id: string
  extracted_data: any
  compliance_results: any
  risk_score: number
  decision_summary: string
  processing_completed_at: string
}

interface AIProcessingStatusProps {
  submissionId: string
  onResultsReady?: (results: ProcessingResults) => void
}

export function AIProcessingStatus({ submissionId, onResultsReady }: AIProcessingStatusProps) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null)
  const [results, setResults] = useState<ProcessingResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/worker/status/${submissionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch status')
      }
      const statusData = await response.json()
      setStatus(statusData)
      
      // If processing is completed, fetch results
      if (statusData.status === 'completed' && !results) {
        await fetchResults()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/worker/results/${submissionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }
      const resultsData = await response.json()
      setResults(resultsData)
      onResultsReady?.(resultsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results')
    }
  }

  useEffect(() => {
    fetchStatus()
    
    // Poll for status updates every 5 seconds if still processing
    const interval = setInterval(() => {
      if (status?.status === 'processing' || status?.status === 'pending') {
        fetchStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [submissionId, status?.status])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case 'processing':
        return <Badge variant="default" className="bg-blue-500">Processing</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'High', color: 'text-red-500' }
    if (score >= 60) return { level: 'Medium', color: 'text-yellow-500' }
    return { level: 'Low', color: 'text-green-500' }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading processing status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!status) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No processing status found for this submission.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(status.status)}
            <span>AI Processing Status</span>
            {getStatusBadge(status.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Submission ID:</span>
                <p className="text-muted-foreground">{status.submission_id}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-muted-foreground capitalize">{status.status}</p>
              </div>
              {status.processing_started_at && (
                <div>
                  <span className="font-medium">Started:</span>
                  <p className="text-muted-foreground">
                    {new Date(status.processing_started_at).toLocaleString()}
                  </p>
                </div>
              )}
              {status.processing_completed_at && (
                <div>
                  <span className="font-medium">Completed:</span>
                  <p className="text-muted-foreground">
                    {new Date(status.processing_completed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {status.status === 'processing' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing documents with AI...</span>
                </div>
                <Progress value={66} className="w-full" />
              </div>
            )}

            {status.status === 'failed' && status.error_message && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Processing failed: {status.error_message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Processing Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Assessment</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{results.risk_score}/100</span>
                  <Badge 
                    variant={results.risk_score >= 60 ? "destructive" : "default"}
                    className={results.risk_score >= 60 ? "bg-red-500" : "bg-green-500"}
                  >
                    {getRiskLevel(results.risk_score).level} Risk
                  </Badge>
                </div>
              </div>
              <Progress value={results.risk_score} className="w-full" />
            </div>

            {/* Decision Summary */}
            <div className="space-y-2">
              <span className="font-medium">Decision Summary</span>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{results.decision_summary}</p>
              </div>
            </div>

            {/* Document Analysis */}
            {results.extracted_data?.documents && (
              <div className="space-y-2">
                <span className="font-medium">Document Analysis</span>
                <div className="space-y-2">
                  {results.extracted_data.documents.map((doc: any, index: number) => (
                    <div key={index} className="p-2 border rounded-md">
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

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


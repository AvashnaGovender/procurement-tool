"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function AirtableImportPage() {
  const [config, setConfig] = useState({
    airtableApiKey: '',
    baseId: '',
    tableName: 'Supplier Onboarding'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleImport = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/airtable/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()
      setResult(data)

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import from Airtable</h1>
          <p className="text-gray-600 mt-2">Import supplier onboarding data from Airtable to Supabase</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Airtable Configuration</CardTitle>
            <CardDescription>
              Enter your Airtable credentials to import form submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Airtable API Key / Personal Access Token</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.airtableApiKey}
                onChange={(e) => setConfig({ ...config, airtableApiKey: e.target.value })}
                placeholder="patXXXXXXXXXXXXXX or keyXXXXXXXXXXXXXX"
              />
              <p className="text-xs text-gray-500">
                Get your token from: <a href="https://airtable.com/create/tokens" target="_blank" className="text-blue-600 hover:underline">https://airtable.com/create/tokens</a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseId">Base ID</Label>
              <Input
                id="baseId"
                value={config.baseId}
                onChange={(e) => setConfig({ ...config, baseId: e.target.value })}
                placeholder="appXXXXXXXXXXXXXX"
              />
              <p className="text-xs text-gray-500">
                Find in your Airtable base URL: airtable.com/<strong>appXXXXXXXX</strong>/...
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={config.tableName}
                onChange={(e) => setConfig({ ...config, tableName: e.target.value })}
                placeholder="Supplier Onboarding"
              />
            </div>

            <Button 
              onClick={handleImport} 
              disabled={loading || !config.airtableApiKey || !config.baseId || !config.tableName}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing from Airtable...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync from Airtable Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Import Successful
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Import Failed
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      <div className="font-medium mb-2">{result.message}</div>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div className="bg-green-50 p-2 rounded">
                          <div className="font-semibold text-green-700">Imported</div>
                          <div className="text-2xl text-green-600">{result.imported}</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="font-semibold text-blue-700">Updated</div>
                          <div className="text-2xl text-blue-600">{result.updated}</div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="font-semibold text-yellow-700">Skipped</div>
                          <div className="text-2xl text-yellow-600">{result.skipped}</div>
                        </div>
                        <div className="bg-red-50 p-2 rounded">
                          <div className="font-semibold text-red-700">Errors</div>
                          <div className="text-2xl text-red-600">{result.errors}</div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {result.details && result.details.imported.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">✅ Newly Imported ({result.details.imported.length}):</h4>
                      <ul className="text-sm space-y-1">
                        {result.details.imported.map((item: any, index: number) => (
                          <li key={index} className="text-green-700">
                            {item.email} → {item.supplierId}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.details && result.details.updated.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">🔄 Updated ({result.details.updated.length}):</h4>
                      <ul className="text-sm space-y-1">
                        {result.details.updated.map((item: any, index: number) => (
                          <li key={index} className="text-blue-700">
                            {item.email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.details && result.details.skipped.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">⚠️ Skipped ({result.details.skipped.length}):</h4>
                      <ul className="text-sm space-y-1">
                        {result.details.skipped.map((item: any, index: number) => (
                          <li key={index} className="text-yellow-700">
                            {item.airtableId}: {item.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.details && result.details.errors.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h4 className="font-medium text-red-900 mb-2">❌ Errors ({result.details.errors.length}):</h4>
                      <ul className="text-sm space-y-1">
                        {result.details.errors.map((item: any, index: number) => (
                          <li key={index} className="text-red-600">
                            {item.airtableId}: {item.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="font-medium">Import Failed</div>
                    <div className="mt-1">{result.error || 'Unknown error occurred'}</div>
                    {result.details && <div className="mt-2 text-sm">{result.details}</div>}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">📖 How to Use</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-3">
            <div>
              <h4 className="font-semibold mb-1">What This Does:</h4>
              <p>This page fetches all supplier form submissions from your Airtable base and saves them to your Supabase database with all 39 fields preserved.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">How to Sync:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Your Airtable credentials are pre-filled</li>
                <li>Click <strong>"Sync from Airtable Now"</strong> to import data</li>
                <li>The system will:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>Create new suppliers that don't exist</li>
                    <li>Update existing suppliers with latest data</li>
                    <li>Skip records missing required fields</li>
                  </ul>
                </li>
                <li>Review the results summary</li>
              </ol>
            </div>

            <div className="bg-white p-3 rounded border border-blue-300">
              <h4 className="font-semibold mb-1">💡 Tip:</h4>
              <p>Run this sync whenever you receive new form submissions. It's safe to run multiple times - existing records will be updated, not duplicated.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw
} from "lucide-react"

interface ReminderConfig {
  id: string
  reminderType: string
  firstReminderAfterHours: number
  secondReminderAfterHours: number
  finalReminderAfterHours: number
  isEnabled: boolean
  emailSubjectTemplate?: string
  emailBodyTemplate?: string
  createdAt: string
  updatedAt: string
}

export function ReminderConfiguration() {
  const [configs, setConfigs] = useState<ReminderConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editedConfigs, setEditedConfigs] = useState<Record<string, Partial<ReminderConfig>>>({})

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/reminders/config')
      const data = await response.json()
      
      if (data.success) {
        setConfigs(data.configurations)
      } else {
        setError(data.error || 'Failed to load configurations')
      }
    } catch (error) {
      console.error('Error fetching configurations:', error)
      setError('Failed to load configurations')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (id: string, field: string, value: any) => {
    setEditedConfigs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const handleSave = async (configId: string) => {
    const config = configs.find(c => c.id === configId)
    if (!config) return

    const updates = editedConfigs[configId] || {}
    if (Object.keys(updates).length === 0) {
      setError('No changes to save')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/reminders/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: configId,
          ...updates
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Configuration updated successfully!')
        fetchConfigs()
        setEditedConfigs(prev => {
          const newEdited = { ...prev }
          delete newEdited[configId]
          return newEdited
        })
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update configuration')
      }
    } catch (error) {
      setError('Failed to update configuration')
      console.error('Error updating configuration:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleTriggerNow = async () => {
    if (!confirm('This will check all pending items and send reminders if needed. Continue?')) {
      return
    }

    setTriggering(true)
    setError(null)

    try {
      const response = await fetch('/api/reminders/check', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        const total = Object.values(data.results).reduce((sum: number, val: any) => 
          typeof val === 'number' ? sum + val : sum, 0
        )
        setSuccess(`Reminder check completed! ${total} reminder(s) sent.`)
        setTimeout(() => setSuccess(null), 5000)
      } else {
        setError(data.error || 'Failed to trigger reminder check')
      }
    } catch (error) {
      setError('Failed to trigger reminder check')
      console.error('Error triggering reminders:', error)
    } finally {
      setTriggering(false)
    }
  }

  const getReminderTypeLabel = (type: string) => {
    const labels: Record<string, { title: string, description: string }> = {
      'SUPPLIER_DOCUMENT_SUBMISSION': {
        title: 'Supplier Document Submission',
        description: 'Remind suppliers who haven\'t uploaded their onboarding documents (24 hours)'
      },
      'MANAGER_APPROVAL_PENDING': {
        title: 'Manager Approval Pending',
        description: 'Remind managers about pending supplier initiation approvals (24 hours)'
      },
      'PM_REVIEW_PENDING': {
        title: 'PM Review Pending',
        description: 'Remind procurement managers to review submitted supplier documents (24 hours)'
      },
      'SUPPLIER_REVISION_PENDING': {
        title: 'Supplier Revision Pending',
        description: 'Remind suppliers to resubmit documents after revision request (24 hours)'
      }
    }
    return labels[type] || { title: type, description: '' }
  }

  const getConfigValue = (config: ReminderConfig, field: keyof ReminderConfig) => {
    return editedConfigs[config.id]?.[field] ?? config[field]
  }

  const hasChanges = (configId: string) => {
    return editedConfigs[configId] && Object.keys(editedConfigs[configId]).length > 0
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-300">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reminder System</h3>
          <p className="text-sm text-muted-foreground">
            Configure automated reminders for pending actions
          </p>
        </div>

        <Button onClick={handleTriggerNow} disabled={triggering} variant="outline">
          {triggering ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Trigger Reminder Check Now
            </>
          )}
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-300">
        <Bell className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>How Reminders Work:</strong> The system automatically checks for pending items daily and sends reminders <strong>24 hours</strong> after the triggering event.
          You can enable/disable each reminder type or trigger a manual check using the button above.
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : configs.length === 0 ? (
        <Alert className="bg-yellow-50 border-yellow-300">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>No reminder configurations found.</strong> Please run the initialization script to set up default configurations:
            <code className="block bg-gray-100 px-2 py-1 rounded mt-2">npx tsx scripts/init-reminder-configs.ts</code>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => {
            const labels = getReminderTypeLabel(config.reminderType)
            const isEnabled = getConfigValue(config, 'isEnabled')
            
            return (
              <Card key={config.id} className={!isEnabled ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {labels.title}
                        {!isEnabled && <Badge variant="secondary">Disabled</Badge>}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {labels.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`enabled-${config.id}`} className="text-sm">
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id={`enabled-${config.id}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleConfigChange(config.id, 'isEnabled', checked)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-blue-50 border-blue-200">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Reminder will be sent <strong>24 hours</strong> after the triggering event if action hasn't been taken.
                    </AlertDescription>
                  </Alert>

                  {hasChanges(config.id) && (
                    <div className="flex justify-end mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleSave(config.id)}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Note:</strong> For production deployment, set up a cron job to call{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded">/api/reminders/trigger</code> daily.
          Add <code className="bg-gray-100 px-1 py-0.5 rounded">CRON_SECRET</code> to your environment variables for security.
        </AlertDescription>
      </Alert>
    </div>
  )
}


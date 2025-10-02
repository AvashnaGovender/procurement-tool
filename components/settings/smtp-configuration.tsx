"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, TestTube } from "lucide-react"

interface SMTPConfig {
  host: string
  port: number
  user: string
  pass: string
  fromEmail: string
  secure: boolean
  companyName: string
  companyWebsite: string
}

export function SMTPConfiguration() {
  const [config, setConfig] = useState<SMTPConfig>({
    host: "smtp.gmail.com",
    port: 587,
    user: "",
    pass: "",
    fromEmail: "",
    secure: false,
    companyName: "",
    companyWebsite: ""
  })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/settings/smtp')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.config) {
          setConfig(data.config)
        }
      }
    } catch (error) {
      console.error('Failed to load SMTP config:', error)
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "SMTP configuration saved successfully",
        })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SMTP configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/test-email')
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Connection Test Successful",
          description: "SMTP configuration is working correctly",
        })
      } else {
        throw new Error(data.error || 'Connection test failed')
      }
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Failed to test SMTP connection",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP Configuration</CardTitle>
        <CardDescription>
          Configure your email service settings for sending supplier onboarding emails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="host">SMTP Host</Label>
          <Input
            id="host"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="mail.yourcompany.com or smtp.gmail.com"
          />
          <p className="text-xs text-gray-500">
            Common: Gmail (smtp.gmail.com), Outlook (smtp.office365.com), cPanel (mail.yourdomain.com)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Select value={config.port.toString()} onValueChange={(value) => setConfig({ ...config, port: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="587">587 (TLS/STARTTLS)</SelectItem>
                <SelectItem value="465">465 (SSL)</SelectItem>
                <SelectItem value="25">25 (Unencrypted)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex items-end">
            <div className="flex items-center space-x-2">
              <Switch
                id="secure"
                checked={config.secure}
                onCheckedChange={(checked) => setConfig({ ...config, secure: checked })}
              />
              <Label htmlFor="secure">Use SSL (Port 465) / TLS (Port 587)</Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user">Username/Email</Label>
            <Input
              id="user"
              type="email"
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              placeholder="your-email@gmail.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pass">Password/App Password</Label>
            <Input
              id="pass"
              type="password"
              value={config.pass}
              onChange={(e) => setConfig({ ...config, pass: e.target.value })}
              placeholder="Enter your password or app password"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromEmail">From Email</Label>
          <Input
            id="fromEmail"
            type="email"
            value={config.fromEmail}
            onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
            placeholder="procurement@yourcompany.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={config.companyName}
              onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
              placeholder="Your Company Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company Website</Label>
            <Input
              id="companyWebsite"
              value={config.companyWebsite}
              onChange={(e) => setConfig({ ...config, companyWebsite: e.target.value })}
              placeholder="https://yourcompany.com"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <Button onClick={saveConfig} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
          
          <Button variant="outline" onClick={testConnection} disabled={testing}>
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <TestTube className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Gmail Setup Instructions</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Enable 2-Factor Authentication on your Google Account</li>
            <li>2. Go to Google Account Settings → Security → 2-Step Verification → App passwords</li>
            <li>3. Generate a new app password for "Mail"</li>
            <li>4. Use the app password instead of your regular password</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

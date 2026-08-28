"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Loader2, UserCog } from "lucide-react"

type ManagerInfo = {
  id: string
  name: string
  email: string
  isActive: boolean
}

export function ManagerSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [currentManager, setCurrentManager] = useState<ManagerInfo | null>(null)
  const [managerEmail, setManagerEmail] = useState("")
  const [managerCheck, setManagerCheck] = useState<
    { exists: true; name: string } | { exists: false; message: string } | null
  >(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/users/me")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const manager = data.user?.manager ?? null
        setCurrentManager(manager)
        if (manager?.email) {
          setManagerEmail(manager.email)
          setManagerCheck({ exists: true, name: manager.name })
        }
      } catch {
        // Keep empty state; user can still try to save
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (loading) return
    if (typeof window !== "undefined" && window.location.hash === "#manager") {
      document.getElementById("manager")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [loading])

  const checkManager = async () => {
    const email = managerEmail.trim()
    if (!email) {
      setManagerCheck(null)
      return
    }
    setChecking(true)
    setManagerCheck(null)
    try {
      const res = await fetch(`/api/register?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.exists) {
        setManagerCheck({ exists: true, name: data.name || "Registered" })
      } else {
        setManagerCheck({
          exists: false,
          message: data.message || "This manager is not registered. Please ask them to register first.",
        })
      }
    } catch {
      setManagerCheck({ exists: false, message: "Could not verify manager." })
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!managerEmail.trim()) {
      toast({
        title: "Manager email required",
        description: "Enter the email of an already registered manager.",
        variant: "destructive",
      })
      return
    }
    if (managerCheck?.exists === false) {
      toast({
        title: "Manager not found",
        description: managerCheck.message,
        variant: "destructive",
      })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerEmail: managerEmail.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({
          title: "Could not update manager",
          description: typeof data.error === "string" ? data.error : "Something went wrong",
          variant: "destructive",
        })
        return
      }
      setCurrentManager(data.user?.manager ?? null)
      setManagerCheck(
        data.user?.manager
          ? { exists: true, name: data.user.manager.name }
          : null
      )
      toast({
        title: "Manager updated",
        description: "Your manager has been saved. You can now initiate supplier requests.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update manager",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const hasActiveManager = !!(currentManager && currentManager.isActive)

  return (
    <Card id="manager" className="scroll-mt-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          <CardTitle>My manager</CardTitle>
        </div>
        <CardDescription>
          Your manager must approve supplier initiations. If you registered without one, add them here before you submit a request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            {!hasActiveManager && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No manager is assigned. You will not be able to initiate a supplier request until you add one.
                </AlertDescription>
              </Alert>
            )}
            {hasActiveManager && (
              <p className="text-sm text-green-700 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Current manager: {currentManager.name} ({currentManager.email})
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="settings-manager-email">Manager email</Label>
              <Input
                id="settings-manager-email"
                type="email"
                placeholder="manager@company.com"
                value={managerEmail}
                onChange={(e) => {
                  setManagerEmail(e.target.value)
                  setManagerCheck(null)
                }}
                onBlur={checkManager}
                disabled={saving}
                required
              />
              {checking && (
                <p className="text-sm text-muted-foreground">Checking if manager is registered...</p>
              )}
              {managerCheck?.exists === true && (
                <p className="text-sm text-green-600 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Manager found: {managerCheck.name}
                </p>
              )}
              {managerCheck?.exists === false && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {managerCheck.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                saving ||
                checking ||
                managerCheck?.exists === false ||
                (managerEmail.trim().length > 0 && managerCheck === null)
              }
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : hasActiveManager ? (
                "Update manager"
              ) : (
                "Save manager"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

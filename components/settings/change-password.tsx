"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react"

export function ChangePassword() {
  const { toast } = useToast()
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/users/me/password")
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setHasPassword(!!data.hasPassword)
      } catch {
        if (!cancelled) setHasPassword(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword:
            hasPassword ? currentPassword : undefined,
          newPassword,
          confirmPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({
          title: "Could not update password",
          description: typeof data.error === "string" ? data.error : "Something went wrong",
          variant: "destructive",
        })
        return
      }
      toast({
        title: "Password updated",
        description: "Your password has been saved. Use it the next time you sign in.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setHasPassword(true)
    } catch {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle>Password</CardTitle>
        </div>
        <CardDescription>
          {hasPassword === false
            ? "Set a password for your account (at least 8 characters)."
            : "Change the password you use to sign in with email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasPassword === null ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswords((value) => !value)}
                className="h-8 px-2 text-xs"
              >
                {showPasswords ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                    Hide passwords
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Show passwords
                  </>
                )}
              </Button>
            </div>
            {hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={submitting}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

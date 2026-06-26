"use client"

import type React from "react"

import { Suspense, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, AlertCircle, UserPlus, X, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signIn } from "next-auth/react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showRegister, setShowRegister] = useState(false)
  const [registerEmail, setRegisterEmail] = useState("")
  const [managerEmail, setManagerEmail] = useState("")
  const [registerRole, setRegisterRole] = useState<string>("USER")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("")
  const [managerCheck, setManagerCheck] = useState<{ exists: true; name: string } | { exists: false; message: string } | null>(null)
  const [checkingManager, setCheckingManager] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetOtp, setResetOtp] = useState("")
  const [resetNewPassword, setResetNewPassword] = useState("")
  const [resetConfirmPassword, setResetConfirmPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [requestingOtp, setRequestingOtp] = useState(false)
  const [resetMessage, setResetMessage] = useState("")
  const [resetError, setResetError] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] = useState(false)
  const [showResetNewPassword, setShowResetNewPassword] = useState(false)
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        // Check for callback URL from query params
        const callbackUrl = searchParams.get("callbackUrl")
        
        // Validate callback URL - prevent redirecting to pages the user doesn't have access to
        if (callbackUrl) {
          // Restricted pages that require specific roles
          const restrictedPaths = [
            { path: '/admin/supplier-submissions', allowedRoles: ['PROCUREMENT_MANAGER', 'ADMIN'] },
            { path: '/admin/approvals', allowedRoles: ['MANAGER', 'PROCUREMENT_MANAGER', 'ADMIN'] }
          ]
          
          // Check if callback URL is a restricted path
          const restricted = restrictedPaths.find(r => callbackUrl.startsWith(r.path))
          
          // If it's restricted and user doesn't have proper role, redirect to dashboard instead
          // We don't have the session here yet, so we'll just redirect to dashboard for restricted paths
          // The page itself will handle the authorization check
          if (restricted) {
            router.push("/dashboard")
          } else {
            router.push(callbackUrl)
          }
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const checkManager = async () => {
    const email = managerEmail.trim()
    if (!email) {
      setManagerCheck(null)
      return
    }
    setCheckingManager(true)
    setManagerCheck(null)
    try {
      const res = await fetch(`/api/register?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.exists) {
        setManagerCheck({ exists: true, name: data.name || "Registered" })
      } else {
        setManagerCheck({ exists: false, message: data.message || "This manager is not registered. Please ask them to register first." })
      }
    } catch {
      setManagerCheck({ exists: false, message: "Could not verify manager." })
    } finally {
      setCheckingManager(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (managerCheck?.exists === false) {
      setRegisterError(managerCheck.message)
      return
    }
    if (!registerPassword || registerPassword.length < 8) {
      setRegisterError("Password must be at least 8 characters.")
      return
    }
    if (registerPassword !== registerPasswordConfirm) {
      setRegisterError("Passwords do not match.")
      return
    }
    setRegisterLoading(true)
    setRegisterError("")
    setRegisterSuccess("")
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail.trim(),
          managerEmail: managerEmail.trim(),
          role: registerRole,
          password: registerPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegisterError(data.error || "Registration failed")
        setRegisterLoading(false)
        return
      }
      setRegisterSuccess(data.message || "Registration successful. You can now sign in.")
      setRegisterEmail("")
      setManagerEmail("")
      setRegisterRole("USER")
      setRegisterPassword("")
      setRegisterPasswordConfirm("")
      setManagerCheck(null)
      setTimeout(() => {
        setShowRegister(false)
        setRegisterSuccess("")
      }, 2000)
    } catch {
      setRegisterError("An unexpected error occurred. Please try again.")
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleRequestResetOtp = async () => {
    if (!resetEmail.trim()) {
      setResetError("Please enter your email.")
      return
    }
    setRequestingOtp(true)
    setResetError("")
    setResetMessage("")
    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResetError(data.error || "Failed to send reset code.")
        return
      }
      setResetMessage(data.message || "If this email exists, a reset code has been sent.")
    } catch {
      setResetError("Failed to send reset code.")
    } finally {
      setRequestingOtp(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError("")
    setResetMessage("")
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail.trim(),
          otp: resetOtp.trim(),
          newPassword: resetNewPassword,
          confirmPassword: resetConfirmPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResetError(data.error || "Failed to reset password.")
        return
      }
      setResetMessage("Password reset successful. You can sign in with your new password.")
      setPassword("")
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetOtp("")
        setResetNewPassword("")
        setResetConfirmPassword("")
      }, 1200)
    } catch {
      setResetError("Failed to reset password.")
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-slate-300 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="mb-12">
            <Image
              src="/logo.png"
              alt="Schauenburg Systems"
              width={300}
              height={90}
              priority
              className="object-contain brightness-0 invert"
            />
          </div>
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Procurement Management System
            </h1>
          </div>
        </div>
        
        <div className="relative z-10 text-blue-100 text-sm">
          © {new Date().getFullYear()} Schauenburg Systems. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/logo.png"
              alt="Schauenburg Systems"
              width={300}
              height={90}
              priority
              className="object-contain mx-auto mb-4"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome</h2>
            <p className="text-slate-600">Sign in to your account to continue</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-700 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true)
                    setResetEmail(email)
                    setResetError("")
                    setResetMessage("")
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-blue-600/30" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            {process.env.NEXT_PUBLIC_AZURE_AD_ENABLED === "true" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-100 px-2 text-slate-500">or</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-slate-300 text-slate-700 font-medium text-base hover:bg-slate-50 transition-all"
                  onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                  Sign in with Microsoft
                </Button>
              </>
            )}

            <p className="text-center text-slate-600 text-sm">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Register
              </button>
            </p>
          </form>

          {/* Register modal */}
          {showRegister && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Register as new user
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegister(false)
                      setRegisterError("")
                      setRegisterSuccess("")
                      setRegisterPassword("")
                      setRegisterPasswordConfirm("")
                      setManagerCheck(null)
                    }}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleRegister} className="p-4 space-y-4">
                  {registerError && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  {registerSuccess && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <AlertDescription>{registerSuccess}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-slate-700 font-medium">Your email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@company.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="h-11 border-slate-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-slate-700 font-medium">Password *</Label>
                    <div className="relative">
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Choose a password (min. 8 characters)"
                      autoComplete="new-password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="h-11 border-slate-300 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-700 transition-colors"
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password-confirm" className="text-slate-700 font-medium">Confirm password *</Label>
                    <div className="relative">
                    <Input
                      id="register-password-confirm"
                      type={showRegisterPasswordConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      value={registerPasswordConfirm}
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                      className="h-11 border-slate-300 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPasswordConfirm((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      aria-label={showRegisterPasswordConfirm ? "Hide password" : "Show password"}
                    >
                      {showRegisterPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-role" className="text-slate-700 font-medium">Role *</Label>
                    <Select value={registerRole} onValueChange={setRegisterRole}>
                      <SelectTrigger id="register-role" className="h-11 border-slate-300">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager-email" className="text-slate-700 font-medium">Manager email *</Label>
                    <Input
                      id="manager-email"
                      type="email"
                      placeholder="manager@company.com"
                      value={managerEmail}
                      onChange={(e) => {
                        setManagerEmail(e.target.value)
                        setManagerCheck(null)
                      }}
                      onBlur={checkManager}
                      className="h-11 border-slate-300"
                      required
                    />
                    {checkingManager && (
                      <p className="text-sm text-slate-500">Checking if manager is registered...</p>
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
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowRegister(false)}
                      disabled={registerLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={registerLoading || managerCheck?.exists === false || (managerEmail.trim() && managerCheck === null && !checkingManager)}
                    >
                      {registerLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Registering...
                        </div>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Forgot password modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800">Reset your password</h3>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleResetPassword} className="p-4 space-y-4">
                  {resetError && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{resetError}</AlertDescription>
                    </Alert>
                  )}
                  {resetMessage && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{resetMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-slate-700 font-medium">Email *</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@company.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-11 border-slate-300"
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRequestResetOtp}
                    disabled={requestingOtp}
                    className="w-full"
                  >
                    {requestingOtp ? "Sending code..." : "Send OTP code"}
                  </Button>

                  <div className="space-y-2">
                    <Label htmlFor="reset-otp" className="text-slate-700 font-medium">OTP code *</Label>
                    <Input
                      id="reset-otp"
                      type="text"
                      placeholder="6-digit code"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      className="h-11 border-slate-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-new-password" className="text-slate-700 font-medium">New password *</Label>
                    <div className="relative">
                    <Input
                      id="reset-new-password"
                      type={showResetNewPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="h-11 border-slate-300 pr-10"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      aria-label={showResetNewPassword ? "Hide password" : "Show password"}
                    >
                      {showResetNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-confirm-password" className="text-slate-700 font-medium">Confirm new password *</Label>
                    <div className="relative">
                    <Input
                      id="reset-confirm-password"
                      type={showResetConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="h-11 border-slate-300 pr-10"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      aria-label={showResetConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showResetConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowForgotPassword(false)}
                      disabled={resetLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={resetLoading}
                    >
                      {resetLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

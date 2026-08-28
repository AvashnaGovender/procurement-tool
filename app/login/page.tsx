"use client"

import type React from "react"

import { Suspense, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signIn } from "next-auth/react"

function MicrosoftMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

function LoginForm() {
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
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterPasswordConfirm, setShowRegisterPasswordConfirm] = useState(false)
  const [microsoftLoading, setMicrosoftLoading] = useState(false)
  const searchParams = useSearchParams()

  const afterSignInPath = () => {
    const callbackUrl = searchParams.get("callbackUrl")
    if (!callbackUrl) return "/dashboard"
    const restrictedPaths = ["/admin/supplier-submissions", "/admin/approvals"]
    if (restrictedPaths.some((path) => callbackUrl.startsWith(path))) {
      return "/dashboard"
    }
    return callbackUrl
  }

  const handleMicrosoftSignIn = () => {
    setMicrosoftLoading(true)
    setError("")
    signIn("azure-ad", { callbackUrl: afterSignInPath() })
  }

  const oauthError = searchParams.get("error")
  const displayError =
    error ||
    (oauthError
      ? "Microsoft sign-in was cancelled or failed. Please try again, or register first if you do not have access yet."
      : "")

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

  const managerRequired = registerRole !== "MANAGER"

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (managerRequired && !managerEmail.trim()) {
      setRegisterError("Manager email is required for User registration.")
      return
    }
    if (managerEmail.trim() && managerCheck?.exists === false) {
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
          managerEmail: managerEmail.trim() || undefined,
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d5bd7] text-white">
      <Image
        src="/login_bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="relative z-10 mx-auto flex min-h-screen flex-col lg:flex-row">
        <section className="relative hidden min-h-screen lg:flex lg:w-[46%] lg:flex-col">
          <div className="relative z-10 flex h-full flex-col px-12 pb-10 pt-12 xl:px-16">
            <div>
              <Image
                src="/logo.png"
                alt="Schauenburg Systems"
                width={280}
                height={88}
                priority
                className="h-auto w-[240px] object-contain brightness-0 invert xl:w-[280px]"
              />
              <h1 className="mt-14 max-w-md text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
                Procurement Management System
              </h1>
              <div className="mt-6 h-px w-24 bg-white/70" />
              <p className="mt-5 max-w-sm text-base leading-relaxed text-white/85 xl:text-lg">
                Smarter procurement. Stronger control.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center justify-center px-5 py-6 sm:px-10 lg:px-12">
          <div className="mb-8 lg:hidden">
            <Image
              src="/logo.png"
              alt="Schauenburg Systems"
              width={220}
              height={70}
              priority
              className="h-auto w-[200px] object-contain brightness-0 invert"
            />
          </div>
          <div className="w-full max-w-[520px] rounded-[28px] bg-white px-7 py-9 text-slate-900 shadow-[0_24px_80px_rgba(8,40,120,0.28)] sm:px-12 sm:py-12 dark:bg-white dark:text-slate-900">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a73e8] shadow-lg shadow-blue-600/30">
                <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2.2} />
              </div>
              <h2 className="text-[1.65rem] font-bold leading-tight text-[#12325c] sm:text-[1.85rem]">
                Welcome to Schauenburg Systems
              </h2>
              <div className="mt-3 h-[3px] w-12 rounded-full bg-[#1a73e8]" />
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-500">
                Access the Procurement Management System. Use your company Microsoft account to continue.
              </p>
            </div>

            {displayError && (
              <Alert variant="destructive" className="mt-6 bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <button
              type="button"
              onClick={handleMicrosoftSignIn}
              disabled={microsoftLoading}
              className="mt-8 flex h-14 w-full items-center justify-between rounded-xl bg-[#1a73e8] px-5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#155cc2] disabled:opacity-70"
            >
              <span className="flex items-center gap-3">
                <MicrosoftMark />
                {microsoftLoading ? "Redirecting..." : "Sign in with Microsoft"}
              </span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-7 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: ShieldCheck, label: "Secure Enterprise SSO" },
                { icon: Lock, label: "Your data is protected" },
                { icon: Clock, label: "Fast, simple & seamless" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f1fd] text-[#1a73e8]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-medium leading-tight text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 font-medium text-slate-400">New user?</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRegister(true)}
              className="h-12 w-full rounded-xl border-[#1a73e8] bg-white text-base font-semibold text-[#1a73e8] hover:bg-[#e8f1fd] hover:text-[#155cc2]"
            >
              <UserPlus className="h-5 w-5" />
              Register for Access
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-medium text-[#12325c] shadow-md">
            <a
              href="mailto:admin@schauenburg.co.za"
              className="inline-flex items-center gap-2 text-[#12325c] hover:text-[#1a73e8]"
            >
              <Headphones className="h-4 w-4 text-[#1a73e8]" />
              Need help? <span className="font-semibold text-[#1a73e8] underline underline-offset-4">Contact support</span>
            </a>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <a
              href="https://schauenburg.co.za"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#1a73e8] underline underline-offset-4 hover:text-[#155cc2]"
            >
              Privacy Policy
            </a>
          </div>
        </section>
      </div>

      {/* Register modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-[420px] max-h-[min(92vh,720px)] overflow-y-auto rounded-3xl bg-white px-7 pb-6 pt-8 text-slate-900 shadow-[0_24px_80px_rgba(8,40,120,0.28)]">
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
              className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#1a73e8] text-[#1a73e8]">
                <UserPlus className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#12325c]">Register your account</h3>
              <p className="mt-1.5 max-w-[280px] text-sm text-slate-500">
                Register an account to access the Procurement Management System.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              {registerError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}
              {registerSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{registerSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="register-email" className="text-sm font-semibold text-[#12325c]">Work email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a73e8]" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@company.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-password" className="text-sm font-semibold text-[#12325c]">Create password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a73e8]" />
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                  >
                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-password-confirm" className="text-sm font-semibold text-[#12325c]">Confirm password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a73e8]" />
                  <Input
                    id="register-password-confirm"
                    type={showRegisterPasswordConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    value={registerPasswordConfirm}
                    onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPasswordConfirm((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showRegisterPasswordConfirm ? "Hide password" : "Show password"}
                  >
                    {showRegisterPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-role" className="text-sm font-semibold text-[#12325c]">Role</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#1a73e8]" />
                  <Select value={registerRole} onValueChange={setRegisterRole}>
                    <SelectTrigger id="register-role" className="h-11 rounded-xl border-slate-200 pl-10">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manager-email" className="text-sm font-semibold text-[#12325c]">
                  {managerRequired ? "Manager email" : "Manager email (optional)"}
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a73e8]" />
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
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    required={managerRequired}
                  />
                </div>
                {!managerRequired && (
                  <p className="text-xs leading-relaxed text-slate-500">
                    You can skip this for now. It may be needed later when submitting supplier requests for approval.
                  </p>
                )}
                {checkingManager && (
                  <p className="text-sm text-slate-500">Checking if manager is registered...</p>
                )}
                {managerCheck?.exists === true && (
                  <p className="flex items-center gap-1.5 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Manager found: {managerCheck.name}
                  </p>
                )}
                {managerCheck?.exists === false && (
                  <p className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {managerCheck.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-xl border-slate-200 text-[#1a73e8] hover:bg-slate-50 hover:text-[#155cc2]"
                  onClick={() => setShowRegister(false)}
                  disabled={registerLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 flex-1 rounded-xl bg-[#1a73e8] font-semibold text-white hover:bg-[#155cc2]"
                  disabled={
                    registerLoading ||
                    (managerRequired && !managerEmail.trim()) ||
                    (!!managerEmail.trim() && (managerCheck?.exists === false || (managerCheck === null && !checkingManager)))
                  }
                >
                  {registerLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      Registering...
                    </span>
                  ) : (
                    "Register your account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0d5bd7]">
          <div className="h-8 w-8 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

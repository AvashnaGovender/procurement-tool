"use client"

import type React from "react"

import { Suspense, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, AlertCircle, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "next-auth/react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
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
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
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
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
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
          </form>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md border border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Reset Password</h3>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600 text-sm leading-relaxed">
                To reset your password, please contact your system administrator. They will be able to help you regain access to your account.
              </p>
              <div className="bg-slate-100 rounded-md p-4 border border-slate-200">
                <p className="text-slate-700 text-sm font-medium mb-2">Contact Information:</p>
                <p className="text-blue-600 text-sm">admin@schauenburg.co.za</p>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowForgotPassword(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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

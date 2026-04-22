'use client'

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

type Status = 'validating' | 'sending' | 'ready' | 'verifying' | 'error' | 'invalid_link'

function VerifyPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token') ?? ''
  const type = (searchParams.get('type') ?? 'onboarding') as 'onboarding' | 'credit'

  const [status, setStatus] = useState<Status>('validating')
  const [otp, setOtp] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Prevent the initial OTP send from firing more than once (e.g. React Strict Mode double-invoke)
  const otpSentRef = useRef(false)

  const destinationPath =
    type === 'credit' ? `/credit-application-form?token=${token}` : `/supplier-onboarding-form?token=${token}`

  const requestOtp = useCallback(async () => {
    setStatus('sending')
    setErrorMessage('')
    try {
      const res = await fetch('/api/supplier-portal/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, formType: type }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMessage(data.error ?? 'Failed to send verification code.')
        setStatus('error')
        return
      }
      setMaskedEmail(data.maskedEmail ?? '')
      setStatus('ready')
      // Start 60-second resend cooldown
      setResendCooldown(60)
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }, [token, type])

  // On mount: validate the link then send OTP
  useEffect(() => {
    if (!token) {
      setStatus('invalid_link')
      return
    }

    // Guard: only run once per mount (React Strict Mode fires effects twice in dev)
    if (otpSentRef.current) return
    otpSentRef.current = true

    async function validate() {
      try {
        const res = await fetch(`/api/supplier-portal/validate?token=${token}&type=${type}`)
        const data = await res.json()
        if (!res.ok || !data.success) {
          setErrorMessage(data.error ?? 'This link is invalid or has expired.')
          setStatus('invalid_link')
          return
        }
        // Link is valid — send OTP
        await requestOtp()
      } catch {
        setErrorMessage('Unable to validate link. Please try again later.')
        setStatus('invalid_link')
      }
    }

    validate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown(c => Math.max(c - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && status === 'ready') {
      handleVerify(otp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  async function handleVerify(code: string) {
    setStatus('verifying')
    setErrorMessage('')
    try {
      const res = await fetch('/api/supplier-portal/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp: code, formType: type }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        router.push(destinationPath)
        return
      }

      setOtp('')
      setAttemptsRemaining(data.attemptsRemaining ?? null)

      if (data.code === 'MAX_ATTEMPTS') {
        setErrorMessage('Too many incorrect attempts. Please request a new code.')
        setStatus('error')
      } else if (data.code === 'EXPIRED') {
        setErrorMessage('Your code has expired. Please request a new one.')
        setStatus('error')
      } else {
        setErrorMessage(data.error ?? 'Incorrect code. Please try again.')
        setStatus('ready')
      }
    } catch {
      setOtp('')
      setErrorMessage('Verification failed. Please check your connection and try again.')
      setStatus('ready')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-white px-8 py-8 text-center border-b-4 border-blue-800">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Schauenburg Systems" width={140} height={48} priority />
          </div>
          <h1 className="text-xl font-bold text-blue-800">Supplier Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Secure Verification</p>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {/* Validating / Sending spinner */}
          {(status === 'validating' || status === 'sending') && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm text-center">
                {status === 'validating' ? 'Validating your link…' : 'Sending verification code…'}
              </p>
            </div>
          )}

          {/* OTP input */}
          {(status === 'ready' || status === 'verifying') && (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="text-gray-700 font-medium">Enter your verification code</p>
                {maskedEmail && (
                  <p className="text-sm text-gray-500 mt-1">
                    A 6-digit code was sent to <span className="font-mono font-medium">{maskedEmail}</span>
                  </p>
                )}
              </div>

              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={status === 'verifying'}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <InputOTPSlot key={i} index={i} className="w-11 h-12 text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {errorMessage && (
                <p className="text-red-600 text-sm text-center">{errorMessage}</p>
              )}
              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-amber-600 text-xs text-center">
                  {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before lockout
                </p>
              )}

              {status === 'verifying' && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
                  Verifying…
                </div>
              )}

              <div className="text-center text-sm text-gray-500">
                Didn&apos;t receive a code?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-gray-400">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={requestOtp}
                    className="text-blue-700 font-medium hover:underline focus:outline-none"
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error / invalid link state */}
          {(status === 'error' || status === 'invalid_link') && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-800 font-medium text-center">{errorMessage || 'Something went wrong.'}</p>
              {status === 'error' && (
                <button
                  onClick={requestOtp}
                  className="mt-2 px-5 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
                >
                  Request new code
                </button>
              )}
              {status === 'invalid_link' && (
                <p className="text-xs text-gray-500 text-center">
                  Please contact your procurement representative for a new link.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center text-xs text-gray-400">
          Schauenburg Systems &mdash; Supplier Onboarding Portal
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyPageContent />
    </Suspense>
  )
}

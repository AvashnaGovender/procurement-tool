import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'supplier_session'
const SESSION_EXPIRY_HOURS = 1

export function generateSessionToken(): string {
  return randomUUID()
}

export function getSessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000)
}

export interface CreateSessionParams {
  onboardingId: string
  formType: 'onboarding' | 'credit'
  email: string
}

export async function createSession(params: CreateSessionParams) {
  const sessionToken = generateSessionToken()
  const expiresAt = getSessionExpiresAt()

  const session = await prisma.supplierSession.create({
    data: {
      sessionToken,
      onboardingId: params.onboardingId,
      formType: params.formType,
      email: params.email,
      expiresAt,
    },
  })

  return { session, sessionToken }
}

export interface ValidatedSession {
  id: string
  sessionToken: string
  onboardingId: string
  formType: string
  email: string
  expiresAt: Date
}

/**
 * Validates the supplier session cookie and confirms it is scoped to the
 * expected onboarding record. Returns null if invalid or expired.
 */
export async function validateSession(
  sessionToken: string,
  onboardingId: string
): Promise<ValidatedSession | null> {
  const session = await prisma.supplierSession.findUnique({
    where: { sessionToken },
  })

  if (!session) return null
  if (session.onboardingId !== onboardingId) return null
  if (session.expiresAt < new Date()) return null

  return session
}

export async function revokeSession(sessionToken: string): Promise<void> {
  await prisma.supplierSession.deleteMany({ where: { sessionToken } })
}

export function getSessionCookieOptions(expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  }
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRY_HOURS }

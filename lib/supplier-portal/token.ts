import { prisma } from '@/lib/prisma'

export type FormType = 'onboarding' | 'credit'

export interface TokenValidationResult {
  valid: true
  onboarding: {
    id: string
    contactEmail: string
    contactName: string
    currentStep: string
    overallStatus: string
  }
}

export interface TokenValidationError {
  valid: false
  code: 'NOT_FOUND' | 'REVOKED' | 'EXPIRED' | 'WRONG_STATUS'
  message: string
}

// Onboarding statuses that allow supplier form access
const ONBOARDING_ALLOWED_STATUSES = [
  'EMAIL_SENT',
  'AWAITING_RESPONSE',
  'REVISION_NEEDED',
]

// Onboarding statuses that allow credit application access
const CREDIT_ALLOWED_STATUSES = [
  'UNDER_REVIEW',
  'AWAITING_FINAL_APPROVAL',
  'EMAIL_SENT',
  'AWAITING_RESPONSE',
]

export async function validateMagicLinkToken(
  token: string,
  formType: FormType
): Promise<TokenValidationResult | TokenValidationError> {
  const whereClause =
    formType === 'onboarding'
      ? { onboardingToken: token }
      : { creditApplicationToken: token }

  const onboarding = await prisma.supplierOnboarding.findUnique({
    where: whereClause,
    select: {
      id: true,
      contactEmail: true,
      contactName: true,
      currentStep: true,
      overallStatus: true,
      onboardingToken: true,
      onboardingTokenExpiresAt: true,
      onboardingTokenRevoked: true,
      creditApplicationToken: true,
      creditApplicationTokenExpiresAt: true,
      creditApplicationTokenRevoked: true,
    },
  })

  if (!onboarding) {
    return { valid: false, code: 'NOT_FOUND', message: 'This link is invalid or does not exist.' }
  }

  const isRevoked =
    formType === 'onboarding'
      ? onboarding.onboardingTokenRevoked
      : onboarding.creditApplicationTokenRevoked

  if (isRevoked) {
    return { valid: false, code: 'REVOKED', message: 'This link has been revoked. Please contact your procurement representative.' }
  }

  const expiresAt =
    formType === 'onboarding'
      ? onboarding.onboardingTokenExpiresAt
      : onboarding.creditApplicationTokenExpiresAt

  if (expiresAt && expiresAt < new Date()) {
    return { valid: false, code: 'EXPIRED', message: 'This link has expired. Please contact your procurement representative to receive a new link.' }
  }

  const allowedStatuses =
    formType === 'onboarding' ? ONBOARDING_ALLOWED_STATUSES : CREDIT_ALLOWED_STATUSES

  if (!allowedStatuses.includes(onboarding.overallStatus)) {
    return {
      valid: false,
      code: 'WRONG_STATUS',
      message: 'This link is no longer active. Your submission may have already been received.',
    }
  }

  return {
    valid: true,
    onboarding: {
      id: onboarding.id,
      contactEmail: onboarding.contactEmail,
      contactName: onboarding.contactName,
      currentStep: onboarding.currentStep,
      overallStatus: onboarding.overallStatus,
    },
  }
}

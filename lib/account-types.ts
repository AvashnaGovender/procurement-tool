/**
 * Standardized Account Types
 * Used in supplier onboarding forms
 */

export const ACCOUNT_TYPES = [
  "Cheque",
  "Savings",
  "Current",
  "Business Cheque",
  "Business Savings",
  "Business Current",
  "Transmission",
  "Call",
  "Other"
] as const

export type AccountType = typeof ACCOUNT_TYPES[number]

/**
 * Get formatted account type for display
 */
export function formatAccountType(accountType: string): string {
  return accountType
}

/**
 * Validate if an account type is valid
 */
export function isValidAccountType(accountType: string): boolean {
  return ACCOUNT_TYPES.includes(accountType as AccountType)
}





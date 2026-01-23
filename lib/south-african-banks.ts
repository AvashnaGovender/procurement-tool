/**
 * Standardized South African Banks
 * Used in supplier onboarding forms
 */

export const SOUTH_AFRICAN_BANKS = [
  "Absa Bank",
  "First National Bank (FNB)",
  "Standard Bank",
  "Nedbank",
  "Capitec Bank",
  "Investec Bank",
  "African Bank",
  "Bidvest Bank",
  "Discovery Bank",
  "Grindrod Bank",
  "Mercantile Bank",
  "Sasfin Bank",
  "TymeBank",
  "Bank of Athens",
  "HBZ Bank",
  "Postbank",
  "Other"
] as const

export type SouthAfricanBank = typeof SOUTH_AFRICAN_BANKS[number]

/**
 * Get formatted bank name for display
 */
export function formatBankName(bank: string): string {
  return bank
}

/**
 * Validate if a bank is valid
 */
export function isValidBank(bank: string): boolean {
  return SOUTH_AFRICAN_BANKS.includes(bank as SouthAfricanBank)
}





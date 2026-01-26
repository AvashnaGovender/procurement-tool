export type PurchaseType = 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP'

/**
 * Get the list of required documents based on purchase type and credit application status
 * @param purchaseType - The type of purchase (REGULAR, ONCE_OFF, SHARED_IP)
 * @param creditApplication - Whether credit application is required
 * @returns Array of document keys that are required
 */
export function getRequiredDocuments(
  purchaseType: PurchaseType,
  creditApplication: boolean
): string[] {
  // Base mandatory documents for all suppliers
  const baseDocs = [
    'cipcCertificate',      // CIPC Certificate (Company Registration)
    'bbbeeScorecard',       // BBBEE Scorecard Report or Affidavit
    'taxClearance',         // Tax Clearance Certificate
    'bankConfirmation',     // Bank Confirmation Letter
    'nda',                  // Non-Disclosure Agreement
    'creditApplication',    // Credit Application Form (now always mandatory)
  ]

  // Optional documents that may be included
  const optionalDocs = [
    'vatCertificate',       // VAT Registration Certificate (if applicable)
  ]

  // Return all documents (base + optional)
  return [...baseDocs, ...optionalDocs]
}

/**
 * Get the list of mandatory documents (excluding optional ones)
 * @param purchaseType - The type of purchase (REGULAR, ONCE_OFF, SHARED_IP)
 * @param creditApplication - Whether credit application is required
 * @returns Array of mandatory document keys
 */
export function getMandatoryDocuments(
  purchaseType: PurchaseType,
  creditApplication: boolean
): string[] {
  // All base documents are mandatory
  return [
    'cipcCertificate',      // CIPC Certificate (Company Registration)
    'bbbeeScorecard',       // BBBEE Scorecard Report or Affidavit
    'taxClearance',         // Tax Clearance Certificate
    'bankConfirmation',     // Bank Confirmation Letter
    'nda',                  // Non-Disclosure Agreement
    'creditApplication',    // Credit Application Form (always mandatory)
  ]
}

/**
 * Get the display name for a document key
 * @param key - The document key
 * @returns The human-readable display name
 */
export function getDocumentDisplayName(key: string): string {
  const displayNames: Record<string, string> = {
    'cipcCertificate': 'CIPC Certificate (Company Registration)',
    'bbbeeScorecard': 'BBBEE Scorecard Report or Affidavit',
    'taxClearance': 'Tax Clearance Certificate',
    'vatCertificate': 'VAT Registration Certificate',
    'bankConfirmation': 'Bank Confirmation Letter',
    'nda': 'Non-Disclosure Agreement (NDA) - Signed',
    'creditApplication': 'Credit Application Form',
  }
  
  return displayNames[key] || key
}

/**
 * Check if a document is mandatory
 * @param key - The document key
 * @param purchaseType - The type of purchase
 * @param creditApplication - Whether credit application is required
 * @returns Whether the document is mandatory
 */
export function isDocumentMandatory(
  key: string,
  purchaseType: PurchaseType,
  creditApplication: boolean
): boolean {
  const mandatoryDocs = getMandatoryDocuments(purchaseType, creditApplication)
  return mandatoryDocs.includes(key)
}

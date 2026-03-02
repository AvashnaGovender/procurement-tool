export type PurchaseType = 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP'
export type PaymentMethod = 'COD' | 'AC'

const NEW_PURCHASE_TYPES = ['COD', 'COD_IP_SHARED', 'CREDIT_TERMS', 'CREDIT_TERMS_IP_SHARED'] as const

/**
 * Maps purchase type (including new 4-category: COD, COD_IP_SHARED, CREDIT_TERMS, CREDIT_TERMS_IP_SHARED)
 * to legacy PurchaseType and PaymentMethod for document logic.
 */
export function toLegacyPurchaseInfo(
  purchaseType: string,
  paymentMethod?: PaymentMethod | string | null
): { purchaseType: PurchaseType; paymentMethod: PaymentMethod } {
  if (purchaseType === 'COD' || purchaseType === 'COD_IP_SHARED') {
    return {
      purchaseType: purchaseType === 'COD' ? 'REGULAR' : 'SHARED_IP',
      paymentMethod: 'COD'
    }
  }
  if (purchaseType === 'CREDIT_TERMS' || purchaseType === 'CREDIT_TERMS_IP_SHARED') {
    return {
      purchaseType: purchaseType === 'CREDIT_TERMS' ? 'REGULAR' : 'SHARED_IP',
      paymentMethod: 'AC'
    }
  }
  return {
    purchaseType: purchaseType as PurchaseType,
    paymentMethod: (paymentMethod === 'COD' ? 'COD' : 'AC') as PaymentMethod
  }
}

/**
 * Get display label for purchase type (supports legacy and new 4-category types).
 */
export function getPurchaseTypeDisplayName(purchaseType: string | null | undefined): string {
  if (!purchaseType) return ''
  const labels: Record<string, string> = {
    COD: 'COD',
    COD_IP_SHARED: 'COD IP Shared',
    CREDIT_TERMS: 'Credit Terms',
    CREDIT_TERMS_IP_SHARED: 'Credit Terms IP Shared',
    REGULAR: 'Regular Purchase',
    ONCE_OFF: 'Once-off Purchase',
    SHARED_IP: 'Shared IP'
  }
  return labels[purchaseType] ?? purchaseType.replace(/_/g, ' ')
}

/**
 * Get the list of required documents (shown to supplier; includes all that may apply).
 * Rules: (1) All 4 categories: Company Reg, BBBEE, Tax Clearance/Good Standing, Bank Confirmation; (2) If VAT registered, VAT Certificate; (3) COD IP Shared & Credit Terms IP Shared: NDA mandatory; (4) Credit Application included for all but only mandatory when credit application box was selected.
 * @param purchaseType - The type of purchase (REGULAR, ONCE_OFF, SHARED_IP, or COD, COD_IP_SHARED, CREDIT_TERMS, CREDIT_TERMS_IP_SHARED)
 * @param creditApplication - Whether the initiator selected the credit application box (makes credit application mandatory)
 * @param paymentMethod - The payment method (COD or AC) - optional when using new 4-category purchase types
 * @param vatRegistered - If true, VAT Certificate is included (and mandatory when true)
 */
export function getRequiredDocuments(
  purchaseType: PurchaseType | string,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null,
  vatRegistered?: boolean
): string[] {
  const legacy = NEW_PURCHASE_TYPES.includes(purchaseType as any)
    ? toLegacyPurchaseInfo(purchaseType)
    : { purchaseType: purchaseType as PurchaseType, paymentMethod: (paymentMethod === 'COD' ? 'COD' : 'AC') as PaymentMethod }
  const { purchaseType: pt } = legacy

  // 1–4: Mandatory for all 4 categories
  const baseDocs = [
    'cipcCertificate',      // 1. Company Reg (CIPC / Company Registration)
    'bbbeeScorecard',      // 2. BBBEE certificate
    'taxClearance',        // 3. Tax Clearance / Good Standing
    'bankConfirmation',    // 4. Bank Confirmation Letter
  ]

  // 5. VAT Certificate – mandatory only if VAT registered
  if (vatRegistered === true) {
    baseDocs.push('vatCertificate')
  }

  // NDA – mandatory for COD IP Shared and Credit Terms IP Shared only (i.e. when pt is SHARED_IP)
  if (pt === 'SHARED_IP') {
    baseDocs.push('nda')
  }

  // Credit Application – included for all (shown to supplier) but only mandatory when credit application box was selected (handled in getMandatoryDocuments)
  baseDocs.push('creditApplication')

  return baseDocs
}

/**
 * Get the list of mandatory documents (must be provided to submit).
 * Rules: (1) All 4 categories: Company Reg, BBBEE, Tax Clearance/Good Standing, Bank Confirmation; (2) If VAT registered, VAT Certificate; (3) COD IP Shared & Credit Terms IP Shared: NDA; (4) Credit Application only mandatory when credit application box was selected.
 */
export function getMandatoryDocuments(
  purchaseType: PurchaseType | string,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null,
  vatRegistered?: boolean
): string[] {
  const legacy = NEW_PURCHASE_TYPES.includes(purchaseType as any)
    ? toLegacyPurchaseInfo(purchaseType)
    : { purchaseType: purchaseType as PurchaseType, paymentMethod: (paymentMethod === 'COD' ? 'COD' : 'AC') as PaymentMethod }
  const { purchaseType: pt, paymentMethod: pm } = legacy

  // 1–4: Mandatory for all 4 categories
  const mandatoryDocs = [
    'cipcCertificate',      // 1. Company Reg
    'bbbeeScorecard',       // 2. BBBEE certificate
    'taxClearance',         // 3. Tax Clearance / Good Standing
    'bankConfirmation',     // 4. Bank Confirmation Letter
  ]

  // 5. VAT Certificate – mandatory only if VAT registered
  if (vatRegistered === true) {
    mandatoryDocs.push('vatCertificate')
  }

  // NDA – mandatory for COD IP Shared and Credit Terms IP Shared only
  if (pt === 'SHARED_IP') {
    mandatoryDocs.push('nda')
  }

  // Credit Application – mandatory only when initiator selected the credit application box (not for COD; for Credit Terms only when selected)
  if (pm !== 'COD' && creditApplication) {
    mandatoryDocs.push('creditApplication')
  }

  return mandatoryDocs
}

/**
 * Get the display name for a document key
 * @param key - The document key
 * @returns The human-readable display name
 */
export function getDocumentDisplayName(key: string): string {
  const displayNames: Record<string, string> = {
    'cipcCertificate': 'CIPC Certificate (Company Registration)',
    'companyRegistration': 'CIPC Certificate (Company Registration)',
    'bbbeeScorecard': 'BBBEE Scorecard Report or Affidavit',
    'bbbeeAccreditation': 'BBBEE Scorecard Report or Affidavit',
    'taxClearance': 'Tax Clearance Certificate',
    'goodStanding': 'Tax Clearance / Letter of Good Standing',
    'vatCertificate': 'VAT Registration Certificate',
    'bankConfirmation': 'Bank Confirmation Letter',
    'nda': 'Non-Disclosure Agreement (NDA) - Signed',
    'creditApplication': 'Credit Application Form',
  }
  
  return displayNames[key] || key
}

/**
 * Check if a document is mandatory
 */
export function isDocumentMandatory(
  key: string,
  purchaseType: PurchaseType | string,
  creditApplication: boolean,
  paymentMethod?: PaymentMethod | string | null,
  vatRegistered?: boolean
): boolean {
  const mandatoryDocs = getMandatoryDocuments(purchaseType, creditApplication, paymentMethod, vatRegistered)
  return mandatoryDocs.includes(key)
}

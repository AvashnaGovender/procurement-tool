/**
 * Document Requirements Based on Purchase Type
 * 
 * Once-off Purchase: Only bank statement and CIPC document are mandatory
 * Regular Purchase: All documents except NDA
 * Shared IP: All documents including NDA
 */

export type PurchaseType = 'REGULAR' | 'ONCE_OFF' | 'SHARED_IP'

export type DocumentKey = 
  | 'companyRegistration'  // CIPC document
  | 'cm29Directors'
  | 'shareholderCerts'
  | 'proofOfShareholding'
  | 'bbbeeAccreditation'
  | 'bbbeeScorecard'
  | 'taxClearance'
  | 'vatCertificate'
  | 'bankConfirmation'     // Bank statement
  | 'nda'
  | 'healthSafety'
  | 'creditApplication'
  | 'qualityCert'
  | 'goodStanding'
  | 'sectorRegistrations'
  | 'organogram'
  | 'companyProfile'

/**
 * Get required documents based on purchase type and credit application
 * @param purchaseType - The purchase type (REGULAR, ONCE_OFF, SHARED_IP)
 * @param creditApplication - Whether credit application was selected (if true, credit application form is required)
 */
export function getRequiredDocuments(purchaseType: PurchaseType, creditApplication: boolean = false): DocumentKey[] {
  const baseDocuments: DocumentKey[] = []
  
  switch (purchaseType) {
    case 'ONCE_OFF':
      // Only bank statement and CIPC document are mandatory
      baseDocuments.push('bankConfirmation', 'companyRegistration')
      break
    
    case 'REGULAR':
      // All documents except NDA
      baseDocuments.push(
        'companyRegistration',
        'cm29Directors',
        'shareholderCerts',
        'proofOfShareholding',
        'bbbeeAccreditation',
        'bbbeeScorecard',
        'taxClearance',
        'vatCertificate',
        'bankConfirmation',
        'healthSafety',
        'qualityCert',
        'goodStanding',
        'sectorRegistrations',
        'organogram',
        'companyProfile'
      )
      break
    
    case 'SHARED_IP':
      // All documents including NDA
      baseDocuments.push(
        'companyRegistration',
        'cm29Directors',
        'shareholderCerts',
        'proofOfShareholding',
        'bbbeeAccreditation',
        'bbbeeScorecard',
        'taxClearance',
        'vatCertificate',
        'bankConfirmation',
        'nda',
        'healthSafety',
        'qualityCert',
        'goodStanding',
        'sectorRegistrations',
        'organogram',
        'companyProfile'
      )
      break
  }
  
  // Add credit application form if credit application was selected
  if (creditApplication) {
    baseDocuments.push('creditApplication')
  }
  
  return baseDocuments
}

/**
 * Check if a document is required for the given purchase type and credit application status
 */
export function isDocumentRequired(documentKey: DocumentKey, purchaseType: PurchaseType, creditApplication: boolean = false): boolean {
  return getRequiredDocuments(purchaseType, creditApplication).includes(documentKey)
}


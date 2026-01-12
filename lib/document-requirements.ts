/**
 * Document Requirements Based on Purchase Type
 * 
 * This file defines:
 * 1. Requested Documents: All documents that should be asked for/displayed in the form
 * 2. Mandatory Documents: Only the documents that are truly required (marked with *)
 * 
 * Mandatory documents are:
 * - companyRegistration (CIPC Documents)
 * - bbbeeAccreditation (B-BBEE Certificate)
 * - taxClearance OR goodStanding (either one accepted)
 * - bankConfirmation (Bank Confirmation Letter)
 * - nda (Non-Disclosure Agreement) - only for SHARED_IP purchase type
 * 
 * All other documents are optional but should still be requested.
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
 * Get all documents that should be requested/displayed based on purchase type and credit application
 * This includes both mandatory and optional documents
 * @param purchaseType - The purchase type (REGULAR, ONCE_OFF, SHARED_IP)
 * @param creditApplication - Whether credit application was selected (if true, credit application form is requested)
 */
export function getRequiredDocuments(purchaseType: PurchaseType, creditApplication: boolean = false): DocumentKey[] {
  const baseDocuments: DocumentKey[] = []
  
  switch (purchaseType) {
    case 'ONCE_OFF':
      // For once-off, only show bank confirmation and company registration
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
 * Get only the mandatory documents that must be provided
 * Mandatory documents are:
 * - companyRegistration (CIPC Documents)
 * - bbbeeAccreditation (B-BBEE Certificate) - only for REGULAR and SHARED_IP
 * - taxClearance OR goodStanding (either one accepted) - only for REGULAR and SHARED_IP
 * - bankConfirmation (Bank Confirmation Letter)
 * - nda (Non-Disclosure Agreement) - only for SHARED_IP purchase type
 * 
 * @param purchaseType - The purchase type (REGULAR, ONCE_OFF, SHARED_IP)
 */
export function getMandatoryDocuments(purchaseType: PurchaseType): DocumentKey[] {
  const mandatory: DocumentKey[] = [
    'companyRegistration',
    'bankConfirmation'
  ]
  
  if (purchaseType === 'REGULAR' || purchaseType === 'SHARED_IP') {
    mandatory.push('bbbeeAccreditation')
    // Note: taxClearance OR goodStanding (either one) is mandatory, but we include taxClearance in the list
    // The validation logic elsewhere should check that at least one of them is provided
    mandatory.push('taxClearance')
  }
  
  // NDA is only mandatory for SHARED_IP purchase type
  if (purchaseType === 'SHARED_IP') {
    mandatory.push('nda')
  }
  
  return mandatory
}

/**
 * Check if a document is mandatory (must be provided) for the given purchase type
 * Note: For taxClearance, goodStanding is also accepted as an alternative
 */
export function isDocumentMandatory(documentKey: DocumentKey, purchaseType: PurchaseType): boolean {
  // Validate purchaseType
  if (!purchaseType || (purchaseType !== 'ONCE_OFF' && purchaseType !== 'REGULAR' && purchaseType !== 'SHARED_IP')) {
    return false
  }
  
  // For ONCE_OFF, only companyRegistration and bankConfirmation are mandatory
  if (purchaseType === 'ONCE_OFF') {
    return documentKey === 'companyRegistration' || documentKey === 'bankConfirmation'
  }
  
  // Get the list of mandatory documents for this purchase type
  const mandatoryDocs = getMandatoryDocuments(purchaseType)
  
  // goodStanding is accepted as alternative to taxClearance for REGULAR and SHARED_IP
  // So if taxClearance is mandatory, goodStanding is also considered mandatory
  if (documentKey === 'goodStanding') {
    return mandatoryDocs.includes('taxClearance') // goodStanding is mandatory if taxClearance is mandatory
  }
  
  // Check if the document is in the mandatory list
  return mandatoryDocs.includes(documentKey)
}

/**
 * Check if a document should be requested/displayed for the given purchase type and credit application status
 * This checks if the document is in the list of requested documents (includes both mandatory and optional)
 */
export function isDocumentRequired(documentKey: DocumentKey, purchaseType: PurchaseType, creditApplication: boolean = false): boolean {
  return getRequiredDocuments(purchaseType, creditApplication).includes(documentKey)
}


/**
 * Credit Controller Assignment Logic
 * 
 * Based on business unit and supplier name (alphabetically), assigns the appropriate credit controller.
 * 
 * Mapping:
 * - Comp 200 & Comp 300:
 *   - A-D: Jordan (or Connie for specific companies)
 *   - E-H: Elizabeth
 *   - I-P: Ntombi
 *   - Q-Z: Nosi
 *   - Specific companies: Connie
 * - Comp 600 & Comp 900: All go to Connie
 */

import { BusinessUnit } from '@prisma/client'

// Specific companies that go to Connie regardless of alphabetical range
const CONNIE_SPECIFIC_COMPANIES = [
  'Corporate Traveller',
  'Corporate traveller',
  'Airliquid',
  'DHL - Express',
  'DHL',
  'Anway',
  'Greenlighting',
  'Chapmans',
  'Magenta',
  'Omega',
  'Phambili',
  'Page Automation'
]

/**
 * Determines the credit controller based on business unit and supplier name
 * @param businessUnit - The business unit (200, 300, 600, or 900)
 * @param supplierName - The supplier name
 * @param isForeignSupplier - Whether the supplier is a foreign supplier (optional)
 * @returns The assigned credit controller name
 */
export function assignCreditController(
  businessUnit: BusinessUnit | string | string[],
  supplierName: string,
  isForeignSupplier?: boolean
): string {
  // Normalize supplier name for comparison
  const normalizedSupplierName = supplierName.trim()
  
  // Handle business unit array (take first one if array)
  const businessUnitValue = Array.isArray(businessUnit) 
    ? businessUnit[0] 
    : businessUnit
  
  // Convert to string for comparison
  const businessUnitStr = String(businessUnitValue)
  
  // Comp 600 and Comp 900: All go to Connie
  if (businessUnitStr.includes('600') || businessUnitStr.includes('900')) {
    return 'Connie'
  }
  
  // Check if supplier is in Connie's specific company list
  const isConnieCompany = CONNIE_SPECIFIC_COMPANIES.some(
    company => normalizedSupplierName.toLowerCase().includes(company.toLowerCase())
  )
  
  if (isConnieCompany) {
    return 'Connie'
  }
  
  // For Comp 200 and Comp 300, assign based on alphabetical range
  if (businessUnitStr.includes('200') || businessUnitStr.includes('300')) {
    // Get first letter of supplier name (case-insensitive)
    const firstLetter = normalizedSupplierName.charAt(0).toUpperCase()
    
    // Assign based on alphabetical range
    if (firstLetter >= 'A' && firstLetter <= 'D') {
      return 'Jordan'
    } else if (firstLetter >= 'E' && firstLetter <= 'H') {
      return 'Elizabeth'
    } else if (firstLetter >= 'I' && firstLetter <= 'P') {
      return 'Ntombi'
    } else if (firstLetter >= 'Q' && firstLetter <= 'Z') {
      return 'Nosi'
    }
  }
  
  // Default fallback (shouldn't happen, but just in case)
  return 'Connie'
}

/**
 * Get list of all available credit controllers
 */
export function getCreditControllers(): string[] {
  return ['Connie', 'Jordan', 'Elizabeth', 'Ntombi', 'Nosi']
}


import { prisma } from '@/lib/prisma'

/**
 * Generate an alphanumeric sequential supplier code
 * Format: SUP-XXXXX where XXXXX is alphanumeric (0-9, A-Z)
 * Example: SUP-00000, SUP-00001, ..., SUP-00009, SUP-0000A, ..., SUP-0000Z, SUP-00010, etc.
 * 
 * Uses base 36 encoding (0-9, A-Z) for sequential alphanumeric codes
 */
export async function generateSupplierCode(): Promise<string> {
  try {
    // Get the last supplier code that follows the SUP-XXXXX format
    const lastSupplier = await prisma.supplier.findFirst({
      where: {
        supplierCode: {
          startsWith: 'SUP-'
        }
      },
      orderBy: {
        supplierCode: 'desc'
      },
      select: {
        supplierCode: true
      }
    })

    let nextNumber = 0 // Start from 0 (SUP-00000)

    if (lastSupplier) {
      // Extract the alphanumeric part after "SUP-"
      const lastCodePart = lastSupplier.supplierCode.substring(4).toUpperCase()
      
      // Validate that it's a valid base 36 string (5 characters, alphanumeric)
      if (lastCodePart.length === 5 && /^[0-9A-Z]{5}$/.test(lastCodePart)) {
        try {
          // Parse as base 36 number
          const lastNumber = parseInt(lastCodePart, 36)
          if (!isNaN(lastNumber) && lastNumber >= 0) {
            nextNumber = lastNumber + 1
          }
        } catch (error) {
          console.warn('Failed to parse last supplier code, starting from 0:', error)
          nextNumber = 0
        }
      } else {
        // If format doesn't match, find the highest numeric value
        console.warn(`Last supplier code "${lastSupplier.supplierCode}" doesn't match expected format, starting from 0`)
        nextNumber = 0
      }
    }

    // Convert to base 36 string and pad with zeros to 5 characters
    const nextCode = nextNumber.toString(36).toUpperCase().padStart(5, '0')
    
    return `SUP-${nextCode}`
  } catch (error) {
    console.error('Error generating supplier code:', error)
    // Fallback: use timestamp-based code if database query fails
    return `SUP-${Date.now().toString(36).toUpperCase().slice(-5).padStart(5, '0')}`
  }
}


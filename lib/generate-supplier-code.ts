import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

/**
 * Generate an alphanumeric sequential supplier code
 * Format: SUP-XXXXX where XXXXX is alphanumeric (0-9, A-Z)
 * Example: SUP-00000, SUP-00001, ..., SUP-00009, SUP-0000A, ..., SUP-0000Z, SUP-00010, etc.
 * 
 * Uses base 36 encoding (0-9, A-Z) for sequential alphanumeric codes
 * 
 * @param tx - Optional Prisma transaction client. If provided, uses the existing transaction.
 *            If not provided, creates its own transaction.
 */
export async function generateSupplierCode(tx?: Prisma.TransactionClient): Promise<string> {
  // Helper function to generate code within a transaction
  const generateCodeInTx = async (transactionClient: Prisma.TransactionClient): Promise<string> => {
    // Get the last supplier code that follows the SUP-XXXXX format
    // Using findFirst with orderBy in a transaction helps prevent race conditions
    const lastSupplier = await transactionClient.supplier.findFirst({
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
          const parsedNumber = parseInt(lastCodePart, 36)
          if (!isNaN(parsedNumber) && parsedNumber >= 0) {
            nextNumber = parsedNumber + 1
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
    const generatedCode = `SUP-${nextCode}`
    
    // Verify the code doesn't already exist (double-check to prevent race conditions)
    const existingSupplier = await transactionClient.supplier.findUnique({
      where: { supplierCode: generatedCode },
      select: { id: true }
    })
    
    if (existingSupplier) {
      // Code already exists, increment and try again
      throw new Error(`Supplier code ${generatedCode} already exists, will retry`)
    }
    
    return generatedCode
  }

  // If a transaction is provided, use it directly
  if (tx) {
    let attempts = 0
    const maxAttempts = 10 // More attempts when in a transaction since we can't create a new transaction
    
    while (attempts < maxAttempts) {
      try {
        return await generateCodeInTx(tx)
      } catch (error: any) {
        attempts++
        if (error.message?.includes('already exists')) {
          // Code exists, increment the number and try again
          // We'll parse the last code again and increment more
          const lastSupplier = await tx.supplier.findFirst({
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
          
          if (lastSupplier) {
            const lastCodePart = lastSupplier.supplierCode.substring(4).toUpperCase()
            if (lastCodePart.length === 5 && /^[0-9A-Z]{5}$/.test(lastCodePart)) {
              const parsedNumber = parseInt(lastCodePart, 36)
              if (!isNaN(parsedNumber) && parsedNumber >= 0) {
                // Increment by attempts to skip past existing codes
                const nextNumber = parsedNumber + attempts
                const nextCode = nextNumber.toString(36).toUpperCase().padStart(5, '0')
                const generatedCode = `SUP-${nextCode}`
                
                const existing = await tx.supplier.findUnique({
                  where: { supplierCode: generatedCode },
                  select: { id: true }
                })
                
                if (!existing) {
                  return generatedCode
                }
              }
            }
          }
        }
        
        if (attempts >= maxAttempts) {
          // Fallback: use timestamp-based code
          const timestampCode = `SUP-${Date.now().toString(36).toUpperCase().slice(-5).padStart(5, '0')}`
          const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()
          return `${timestampCode.slice(0, -2)}${randomSuffix}`
        }
      }
    }
    
    throw new Error('Failed to generate supplier code after all retry attempts')
  }

  // No transaction provided, create our own with retry logic
  let attempts = 0
  const maxAttempts = 5
  
  while (attempts < maxAttempts) {
    try {
      // Use a transaction to ensure atomicity and prevent race conditions
      const result = await prisma.$transaction(async (tx) => {
        return await generateCodeInTx(tx)
      }, {
        isolationLevel: 'Serializable', // Highest isolation level to prevent race conditions
        timeout: 5000 // 5 second timeout
      })
      
      return result
    } catch (error: any) {
      attempts++
      console.warn(`Attempt ${attempts} to generate supplier code failed:`, error.message)
      
      if (attempts >= maxAttempts) {
        // If all attempts failed, use timestamp-based fallback
        console.error('All attempts to generate supplier code failed, using timestamp fallback')
        const timestampCode = `SUP-${Date.now().toString(36).toUpperCase().slice(-5).padStart(5, '0')}`
        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()
        return `${timestampCode.slice(0, -2)}${randomSuffix}`
      }
      
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 100 * attempts))
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('Failed to generate supplier code after all retry attempts')
}


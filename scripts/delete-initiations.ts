import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteAllInitiations() {
  try {
    console.log('🗑️  Starting deletion of all supplier initiations...')
    
    // First, delete all related approvals (if cascade doesn't work)
    const managerApprovalsCount = await prisma.managerApproval.deleteMany({})
    console.log(`✅ Deleted ${managerApprovalsCount.count} manager approvals`)
    
    const procurementApprovalsCount = await prisma.procurementApproval.deleteMany({})
    console.log(`✅ Deleted ${procurementApprovalsCount.count} procurement approvals`)
    
    // Delete all supplier onboarding records linked to initiations
    const onboardingCount = await prisma.supplierOnboarding.deleteMany({
      where: {
        initiationId: {
          not: null
        }
      }
    })
    console.log(`✅ Deleted ${onboardingCount.count} supplier onboarding records`)
    
    // Delete all supplier records that were created from initiations
    const supplierCount = await prisma.supplier.deleteMany({
      where: {
        onboarding: {
          initiationId: {
            not: null
          }
        }
      }
    })
    console.log(`✅ Deleted ${supplierCount.count} supplier records`)
    
    // Finally, delete all initiations
    const initiationsCount = await prisma.supplierInitiation.deleteMany({})
    console.log(`✅ Deleted ${initiationsCount.count} supplier initiations`)
    
    console.log('✨ All supplier initiations and related records deleted successfully!')
    
  } catch (error) {
    console.error('❌ Error deleting initiations:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllInitiations()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })






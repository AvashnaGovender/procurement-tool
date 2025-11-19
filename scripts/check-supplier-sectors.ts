import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Check if suppliers have sector field populated
 * Run this to debug category filtering issues
 */
async function checkSupplierSectors() {
  console.log('🔍 Checking supplier sectors...\n')

  try {
    // Get all suppliers
    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        supplierCode: true,
        companyName: true,
        sector: true,
        natureOfBusiness: true,
        status: true,
        onboarding: {
          select: {
            initiation: {
              select: {
                productServiceCategory: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${suppliers.length} suppliers\n`)

    let withSector = 0
    let withoutSector = 0

    suppliers.forEach((supplier, index) => {
      const initiationCategory = supplier.onboarding?.initiation?.productServiceCategory
      
      console.log(`${index + 1}. ${supplier.companyName || 'N/A'}`)
      console.log(`   Code: ${supplier.supplierCode}`)
      console.log(`   Status: ${supplier.status}`)
      console.log(`   Sector: ${supplier.sector || '❌ NOT SET'}`)
      console.log(`   Nature of Business: ${supplier.natureOfBusiness || 'N/A'}`)
      console.log(`   Initiation Category: ${initiationCategory || 'N/A'}`)
      
      if (supplier.sector) {
        withSector++
        console.log(`   ✅ Has sector field`)
      } else {
        withoutSector++
        console.log(`   ⚠️  Missing sector field`)
        if (initiationCategory) {
          console.log(`   💡 Can be updated from initiation: "${initiationCategory}"`)
        }
      }
      console.log('')
    })

    console.log('\n📈 Summary:')
    console.log(`   Total suppliers: ${suppliers.length}`)
    console.log(`   With sector: ${withSector}`)
    console.log(`   Without sector: ${withoutSector}`)

    if (withoutSector > 0) {
      console.log('\n💡 Run "npx tsx scripts/update-supplier-sectors.ts" to fix missing sectors')
    }

  } catch (error) {
    console.error('❌ Error checking suppliers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSupplierSectors()


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Update existing suppliers with sector field from their initiations
 * Run this script to fix suppliers created before sector field was added
 */
async function updateSupplierSectors() {
  console.log('🔄 Starting supplier sector update...')

  try {
    // Find all suppliers that don't have a sector
    const suppliersWithoutSector = await prisma.supplier.findMany({
      where: {
        OR: [
          { sector: null },
          { sector: '' }
        ]
      },
      include: {
        onboarding: {
          include: {
            initiation: true
          }
        }
      }
    })

    console.log(`📊 Found ${suppliersWithoutSector.length} suppliers without sector field`)

    let updated = 0
    let skipped = 0

    for (const supplier of suppliersWithoutSector) {
      // Try to get sector from the initiation
      const sector = supplier.onboarding?.initiation?.productServiceCategory

      if (sector) {
        await prisma.supplier.update({
          where: { id: supplier.id },
          data: { sector }
        })
        console.log(`✅ Updated ${supplier.companyName}: ${sector}`)
        updated++
      } else {
        console.log(`⚠️  Skipped ${supplier.companyName}: No initiation data found`)
        skipped++
      }
    }

    console.log('\n✅ Update complete!')
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)

  } catch (error) {
    console.error('❌ Error updating suppliers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSupplierSectors()


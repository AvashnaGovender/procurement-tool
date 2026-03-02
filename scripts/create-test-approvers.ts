import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestApprovers() {
  try {
    console.log('Creating test approver users...\n')

    // Create Manager user (login is email-only)
    const manager = await prisma.user.upsert({
      where: { email: 'manager@test.com' },
      update: {
        role: 'MANAGER',
        isActive: true
      },
      create: {
        email: 'manager@test.com',
        name: 'Test Manager',
        role: 'MANAGER',
        department: 'Operations',
        phoneNumber: '+27123456789',
        isActive: true
      }
    })

    console.log('✅ Manager user created/updated:')
    console.log(`   Email: ${manager.email}`)
    console.log(`   Name: ${manager.name}`)
    console.log(`   Role: ${manager.role}`)
    console.log('')

    // Create Procurement Manager user
    const procurementManager = await prisma.user.upsert({
      where: { email: 'procurement@test.com' },
      update: {
        role: 'PROCUREMENT_MANAGER',
        isActive: true
      },
      create: {
        email: 'procurement@test.com',
        name: 'Test Procurement Manager',
        role: 'PROCUREMENT_MANAGER',
        department: 'Procurement',
        phoneNumber: '+27123456790',
        isActive: true
      }
    })

    console.log('✅ Procurement Manager user created/updated:')
    console.log(`   Email: ${procurementManager.email}`)
    console.log(`   Name: ${procurementManager.name}`)
    console.log(`   Role: ${procurementManager.role}`)
    console.log('')

    console.log('🎉 Test approver accounts ready!')
    console.log('\n📝 Login with email only (no password):')
    console.log('─────────────────────────────────────')
    console.log('Manager: manager@test.com')
    console.log('Procurement Manager: procurement@test.com')
    console.log('─────────────────────────────────────')

  } catch (error) {
    console.error('Error creating test approvers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createTestApprovers()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })


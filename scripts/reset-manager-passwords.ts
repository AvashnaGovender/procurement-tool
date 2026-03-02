import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetManagerPasswords() {
  try {
    // Passwords are no longer used - login is email-only.
    // This script now just confirms the manager accounts exist.
    console.log('📋 Manager accounts (login with email only, no password):\n')

    const manager = await prisma.user.findUnique({
      where: { email: 'agovender@theinnoverse.co.za' },
    })
    if (manager) {
      console.log('✅ Manager:', manager.email, '-', manager.name)
    } else {
      console.log('⚠️  Manager agovender@theinnoverse.co.za not found')
    }

    const procurementManager = await prisma.user.findUnique({
      where: { email: 'theinnoverse1212@gmail.com' },
    })
    if (procurementManager) {
      console.log('✅ Procurement Manager:', procurementManager.email, '-', procurementManager.name)
    } else {
      console.log('⚠️  Procurement Manager theinnoverse1212@gmail.com not found')
    }

    console.log('\n🎉 Login with the email addresses above (no password required).')
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetManagerPasswords()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })


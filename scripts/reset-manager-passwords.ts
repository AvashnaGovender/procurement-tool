import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetManagerPasswords() {
  try {
    console.log('📋 Manager accounts (credential login uses email + password):\n')

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

    console.log('\n🎉 Use the emails above; default password is password123 if reset via npm run users:set-default-password.')
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


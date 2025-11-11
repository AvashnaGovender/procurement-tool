import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetManagerPasswords() {
  try {
    // Set a new password for both managers
    const newPassword = 'Manager123!' // Change this to your desired password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    console.log('🔄 Resetting manager passwords...\n')

    // Reset Manager password
    const manager = await prisma.user.update({
      where: { email: 'agovender@theinnoverse.co.za' },
      data: {
        password: hashedPassword
      }
    })

    console.log('✅ Manager password reset:')
    console.log(`   Email: ${manager.email}`)
    console.log(`   New Password: ${newPassword}\n`)

    // Reset Procurement Manager password
    const procurementManager = await prisma.user.update({
      where: { email: 'theinnoverse1212@gmail.com' },
      data: {
        password: hashedPassword
      }
    })

    console.log('✅ Procurement Manager password reset:')
    console.log(`   Email: ${procurementManager.email}`)
    console.log(`   New Password: ${newPassword}\n`)

    console.log('🎉 Passwords reset successfully!')
    console.log('\n📝 Login Credentials:')
    console.log('─────────────────────────────────────')
    console.log('Manager:')
    console.log(`  Email: agovender@theinnoverse.co.za`)
    console.log(`  Password: ${newPassword}`)
    console.log('')
    console.log('Procurement Manager:')
    console.log(`  Email: theinnoverse1212@gmail.com`)
    console.log(`  Password: ${newPassword}`)
    console.log('─────────────────────────────────────')

  } catch (error) {
    console.error('Error resetting passwords:', error)
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


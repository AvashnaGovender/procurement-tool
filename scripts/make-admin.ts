import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  const email = 'avashna002@gmail.com'
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      console.log('\nAvailable users:')
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          name: true,
          role: true
        }
      })
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - ${u.role}`)
      })
      return
    }

    // Update to ADMIN role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        role: 'ADMIN',
        isActive: true // Ensure account is active
      }
    })

    console.log('✅ User updated successfully!')
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Name: ${updatedUser.name}`)
    console.log(`   Role: ${updatedUser.role}`)
    console.log(`   Active: ${updatedUser.isActive}`)
  } catch (error) {
    console.error('Error updating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()


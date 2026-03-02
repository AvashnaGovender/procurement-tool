import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateToAdmin() {
  try {
    // Update user to admin (login is email-only)
    const user = await prisma.user.update({
      where: { email: 'avashna002@gmail.com' },
      data: {
        name: 'Avashna',
        role: 'ADMIN',
        department: 'Management',
        isActive: true,
      },
    })

    console.log('✅ User updated to ADMIN successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:', user.email)
    console.log('Role:', user.role)
    console.log('Name:', user.name)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } catch (error) {
    console.error('❌ Error updating user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateToAdmin()


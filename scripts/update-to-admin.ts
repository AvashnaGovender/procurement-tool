import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function updateToAdmin() {
  try {
    // Hash the password
    const hashedPassword = await hash('admin123', 10)

    // Update user to admin with new password
    const user = await prisma.user.update({
      where: { email: 'avashna002@gmail.com' },
      data: {
        name: 'Avashna',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Management',
        isActive: true,
      },
    })

    console.log('✅ User updated to ADMIN successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:', user.email)
    console.log('Password: admin123')
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


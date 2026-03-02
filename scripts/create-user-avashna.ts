import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'avashna002@gmail.com' }
    })

    if (existingUser) {
      console.log('✅ User already exists!')
      console.log('Email:', existingUser.email)
      console.log('Name:', existingUser.name)
      console.log('Role:', existingUser.role)
      return
    }

    // Create admin user (login is email-only)
    const user = await prisma.user.create({
      data: {
        email: 'avashna002@gmail.com',
        name: 'Avashna',
        role: 'ADMIN',
        department: 'Management',
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:', user.email)
    console.log('Role:', user.role)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Login with this email (no password required).')
  } catch (error) {
    console.error('❌ Error creating user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createUser()


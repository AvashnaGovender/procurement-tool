import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

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

    // Hash the password
    const hashedPassword = await hash('admin123', 10)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: 'avashna002@gmail.com',
        name: 'Avashna',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'Management',
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:', user.email)
    console.log('Password: admin123')
    console.log('Role:', user.role)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  IMPORTANT: Change this password after first login!')
  } catch (error) {
    console.error('❌ Error creating user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createUser()


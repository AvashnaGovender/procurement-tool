import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@schauenburg.co.za' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists!')
      console.log('Email:', existingAdmin.email)
      console.log('Name:', existingAdmin.name)
      return
    }

    const passwordHash = await hashPassword('password123')
    const admin = await prisma.user.create({
      data: {
        email: 'admin@schauenburg.co.za',
        name: 'System Administrator',
        role: 'ADMIN',
        department: 'IT',
        isActive: true,
        password: passwordHash,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Default login password: password123 (change after first sign-in).')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()


import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

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

    // Hash the password
    const hashedPassword = await hash('admin123', 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@schauenburg.co.za',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'IT',
        isActive: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:', admin.email)
    console.log('Password: admin123')
    console.log('Role:', admin.role)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  IMPORTANT: Change this password after first login!')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()


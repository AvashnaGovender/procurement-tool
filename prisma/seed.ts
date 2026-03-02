import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create Admin User (login is email-only, no password)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@schauenburg.com' },
    update: {},
    create: {
      email: 'admin@schauenburg.com',
      name: 'System Administrator',
      role: 'ADMIN',
      department: 'IT',
      phoneNumber: '+27 11 123 4567',
      isActive: true,
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create Procurement Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@schauenburg.com' },
    update: {},
    create: {
      email: 'manager@schauenburg.com',
      name: 'Procurement Manager',
      role: 'PROCUREMENT_MANAGER',
      department: 'Procurement',
      phoneNumber: '+27 11 123 4568',
      isActive: true,
    },
  })
  console.log('✅ Created procurement manager:', manager.email)

  // Create Procurement Specialist
  const specialist = await prisma.user.upsert({
    where: { email: 'specialist@schauenburg.com' },
    update: {},
    create: {
      email: 'specialist@schauenburg.com',
      name: 'Procurement Specialist',
      role: 'PROCUREMENT_SPECIALIST',
      department: 'Procurement',
      phoneNumber: '+27 11 123 4569',
      isActive: true,
    },
  })
  console.log('✅ Created procurement specialist:', specialist.email)

  // Create Approver
  const approver = await prisma.user.upsert({
    where: { email: 'approver@schauenburg.com' },
    update: {},
    create: {
      email: 'approver@schauenburg.com',
      name: 'Department Approver',
      role: 'APPROVER',
      department: 'Operations',
      phoneNumber: '+27 11 123 4570',
      isActive: true,
    },
  })
  console.log('✅ Created approver:', approver.email)

  // Create Sample Supplier
  const supplier = await prisma.supplier.create({
    data: {
      supplierCode: 'SUP-001',
      companyName: 'Acme Mining Supplies',
      contactPerson: 'John Smith',
      contactEmail: 'john@acmemining.co.za',
      contactPhone: '+27 11 234 5678',
      businessType: 'PTY_LTD',
      sector: 'mining',
      registrationNumber: '2020/123456/07',
      vatNumber: '4123456789',
      physicalAddress: '123 Mining Street, Johannesburg',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2000',
      status: 'APPROVED',
      createdById: manager.id,
      approvedAt: new Date(),
    },
  })
  console.log('✅ Created sample supplier:', supplier.companyName)

  // Create System Configuration
  const configs = [
    {
      key: 'REQUISITION_APPROVAL_THRESHOLD',
      value: '50000',
      description: 'Amount threshold that requires additional approval',
      category: 'REQUISITIONS',
    },
    {
      key: 'CONTRACT_RENEWAL_NOTICE_DAYS',
      value: '30',
      description: 'Days before contract expiry to send renewal notice',
      category: 'CONTRACTS',
    },
    {
      key: 'EMAIL_REMINDER_DAYS',
      value: '3',
      description: 'Days before sending follow-up email reminder',
      category: 'EMAILS',
    },
    {
      key: 'SESSION_EXPIRY_HOURS',
      value: '24',
      description: 'Hours before session resumption expires',
      category: 'SYSTEM',
    },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }
  console.log('✅ Created system configurations')

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Test users (login with email only):')
  console.log('   Admin: admin@schauenburg.com')
  console.log('   Manager: manager@schauenburg.com')
  console.log('   Specialist: specialist@schauenburg.com')
  console.log('   Approver: approver@schauenburg.com')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


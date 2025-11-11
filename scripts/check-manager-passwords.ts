import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkManagerPasswords() {
  try {
    const managers = await prisma.user.findMany({
      where: {
        role: {
          in: ['MANAGER', 'PROCUREMENT_MANAGER']
        },
        isActive: true
      },
      select: {
        email: true,
        name: true,
        role: true
      }
    })

    console.log('\n📋 Manager and Procurement Manager Accounts:')
    console.log('─────────────────────────────────────────────')
    
    if (managers.length === 0) {
      console.log('No active managers found.')
    } else {
      managers.forEach(user => {
        console.log(`\n${user.role}:`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Name: ${user.name}`)
      })
    }
    
    console.log('\n📝 Default Passwords (from seed file):')
    console.log('─────────────────────────────────────────────')
    console.log('If using default seed data:')
    console.log('  Manager: Manager123!')
    console.log('  Procurement Manager: Manager123!')
    console.log('\nIf using test approvers script:')
    console.log('  Manager: password123')
    console.log('  Procurement Manager: password123')
    console.log('\n⚠️  Note: Passwords are hashed in the database.')
    console.log('   If you need to reset a password, use a script to update it.')
    
  } catch (error) {
    console.error('Error checking managers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkManagerPasswords()


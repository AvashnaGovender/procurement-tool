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
    
    console.log('\n📝 Login: email + password (use default password123 if not yet changed).')
    
  } catch (error) {
    console.error('Error checking managers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkManagerPasswords()


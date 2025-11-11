import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkApprovals() {
  try {
    console.log('\n=== Checking Supplier Initiations and Approvals ===\n')
    
    // Get all initiations
    const initiations = await prisma.supplierInitiation.findMany({
      include: {
        managerApproval: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true
              }
            }
          }
        },
        procurementApproval: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true
              }
            }
          }
        },
        initiatedBy: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })
    
    console.log(`Found ${initiations.length} supplier initiation(s)\n`)
    
    if (initiations.length === 0) {
      console.log('❌ No initiations found! Please submit a supplier initiation first.')
      console.log('\nTo create a test initiation, login as admin and go to:')
      console.log('   Suppliers → Onboard → Initiate New Onboarding\n')
      return
    }
    
    initiations.forEach((init, index) => {
      console.log(`\n${index + 1}. Initiation: ${init.supplierName}`)
      console.log(`   ID: ${init.id}`)
      console.log(`   Status: ${init.status}`)
      console.log(`   Initiated by: ${init.initiatedBy.name} (${init.initiatedBy.email})`)
      console.log(`   Submitted: ${init.submittedAt.toLocaleString()}`)
      console.log('')
      console.log('   Manager Approval:')
      if (init.managerApproval) {
        console.log(`      ✓ Assigned to: ${init.managerApproval.approver.name}`)
        console.log(`      ✓ Email: ${init.managerApproval.approver.email}`)
        console.log(`      ✓ Role: ${init.managerApproval.approver.role}`)
        console.log(`      ✓ Status: ${init.managerApproval.status}`)
      } else {
        console.log('      ✗ NOT ASSIGNED')
      }
      console.log('')
      console.log('   Procurement Approval:')
      if (init.procurementApproval) {
        console.log(`      ✓ Assigned to: ${init.procurementApproval.approver.name}`)
        console.log(`      ✓ Email: ${init.procurementApproval.approver.email}`)
        console.log(`      ✓ Role: ${init.procurementApproval.approver.role}`)
        console.log(`      ✓ Status: ${init.procurementApproval.status}`)
      } else {
        console.log('      ✗ NOT ASSIGNED')
      }
      console.log('\n' + '─'.repeat(80))
    })
    
    // Check test approver accounts
    console.log('\n=== Test Approver Accounts ===\n')
    const manager = await prisma.user.findUnique({
      where: { email: 'manager@test.com' }
    })
    const procurement = await prisma.user.findUnique({
      where: { email: 'procurement@test.com' }
    })
    
    if (manager) {
      console.log(`✓ Manager Test Account: ${manager.email} (${manager.name})`)
      console.log(`  Role: ${manager.role}`)
      console.log(`  Active: ${manager.isActive}`)
      console.log(`  ID: ${manager.id}`)
    } else {
      console.log('✗ Manager test account not found')
    }
    console.log('')
    if (procurement) {
      console.log(`✓ Procurement Manager Test Account: ${procurement.email} (${procurement.name})`)
      console.log(`  Role: ${procurement.role}`)
      console.log(`  Active: ${procurement.isActive}`)
      console.log(`  ID: ${procurement.id}`)
    } else {
      console.log('✗ Procurement manager test account not found')
    }
    
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkApprovals()
  .then(() => {
    console.log('\n✅ Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error)
    process.exit(1)
  })


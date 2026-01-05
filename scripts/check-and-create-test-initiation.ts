import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndCreateTestInitiation() {
  try {
    console.log('Checking supplier initiations in the database...\n')
    
    // Count existing initiations
    const initiationCount = await prisma.supplierInitiation.count()
    console.log(`Found ${initiationCount} supplier initiation(s)\n`)
    
    if (initiationCount === 0) {
      console.log('No initiations found. Creating a test initiation...\n')
      
      // Get admin user
      const admin = await prisma.user.findFirst({
        where: {
          role: 'ADMIN'
        }
      })
      
      if (!admin) {
        console.error('❌ No admin user found. Please create an admin user first.')
        return
      }
      
      // Get manager
      const manager = await prisma.user.findFirst({
        where: {
          role: { in: ['MANAGER', 'ADMIN', 'APPROVER'] },
          isActive: true
        }
      })
      
      // Get procurement manager
      const procurementManager = await prisma.user.findFirst({
        where: {
          role: 'PROCUREMENT_MANAGER',
          isActive: true
        }
      })
      
      console.log(`Manager found: ${manager?.email}`)
      console.log(`Procurement Manager found: ${procurementManager?.email}\n`)
      
      // Create test initiation
      const initiation = await prisma.supplierInitiation.create({
        data: {
          businessUnit: ['SCHAUENBURG_SYSTEMS_200'],
          processReadUnderstood: true,
          dueDiligenceCompleted: true,
          supplierName: 'Test Supplier Company',
          supplierEmail: 'supplier@test.com',
          supplierContactPerson: 'John Doe',
          productServiceCategory: 'IT Services',
          requesterName: admin.name,
          relationshipDeclaration: 'No existing relationship with this supplier',
          purchaseType: 'REGULAR',
          annualPurchaseValue: 500000,
          creditApplication: true,
          onboardingReason: 'We need this supplier for specialized IT services that are not available from our current suppliers. They offer competitive pricing and have excellent references.',
          initiatedById: admin.id,
          status: 'SUBMITTED'
        }
      })
      
      console.log('✅ Test initiation created:', initiation.id)
      
      // Create manager approval
      if (manager) {
        await prisma.managerApproval.create({
          data: {
            initiationId: initiation.id,
            approverId: manager.id,
            status: 'PENDING'
          }
        })
        console.log(`✅ Manager approval created for: ${manager.email}`)
      }
      
      // Create procurement approval
      if (procurementManager) {
        await prisma.procurementApproval.create({
          data: {
            initiationId: initiation.id,
            approverId: procurementManager.id,
            status: 'PENDING'
          }
        })
        console.log(`✅ Procurement approval created for: ${procurementManager.email}`)
      }
      
      console.log('\n🎉 Test supplier initiation created successfully!')
      console.log('\nNow you can:')
      console.log('1. Login as manager@test.com to approve as Manager')
      console.log('2. Login as procurement@test.com to approve as Procurement Manager')
    } else {
      console.log('Supplier initiations already exist in the database.')
      
      // Show existing initiations
      const initiations = await prisma.supplierInitiation.findMany({
        include: {
          managerApproval: {
            include: {
              approver: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          procurementApproval: {
            include: {
              approver: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
      
      console.log('\nExisting Initiations:')
      initiations.forEach((init, index) => {
        console.log(`\n${index + 1}. ${init.supplierName}`)
        console.log(`   Status: ${init.status}`)
        console.log(`   Manager Approval: ${init.managerApproval?.status || 'Not assigned'} (${init.managerApproval?.approver.email || 'N/A'})`)
        console.log(`   Procurement Approval: ${init.procurementApproval?.status || 'Not assigned'} (${init.procurementApproval?.approver.email || 'N/A'})`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateTestInitiation()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })


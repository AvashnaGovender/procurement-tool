import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Get the latest initiation
    const latestInitiation = await prisma.supplierInitiation.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!latestInitiation) {
      console.log('No initiations found')
      return
    }

    console.log('Latest initiation:', {
      id: latestInitiation.id,
      supplierName: latestInitiation.supplierName,
      supplierEmail: latestInitiation.supplierEmail,
      status: latestInitiation.status,
      createdAt: latestInitiation.createdAt
    })

    // Delete it
    await prisma.supplierInitiation.delete({
      where: {
        id: latestInitiation.id
      }
    })

    console.log('✅ Successfully deleted the latest initiation')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()









import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can run cleanup
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only administrators can run cleanup operations' },
        { status: 403 }
      )
    }

    console.log('🧹 Starting cleanup of orphaned initiations...')

    // Find all initiations with onboarding records
    const initiationsWithOnboarding = await prisma.supplierInitiation.findMany({
      where: {
        onboarding: {
          isNot: null
        }
      },
      include: {
        onboarding: {
          include: {
            supplier: true
          }
        }
      }
    })

    const orphanedInitiations: string[] = []

    // Check which ones have deleted suppliers
    for (const initiation of initiationsWithOnboarding) {
      if (initiation.onboarding && !initiation.onboarding.supplier) {
        orphanedInitiations.push(initiation.id)
        console.log(`Found orphaned initiation: ${initiation.id} - ${initiation.supplierName}`)
      }
    }

    if (orphanedInitiations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orphaned initiations found',
        cleaned: 0
      })
    }

    // Delete orphaned initiations
    let cleanedCount = 0
    for (const initiationId of orphanedInitiations) {
      try {
        await prisma.$transaction(async (tx) => {
          // Get onboarding record
          const onboarding = await tx.supplierOnboarding.findFirst({
            where: { initiationId }
          })

          if (onboarding) {
            // Delete timeline entries
            await tx.onboardingTimeline.deleteMany({
              where: { onboardingId: onboarding.id }
            })

            // Delete onboarding
            await tx.supplierOnboarding.delete({
              where: { id: onboarding.id }
            })
          }

          // Delete approvals
          await tx.managerApproval.deleteMany({
            where: { initiationId }
          })

          await tx.procurementApproval.deleteMany({
            where: { initiationId }
          })

          // Delete initiation
          await tx.supplierInitiation.delete({
            where: { id: initiationId }
          })
        })

        console.log(`✅ Cleaned up orphaned initiation: ${initiationId}`)
        cleanedCount++
      } catch (error) {
        console.error(`❌ Failed to clean up initiation ${initiationId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} orphaned initiation(s)`,
      cleaned: cleanedCount
    })
  } catch (error) {
    console.error('Error cleaning up orphaned initiations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup orphaned initiations'
      },
      { status: 500 }
    )
  }
}


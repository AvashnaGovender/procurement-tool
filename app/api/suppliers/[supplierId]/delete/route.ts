import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Check admin authorization
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Only administrators can delete suppliers.' },
        { status: 403 }
      )
    }

    const { supplierId } = await params

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    // Get supplier details before deletion for logging
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        onboarding: true
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Delete uploaded documents from filesystem
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads', 'suppliers', supplierId)
    if (fs.existsSync(uploadsDir)) {
      try {
        fs.rmSync(uploadsDir, { recursive: true, force: true })
        console.log(`✅ Deleted uploaded files for supplier: ${supplierId}`)
      } catch (error) {
        console.error('Error deleting uploaded files:', error)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete all related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Get the initiation ID if it exists
      let initiationId: string | null = null
      if (supplier.onboarding?.initiationId) {
        initiationId = supplier.onboarding.initiationId
      }

      // Delete onboarding timeline entries
      if (supplier.onboarding) {
        await tx.onboardingTimeline.deleteMany({
          where: { onboardingId: supplier.onboarding.id }
        })
        console.log(`✅ Deleted timeline entries for onboarding: ${supplier.onboarding.id}`)
      }

      // Delete supplier onboarding record
      if (supplier.onboarding) {
        await tx.supplierOnboarding.delete({
          where: { id: supplier.onboarding.id }
        })
        console.log(`✅ Deleted onboarding record: ${supplier.onboarding.id}`)
      }

      // Delete supplier
      await tx.supplier.delete({
        where: { id: supplierId }
      })
      console.log(`✅ Deleted supplier: ${supplierId}`)

      // Delete the related supplier initiation if it exists
      if (initiationId) {
        // Delete manager approval if exists
        await tx.managerApproval.deleteMany({
          where: { initiationId }
        })
        
        // Delete procurement approval if exists
        await tx.procurementApproval.deleteMany({
          where: { initiationId }
        })
        
        // Delete the initiation
        await tx.supplierInitiation.delete({
          where: { id: initiationId }
        })
        console.log(`✅ Deleted supplier initiation: ${initiationId}`)
      }
    })

    console.log(`✅ Successfully deleted supplier "${supplier.companyName}" (${supplierId}) and all associated data`)

    return NextResponse.json({
      success: true,
      message: `Supplier "${supplier.companyName}" and all associated data have been permanently deleted`,
      deletedSupplier: {
        id: supplier.id,
        companyName: supplier.companyName,
        contactEmail: supplier.contactEmail
      }
    })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete supplier'
      },
      { status: 500 }
    )
  }
}















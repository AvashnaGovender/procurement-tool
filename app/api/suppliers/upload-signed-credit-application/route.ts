import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Debug logging
    console.log('📤 Upload signed credit application - User:', session.user.email, 'Role:', session.user.role)

    // Check if user is Procurement Manager or Admin
    if (session.user.role !== 'PROCUREMENT_MANAGER' && session.user.role !== 'ADMIN') {
      console.log('❌ Access denied - User role:', session.user.role, 'Expected: PROCUREMENT_MANAGER or ADMIN')
      return NextResponse.json(
        { success: false, error: 'Only Procurement Managers can upload signed credit applications' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const supplierId = formData.get('supplierId') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'No supplier ID provided' },
        { status: 400 }
      )
    }

    // Validate file type - only accept PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are accepted' },
        { status: 400 }
      )
    }

    // Get supplier to verify it exists and get supplier code
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: {
        id: true,
        supplierCode: true,
        status: true,
        onboarding: {
          include: {
            initiation: {
              select: {
                creditApplication: true
              }
            }
          }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Verify supplier is awaiting final approval
    if (supplier.status !== 'AWAITING_FINAL_APPROVAL') {
      return NextResponse.json(
        { success: false, error: 'Supplier is not awaiting final approval' },
        { status: 400 }
      )
    }

    // Verify credit application is required
    if (!supplier.onboarding?.initiation?.creditApplication) {
      return NextResponse.json(
        { success: false, error: 'Credit application is not required for this supplier' },
        { status: 400 }
      )
    }

    // Create directory for signed credit application
    const signedCreditAppDir = join(
      process.cwd(),
      'data',
      'uploads',
      'suppliers',
      supplier.supplierCode,
      'signedCreditApplication'
    )

    if (!existsSync(signedCreditAppDir)) {
      await mkdir(signedCreditAppDir, { recursive: true })
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const fileName = `signed-credit-application-${timestamp}.pdf`
    const filePath = join(signedCreditAppDir, fileName)

    await writeFile(filePath, buffer)

    // Update supplier's airtableData to include signed credit application info
    const currentAirtableData = supplier.onboarding?.airtableData || {}
    const updatedAirtableData = {
      ...currentAirtableData,
      signedCreditApplication: {
        fileName: fileName,
        uploadedAt: new Date().toISOString(),
        uploadedBy: session.user.id
      }
    }

    // Update the onboarding record
    await prisma.supplierOnboarding.update({
      where: { supplierId: supplier.id },
      data: {
        airtableData: updatedAirtableData
      }
    })

    return NextResponse.json({
      success: true,
      fileName: fileName,
      message: 'Signed credit application uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading signed credit application:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload signed credit application'
      },
      { status: 500 }
    )
  }
}


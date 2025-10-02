import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { supplierId: string } }
) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.supplierId },
      select: {
        id: true,
        supplierCode: true,
        companyName: true,
        contactPerson: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        createdAt: true,
        natureOfBusiness: true,
        bbbeeLevel: true,
        numberOfEmployees: true,
        airtableData: true,
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      supplier
    })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch supplier'
      },
      { status: 500 }
    )
  }
}


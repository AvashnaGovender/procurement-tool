import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        createdAt: 'desc'
      },
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

    return NextResponse.json({
      success: true,
      suppliers
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch suppliers'
      },
      { status: 500 }
    )
  }
}


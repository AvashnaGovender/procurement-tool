import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all custom options by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const optionType = searchParams.get('type') as 'PRODUCT_SERVICE_CATEGORY' | 'BANK' | 'ACCOUNT_TYPE' | null

    if (!optionType) {
      return NextResponse.json(
        { success: false, error: 'Option type is required' },
        { status: 400 }
      )
    }

    const customOptions = await prisma.customOption.findMany({
      where: {
        optionType: optionType
      },
      orderBy: {
        value: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      options: customOptions.map(opt => opt.value)
    })
  } catch (error) {
    console.error('Error fetching custom options:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch custom options' },
      { status: 500 }
    )
  }
}

// POST - Add a new custom option
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { optionType, value } = body

    if (!optionType || !value) {
      return NextResponse.json(
        { success: false, error: 'Option type and value are required' },
        { status: 400 }
      )
    }

    // Validate option type
    const validTypes = ['PRODUCT_SERVICE_CATEGORY', 'BANK', 'ACCOUNT_TYPE']
    if (!validTypes.includes(optionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid option type' },
        { status: 400 }
      )
    }

    // Trim and validate value
    const trimmedValue = value.trim()
    if (!trimmedValue) {
      return NextResponse.json(
        { success: false, error: 'Value cannot be empty' },
        { status: 400 }
      )
    }

    // Check if option already exists
    const existing = await prisma.customOption.findFirst({
      where: {
        optionType: optionType,
        value: trimmedValue
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This option already exists' },
        { status: 409 }
      )
    }

    // Create the custom option
    const customOption = await prisma.customOption.create({
      data: {
        optionType: optionType,
        value: trimmedValue,
        createdById: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      option: customOption.value
    })
  } catch (error: any) {
    console.error('Error creating custom option:', error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'This option already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create custom option' },
      { status: 500 }
    )
  }
}


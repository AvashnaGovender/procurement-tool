import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { supplierId, version, category, fileName, isVerified } = await request.json()

    if (!supplierId || version === undefined || !category || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if verification record exists
    const existingVerification = await prisma.documentVerification.findUnique({
      where: {
        supplierId_version_category_fileName: {
          supplierId,
          version: parseInt(version),
          category,
          fileName
        }
      }
    })

    let verification
    if (existingVerification) {
      // Update existing verification
      verification = await prisma.documentVerification.update({
        where: {
          id: existingVerification.id
        },
        data: {
          isVerified,
          verifiedAt: isVerified ? new Date() : null,
          verifiedBy: isVerified ? session.user.id : null
        }
      })
    } else {
      // Create new verification
      verification = await prisma.documentVerification.create({
        data: {
          supplierId,
          version: parseInt(version),
          category,
          fileName,
          isVerified,
          verifiedAt: isVerified ? new Date() : null,
          verifiedBy: isVerified ? session.user.id : null
        }
      })
    }

    return NextResponse.json({
      success: true,
      verification
    })

  } catch (error) {
    console.error('Error updating document verification:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get verification status for a supplier's documents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get('supplierId')

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    const verifications = await prisma.documentVerification.findMany({
      where: {
        supplierId
      },
      include: {
        // Add user info if needed
      }
    })

    // Create a lookup map for easy access
    const verificationMap: Record<string, boolean> = {}
    verifications.forEach(v => {
      const key = `${v.version}-${v.category}-${v.fileName}`
      verificationMap[key] = v.isVerified
    })

    return NextResponse.json({
      success: true,
      verifications: verificationMap
    })

  } catch (error) {
    console.error('Error fetching document verifications:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}


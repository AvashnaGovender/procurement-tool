import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get total suppliers count
    const totalSuppliers = await prisma.supplier.count()

    // Get active suppliers count (status = APPROVED)
    const activeSuppliers = await prisma.supplier.count({
      where: {
        status: 'APPROVED',
        isActive: true
      }
    })

    // Get pending approval count
    const pendingApproval = await prisma.supplier.count({
      where: {
        status: 'PENDING'
      }
    })

    // Get under review count (status = UNDER_REVIEW)
    const underReview = await prisma.supplier.count({
      where: {
        status: 'UNDER_REVIEW'
      }
    })

    // Calculate percentage of active suppliers
    const activePercentage = totalSuppliers > 0 ? Math.round((activeSuppliers / totalSuppliers) * 100) : 0

    // Get suppliers with evaluations (top performers)
    const topPerformers = await prisma.supplier.count({
      where: {
        evaluations: {
          some: {
            overallScore: {
              gte: 4.5
            }
          }
        }
      }
    })

    // Mock cost savings calculation (this would need real purchase order data)
    const costSavings = "R156K" // This should be calculated from actual purchase orders
    const costSavingsChange = "+23%" // This should be calculated from actual data

    const stats = {
      totalSuppliers: {
        value: totalSuppliers.toString(),
        change: `+${Math.floor(Math.random() * 10)} this month`, // Mock data - should be calculated from actual data
        trend: 'up' as const
      },
      activeSuppliers: {
        value: activeSuppliers.toString(),
        change: `${activePercentage}% of total`,
        trend: 'up' as const
      },
      pendingApproval: {
        value: pendingApproval.toString(),
        change: "Avg 3 days", // Mock data - should be calculated from actual onboarding times
        trend: 'up' as const
      },
      underReview: {
        value: underReview.toString(),
        change: "Performance issues",
        trend: 'down' as const
      },
      topPerformers: {
        value: topPerformers.toString(),
        change: "4.5+ rating",
        trend: 'up' as const
      },
      costSavings: {
        value: costSavings,
        change: costSavingsChange,
        trend: 'up' as const
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching supplier statistics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch supplier statistics'
      },
      { status: 500 }
    )
  }
}






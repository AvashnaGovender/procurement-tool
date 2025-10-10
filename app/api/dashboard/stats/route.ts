import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get current date for calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all statistics in parallel
    const [
      totalSuppliers,
      totalSuppliersLastMonth,
      activeOrders,
      activeOrdersLastMonth,
      totalSpend,
      totalSpendLastMonth,
      averageLeadTime,
      averageLeadTimeLastMonth
    ] = await Promise.all([
      // Total Suppliers (approved suppliers)
      prisma.supplier.count({
        where: {
          status: 'APPROVED',
          isActive: true
        }
      }),
      
      // Total Suppliers last month
      prisma.supplier.count({
        where: {
          status: 'APPROVED',
          isActive: true,
          createdAt: {
            lte: endOfLastMonth
          }
        }
      }),

      // Active Orders (requisitions in progress)
      prisma.requisition.count({
        where: {
          status: {
            in: ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'CONVERTED_TO_PO']
          }
        }
      }),

      // Active Orders last month
      prisma.requisition.count({
        where: {
          status: {
            in: ['SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'CONVERTED_TO_PO']
          },
          createdAt: {
            lte: endOfLastMonth
          }
        }
      }),

      // Total Spend (sum of all approved requisitions)
      prisma.requisition.aggregate({
        where: {
          status: {
            in: ['APPROVED', 'CONVERTED_TO_PO', 'COMPLETED']
          },
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          estimatedTotalAmount: true
        }
      }),

      // Total Spend last month
      prisma.requisition.aggregate({
        where: {
          status: {
            in: ['APPROVED', 'CONVERTED_TO_PO', 'COMPLETED']
          },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: {
          estimatedTotalAmount: true
        }
      }),

      // Average Lead Time (from deliveries)
      prisma.delivery.aggregate({
        where: {
          leadTimeDays: {
            not: null
          },
          createdAt: {
            gte: startOfMonth
          }
        },
        _avg: {
          leadTimeDays: true
        }
      }),

      // Average Lead Time last month
      prisma.delivery.aggregate({
        where: {
          leadTimeDays: {
            not: null
          },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _avg: {
          leadTimeDays: true
        }
      })
    ])

    // Calculate percentage changes
    const suppliersChange = totalSuppliersLastMonth > 0 
      ? ((totalSuppliers - totalSuppliersLastMonth) / totalSuppliersLastMonth) * 100 
      : 0

    const ordersChange = activeOrdersLastMonth > 0 
      ? ((activeOrders - activeOrdersLastMonth) / activeOrdersLastMonth) * 100 
      : 0

    const spendChange = totalSpendLastMonth._sum.estimatedTotalAmount && totalSpendLastMonth._sum.estimatedTotalAmount > 0
      ? ((totalSpend._sum.estimatedTotalAmount - totalSpendLastMonth._sum.estimatedTotalAmount) / totalSpendLastMonth._sum.estimatedTotalAmount) * 100
      : 0

    const leadTimeChange = averageLeadTimeLastMonth._avg.leadTimeDays && averageLeadTime._avg.leadTimeDays
      ? averageLeadTimeLastMonth._avg.leadTimeDays - averageLeadTime._avg.leadTimeDays
      : 0

    // Format the response
    const stats = {
      totalSuppliers: {
        value: totalSuppliers.toLocaleString(),
        change: suppliersChange,
        trend: suppliersChange >= 0 ? 'up' : 'down'
      },
      activeOrders: {
        value: activeOrders.toLocaleString(),
        change: ordersChange,
        trend: ordersChange >= 0 ? 'up' : 'down'
      },
      totalSpend: {
        value: `R${(totalSpend._sum.estimatedTotalAmount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        change: spendChange,
        trend: spendChange >= 0 ? 'up' : 'down'
      },
      averageLeadTime: {
        value: averageLeadTime._avg.leadTimeDays 
          ? `${Math.round(averageLeadTime._avg.leadTimeDays)} days`
          : 'N/A',
        change: leadTimeChange,
        trend: leadTimeChange <= 0 ? 'up' : 'down' // Lower lead time is better
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}






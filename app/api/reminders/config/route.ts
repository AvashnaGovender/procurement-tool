import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all reminder configurations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can view configurations
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const configs = await prisma.reminderConfiguration.findMany({
      orderBy: {
        reminderType: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      configurations: configs
    })

  } catch (error) {
    console.error('Error fetching reminder configurations:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update reminder configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, firstReminderAfterHours, secondReminderAfterHours, finalReminderAfterHours, isEnabled, emailSubjectTemplate, emailBodyTemplate } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Configuration ID is required' },
        { status: 400 }
      )
    }

    console.log(`📝 Updating reminder config ${id}:`, { firstReminderAfterHours, secondReminderAfterHours, finalReminderAfterHours, isEnabled })

    const updateData: any = {}
    if (firstReminderAfterHours !== undefined) updateData.firstReminderAfterHours = Number(firstReminderAfterHours)
    if (secondReminderAfterHours !== undefined) updateData.secondReminderAfterHours = Number(secondReminderAfterHours)
    if (finalReminderAfterHours !== undefined) updateData.finalReminderAfterHours = Number(finalReminderAfterHours)
    if (isEnabled !== undefined) updateData.isEnabled = Boolean(isEnabled)
    if (emailSubjectTemplate !== undefined) updateData.emailSubjectTemplate = emailSubjectTemplate
    if (emailBodyTemplate !== undefined) updateData.emailBodyTemplate = emailBodyTemplate

    const updated = await prisma.reminderConfiguration.update({
      where: { id },
      data: updateData
    })

    console.log(`✅ Updated reminder config: ${updated.reminderType}`)

    return NextResponse.json({
      success: true,
      configuration: updated
    })

  } catch (error) {
    console.error('Error updating reminder configuration:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}


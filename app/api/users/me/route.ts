import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const managerSelect = {
  id: true,
  name: true,
  email: true,
  isActive: true,
} as const

// GET - Current user's profile, including assigned manager
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        manager: { select: managerSelect },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
      hasManager: !!(user.managerId && user.manager && user.manager.isActive),
    })
  } catch (error) {
    console.error('GET /api/users/me:', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

// PATCH - Update own manager assignment
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const managerEmail =
      typeof body.managerEmail === 'string' ? body.managerEmail.trim() : ''

    if (!managerEmail) {
      return NextResponse.json(
        { error: 'Manager email is required' },
        { status: 400 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (managerEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot assign yourself as your manager.' },
        { status: 400 }
      )
    }

    const manager = await prisma.user.findFirst({
      where: { email: { equals: managerEmail.toLowerCase(), mode: 'insensitive' } },
      select: managerSelect,
    })

    if (!manager) {
      return NextResponse.json(
        {
          error:
            'This manager is not registered in the system. Please ask them to register first, or contact your administrator.',
        },
        { status: 400 }
      )
    }

    if (!manager.isActive) {
      return NextResponse.json(
        {
          error:
            'This manager account is inactive. Please choose a different manager or contact your administrator.',
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: { managerId: manager.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        manager: { select: managerSelect },
      },
    })

    return NextResponse.json({
      success: true,
      user,
      hasManager: true,
      message: 'Manager updated successfully.',
    })
  } catch (error) {
    console.error('PATCH /api/users/me:', error)
    return NextResponse.json({ error: 'Failed to update manager' }, { status: 500 })
  }
}

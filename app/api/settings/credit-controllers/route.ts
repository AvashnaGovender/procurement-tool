import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_CONTROLLERS = ['Connie', 'Jordan', 'Elizabeth', 'Ntombi', 'Nosi']

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let controllers = await prisma.creditController.findMany({
      orderBy: { name: 'asc' },
    })

    // If the table is empty (first run before migration was applied), seed defaults
    if (controllers.length === 0) {
      await prisma.creditController.createMany({
        data: DEFAULT_CONTROLLERS.map(name => ({ name })),
        skipDuplicates: true,
      })
      controllers = await prisma.creditController.findMany({
        orderBy: { name: 'asc' },
      })
    }

    return NextResponse.json({ success: true, controllers })
  } catch (error) {
    console.error('Error fetching credit controllers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credit controllers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Controller name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    const existing = await prisma.creditController.findUnique({
      where: { name: trimmedName },
    })

    if (existing) {
      if (!existing.isActive) {
        // Reactivate if previously deactivated
        const reactivated = await prisma.creditController.update({
          where: { name: trimmedName },
          data: { isActive: true },
        })
        return NextResponse.json({ success: true, controller: reactivated })
      }
      return NextResponse.json(
        { success: false, error: 'A controller with this name already exists' },
        { status: 409 }
      )
    }

    const controller = await prisma.creditController.create({
      data: { name: trimmedName },
    })

    return NextResponse.json({ success: true, controller }, { status: 201 })
  } catch (error) {
    console.error('Error creating credit controller:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create credit controller' },
      { status: 500 }
    )
  }
}

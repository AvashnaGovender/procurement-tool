import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fromLetter, toLetter, controllerName, sortOrder, isActive } = body

    const rule = await prisma.creditControllerRule.update({
      where: { id: params.id },
      data: {
        ...(fromLetter   !== undefined && { fromLetter: fromLetter?.trim().toUpperCase() ?? null }),
        ...(toLetter     !== undefined && { toLetter:   toLetter?.trim().toUpperCase()   ?? null }),
        ...(controllerName !== undefined && { controllerName: controllerName.trim() }),
        ...(sortOrder    !== undefined && { sortOrder }),
        ...(isActive     !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ success: true, rule })
  } catch (error) {
    console.error('Error updating credit controller rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update rule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.creditControllerRule.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting credit controller rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete rule' },
      { status: 500 }
    )
  }
}

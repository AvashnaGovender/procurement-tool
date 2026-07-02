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

    const { isActive } = await request.json()

    const controller = await prisma.creditController.update({
      where: { id: params.id },
      data: { isActive },
    })

    return NextResponse.json({ success: true, controller })
  } catch (error) {
    console.error('Error updating credit controller:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update credit controller' },
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

    await prisma.creditController.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting credit controller:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete credit controller' },
      { status: 500 }
    )
  }
}

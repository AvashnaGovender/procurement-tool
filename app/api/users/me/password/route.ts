import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'

/** Whether the signed-in account has a stored credential password */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })
    return NextResponse.json({ hasPassword: !!user?.password })
  } catch (e) {
    console.error('GET /api/users/me/password:', e)
    return NextResponse.json({ error: 'Failed to load account' }, { status: 500 })
  }
}

type Body = {
  currentPassword?: string | null
  newPassword?: string | null
  confirmPassword?: string | null
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as Body
    const newPassword = body.newPassword?.trim() ?? ''
    const confirmPassword = body.confirmPassword?.trim() ?? ''

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.password) {
      const current = body.currentPassword?.trim() ?? ''
      if (!current) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        )
      }
      const currentOk = await verifyPassword(current, user.password)
      if (!currentOk) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }
      const sameAsOld = await verifyPassword(newPassword, user.password)
      if (sameAsOld) {
        return NextResponse.json(
          { error: 'New password must be different from your current password' },
          { status: 400 }
        )
      }
    }

    const hash = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/users/me/password:', e)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}

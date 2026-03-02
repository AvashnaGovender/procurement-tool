import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Public self-registration (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, managerName, managerEmail } = body

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    if (!managerName?.trim()) {
      return NextResponse.json(
        { error: 'Manager name is required' },
        { status: 400 }
      )
    }
    if (!managerEmail?.trim()) {
      return NextResponse.json(
        { error: 'Manager email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedManagerEmail = managerEmail.toLowerCase().trim()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Resolve manager: if a user exists with manager email, link them
    const manager = await prisma.user.findFirst({
      where: { email: { equals: normalizedManagerEmail, mode: 'insensitive' } },
      select: { id: true },
    })
    const managerId = manager?.id ?? null
    // When manager not in system, store "Manager: Name (email)" in department so admin can see it
    const department = managerId
      ? null
      : `Manager: ${managerName.trim()} (${normalizedManagerEmail})`

    // Default display name from email local part (e.g. "john" from "john@example.com")
    const nameFromEmail = normalizedEmail.split('@')[0] || 'New User'
    const displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1).replace(/[._]/g, ' ')

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: displayName,
        role: 'USER',
        isActive: true,
        managerId,
        department,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        managerId: true,
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(
      { success: true, message: 'Registration successful. You can now sign in.', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}

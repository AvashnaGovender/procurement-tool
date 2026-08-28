import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

// GET - Check if a manager is registered (for real-time validation on register form)
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim()
  if (!email) {
    return NextResponse.json({ exists: false }, { status: 200 })
  }
  const normalized = email.toLowerCase()
  const manager = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
    select: { id: true, name: true, email: true, isActive: true },
  })
  if (!manager) {
    return NextResponse.json({
      exists: false,
      message: 'This manager is not registered. Please ask them to register first.',
    })
  }
  if (!manager.isActive) {
    return NextResponse.json({
      exists: false,
      message: 'This manager account is inactive. Please choose a different manager or contact your administrator.',
    })
  }
  return NextResponse.json({
    exists: true,
    name: manager.name,
    email: manager.email,
  })
}

const ALLOWED_ROLES = ['USER', 'MANAGER'] as const
type AllowedRole = (typeof ALLOWED_ROLES)[number]

async function resolveManager(managerEmail: string, registrantEmail: string) {
  const normalizedManagerEmail = managerEmail.toLowerCase().trim()
  if (normalizedManagerEmail === registrantEmail) {
    return { error: 'You cannot assign yourself as your manager.' }
  }
  const manager = await prisma.user.findFirst({
    where: { email: { equals: normalizedManagerEmail, mode: 'insensitive' } },
    select: { id: true, name: true, email: true, isActive: true },
  })
  if (!manager) {
    return {
      error:
        'This manager is not registered in the system. Please ask your manager to register first, or contact your administrator.',
    }
  }
  if (!manager.isActive) {
    return {
      error:
        'This manager account is inactive. Please choose a different manager or contact your administrator.',
    }
  }
  return { manager }
}

// POST - Public self-registration (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, managerEmail, role, password } = body

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    if (!password?.trim()) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }
    const passwordTrimmed = password.trim()
    if (passwordTrimmed.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    const roleVal = (role || 'USER').toUpperCase()
    if (!ALLOWED_ROLES.includes(roleVal as AllowedRole)) {
      return NextResponse.json(
        { error: 'Role must be User or Manager' },
        { status: 400 }
      )
    }

    const managerEmailTrimmed = typeof managerEmail === 'string' ? managerEmail.trim() : ''
    const managerRequired = roleVal === 'USER'
    if (managerRequired && !managerEmailTrimmed) {
      return NextResponse.json(
        { error: 'Manager email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    let managerId: string | null = null

    if (managerEmailTrimmed) {
      const resolved = await resolveManager(managerEmailTrimmed, normalizedEmail)
      if ('error' in resolved) {
        return NextResponse.json({ error: resolved.error }, { status: 400 })
      }
      managerId = resolved.manager.id
    }

    // Default display name from email local part (e.g. "john" from "john@example.com")
    const nameFromEmail = normalizedEmail.split('@')[0] || 'New User'
    const displayName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1).replace(/[._]/g, ' ')

    const hashedPassword = await hashPassword(passwordTrimmed)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: displayName,
        role: roleVal as AllowedRole,
        isActive: true,
        managerId,
        password: hashedPassword,
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

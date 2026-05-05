import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

const ADMIN_CREATED_DEFAULT_PASSWORD =
  process.env.ADMIN_CREATED_USER_DEFAULT_PASSWORD || 'password123'

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`👥 Fetching users for: ${session.user.email}, role: ${session.user.role}`)

    // Admins get full user information, others get basic info for delegations
    if (session.user.role === 'ADMIN') {
      // Admins see all users with full details
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          managerId: true,
          department: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      console.log(`   ✅ Admin: Returning ${users.length} users with full details`)
      return NextResponse.json({ success: true, users })
    } else {
      // Non-admins only see active users with basic info (for delegations)
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          id: { not: session.user.id } // Exclude self
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true
        },
        orderBy: {
          name: 'asc'
        }
      })
      console.log(`   ✅ Regular user: Returning ${users.length} active users (basic info)`)
      return NextResponse.json({ success: true, users })
    }

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, role, isActive, managerId } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(ADMIN_CREATED_DEFAULT_PASSWORD)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'USER',
        isActive: isActive !== undefined ? isActive : true,
        managerId: managerId || null,
        password: passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

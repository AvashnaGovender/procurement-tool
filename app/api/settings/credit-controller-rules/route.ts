import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_RULES = [
  { businessUnit: 'SCHAUENBURG_SYSTEMS_200', ruleType: 'ALPHA_RANGE' as const, fromLetter: 'A', toLetter: 'D', controllerName: 'Jordan',    sortOrder: 1 },
  { businessUnit: 'SCHAUENBURG_SYSTEMS_200', ruleType: 'ALPHA_RANGE' as const, fromLetter: 'E', toLetter: 'H', controllerName: 'Elizabeth', sortOrder: 2 },
  { businessUnit: 'SCHAUENBURG_SYSTEMS_200', ruleType: 'ALPHA_RANGE' as const, fromLetter: 'I', toLetter: 'P', controllerName: 'Ntombi',    sortOrder: 3 },
  { businessUnit: 'SCHAUENBURG_SYSTEMS_200', ruleType: 'ALPHA_RANGE' as const, fromLetter: 'Q', toLetter: 'Z', controllerName: 'Nosi',      sortOrder: 4 },
  { businessUnit: 'SCHAUENBURG_PTY_LTD_300', ruleType: 'ALPHA_RANGE' as const, fromLetter: 'A', toLetter: 'D', controllerName: 'Jordan',    sortOrder: 1 },
  { businessUnit: 'SCHAUENBURG_PTY_LTD_300', ruleType: 'ALPHA_RANGE' as const, fromLetter: 'E', toLetter: 'H', controllerName: 'Elizabeth', sortOrder: 2 },
  { businessUnit: 'SCHAUENBURG_PTY_LTD_300', ruleType: 'ALPHA_RANGE' as const, fromLetter: 'I', toLetter: 'P', controllerName: 'Ntombi',    sortOrder: 3 },
  { businessUnit: 'SCHAUENBURG_PTY_LTD_300', ruleType: 'ALPHA_RANGE' as const, fromLetter: 'Q', toLetter: 'Z', controllerName: 'Nosi',      sortOrder: 4 },
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let rules = await prisma.creditControllerRule.findMany({
      orderBy: [{ businessUnit: 'asc' }, { sortOrder: 'asc' }],
    })

    // Auto-seed defaults on first run
    if (rules.length === 0) {
      await prisma.creditControllerRule.createMany({ data: DEFAULT_RULES })
      rules = await prisma.creditControllerRule.findMany({
        orderBy: [{ businessUnit: 'asc' }, { sortOrder: 'asc' }],
      })
    }

    return NextResponse.json({ success: true, rules })
  } catch (error) {
    console.error('Error fetching credit controller rules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rules' },
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

    const body = await request.json()
    const { businessUnit, ruleType, fromLetter, toLetter, controllerName, sortOrder } = body

    if (!businessUnit?.trim() || !ruleType || !controllerName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'businessUnit, ruleType, and controllerName are required' },
        { status: 400 }
      )
    }

    if (ruleType === 'ALPHA_RANGE' && (!fromLetter?.trim() || !toLetter?.trim())) {
      return NextResponse.json(
        { success: false, error: 'fromLetter and toLetter are required for ALPHA_RANGE rules' },
        { status: 400 }
      )
    }

    // For FIXED rules, ensure only one active FIXED rule per BU
    if (ruleType === 'FIXED') {
      const existing = await prisma.creditControllerRule.findFirst({
        where: { businessUnit: businessUnit.trim(), ruleType: 'FIXED', isActive: true },
      })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'This business unit already has a fixed rule. Delete it first or use an alphabetical range.' },
          { status: 409 }
        )
      }
    }

    // Calculate sortOrder: place after last rule for this BU if not provided
    let order = sortOrder ?? 0
    if (!order) {
      const last = await prisma.creditControllerRule.findFirst({
        where: { businessUnit: businessUnit.trim() },
        orderBy: { sortOrder: 'desc' },
      })
      order = (last?.sortOrder ?? 0) + 1
    }

    const rule = await prisma.creditControllerRule.create({
      data: {
        businessUnit: businessUnit.trim(),
        ruleType,
        fromLetter: ruleType === 'ALPHA_RANGE' ? fromLetter.trim().toUpperCase() : null,
        toLetter:   ruleType === 'ALPHA_RANGE' ? toLetter.trim().toUpperCase()   : null,
        controllerName: controllerName.trim(),
        sortOrder: order,
      },
    })

    return NextResponse.json({ success: true, rule }, { status: 201 })
  } catch (error) {
    console.error('Error creating credit controller rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create rule' },
      { status: 500 }
    )
  }
}

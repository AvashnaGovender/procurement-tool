import { prisma } from './prisma'
import { ModuleType } from '@prisma/client'

interface SaveSessionParams {
  userId: string
  moduleType: ModuleType
  processId: string
  processStep: string
  processData?: any
  expiresInHours?: number
}

/**
 * Save user's current process state for resumption
 */
export async function saveSessionState(params: SaveSessionParams) {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + (params.expiresInHours || 24))

  // Check if session already exists
  const existing = await prisma.sessionResumption.findFirst({
    where: {
      userId: params.userId,
      moduleType: params.moduleType,
      processId: params.processId,
      isCompleted: false,
    },
  })

  if (existing) {
    // Update existing session
    return await prisma.sessionResumption.update({
      where: { id: existing.id },
      data: {
        processStep: params.processStep,
        processData: params.processData || {},
        lastAccessedAt: new Date(),
        expiresAt,
      },
    })
  } else {
    // Create new session
    return await prisma.sessionResumption.create({
      data: {
        userId: params.userId,
        moduleType: params.moduleType,
        processId: params.processId,
        processStep: params.processStep,
        processData: params.processData || {},
        expiresAt,
      },
    })
  }
}

/**
 * Get user's active sessions
 */
export async function getUserActiveSessions(userId: string) {
  return await prisma.sessionResumption.findMany({
    where: {
      userId,
      isCompleted: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      lastAccessedAt: 'desc',
    },
  })
}

/**
 * Resume a specific session
 */
export async function getSessionState(userId: string, moduleType: ModuleType, processId: string) {
  const session = await prisma.sessionResumption.findFirst({
    where: {
      userId,
      moduleType,
      processId,
      isCompleted: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (session) {
    // Update last accessed time
    await prisma.sessionResumption.update({
      where: { id: session.id },
      data: { lastAccessedAt: new Date() },
    })
  }

  return session
}

/**
 * Mark session as completed
 */
export async function completeSession(userId: string, moduleType: ModuleType, processId: string) {
  return await prisma.sessionResumption.updateMany({
    where: {
      userId,
      moduleType,
      processId,
      isCompleted: false,
    },
    data: {
      isCompleted: true,
    },
  })
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  return await prisma.sessionResumption.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}


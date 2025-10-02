import { prisma } from './prisma'

interface AuditLogParams {
  userId?: string
  userName?: string
  action: string
  entityType: string
  entityId: string
  changes?: any
  metadata?: any
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an audit log entry for any system action
 */
export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes || {},
        metadata: params.metadata || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw error - audit logging should not break the main flow
  }
}

/**
 * Get audit trail for a specific entity
 */
export async function getAuditTrail(entityType: string, entityId: string) {
  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

/**
 * Get user activity log
 */
export async function getUserActivity(userId: string, limit: number = 50) {
  return await prisma.auditLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  })
}


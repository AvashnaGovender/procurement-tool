import { PrismaClient } from '@prisma/client'

// Single PrismaClient instance attached to `global` so it survives module
// re-evaluations in both development (HMR) and production (multiple render
// contexts in Next.js App Router). Without this, each new module context
// creates its own client with its own connection pool, slowly exhausting
// memory over days of uptime.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

globalForPrisma.prisma = prisma

export default prisma


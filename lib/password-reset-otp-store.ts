import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export interface PasswordResetOtpRecord {
  id: string
  email: string
  otpHash: string
  salt: string
  expiresAt: Date
  attempts: number
  invalidated: boolean
  createdAt: Date
}

export async function invalidateActivePasswordResetOtps(email: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "password_reset_otps"
    SET "invalidated" = true
    WHERE "email" = ${email} AND "invalidated" = false
  `
}

export async function createPasswordResetOtp(params: {
  email: string
  otpHash: string
  salt: string
  expiresAt: Date
}): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO "password_reset_otps" ("id", "email", "otpHash", "salt", "expiresAt", "attempts", "invalidated", "createdAt")
    VALUES (${crypto.randomUUID()}, ${params.email}, ${params.otpHash}, ${params.salt}, ${params.expiresAt}, 0, false, NOW())
  `
}

export async function getLatestActivePasswordResetOtp(email: string): Promise<PasswordResetOtpRecord | null> {
  const rows = await prisma.$queryRaw<PasswordResetOtpRecord[]>(Prisma.sql`
    SELECT "id", "email", "otpHash", "salt", "expiresAt", "attempts", "invalidated", "createdAt"
    FROM "password_reset_otps"
    WHERE "email" = ${email} AND "invalidated" = false
    ORDER BY "createdAt" DESC
    LIMIT 1
  `)
  return rows[0] ?? null
}

export async function updatePasswordResetOtpById(
  id: string,
  params: { attempts?: number; invalidated?: boolean }
): Promise<void> {
  const setClauses: Prisma.Sql[] = []
  if (typeof params.attempts === "number") {
    setClauses.push(Prisma.sql`"attempts" = ${params.attempts}`)
  }
  if (typeof params.invalidated === "boolean") {
    setClauses.push(Prisma.sql`"invalidated" = ${params.invalidated}`)
  }
  if (setClauses.length === 0) return

  const setSql = Prisma.join(setClauses, Prisma.sql`, `)
  await prisma.$executeRaw(Prisma.sql`
    UPDATE "password_reset_otps"
    SET ${setSql}
    WHERE "id" = ${id}
  `)
}

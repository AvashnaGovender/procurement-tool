/**
 * One-time (or forced) migration: set every user's password to bcrypt password123.
 * Run after DB migration adds `users.password`:
 *   npx tsx scripts/set-default-passwords.ts
 *
 * Optional env: DEFAULT_USER_PASSWORD (default: password123)
 */
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

async function main() {
  const plain = process.env.DEFAULT_USER_PASSWORD?.trim() || 'password123'
  const hash = await hashPassword(plain)
  const result = await prisma.user.updateMany({
    data: { password: hash },
  })
  console.log(`✅ Updated ${result.count} user(s) to default password: "${plain}"`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

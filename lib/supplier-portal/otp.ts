import { createHash, randomInt } from 'crypto'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 24 * 60 // 24 hours
const OTP_MAX_ATTEMPTS = 5

export function generateOtp(): string {
  const min = Math.pow(10, OTP_LENGTH - 1)
  const max = Math.pow(10, OTP_LENGTH) - 1
  return randomInt(min, max + 1).toString().padStart(OTP_LENGTH, '0')
}

export function generateSalt(): string {
  return createHash('sha256').update(Math.random().toString() + Date.now().toString()).digest('hex').slice(0, 16)
}

export function hashOtp(otp: string, salt: string): string {
  return createHash('sha256').update(otp + salt).digest('hex')
}

export function verifyOtp(inputOtp: string, salt: string, storedHash: string): boolean {
  const inputHash = hashOtp(inputOtp, salt)
  // Constant-time comparison to prevent timing attacks
  if (inputHash.length !== storedHash.length) return false
  let diff = 0
  for (let i = 0; i < inputHash.length; i++) {
    diff |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i)
  }
  return diff === 0
}

export function getOtpExpiresAt(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
}

export { OTP_MAX_ATTEMPTS, OTP_EXPIRY_MINUTES }

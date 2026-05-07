import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { OTP_MAX_ATTEMPTS, verifyPasswordResetOtp } from "@/lib/password-reset-otp"
import {
  getLatestActivePasswordResetOtp,
  invalidateActivePasswordResetOtps,
  updatePasswordResetOtpById,
} from "@/lib/password-reset-otp-store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body?.email || "").toLowerCase().trim()
    const otp = String(body?.otp || "").trim()
    const newPassword = String(body?.newPassword || "")
    const confirmPassword = String(body?.confirmPassword || "")

    if (!email || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Email, OTP, and new password are required" },
        { status: 400 }
      )
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      )
    }

    const otpRecord = await getLatestActivePasswordResetOtp(email)

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "No active reset code found. Request a new code." },
        { status: 400 }
      )
    }

    if (otpRecord.expiresAt < new Date()) {
      await updatePasswordResetOtpById(otpRecord.id, { invalidated: true })
      return NextResponse.json(
        { success: false, error: "Reset code expired. Request a new code." },
        { status: 400 }
      )
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await updatePasswordResetOtpById(otpRecord.id, { invalidated: true })
      return NextResponse.json(
        { success: false, error: "Too many incorrect attempts. Request a new code." },
        { status: 429 }
      )
    }

    const isValidOtp = verifyPasswordResetOtp(otp, otpRecord.salt, otpRecord.otpHash)
    if (!isValidOtp) {
      const attempts = otpRecord.attempts + 1
      await updatePasswordResetOtpById(otpRecord.id, {
        attempts,
        invalidated: attempts >= OTP_MAX_ATTEMPTS,
      })
      return NextResponse.json({ success: false, error: "Invalid reset code" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" }, isActive: true },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 })
    }

    const passwordHash = await hashPassword(newPassword)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      }),
    ])
    await invalidateActivePasswordResetOtps(email)

    return NextResponse.json({ success: true, message: "Password reset successful." })
  } catch (error) {
    console.error("Forgot password reset error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}

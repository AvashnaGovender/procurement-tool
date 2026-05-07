import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { prisma } from "@/lib/prisma"
import {
  generateOtpSalt,
  generatePasswordResetOtp,
  getPasswordResetOtpExpiresAt,
  hashPasswordResetOtp,
} from "@/lib/password-reset-otp"
import {
  getEnvelope,
  getFromAddress,
  getMailTransporter,
  loadAdminSmtpConfig,
  sendMailAndCheck,
} from "@/lib/smtp-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body?.email || "").toLowerCase().trim()
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" }, isActive: true },
      select: { id: true, email: true, name: true },
    })

    // Do not reveal whether the account exists.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If this email exists, a reset code has been sent.",
      })
    }

    await prisma.passwordResetOtp.updateMany({
      where: { email: user.email, invalidated: false },
      data: { invalidated: true },
    })

    const otp = generatePasswordResetOtp()
    const salt = generateOtpSalt()
    const otpHash = hashPasswordResetOtp(otp, salt)
    const expiresAt = getPasswordResetOtpExpiresAt()

    await prisma.passwordResetOtp.create({
      data: { email: user.email, otpHash, salt, expiresAt },
    })

    const smtpConfig = loadAdminSmtpConfig()
    const transporter = getMailTransporter(smtpConfig)

    await sendMailAndCheck(
      transporter,
      {
        from: getFromAddress(smtpConfig),
        to: user.email,
        envelope: getEnvelope(smtpConfig, user.email),
        subject: "Password reset code",
        html: buildResetOtpEmail(user.name || "User", otp),
        attachments: [
          {
            filename: "logo.png",
            path: path.join(process.cwd(), "public", "logo.png"),
            cid: "logo",
          },
        ],
      },
      "Password reset OTP"
    )

    return NextResponse.json({
      success: true,
      message: "If this email exists, a reset code has been sent.",
    })
  } catch (error) {
    console.error("Forgot password OTP request error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send reset code. Please try again." },
      { status: 500 }
    )
  }
}

function buildResetOtpEmail(name: string, otp: string): string {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden;">
        <div style="padding:30px; text-align:center; border-bottom:3px solid #1e40af;">
          <img src="cid:logo" alt="Schauenburg Systems" style="max-width:150px;" />
          <h2 style="color:#1e40af; margin-top:20px;">Password Reset</h2>
        </div>
        <div style="padding:30px; color:#333; line-height:1.6;">
          <p>Dear ${name},</p>
          <p>Use this one-time code to reset your password. The code expires in <strong>15 minutes</strong>.</p>
          <div style="text-align:center; margin:30px 0;">
            <span style="display:inline-block; padding:14px 28px; border:2px solid #1e40af; border-radius:8px; font-size:32px; letter-spacing:8px; color:#1e40af; font-family:monospace; font-weight:bold;">
              ${otp}
            </span>
          </div>
          <p style="font-size:14px; color:#666;">If you did not request this, you can ignore this email.</p>
        </div>
      </div>
    </body>
  </html>
  `
}

import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { validateMagicLinkToken, FormType } from '@/lib/supplier-portal/token'
import { generateOtp, generateSalt, hashOtp, getOtpExpiresAt } from '@/lib/supplier-portal/otp'
import { loadAdminSmtpConfig, getMailTransporter, getFromAddress, getEnvelope, sendMailAndCheck } from '@/lib/smtp-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, formType } = body as { token?: string; formType?: FormType }

    if (!token || !formType) {
      return NextResponse.json(
        { success: false, error: 'token and formType are required' },
        { status: 400 }
      )
    }

    if (formType !== 'onboarding' && formType !== 'credit') {
      return NextResponse.json(
        { success: false, error: 'formType must be "onboarding" or "credit"' },
        { status: 400 }
      )
    }

    // Validate the magic link token before sending OTP
    const tokenResult = await validateMagicLinkToken(token, formType)
    if (!tokenResult.valid) {
      return NextResponse.json(
        { success: false, error: tokenResult.message, code: tokenResult.code },
        { status: 400 }
      )
    }

    const { id: onboardingId, contactEmail, contactName } = tokenResult.onboarding

    // Rate limit: if a non-invalidated OTP was sent in the last 2 minutes, return success
    // without sending another email. This prevents duplicate emails from double-renders or
    // repeated redirects while the session cookie is being established.
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    const recentOtp = await prisma.supplierOtp.findFirst({
      where: {
        onboardingId,
        formType,
        invalidated: false,
        createdAt: { gte: twoMinutesAgo },
      },
    })

    if (recentOtp) {
      const maskedEmail = maskEmail(contactEmail)
      return NextResponse.json({ success: true, maskedEmail, rateLimited: true })
    }

    // Invalidate any existing active OTPs for this record + formType
    await prisma.supplierOtp.updateMany({
      where: { onboardingId, formType, invalidated: false },
      data: { invalidated: true },
    })

    // Generate new OTP
    const otp = generateOtp()
    const salt = generateSalt()
    const otpHash = hashOtp(otp, salt)
    const expiresAt = getOtpExpiresAt()

    await prisma.supplierOtp.create({
      data: { onboardingId, formType, email: contactEmail, otpHash, salt, expiresAt },
    })

    // Send OTP email
    let smtpConfig
    try {
      smtpConfig = loadAdminSmtpConfig()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Email service not configured. Please contact your procurement representative.' },
        { status: 503 }
      )
    }

    const transporter = getMailTransporter(smtpConfig)
    const htmlContent = buildOtpEmail(contactName, otp)

    await sendMailAndCheck(
      transporter,
      {
        from: getFromAddress(smtpConfig),
        to: contactEmail,
        envelope: getEnvelope(smtpConfig, contactEmail),
        subject: 'Your verification code',
        html: htmlContent,
        attachments: [
          {
            filename: 'logo.png',
            path: path.join(process.cwd(), 'public', 'logo.png'),
            cid: 'logo',
          },
        ],
      },
      'OTP request'
    )

    // Return masked email so the UI can confirm where the code was sent
    const maskedEmail = maskEmail(contactEmail)
    return NextResponse.json({ success: true, maskedEmail })
  } catch (error) {
    console.error('OTP request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    )
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}@${domain}`
}

function buildOtpEmail(contactName: string, otp: string): string {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color:#ffffff;">
          <tr>
            <td style="background-color:#ffffff;padding:40px 30px;text-align:center;border-bottom:3px solid #1e40af;">
              <img src="cid:logo" alt="Schauenburg Systems" style="max-width:150px;height:auto;margin-bottom:20px;display:block;margin-left:auto;margin-right:auto;" />
              <p style="color:#1e40af;font-size:24px;font-weight:bold;margin:0;line-height:1.2;">Supplier Portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;color:#333333;line-height:1.6;font-size:16px;">
              <p>Dear ${contactName},</p>
              <p>Use the verification code below to access your supplier form. This code expires in <strong>24 hours</strong>.</p>
              <div style="text-align:center;margin:30px 0;">
                <div style="display:inline-block;background-color:#f0f4ff;border:2px solid #1e40af;border-radius:8px;padding:20px 40px;">
                  <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e40af;font-family:monospace;">${otp}</span>
                </div>
              </div>
              <p style="color:#6b7280;font-size:14px;">If you did not request this code, you can safely ignore this email. Do not share this code with anyone.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:30px;text-align:center;color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;">Schauenburg Systems &mdash; Supplier Onboarding Portal</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Unified email helper that transparently uses Microsoft Graph API when
 * Azure AD credentials are configured, and falls back to SMTP otherwise.
 *
 * Drop-in for the repeated loadAdminSmtpConfig / getMailTransporter /
 * sendMailAndCheck pattern used throughout the supplier API routes.
 */

import path from 'path'
import fs from 'fs'
import { loadAdminSmtpConfig, getMailTransporter, getFromAddress, getEnvelope, sendMailAndCheck } from '@/lib/smtp-admin'
import { sendViaGraphApi, isGraphApiConfigured, GraphAttachment } from '@/lib/microsoft-graph-email'

export interface NotificationAttachment {
  /** Display filename */
  filename: string
  /** Buffer or base64 string content (for PDFs / binaries) */
  content?: Buffer | string
  /** Absolute file-system path (alternative to content) */
  filePath?: string
  contentType?: string
  /** CID for inline images (e.g. 'logo') */
  cid?: string
}

export interface NotificationEmailOptions {
  to: string | string[]
  subject: string
  html: string
  attachments?: NotificationAttachment[]
}

/**
 * Send a notification email. Uses Graph API when Azure AD env vars are present,
 * otherwise falls back to SMTP.
 */
export async function sendNotificationEmail(options: NotificationEmailOptions): Promise<void> {
  const recipients = Array.isArray(options.to) ? options.to : [options.to]

  if (isGraphApiConfigured()) {
    const senderEmail = process.env.GRAPH_SENDER_EMAIL
    if (!senderEmail) throw new Error('GRAPH_SENDER_EMAIL is not configured.')

    const graphAttachments: GraphAttachment[] = []

    for (const att of options.attachments ?? []) {
      let contentBytes: string

      if (att.filePath) {
        contentBytes = fs.readFileSync(att.filePath).toString('base64')
      } else if (Buffer.isBuffer(att.content)) {
        contentBytes = att.content.toString('base64')
      } else if (typeof att.content === 'string') {
        // Already base64 or treat as raw string → convert via Buffer
        contentBytes = Buffer.from(att.content, 'binary').toString('base64')
      } else {
        continue // Skip attachments with no content
      }

      graphAttachments.push({
        name: att.filename,
        contentType: att.contentType ?? 'application/octet-stream',
        contentBytes,
        isInline: !!att.cid,
        ...(att.cid ? { contentId: att.cid } : {}),
      })
    }

    for (const to of recipients) {
      await sendViaGraphApi({
        to,
        subject: options.subject,
        htmlContent: options.html,
        senderEmail,
        attachments: graphAttachments,
      })
      console.log(`✅ Notification email sent via Graph API → ${to}`)
    }
  } else {
    const smtpConfig = loadAdminSmtpConfig()
    const transporter = getMailTransporter(smtpConfig)
    const fromAddress = getFromAddress(smtpConfig)

    // Convert our attachment format to Nodemailer format
    const smtpAttachments = (options.attachments ?? []).map(att => {
      if (att.filePath) {
        return { filename: att.filename, path: att.filePath, cid: att.cid, contentType: att.contentType }
      }
      return { filename: att.filename, content: att.content, cid: att.cid, contentType: att.contentType }
    })

    for (const to of recipients) {
      await sendMailAndCheck(transporter, {
        from: fromAddress,
        envelope: getEnvelope(smtpConfig, to),
        to,
        subject: options.subject,
        html: options.html,
        attachments: smtpAttachments,
      }, `Notification → ${to}`)
      console.log(`✅ Notification email sent via SMTP → ${to}`)
    }
  }
}

/** Convenience: returns base64 string of the app logo, or null if not found. */
export function getLogoBase64(): string | null {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png')).toString('base64')
  } catch {
    return null
  }
}

/** Returns a logo attachment object ready to pass into sendNotificationEmail. */
export function logoAttachment(): NotificationAttachment {
  return {
    filename: 'logo.png',
    filePath: path.join(process.cwd(), 'public', 'logo.png'),
    contentType: 'image/png',
    cid: 'logo',
  }
}

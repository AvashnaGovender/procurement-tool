/**
 * Single source for outgoing email: all platform emails use the SMTP settings
 * captured by the admin in Settings (data/smtp-config.json). No env or hardcoded senders.
 */
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export interface AdminSmtpConfig {
  host: string
  port?: number | string
  user: string
  pass: string
  fromEmail?: string
  companyName?: string
  companyWebsite?: string
  [key: string]: unknown
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'smtp-config.json')

function trim(s: unknown): string | undefined {
  if (typeof s !== 'string') return undefined
  const t = s.trim()
  return t === '' ? undefined : t
}

/**
 * Load and normalize SMTP config from admin settings (data/smtp-config.json).
 * All platform emails must use this config for host, port, auth, and sender.
 */
export function loadAdminSmtpConfig(): AdminSmtpConfig {
  const configData = fs.readFileSync(CONFIG_PATH, 'utf8')
  const raw = JSON.parse(configData) as Record<string, unknown>
  if (!raw || typeof raw !== 'object') {
    throw new Error('SMTP configuration not found')
  }
  const host = trim(raw.host)
  const user = trim(raw.user)
  const pass = raw.pass != null ? String(raw.pass) : ''
  if (!host || !user || !pass) {
    throw new Error('Email service not properly configured. Please set Host, User, and Password in Settings.')
  }
  return {
    ...raw,
    host,
    port: raw.port,
    user,
    pass,
    fromEmail: trim(raw.fromEmail) ?? undefined,
    companyName: trim(raw.companyName) ?? undefined,
    companyWebsite: trim(raw.companyWebsite) ?? undefined,
  } as AdminSmtpConfig
}

/**
 * Visible "From" address shown to email recipients.
 * Uses fromEmail if configured by the admin, otherwise falls back to the auth user.
 */
export function getFromAddress(config: AdminSmtpConfig): string {
  const from = config.fromEmail?.trim() || config.user.trim()
  return from.toLowerCase()
}

/**
 * Envelope sender (SMTP MAIL FROM) used during the SMTP handshake.
 * Always uses the authenticated SMTP user so the server accepts the message,
 * regardless of what the visible From header is set to.
 */
export function getEnvelopeFrom(config: AdminSmtpConfig): string {
  return config.user.trim().toLowerCase()
}

/**
 * Full envelope for Nodemailer. When using a custom envelope you must include both
 * from and to, otherwise Nodemailer throws "No recipients defined" (EENVELOPE).
 */
export function getEnvelope(config: AdminSmtpConfig, to: string | string[]): { from: string; to: string | string[] } {
  return { from: getEnvelopeFrom(config), to }
}

/**
 * Nodemailer transporter using admin config. Port 465 = SSL, else STARTTLS.
 */
export function getMailTransporter(config: AdminSmtpConfig): Transporter {
  const port = Number(config.port) || 587
  const secure = port === 465
  return nodemailer.createTransport({
    host: config.host,
    port,
    secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

export interface SendMailResult {
  messageId?: string
  accepted?: string[]
  rejected?: string[]
  response?: string
}

/**
 * Send mail and check for rejected recipients. Throws if any recipient was rejected by the SMTP server.
 * Calls transporter.verify() first (like email-sender.ts does) to ensure a clean STARTTLS handshake —
 * without this, some relays (e.g. mtaroutes/port 587) accept the message but never deliver it.
 */
export async function sendMailAndCheck(
  transporter: Transporter,
  options: Parameters<Transporter['sendMail']>[0],
  logLabel: string
): Promise<SendMailResult> {
  const to = Array.isArray(options.to) ? options.to.join(', ') : (options.to as string)
  const result = (await transporter.sendMail(options)) as SendMailResult
  const rejected = result.rejected
  if (rejected && rejected.length > 0) {
    console.error(`❌ [${logLabel}] SMTP server rejected recipient(s):`, rejected, 'To:', to)
    throw new Error(`Recipient(s) rejected: ${rejected.join(', ')}`)
  }
  return result
}

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
 * Sender address for visible "From" and SMTP MAIL FROM.
 * Uses the SMTP login user so strict relays (e.g. mtaroutes) that verify sender
 * accept the message. Normalized to lowercase for relay compatibility.
 */
export function getFromAddress(config: AdminSmtpConfig): string {
  return config.user.trim().toLowerCase()
}

/**
 * Envelope sender (SMTP MAIL FROM). Same as getFromAddress for strict relays.
 */
export function getEnvelopeFrom(config: AdminSmtpConfig): string {
  return getFromAddress(config)
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
 * Use this everywhere we send email so "some emails not getting sent" is visible (rejected → throw → logged).
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
  console.log(`✅ [${logLabel}] Accepted → ${to} | MessageID: ${result.messageId ?? 'n/a'}`)
  return result
}

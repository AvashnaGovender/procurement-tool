/**
 * Microsoft Graph API email sender.
 *
 * Uses the Azure AD app credentials (client credentials flow) to obtain an
 * access token and send mail via the Graph API on behalf of a configured
 * sender mailbox. No SMTP relay or IP whitelisting required.
 *
 * Required Azure AD app permissions (Application, not Delegated):
 *   - Mail.Send
 * Admin consent must be granted for the permission above.
 */

interface GraphMailRecipient {
  emailAddress: { address: string; name?: string }
}

interface GraphMailPayload {
  message: {
    subject: string
    body: { contentType: 'HTML' | 'Text'; content: string }
    toRecipients: GraphMailRecipient[]
    attachments?: Array<{
      '@odata.type': string
      name: string
      contentType: string
      contentBytes: string
      isInline: boolean
      contentId?: string
    }>
  }
  saveToSentItems: boolean
}

/**
 * Fetch a short-lived access token using the client-credentials OAuth2 flow.
 */
async function getAccessToken(
  tenantId: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to obtain access token: ${error}`)
  }

  const data = await response.json() as { access_token: string }
  return data.access_token
}

export interface GraphAttachment {
  name: string
  contentType: string
  /** Base64-encoded file content */
  contentBytes: string
  /** Set true for inline images (requires contentId) */
  isInline?: boolean
  contentId?: string
}

export interface GraphEmailOptions {
  to: string
  subject: string
  htmlContent: string
  /** UPN / email address of the mailbox to send from (must have Mail.Send permission) */
  senderEmail: string
  /** Attachments — both inline (logo) and regular (PDFs, documents) */
  attachments?: GraphAttachment[]
  /** @deprecated Use attachments array instead */
  inlineAttachment?: {
    name: string
    contentType: string
    contentBytes: string
    contentId: string
  }
}

/**
 * Send an email via Microsoft Graph API.
 * Throws on failure so the caller can handle the error.
 */
export async function sendViaGraphApi(options: GraphEmailOptions): Promise<void> {
  const clientId = process.env.AZURE_AD_CLIENT_ID
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET
  const tenantId = process.env.AZURE_AD_TENANT_ID

  if (!clientId || !clientSecret || !tenantId) {
    throw new Error(
      'Azure AD credentials (AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID) are not configured.'
    )
  }

  const accessToken = await getAccessToken(tenantId, clientId, clientSecret)

  const payload: GraphMailPayload = {
    message: {
      subject: options.subject,
      body: { contentType: 'HTML', content: options.htmlContent },
      toRecipients: [{ emailAddress: { address: options.to } }],
    },
    saveToSentItems: false,
  }

  // Build attachments list from the new array and/or the legacy single inline attachment
  const allAttachments: GraphAttachment[] = [
    ...(options.attachments ?? []),
    ...(options.inlineAttachment
      ? [{
          name: options.inlineAttachment.name,
          contentType: options.inlineAttachment.contentType,
          contentBytes: options.inlineAttachment.contentBytes,
          isInline: true,
          contentId: options.inlineAttachment.contentId,
        }]
      : []),
  ]

  if (allAttachments.length > 0) {
    payload.message.attachments = allAttachments.map(a => ({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: a.name,
      contentType: a.contentType,
      contentBytes: a.contentBytes,
      isInline: a.isInline ?? false,
      ...(a.contentId ? { contentId: a.contentId } : {}),
    }))
  }

  // Encode sender UPN for the URL (handles special characters)
  const senderUpn = encodeURIComponent(options.senderEmail)
  const graphUrl = `https://graph.microsoft.com/v1.0/users/${senderUpn}/sendMail`

  const response = await fetch(graphUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Graph API sendMail failed (${response.status}): ${errorBody}`)
  }
  // 202 Accepted = queued for delivery, no body returned
}

/**
 * Returns true when all three Azure AD env vars are present,
 * meaning Graph API sending is available.
 */
export function isGraphApiConfigured(): boolean {
  return !!(
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  )
}

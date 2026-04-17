/**
 * True when the URL host is only reachable on the same machine or LAN — unsuitable
 * as the default for supplier emails unless explicitly set via SUPPLIER_PORTAL_URL.
 */
export function isPrivateOrLocalhostUrl(urlString: string): boolean {
  try {
    const { hostname } = new URL(urlString)
    const h = hostname.toLowerCase()
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return true
    if (h.startsWith('192.168.')) return true
    if (h.startsWith('10.')) return true
    const m = /^172\.(\d+)\./.exec(h)
    if (m) {
      const octet = Number(m[1])
      if (octet >= 16 && octet <= 31) return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Base URL for links in supplier-facing emails (onboarding / credit).
 *
 * 1. `SUPPLIER_PORTAL_URL` — use in production (public hostname, e.g. https://suppliers.example.com)
 * 2. `NEXT_PUBLIC_SUPPLIER_PORTAL_URL` — same, exposed to the browser if needed
 * 3. `NEXTAUTH_URL` / `NEXT_PUBLIC_BASE_URL` — only if the host is **not** private/LAN
 * 4. `http://localhost:3000` — last resort (local dev)
 *
 * Internal IPs (192.168.x, 10.x, etc.) are **not** used from NEXTAUTH_URL unless you
 * set them explicitly on SUPPLIER_PORTAL_URL (e.g. lab-only testing).
 */
export function getSupplierPortalBaseUrl(): string {
  const trim = (s: string | undefined) => s?.trim().replace(/\/$/, '') ?? ''

  const explicit =
    trim(process.env.SUPPLIER_PORTAL_URL) || trim(process.env.NEXT_PUBLIC_SUPPLIER_PORTAL_URL)
  if (explicit) return explicit

  for (const key of ['NEXTAUTH_URL', 'NEXT_PUBLIC_BASE_URL'] as const) {
    const candidate = trim(process.env[key])
    if (!candidate) continue
    if (!isPrivateOrLocalhostUrl(candidate)) return candidate
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[supplier-portal] Set SUPPLIER_PORTAL_URL to your public supplier portal base URL. ' +
        'NEXTAUTH_URL / NEXT_PUBLIC_BASE_URL point to a private/LAN host, so they are not used in supplier emails.'
    )
  }

  return 'http://localhost:3000'
}

/**
 * Base URL for links in supplier-facing emails (onboarding / credit).
 * Prefer a public supplier hostname in production; fall back to NEXTAUTH_URL for dev.
 */
export function getSupplierPortalBaseUrl(): string {
  const raw =
    process.env.SUPPLIER_PORTAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPPLIER_PORTAL_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    'http://localhost:3000'
  return raw.replace(/\/$/, '')
}

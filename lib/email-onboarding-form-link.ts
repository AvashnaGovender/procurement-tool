import { getSupplierPortalBaseUrl } from '@/lib/supplier-portal/public-url'

/**
 * Builds the supplier onboarding URL and HTML button used in invitation emails.
 */
export function buildOnboardingFormLinkParts(onboardingToken: string): {
  formUrl: string
  formLinkHtml: string
  plainFallbackHtml: string
} {
  const baseUrl = getSupplierPortalBaseUrl()
  const formUrl = `${baseUrl}/supplier-onboarding-form?token=${encodeURIComponent(onboardingToken)}`
  const formLinkHtml = `<div style="text-align: center; margin: 30px 0;"><a href="${formUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 8px; border: none;">Complete Registration Form</a></div>`
  const plainFallbackHtml = `<p style="margin-top:16px;font-size:14px;color:#374151;line-height:1.5;">If the button does not work, copy and paste this link into your browser:<br/><a href="${formUrl}" style="color:#2563eb;word-break:break-all;">${formUrl}</a></p>`
  return { formUrl, formLinkHtml, plainFallbackHtml }
}

/**
 * Replaces known placeholders with the registration button. If the final body
 * still does not contain the URL (no placeholder in the template), appends the
 * button and a plain-text link so suppliers always receive a working link.
 *
 * @param emailContentWithBr - Body after newlines were converted to &lt;br /&gt;
 */
export function injectOnboardingFormLinkIntoEmailBody(
  emailContentWithBr: string,
  onboardingToken: string
): string {
  const { formUrl, formLinkHtml, plainFallbackHtml } = buildOnboardingFormLinkParts(onboardingToken)

  let out = emailContentWithBr
    .replace(/{formLink}/g, formLinkHtml)
    .replace(/\{formLink\}/g, formLinkHtml)
    .replace(/\{\{\s*formLink\s*\}\}/gi, formLinkHtml)
    .replace(/\[Supplier Registration Portal Link\]/g, formLinkHtml)
    .replace(/%FORM_LINK%/gi, formLinkHtml)

  if (!out.includes(formUrl)) {
    out = `${out}<br /><br />${formLinkHtml}${plainFallbackHtml}`
  }

  return out
}

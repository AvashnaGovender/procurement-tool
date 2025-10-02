import { SettingsHeader } from "@/components/settings/settings-header"
import { SMTPConfiguration } from "@/components/settings/smtp-configuration"
import { EmailTemplates } from "@/components/settings/email-templates"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <SMTPConfiguration />
          <EmailTemplates />
        </div>
      </main>
    </div>
  )
} 
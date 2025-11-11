import { SettingsHeader } from "@/components/settings/settings-header"
import { SMTPConfiguration } from "@/components/settings/smtp-configuration"
import { DelegationManagement } from "@/components/settings/delegation-management"
import { ReminderConfiguration } from "@/components/settings/reminder-configuration"
import { UserManagement } from "@/components/settings/user-management"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* User Management */}
          <div className="bg-card border border-border rounded-lg p-6">
            <UserManagement />
          </div>

          {/* Reminder Configuration */}
          <div className="bg-card border border-border rounded-lg p-6">
            <ReminderConfiguration />
          </div>

          {/* Delegation Management */}
          <div className="bg-card border border-border rounded-lg p-6">
            <DelegationManagement />
          </div>

          {/* Email Configuration */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Email Configuration</h2>
                <p className="text-sm text-muted-foreground">
                  Configure SMTP settings for sending emails
                </p>
              </div>
            </div>
            <SMTPConfiguration />
          </div>

        </div>
      </main>
    </div>
  )
}

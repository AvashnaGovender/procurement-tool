# Fix Reminder System - Quick Guide

## Problem
The reminder system shows "configured intervals below" but displays nothing because the database doesn't have any reminder configurations yet.

## Solution

### Step 1: Initialize Reminder Configurations

On the **server**, run this command:

```powershell
cd C:\procurement\procurement-app

npx tsx scripts\init-reminder-configs.ts
```

This will create 5 default reminder configurations:
1. Supplier Document Submission
2. Manager Approval Pending
3. Procurement Approval Pending
4. Buyer Review Pending
5. Supplier Revision Pending

### Step 2: Verify

1. **Refresh** the Settings → Reminder Configuration page in your browser
2. You should now see 5 cards showing all the reminder types
3. Each will have:
   - Enable/Disable toggle
   - 1st, 2nd, and Final reminder intervals (in hours)
   - Save button (appears when you make changes)

### Step 3: Test Reminders

Click the **"Trigger Reminder Check Now"** button to test if reminders work.

The system will:
- Check for pending supplier onboardings (no documents submitted)
- Check for pending manager approvals
- Check for pending procurement approvals
- Check for pending buyer reviews
- Send emails if any reminders are due

### Step 4: Set Up Automated Daily Reminders (Optional)

Create a Windows scheduled task to run reminders automatically every day:

```powershell
# 1. Create a script file
notepad C:\procurement\trigger-reminders.ps1
```

**Paste this content:**

```powershell
# Load environment variables
Get-Content "C:\procurement\procurement-app\.env" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

$baseUrl = $env:NEXTAUTH_URL
$cronSecret = if ($env:CRON_SECRET) { $env:CRON_SECRET } else { "change-me-in-production" }

Write-Host "🕐 Triggering reminder check at $(Get-Date)"

try {
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/api/reminders/trigger" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $cronSecret" } `
        -ContentType "application/json"
    
    Write-Host "✅ Success: $($response | ConvertTo-Json)"
} catch {
    Write-Host "❌ Error: $_"
}
```

**Save and close.**

```powershell
# 2. Create scheduled task (run as Administrator)
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File C:\procurement\trigger-reminders.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At "09:00AM"

$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

Register-ScheduledTask `
    -TaskName "Procurement Reminder Check" `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Daily reminder check for procurement system"
```

```powershell
# 3. Test it
Start-ScheduledTask -TaskName "Procurement Reminder Check"
```

## Done!

Your reminder system is now:
✅ Configured with default intervals
✅ Visible in the UI
✅ Ready to send reminders
✅ (Optional) Scheduled to run daily

---

## Customizing Reminders

Once configured, you can adjust the reminder intervals in the UI:

1. Log in as **admin**
2. Go to **Settings → Reminder Configuration**
3. For any reminder type:
   - Toggle **Enable/Disable**
   - Change **1st Reminder** hours (e.g., 24 = 1 day)
   - Change **2nd Reminder** hours (e.g., 48 = 2 days)
   - Change **Final Reminder** hours (e.g., 72 = 3 days)
4. Click **Save Changes**

---

## Need Help?

See the full guide: `REMINDER_SYSTEM_SETUP.md`


# Reminder System Setup Guide

## Overview

The reminder system automatically sends email notifications to suppliers, managers, and buyers for pending actions. It supports:

- **Supplier Document Submission**: Remind suppliers who haven't uploaded documents
- **Manager Approval Pending**: Remind managers about pending initiation approvals
- **Procurement Approval Pending**: Remind procurement managers about pending approvals
- **Buyer Review Pending**: Remind buyers to review submitted documents
- **Supplier Revision Pending**: Remind suppliers to resubmit after revision requests

---

## Initial Setup

### Step 1: Initialize Reminder Configurations

Run this command on the server to create default reminder configurations in the database:

```powershell
cd C:\procurement\procurement-app
npx tsx scripts\init-reminder-configs.ts
```

**Expected Output:**
```
🔔 Initializing reminder configurations...
✅ Created: SUPPLIER_DOCUMENT_SUBMISSION
✅ Created: MANAGER_APPROVAL_PENDING
✅ Created: PROCUREMENT_APPROVAL_PENDING
✅ Created: BUYER_REVIEW_PENDING
✅ Created: SUPPLIER_REVISION_PENDING

✅ Reminder configurations initialized successfully!

📋 Summary:
   - SUPPLIER_DOCUMENT_SUBMISSION: ✅ Enabled
     Intervals: 24h, 72h, 120h
   - MANAGER_APPROVAL_PENDING: ✅ Enabled
     Intervals: 24h, 48h, 72h
   - PROCUREMENT_APPROVAL_PENDING: ✅ Enabled
     Intervals: 24h, 48h, 72h
   - BUYER_REVIEW_PENDING: ✅ Enabled
     Intervals: 48h, 96h, 144h
   - SUPPLIER_REVISION_PENDING: ✅ Enabled
     Intervals: 48h, 96h, 144h
```

### Step 2: Verify in UI

1. Log in as an **admin** user
2. Go to **Settings → Reminder Configuration**
3. You should now see all 5 reminder types with their configurations

---

## Manual Testing

### Test Reminder Check

In the Settings → Reminder Configuration page, click the **"Trigger Reminder Check Now"** button.

This will:
- Check all pending items (onboardings, approvals, reviews)
- Send reminders based on the configured intervals
- Display a summary of reminders sent

### Check Server Logs

Monitor the server console for debugging:

```powershell
# You should see:
🔔 Starting reminder check...
✓ Sent reminder 1 to supplier@example.com
✓ Sent manager approval reminder 2 to manager@company.com
✅ Reminder check completed: { supplierDocuments: 1, managerApprovals: 1, ... }
```

---

## Automated Scheduling (Production)

For production, set up a scheduled task to run reminders automatically.

### Option 1: Windows Task Scheduler (Recommended)

1. **Create a PowerShell script** (`C:\procurement\trigger-reminders.ps1`):

```powershell
# Load environment variables
Get-Content "C:\procurement\procurement-app\.env" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

$baseUrl = $env:NEXTAUTH_URL
$cronSecret = $env:CRON_SECRET

if (-not $cronSecret) {
    $cronSecret = "change-me-in-production"
}

Write-Host "🕐 Triggering reminder check at $(Get-Date)"

try {
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/api/reminders/trigger" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $cronSecret" } `
        -ContentType "application/json"
    
    Write-Host "✅ Reminder check completed successfully"
    Write-Host "Results: $($response | ConvertTo-Json -Depth 5)"
} catch {
    Write-Host "❌ Error triggering reminders: $_"
}
```

2. **Add CRON_SECRET to .env** (if not already there):

```env
CRON_SECRET=your-secure-random-secret-here
```

3. **Create Windows Scheduled Task**:

```powershell
# Run as Administrator
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

4. **Test the scheduled task**:

```powershell
Start-ScheduledTask -TaskName "Procurement Reminder Check"
```

### Option 2: External Cron Service (If App is Public)

Use services like:
- **EasyCron** (https://www.easycron.com/)
- **Cron-job.org** (https://cron-job.org/)
- **Vercel Cron** (if deployed to Vercel)

**Configuration:**
- **URL**: `https://your-domain.com/api/reminders/trigger`
- **Method**: `POST` or `GET`
- **Headers**: `Authorization: Bearer your-cron-secret`
- **Schedule**: Daily at 9:00 AM

---

## Customizing Reminder Settings

### Via UI (Admin Only)

1. Go to **Settings → Reminder Configuration**
2. For each reminder type, you can:
   - **Enable/Disable**: Toggle the switch
   - **Adjust Intervals**: Change hours for 1st, 2nd, and Final reminders
   - **Example**: For Manager Approvals:
     - 1st Reminder: 24 hours (1 day)
     - 2nd Reminder: 48 hours (2 days)
     - Final Reminder: 72 hours (3 days)
3. Click **"Save Changes"** after modifying

### Via Database (Advanced)

You can also update the `reminder_configurations` table directly:

```sql
-- Example: Change manager approval intervals
UPDATE reminder_configurations
SET 
  "firstReminderAfterHours" = 12,  -- 12 hours instead of 24
  "secondReminderAfterHours" = 36, -- 36 hours instead of 48
  "finalReminderAfterHours" = 60   -- 60 hours instead of 72
WHERE "reminderType" = 'MANAGER_APPROVAL_PENDING';
```

---

## Email Templates

Each reminder type has customizable email templates with placeholders:

### Available Placeholders

#### Supplier Document Submission:
- `{supplierName}` - Supplier contact name
- `{hoursAgo}` - Hours since email was sent
- `{onboardingLink}` - Link to complete onboarding

#### Manager/Procurement Approval:
- `{managerName}` or `{procurementManagerName}` - Approver name
- `{supplierName}` - Supplier company name
- `{requesterName}` - Person who initiated
- `{category}` - Product/Service category
- `{submittedDate}` - Date of submission
- `{hoursAgo}` - Hours pending
- `{approvalsLink}` - Link to approvals page

#### Buyer Review:
- `{buyerName}` - Buyer name
- `{supplierName}` - Supplier company name
- `{submittedDate}` - Date of submission
- `{hoursAgo}` - Hours pending
- `{reviewLink}` - Link to review page

---

## Troubleshooting

### No Reminders Being Sent

1. **Check if configurations exist**:
   ```powershell
   npx tsx scripts\init-reminder-configs.ts
   ```

2. **Check if configurations are enabled**:
   - Log in as admin
   - Go to Settings → Reminder Configuration
   - Ensure toggles are ON (green)

3. **Check if there are pending items**:
   ```sql
   -- Check pending onboardings
   SELECT * FROM supplier_onboardings 
   WHERE "supplierFormSubmitted" = false 
   AND "emailSent" = true;

   -- Check pending manager approvals
   SELECT * FROM manager_approvals WHERE status = 'PENDING';

   -- Check pending procurement approvals
   SELECT * FROM procurement_approvals WHERE status = 'PENDING';
   ```

4. **Check reminder logs**:
   ```sql
   SELECT * FROM reminder_logs ORDER BY "createdAt" DESC LIMIT 20;
   ```

5. **Check server logs** for errors during reminder check

### Reminders Sent Too Frequently

If the same reminder is being sent multiple times, check the `reminder_logs` table. The system should prevent duplicate reminders for the same `reminderType`, `referenceId`, and `reminderCount`.

### Email Not Received

1. **Check SMTP configuration** in `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=noreply@yourcompany.com
   ```

2. **Test email manually**:
   ```powershell
   npx tsx scripts\test-email-send.ts
   ```

3. **Check reminder logs** for failed emails:
   ```sql
   SELECT * FROM reminder_logs WHERE status = 'FAILED';
   ```

---

## Monitoring & Maintenance

### Check Reminder Statistics

View the admin dashboard or query directly:

```sql
-- Reminders sent in the last 7 days
SELECT 
  "reminderType",
  COUNT(*) as sent_count,
  COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_count
FROM reminder_logs
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY "reminderType";
```

### Clean Up Old Logs (Optional)

If the `reminder_logs` table grows too large:

```sql
-- Delete logs older than 90 days
DELETE FROM reminder_logs WHERE "createdAt" < NOW() - INTERVAL '90 days';
```

---

## FAQ

**Q: How often should reminders run?**
A: Once daily (e.g., 9:00 AM) is recommended. Running more frequently may annoy recipients.

**Q: Can I disable specific reminder types?**
A: Yes, toggle them off in Settings → Reminder Configuration.

**Q: Can I customize email content?**
A: Yes, edit the `emailBodyTemplate` field in the database or re-run the init script with your custom templates.

**Q: What if I need a 4th or 5th reminder?**
A: The system currently supports 3 reminders. You would need to modify the code to add more levels.

**Q: Can non-admin users see reminders?**
A: No, only admins can configure reminders. Recipients receive emails automatically.

---

## Support

If you encounter issues:
1. Check server console logs
2. Check `reminder_logs` table for errors
3. Verify SMTP configuration
4. Test manual trigger in the UI

For further assistance, contact your system administrator.


# Automated Reminder System

## Overview
The Reminder System automatically sends email notifications to keep the procurement process moving. It pings suppliers, managers, and buyers when actions are overdue, preventing bottlenecks and delays.

## Reminder Types

### 1. **Supplier Document Submission** 📄
- **Who:** Suppliers who received onboarding emails
- **When:** Haven't uploaded required documents
- **Default Schedule:**
  - 1st reminder: 3 hours after email sent
  - 2nd reminder: 7 hours after email sent
  - Final reminder: 14 hours after email sent

### 2. **Manager Approval Pending** 👔
- **Who:** Managers with pending supplier initiation approvals
- **When:** Haven't approved/rejected initiation requests
- **Default Schedule:**
  - 1st reminder: 3 hours after submission
  - 2nd reminder: 7 hours after submission
  - Final reminder: 14 hours after submission

### 3. **Procurement Approval Pending** 💼
- **Who:** Procurement managers with pending approvals
- **When:** Haven't approved/rejected after manager approval
- **Default Schedule:**
  - 1st reminder: 3 hours after manager approval
  - 2nd reminder: 7 hours after manager approval
  - Final reminder: 14 hours after manager approval

### 4. **Buyer Review Pending** 👀
- **Who:** Buyers who initiated supplier onboarding
- **When:** Supplier submitted documents but buyer hasn't reviewed
- **Default Schedule:**
  - 1st reminder: 3 hours after submission
  - 2nd reminder: 7 hours after submission
  - Final reminder: 14 hours after submission

### 5. **Supplier Revision Pending** 🔄
- **Who:** Suppliers who received revision requests
- **When:** Haven't resubmitted revised documents
- **Default Schedule:**
  - 1st reminder: 3 hours after revision request
  - 2nd reminder: 7 hours after revision request
  - Final reminder: 14 hours after revision request

## Features

### ✅ Smart Reminder Logic
- **No Duplicate Reminders:** System tracks sent reminders to avoid spam
- **Progressive Escalation:** 1st, 2nd, and final reminders with increasing urgency
- **Auto-Skip Completed:** If action is completed, no more reminders sent
- **Configurable Timing:** Adjust hours for each reminder level
- **Enable/Disable:** Turn specific reminder types on/off

### ✅ Comprehensive Tracking
- **Reminder Log:** Every reminder logged with status (sent/failed)
- **Recipient Tracking:** Know who received which reminders
- **Metadata:** Additional context stored for each reminder
- **Error Handling:** Failed reminders logged with error messages

### ✅ Email Content
- **Professional Templates:** Pre-configured email templates
- **Dynamic Content:** Personalized with names, dates, links
- **Actionable:** Direct links to take action
- **Clear Subject Lines:** Recipients know what it's about

## Configuration

### Access Settings
1. Go to **Settings** page (admin only)
2. Navigate to **Reminder System** section at the top

### Configure Reminder Timings
For each reminder type, you can set:

```
┌─────────────────────────────────┐
│ Supplier Document Submission    │
├─────────────────────────────────┤
│ 1st Reminder: [3] hours        │
│ 2nd Reminder: [7] hours        │
│ Final Reminder: [14] hours     │
│ Enabled: [✓]                   │
└─────────────────────────────────┘
```

- **Adjust Numbers:** Change hours to match your business needs
- **Toggle Enable/Disable:** Turn reminders on/off per type
- **Save Changes:** Click "Save Changes" after modifications

### Manual Trigger
- **Button:** "Trigger Reminder Check Now"
- **Use Case:** Test reminders or send immediate notifications
- **Action:** Checks all pending items and sends appropriate reminders

## How It Works

### Automated Check Process

```
┌──────────────────────────────┐
│   Daily Cron Job Runs        │
│   (or Manual Trigger)        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Check All Configurations    │
│  (Only Enabled Ones)         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Query Database for:         │
│  - Pending onboardings       │
│  - Pending approvals         │
│  - Pending reviews           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Calculate Hours Overdue     │
│  Compare with Config         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Determine Reminder Count    │
│  (1st, 2nd, or Final)        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Check if Already Sent       │
│  (Prevent Duplicates)        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Send Email Reminder         │
│  Log to Database             │
└──────────────────────────────┘
```

### Example Timeline

**Scenario: Supplier Document Submission**
```
Hour 0:  Email sent to supplier
Hour 1:  (no reminder - too soon)
Hour 2:  (no reminder - too soon)
Hour 3:  ⏰ 1st Reminder sent
Hour 4-6: (no reminder - waiting)
Hour 7:  ⏰ 2nd Reminder sent
Hour 8-13: (no reminder - waiting)
Hour 14: ⏰ Final Reminder sent
```

If supplier submits at Hour 5, no more reminders sent ✅

## Setup for Production

### Option 1: External Cron Service (Recommended)

Use a free cron service like:
- **cron-job.org** (free, reliable)
- **EasyCron** (free tier available)
- **Zapier** (scheduled tasks)

**Setup Steps:**
1. Add to `.env`:
   ```env
   CRON_SECRET=your-secret-token-here-change-me
   ```

2. Create cron job:
   - **URL:** `https://your-domain.com/api/reminders/trigger`
   - **Method:** GET or POST
   - **Header:** `Authorization: Bearer your-secret-token-here`
   - **Schedule:** Daily at 9:00 AM

### Option 2: Vercel Cron (If Deployed on Vercel)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/reminders/trigger",
    "schedule": "0 9 * * *"
  }]
}
```

### Option 3: Server Cron Job

On your server, add to crontab:
```bash
# Run every day at 9 AM
0 9 * * * curl -X POST -H "Authorization: Bearer YOUR_SECRET" https://your-domain.com/api/reminders/trigger
```

## API Endpoints

### `/api/reminders/check` (POST)
- **Purpose:** Check all pending items and send reminders
- **Auth:** Internal use
- **Returns:** Count of reminders sent per type

### `/api/reminders/trigger` (GET/POST)
- **Purpose:** Cron endpoint to trigger reminder check
- **Auth:** Bearer token (CRON_SECRET)
- **Returns:** Results of reminder check

### `/api/reminders/config` (GET)
- **Purpose:** Fetch reminder configurations
- **Auth:** Admin only
- **Returns:** All reminder configurations

### `/api/reminders/config` (PUT)
- **Purpose:** Update reminder configuration
- **Auth:** Admin only
- **Body:** Configuration updates

## Database Schema

### ReminderConfiguration
```typescript
{
  id: string
  reminderType: ReminderConfigType
  firstReminderAfterHours: number
  secondReminderAfterHours: number
  finalReminderAfterHours: number
  isEnabled: boolean
  emailSubjectTemplate: string
  emailBodyTemplate: string
}
```

### ReminderLog
```typescript
{
  id: string
  reminderType: ReminderConfigType
  referenceId: string          // ID of the thing being reminded about
  referenceType: string         // "SupplierOnboarding", "ManagerApproval", etc.
  recipientEmail: string
  recipientName: string
  reminderCount: number         // 1, 2, or 3
  subject: string
  content: string
  status: ReminderStatus        // PENDING, SENT, FAILED
  sentAt: DateTime
  errorMessage: string
}
```

## Monitoring & Troubleshooting

### Check Reminder Logs
```sql
-- See recent reminders sent
SELECT * FROM reminder_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- Check failed reminders
SELECT * FROM reminder_logs 
WHERE status = 'FAILED'
ORDER BY created_at DESC;

-- Count reminders by type
SELECT reminder_type, COUNT(*) 
FROM reminder_logs 
WHERE status = 'SENT'
GROUP BY reminder_type;
```

### Common Issues

**1. No Reminders Being Sent**
- ✓ Check if cron job is running
- ✓ Verify SMTP configuration
- ✓ Confirm reminder types are enabled
- ✓ Check if items are actually overdue

**2. Duplicate Reminders**
- ✓ System should prevent this automatically
- ✓ Check reminder_logs for duplicate entries
- ✓ Verify cron isn't running multiple times

**3. Failed Emails**
- ✓ Check SMTP settings in Settings page
- ✓ Review error_message in reminder_logs
- ✓ Verify recipient email addresses are valid

### Manual Testing

1. **Trigger Manual Check:**
   - Go to Settings → Reminder System
   - Click "Trigger Reminder Check Now"
   - Check results in console/logs

2. **Create Test Scenario:**
   ```sql
   -- Create a test supplier onboarding from 10 hours ago
   UPDATE supplier_onboardings 
   SET email_sent_at = NOW() - INTERVAL '10 hours'
   WHERE id = 'test-id';
   ```
   
3. **Run Check:**
   - Trigger manual check
   - Verify 2nd reminder is sent (7-10 hours)

## Email Templates

### Template Variables

Each reminder type supports these variables:

**Supplier Document Submission:**
- `{supplierName}` - Supplier company name
- `{hoursAgo}` - Hours since email sent
- `{onboardingLink}` - Direct link to form

**Manager/Procurement Approval:**
- `{managerName}` / `{procurementManagerName}` - Approver name
- `{supplierName}` - Supplier being approved
- `{requesterName}` - Who requested onboarding
- `{category}` - Product/service category
- `{submittedDate}` - When submitted
- `{hoursAgo}` - Hours pending
- `{approvalsLink}` - Link to approvals page

**Buyer Review:**
- `{buyerName}` - Buyer name
- `{supplierName}` - Supplier name
- `{submittedDate}` - When documents submitted
- `{hoursAgo}` - Hours pending review
- `{reviewLink}` - Direct link to supplier details

### Customizing Templates

Currently, templates are set in database during seed. To customize:

1. **Update Seed Script:**
   - Edit `scripts/seed-reminder-config.ts`
   - Modify `emailSubjectTemplate` and `emailBodyTemplate`
   - Re-run seed script

2. **Direct Database Update:**
   ```sql
   UPDATE reminder_configurations 
   SET email_subject_template = 'Your New Subject',
       email_body_template = 'Your new body with {variables}'
   WHERE reminder_type = 'SUPPLIER_DOCUMENT_SUBMISSION';
   ```

## Best Practices

### Timing Configuration
- **Too Frequent:** Annoys recipients, reduces urgency
- **Too Rare:** Process stalls, delays increase
- **Recommended:** Start with defaults, adjust based on feedback

### Enable/Disable Strategy
- **Enable All Initially:** See what volume is
- **Adjust Gradually:** Disable if overwhelming
- **Monitor Metrics:** Track completion rates

### Escalation
- **1st Reminder:** Gentle nudge
- **2nd Reminder:** More urgent tone
- **Final Reminder:** Clearly state importance

### Cron Timing
- **Best Time:** Early morning (8-9 AM)
- **Reason:** Recipients see first thing
- **Avoid:** Late night, weekends

## Metrics & Analytics

Track reminder effectiveness:

```sql
-- Reminder effectiveness
SELECT 
  reminder_type,
  AVG(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as success_rate,
  COUNT(*) as total_sent
FROM reminder_logs
GROUP BY reminder_type;

-- Response times after reminder
-- (Requires joining with completion timestamps)
```

## Future Enhancements

Potential improvements:
- **Reminder History in UI:** Show sent reminders per item
- **Custom Templates per Type:** Edit templates in Settings UI
- **Slack/Teams Integration:** Send reminders via chat
- **Reminder Digest:** Daily summary of pending items
- **Smart Timing:** Send at recipient's preferred time
- **A/B Testing:** Test different subject lines
- **Escalation Rules:** Notify manager after X reminders
- **Reminder Analytics:** Dashboard showing effectiveness

## Support

### Testing Reminders
```bash
# Manual trigger via curl
curl -X POST \
  -H "Content-Type: application/json" \
  https://your-domain.com/api/reminders/check
```

### Viewing Logs
```bash
# Check application logs
tail -f logs/reminders.log
```

### Questions?
- Check reminder_logs table for sent reminders
- Review reminder_configurations for current settings
- Test with manual trigger button in Settings
- Verify SMTP configuration is working

---

**Remember:** Restart your dev server after database changes to load new Prisma types!


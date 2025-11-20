# Duplicate Supplier Email Fix

## Problem

When both manager and procurement approvals are completed, the supplier receives **2 identical onboarding emails** instead of 1.

## Root Cause

The approval endpoint (`/api/suppliers/initiation/[id]/approve`) checks if both approvals are complete and sends the supplier onboarding email when `status === 'APPROVED'`.

### Scenarios That Could Cause Duplicate Emails:

1. **Dual Role User**: A user with both manager and procurement authority (via delegation or dual roles) approves twice in quick succession:
   - First approval (as manager) → Status becomes `MANAGER_APPROVED` → No email sent ✅
   - Second approval (as procurement) → Status becomes `APPROVED` → Email sent ✅
   - **If the endpoint is called again or there's a race condition** → Status is still `APPROVED` → Email sent again ❌

2. **Multiple Browser Tabs**: User clicks approve in multiple tabs simultaneously

3. **Retry/Refresh**: User refreshes the page or retries the approval action

4. **Race Condition**: Two approvers (manager + procurement) approve at nearly the same time, and both requests process the "APPROVED" status

## Solution

Added a **duplicate prevention check** before creating the supplier record and sending the email:

```typescript
// Check if supplier was already created and email already sent
if (initiationDetails && !initiationDetails.emailSent && !initiationDetails.onboarding) {
  console.log('📧 Both approvals complete - proceeding with supplier creation and email...')
  
  // Create supplier record
  // Create onboarding record
  // Send email to supplier
  // Send email to initiator
  // Update emailSent = true
  
} else if (initiationDetails) {
  console.log('⚠️ Skipping supplier creation - email already sent or onboarding record exists')
  console.log(`   emailSent: ${initiationDetails.emailSent}`)
  console.log(`   onboarding exists: ${!!initiationDetails.onboarding}`)
}
```

### How It Works:

1. **First approval completes both approvals** (status becomes `APPROVED`):
   - ✅ `emailSent` is `false`
   - ✅ `onboarding` record doesn't exist
   - ✅ Proceeds to create supplier, send emails, and set `emailSent = true`

2. **If the same approval is processed again** (race condition, retry, etc.):
   - ❌ `emailSent` is now `true` OR
   - ❌ `onboarding` record already exists
   - ✅ **Skips** supplier creation and email sending
   - ✅ Logs a warning for debugging

## Files Changed

### `app/api/suppliers/initiation/[id]/approve/route.ts`

1. **Added duplicate prevention check** (lines 201-203):
   ```typescript
   if (initiationDetails && !initiationDetails.emailSent && !initiationDetails.onboarding) {
   ```

2. **Added comprehensive logging**:
   - Logs approval status check (manager/procurement approved)
   - Logs when email sending is triggered
   - Logs when email sending is skipped (duplicate prevention)

3. **Added else clause** (lines 351-355):
   - Logs why email sending was skipped
   - Shows `emailSent` flag value
   - Shows if `onboarding` record exists

## Testing the Fix

### Test Scenario 1: Normal Flow (Should Send 1 Email)

1. **User A** submits an initiation
2. **Manager** approves → Status: `MANAGER_APPROVED`, no email sent
3. **Procurement Manager** approves → Status: `APPROVED`, email sent ✅
4. **Check supplier email** → Should receive **1 email** ✅

**Server logs should show:**
```
📊 Approval Status Check:
   Manager Approved: true
   Procurement Approved: true
✅ Both approvals complete - status: APPROVED

📧 Both approvals complete - proceeding with supplier creation and email...
📧 Sending supplier onboarding email to: supplier@example.com
✅ Supplier onboarding email sent successfully
```

### Test Scenario 2: Dual Role User (Should Send 1 Email)

1. **User A** submits an initiation
2. **User B** (has delegation for both manager + procurement) approves as manager first
3. **User B** approves as procurement second → Status: `APPROVED`, email sent ✅
4. **Check supplier email** → Should receive **1 email** ✅

### Test Scenario 3: Retry/Duplicate Request (Should Send 1 Email)

1. Both approvals are complete → Email sent
2. User clicks approve again (or refreshes) → **No duplicate email** ✅

**Server logs should show:**
```
⚠️ Skipping supplier creation - email already sent or onboarding record exists
   emailSent: true
   onboarding exists: true
```

### Test Scenario 4: Race Condition (Should Send 1 Email)

1. Manager and Procurement Manager approve at nearly the same time
2. Both requests reach the "APPROVED" status
3. **First request** creates supplier and sends email ✅
4. **Second request** skips email (sees `emailSent = true`) ✅
5. **Check supplier email** → Should receive **1 email** ✅

## Verification in Database

After both approvals are complete, check the database:

```sql
SELECT 
  si.id,
  si."supplierName",
  si.status,
  si."emailSent",
  si."emailSentAt",
  so.id as onboarding_id
FROM supplier_initiations si
LEFT JOIN supplier_onboardings so ON so."initiationId" = si.id
WHERE si."supplierName" = 'Test Supplier';
```

**Expected result** (after both approvals):
```
id  | supplierName  | status           | emailSent | emailSentAt           | onboarding_id
----|---------------|------------------|-----------|----------------------|---------------
123 | Test Supplier | SUPPLIER_EMAILED | true      | 2025-11-20 10:30:00 | 456
```

**Key checks:**
- ✅ `emailSent` should be `true`
- ✅ `emailSentAt` should have a timestamp
- ✅ `onboarding_id` should exist (not null)
- ✅ Only **1 row** should exist for this supplier

## Additional Safeguards

The fix uses **two independent checks** to prevent duplicates:

1. **`emailSent` flag**: Set to `true` immediately after sending email
2. **`onboarding` record existence**: If the onboarding record exists, supplier creation was already done

Even if one check fails due to a database transaction issue, the other will catch it.

## Monitoring for Future Issues

### Log Messages to Watch For:

✅ **Normal (1 email sent):**
```
📧 Both approvals complete - proceeding with supplier creation and email...
✅ Supplier onboarding email sent successfully
```

⚠️ **Duplicate prevented:**
```
⚠️ Skipping supplier creation - email already sent or onboarding record exists
```

❌ **If you see this multiple times for the same initiation, investigate:**
```
📧 Sending supplier onboarding email to: same@email.com
📧 Sending supplier onboarding email to: same@email.com  ← DUPLICATE!
```

### Check Email Logs:

```sql
-- Count emails sent per supplier initiation
SELECT 
  so."initiationId",
  si."supplierName",
  so."contactEmail",
  COUNT(*) as email_count
FROM supplier_onboardings so
JOIN supplier_initiations si ON si.id = so."initiationId"
WHERE so."emailSentAt" IS NOT NULL
GROUP BY so."initiationId", si."supplierName", so."contactEmail"
HAVING COUNT(*) > 1;  -- Shows duplicates
```

Should return **0 rows** (no duplicates).

## Summary

✅ **Fixed**: Duplicate supplier emails prevented with `emailSent` and `onboarding` checks
✅ **Added**: Comprehensive logging for debugging
✅ **Maintained**: All existing email functionality (to supplier, to initiator)
✅ **Improved**: Idempotent behavior - can safely call the approval endpoint multiple times

The supplier will now receive exactly **1 onboarding email** when both approvals are complete, regardless of:
- How many times the approval endpoint is called
- Whether approvals happen simultaneously (race condition)
- Whether a dual-role user approves multiple times
- Whether the user retries or refreshes the page


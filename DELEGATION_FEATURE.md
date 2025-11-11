# Approval Delegation System

## Overview
The Approval Delegation System allows users to delegate their approval authority to other users during absences (vacation, sick leave, business trips, etc.). This ensures business continuity and prevents approval bottlenecks.

## Features Implemented

### ✅ 1. Database Schema
**Location:** `prisma/schema.prisma`

- Added `UserDelegation` model to track delegations
- Added `DelegationType` enum for specific delegation types
- Updated `User` model with delegation relationships

**Delegation Types:**
- `ALL_APPROVALS` - Delegate all approval types
- `MANAGER_APPROVALS` - Only manager approvals for supplier initiations
- `PROCUREMENT_APPROVALS` - Only procurement manager approvals
- `REQUISITION_APPROVALS` - Only requisition approvals
- `CONTRACT_APPROVALS` - Only contract approvals

### ✅ 2. API Endpoints
**Location:** `app/api/delegations/`

#### `/api/delegations` (GET)
- Fetch all delegations (given or received)
- Query params: `type` (given/received/all), `includeInactive`
- Auto-deactivates expired delegations

#### `/api/delegations` (POST)
- Create a new delegation
- Validates delegate user, dates, and prevents self-delegation
- Sends email notification to delegate

#### `/api/delegations` (DELETE)
- Deactivate a delegation
- Query param: `id`
- Only delegator or admin can deactivate

#### `/api/delegations/check` (GET)
- Check if user has active delegations
- Returns counts and details of given/received delegations

#### `/api/users` (GET)
- List users for delegation dropdown
- Excludes current user
- Filters by role and active status

### ✅ 3. Updated Approval Logic
**Location:** `app/api/suppliers/initiations/route.ts`

- Checks for active delegations when fetching initiations
- Includes approvals where user is delegating for someone
- Returns `isDelegated` and `delegationType` flags
- Respects delegation type (manager vs procurement)

### ✅ 4. Delegation Management UI
**Location:** `components/settings/delegation-management.tsx`

#### Features:
- **Create Delegation Dialog**
  - Select delegate from dropdown
  - Choose delegation type
  - Set start and end dates
  - Add reason and notes
  
- **Two Tabs:**
  - **Delegations Given** - Shows delegations you've created
  - **Delegations Received** - Shows delegations where you're the delegate

- **Status Badges:**
  - Active (green) - Currently in effect
  - Scheduled (blue) - Starts in the future
  - Expired (gray) - Past end date
  - Deactivated (gray) - Manually deactivated

- **Actions:**
  - Deactivate active delegations
  - View delegation details (dates, reason, notes)

### ✅ 5. Approval Display Updates
**Location:** `app/admin/approvals/page.tsx`

- Shows "🔄 Delegated" badge on approval cards
- Indicates when viewing delegated approvals
- Updated interface to include delegation fields

### ✅ 6. Email Notifications
**Location:** `app/api/delegations/route.ts`

When a delegation is created, the delegate receives an email with:
- Delegator's name and email
- Delegation type
- Period (start and end dates)
- Reason and notes (if provided)
- Instructions on accessing delegations

## User Workflows

### Creating a Delegation (Delegator)

1. Go to **Settings** page
2. In the **Approval Delegations** section, click **New Delegation**
3. Fill in the form:
   - **Delegate To:** Select the person who will act on your behalf
   - **Delegation Type:** Choose which approvals to delegate
   - **Start Date:** When delegation begins
   - **End Date:** When delegation ends
   - **Reason:** Why you're delegating (optional)
   - **Notes:** Additional information (optional)
4. Click **Create Delegation**
5. Delegate receives an email notification

### Viewing Delegated Approvals (Delegate)

1. Navigate to **Approvals** page
2. See approval cards with "🔄 Delegated" badge
3. These are approvals you can process on behalf of someone else
4. Approve/reject as normal - system tracks you as the acting delegate

### Managing Delegations

**Delegations Given Tab:**
- View all delegations you've created
- See status (Active/Scheduled/Expired)
- Deactivate active delegations if needed

**Delegations Received Tab:**
- View delegations where you're the delegate
- See active delegations highlighted with blue border
- Alert message shows you're acting with delegator's authority

## Technical Details

### Delegation Resolution Logic

```typescript
// Check for active delegations
const now = new Date()
const activeDelegations = await prisma.userDelegation.findMany({
  where: {
    delegateId: session.user.id,
    isActive: true,
    startDate: { lte: now },
    endDate: { gte: now }
  }
})

// Include initiations where user is delegating for the approver
const delegatedUserIds = activeDelegations.map(d => d.delegatorId)

// Check if initiation is visible via delegation
if (managerApproval && delegatedUserIds.includes(managerApproval.approverId)) {
  // Check delegation type matches
  isDelegated = true
}
```

### Auto-Expiry

- Delegations automatically expire after end date
- Status checks happen on fetch
- Expired delegations are auto-deactivated
- No manual intervention needed

### Security

- Users cannot delegate to themselves
- Only delegator or admin can deactivate
- Delegation type controls which approvals are accessible
- Audit trail maintained (createdBy, timestamps)

## Database Schema

```prisma
model UserDelegation {
  id              String         @id @default(cuid())
  delegatorId     String         // Who is delegating
  delegateId      String         // Who receives authority
  delegationType  DelegationType @default(ALL_APPROVALS)
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean        @default(true)
  reason          String?
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  createdBy       String?
  
  delegator       User           @relation("DelegationDelegator")
  delegate        User           @relation("DelegationDelegate")
}

enum DelegationType {
  ALL_APPROVALS
  MANAGER_APPROVALS
  PROCUREMENT_APPROVALS
  REQUISITION_APPROVALS
  CONTRACT_APPROVALS
}
```

## Example Use Cases

### Vacation Coverage
```
Manager A is going on vacation from Jan 15-30
→ Creates delegation to Manager B
→ Type: MANAGER_APPROVALS
→ Manager B sees and approves supplier initiations during this period
→ Delegation auto-expires on Jan 31
```

### Emergency Absence
```
Procurement Manager is suddenly ill
→ Admin creates delegation to Procurement Specialist
→ Type: PROCUREMENT_APPROVALS
→ Specialist can approve urgent requests
→ Admin can deactivate when manager returns
```

### Business Trip
```
Approver traveling for a week
→ Creates delegation with specific dates
→ Type: ALL_APPROVALS
→ Notes: "Traveling to client site, limited access"
→ Delegate handles all approvals during trip
```

## Benefits

✅ **Business Continuity** - No approval bottlenecks during absences  
✅ **Flexibility** - Granular control over delegation types  
✅ **Transparency** - Clear indication of delegated approvals  
✅ **Automatic** - Set once, works automatically during period  
✅ **Auditable** - Full trail of who delegated what to whom  
✅ **Temporary** - Auto-expires, no lingering permissions  
✅ **Secure** - Role-based, can't delegate to self  

## Future Enhancements

Potential improvements:
- Delegation chains (A→B→C if both are absent)
- Delegation approval (require approval before activation)
- Recurring delegations (e.g., every Friday)
- Delegation templates
- Email reminders before delegation starts/ends
- Analytics on delegation usage
- Out-of-office status integration
- Delegation history and reports

## Testing

### To Test Delegation:

1. **Create Test Users:**
   - Manager: manager@test.com
   - Delegate: delegate@test.com

2. **As Manager:**
   - Log in
   - Go to Settings
   - Create delegation to delegate@test.com
   - Choose dates that include today

3. **As Delegate:**
   - Log in
   - Check Settings → see "Delegations Received"
   - Go to Approvals page
   - See delegated approvals with "🔄 Delegated" badge

4. **Test Expiry:**
   - Set end date to yesterday
   - Delegation should auto-deactivate
   - Approvals no longer visible to delegate

## Notes

- Restart dev server after schema changes to regenerate Prisma client
- Email notifications require SMTP configuration
- Delegations are time-zone aware (uses server time)
- Multiple simultaneous delegations supported
- Delegation doesn't remove original approver's access

## Support

For issues or questions about the delegation system:
1. Check delegation status in Settings
2. Verify dates are correct (start <= today <= end)
3. Confirm delegation type matches approval type
4. Check user roles and permissions


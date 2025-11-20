# Approval Visibility Fix

## Problem

When a user submits a supplier initiation and an approval email is sent to their manager, the manager clicks the link but the initiation doesn't appear on the approvals page.

## Root Cause

The issue was a **mismatch between how manager approvals are assigned vs. how they are filtered**.

### How Manager Approvals Work:

1. **In User Management**: Any user can be set as another user's manager (via the `managerId` field in the `users` table)
2. **In Initiation Creation**: When a user submits an initiation, the system:
   - Looks up the user's assigned manager (`currentUser.managerId`)
   - Creates a `ManagerApproval` record with `approverId = assignedManager.id`
   - **Important**: The assigned manager does NOT need to have the `MANAGER` role

### How Approvals Page Filtered (OLD - BROKEN):

The old filter logic in `/api/suppliers/initiations` was:

```javascript
if (session.user.role === 'MANAGER') {
  // Show initiations where approverId matches
  userFilterClause = {
    OR: [
      { initiatedById: session.user.id },
      { managerApproval: { approverId: session.user.id } }
    ]
  }
} else {
  // Regular users only see their own
  userFilterClause = { initiatedById: session.user.id }
}
```

**Problem**: If a user is assigned as someone's manager but doesn't have the `MANAGER` role, they:
- ✅ Receive the approval email
- ✅ Have a `ManagerApproval` record with their ID
- ❌ **Cannot see the initiation** because the filter requires `role === 'MANAGER'`

## Solution

### Updated Filter Logic (NEW - FIXED):

Changed the filter in `/api/suppliers/initiations/route.ts` to **always check if the user is an approver**, regardless of their role:

```javascript
// For all non-admin users
const orConditions = [
  { initiatedById: session.user.id },  // Initiations they created
  { managerApproval: { approverId: session.user.id } },  // Where they're manager approver
  { procurementApproval: { approverId: session.user.id } }  // Where they're procurement approver
]

userFilterClause = { OR: orConditions }
```

**Now**:
- ✅ Users who are assigned as managers (via `managerId`) can see initiations
- ✅ Users who are assigned as procurement approvers can see initiations
- ✅ Users can still see their own initiations
- ✅ Works regardless of the user's role

## Files Changed

### 1. `app/api/suppliers/initiations/route.ts`
- **Changed**: Filter logic to check approver assignment instead of role
- **Added**: Comprehensive debug logging

### 2. `app/api/suppliers/initiate/route.ts`
- **Added**: Comment clarifying that assigned managers don't need MANAGER role
- **Added**: Enhanced logging for debugging

### 3. `app/admin/approvals/page.tsx`
- **Added**: Console logging for debugging frontend data

## Testing the Fix

### Step 1: Check Server Logs (Backend)

After submitting an initiation, check the server console:

```
📋 Fetching initiations for user: manager@company.com
   User ID: clx1234567890
   User Role: USER  ← Note: Not "MANAGER" role
   Active delegations: 0
   ⚙️ Building filter for non-admin user
   ✅ Added manager approval filter for user ID: clx1234567890
   ✅ Added procurement approval filter for user ID: clx1234567890
   📝 OR conditions count: 3

📊 Found 1 initiations for user manager@company.com (role: USER)
   [1] ABC Supplier Ltd
       Status: SUBMITTED
       InitiatedBy: clx9876543210 (John Doe)
       HasOnboarding: false
       Manager Approval:
         Status: PENDING
         ApproverId: clx1234567890
         Approver Name: Jane Manager
         Matches Current User? ✅ YES  ← This confirms assignment
```

### Step 2: Check Browser Console (Frontend)

Open the approvals page and check the browser console:

```
🔄 Fetching initiations...
✅ Received 1 initiations
   [1] ABC Supplier Ltd
       Status: SUBMITTED
       Manager Approval: PENDING (Approver: Jane Manager)
       Procurement Approval: PENDING (Approver: Procurement Manager)
```

### Step 3: Verify in Database

```sql
-- Check the manager approval record
SELECT 
  si.id,
  si."supplierName",
  si.status,
  ma."approverId",
  u.email as approver_email,
  u.role as approver_role
FROM supplier_initiations si
JOIN manager_approvals ma ON ma."initiationId" = si.id
JOIN users u ON u.id = ma."approverId"
WHERE si."supplierName" = 'ABC Supplier Ltd';
```

Should return:
```
id | supplierName       | status    | approverId   | approver_email       | approver_role
---|--------------------|-----------|--------------|---------------------|---------------
123| ABC Supplier Ltd   | SUBMITTED | clx123456... | manager@company.com | USER
```

Note: `approver_role` can be `USER`, `MANAGER`, `PROCUREMENT_MANAGER`, or `ADMIN` - it doesn't matter!

## How Manager Assignment Works

### 1. Setting a Manager for a User:

In **User Management** (admin only):
1. Go to Settings → User Management
2. Click "Edit" on a user
3. Select a manager from the dropdown
4. Click "Save"

This sets the `managerId` field in the `users` table.

### 2. What Happens During Initiation:

```javascript
// 1. Find the user's assigned manager
const currentUser = await prisma.user.findUnique({
  where: { id: session.user.id },
  include: { manager: true }
})

// 2. Create manager approval for that specific manager
if (currentUser.managerId && currentUser.manager?.isActive) {
  await prisma.managerApproval.create({
    data: {
      initiationId: initiation.id,
      approverId: currentUser.manager.id,  // ← Assigned manager
      status: 'PENDING'
    }
  })
}
```

### 3. Who Can Approve:

The frontend checks:
```javascript
const canApproveAsManager = (initiation) => {
  // User cannot approve their own request
  if (initiation.initiatedById === userId) return false
  
  // Manager approval must be PENDING
  if (managerStatus !== 'PENDING') return false
  
  // User is directly assigned as the approver
  return managerApproverId === userId
}
```

**Key point**: No role check! Only checks if `approverId` matches.

## Common Scenarios

### Scenario 1: User Without Manager Assignment
- **User**: John Doe (no manager set)
- **Submits initiation**
- **System**: Falls back to finding any active user with `MANAGER` role
- **Result**: First active manager receives approval

### Scenario 2: User With Manager Assignment (Manager Has MANAGER Role)
- **User**: Jane Smith (manager: Bob Manager, role: MANAGER)
- **Submits initiation**
- **System**: Assigns approval to Bob Manager
- **Result**: Bob sees initiation (both via role AND assignment)

### Scenario 3: User With Manager Assignment (Manager Has USER Role) ← THIS WAS BROKEN
- **User**: Tom Brown (manager: Alice Lead, role: USER)
- **Submits initiation**
- **System**: Assigns approval to Alice Lead
- **OLD**: Alice couldn't see it (no MANAGER role) ❌
- **NEW**: Alice can see it (assigned as approver) ✅

## Delegation Still Works

Delegation logic is separate and still functions:
- If Alice delegates to Bob
- Bob can also approve on behalf of Alice
- Delegation check happens in addition to direct assignment

## Future Improvements (Optional)

### Option 1: Role Enforcement
If you want only users with the MANAGER role to be assignable as managers:

In `components/settings/user-management.tsx`, filter the manager dropdown:
```typescript
const potentialManagers = users.filter(u => 
  u.isActive && 
  u.id !== user.id && 
  u.role === 'MANAGER'  // ← Add this
)
```

### Option 2: Automatic Role Assignment
When a user is assigned as someone's manager, automatically give them the MANAGER role:

In `app/api/users/[userId]/route.ts`:
```typescript
// When updating user with managerId
if (managerId) {
  const manager = await prisma.user.findUnique({ where: { id: managerId } })
  if (manager && manager.role === 'USER') {
    // Promote to MANAGER role
    await prisma.user.update({
      where: { id: managerId },
      data: { role: 'MANAGER' }
    })
  }
}
```

## Summary

✅ **Fixed**: Users assigned as managers can now see initiations regardless of their role
✅ **Fixed**: Filter logic now checks assignment, not role
✅ **Added**: Comprehensive logging for debugging
✅ **Maintained**: All existing functionality (delegation, procurement approvals, etc.)

The system is now more flexible: any active user can be assigned as a manager and will have the necessary permissions to approve initiations.


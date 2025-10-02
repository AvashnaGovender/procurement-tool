# Database Setup Guide

This procurement system uses **PostgreSQL** as the database with **Prisma ORM** for type-safe database access.

## Overview

The database is designed to support:
- ✅ **Multi-user concurrent access**
- ✅ **Process state tracking and resumption**
- ✅ **Complete audit trail for compliance**
- ✅ **Email tracking and automated reminders**
- ✅ **Multi-step workflow management**
- ✅ **Revision history tracking**
- ✅ **Analytics and reporting data**

## Database Modules

### 1. User Management
- User authentication and authorization
- Role-based access control (ADMIN, PROCUREMENT_MANAGER, PROCUREMENT_SPECIALIST, APPROVER, FINANCE, USER)
- Session management

### 2. Session Resumption
- Tracks user's active processes
- Allows users to resume incomplete workflows
- Auto-expires after 24 hours (configurable)
- Stores process state and form data

### 3. Supplier Management
- Complete supplier information
- Business type classification
- Status tracking (PENDING, UNDER_REVIEW, APPROVED, etc.)
- Supplier evaluations and reviews

### 4. Supplier Onboarding
- Multi-step workflow (Initiate → Pending → Review → Complete)
- Email tracking (sent, opened, clicked)
- Document upload and verification
- Revision tracking (how many revisions, when requested)
- Complete timeline of all actions
- Verification checks (tax compliance, BBBEE, etc.)
- Process time tracking (start to end)

### 5. Purchase Requisitions
- Multi-level approval workflow
- Line items with pricing
- Budget tracking
- Comments and attachments
- Process time tracking

### 6. Purchase Orders
- Linked to requisitions
- Supplier acknowledgment tracking
- Delivery tracking
- Invoice matching

### 7. Contracts
- Contract lifecycle management
- Renewal reminders
- Auto-renewal tracking
- Document version control
- Amendment history

### 8. Delivery & Lead Time Tracking
- Expected vs. actual delivery dates
- Lead time analysis
- On-time delivery metrics
- Delay tracking

### 9. Invoices
- Invoice status tracking
- Payment reconciliation
- Overdue tracking

### 10. Email Management
- Complete email log (sent, delivered, opened, bounced)
- Automated reminder scheduling
- Email type classification
- Retry mechanism for failed emails

### 11. Notifications
- In-app notifications
- Reference linking to processes
- Read/unread status

### 12. Audit Logs
- Every action tracked
- Before/after values for changes
- User identification
- IP address and user agent tracking
- Timestamp for every action

## Prerequisites

1. **PostgreSQL Database**
   - PostgreSQL 14+ installed and running
   - Or use a managed PostgreSQL service (e.g., Supabase, Railway, Neon, AWS RDS)

2. **Node.js**
   - Node.js 18+ installed

## Setup Instructions

### Step 1: Set up PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (if not already installed)
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql@14
# Linux: sudo apt-get install postgresql-14

# Create database
psql -U postgres
CREATE DATABASE procurement_db;
CREATE USER procurement_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE procurement_db TO procurement_user;
\q
```

#### Option B: Use Managed PostgreSQL (Recommended for Production)
Popular options:
- **Supabase** (Free tier available): https://supabase.com
- **Railway** (Free tier available): https://railway.app
- **Neon** (Free tier available): https://neon.tech
- **AWS RDS PostgreSQL**
- **Azure Database for PostgreSQL**

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://procurement_user:your_secure_password@localhost:5432/procurement_db?schema=public"

# For managed databases, use their connection string:
# DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Application
NODE_ENV="development"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# SMTP Configuration (for production email sending)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="your-email@gmail.com"
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

This creates the TypeScript types and Prisma Client for type-safe database access.

### Step 4: Run Database Migrations

```bash
# Create and apply the initial migration
npx prisma migrate dev --name init

# This will:
# 1. Create all tables in your PostgreSQL database
# 2. Apply the schema
# 3. Generate Prisma Client
```

### Step 5: (Optional) Seed Initial Data

Create a seed script to add initial users and test data:

```bash
# Create seed file
touch prisma/seed.ts
```

See the "Database Seeding" section below for examples.

### Step 6: View Database with Prisma Studio

```bash
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

## Database Schema Highlights

### Audit Trail
Every important action is logged in the `audit_logs` table:
- User who performed the action
- Entity type and ID
- Changes (before/after values)
- Timestamp
- IP address and user agent

### Process Tracking
For supplier onboarding and requisitions:
- `processStartedAt` - When process began
- `processEndedAt` - When process completed
- `totalProcessingTimeHours` - Auto-calculated duration
- `currentStep` - Current workflow step
- `overallStatus` - Overall process status

### Email Tracking
Complete email lifecycle tracking:
- Email sent (with message ID)
- Email delivered
- Email opened (if tracking enabled)
- Email clicked
- Email bounced or failed
- Automated retry for failed emails

### Revision History
For supplier onboarding:
- `revisionCount` - Number of times revisions were requested
- `revisionRequested` - Boolean flag
- `revisionNotes` - Reason for revision
- `revisionRequestedAt` - Timestamp

### Session Resumption
Users can resume incomplete processes:
- Stores current form data
- Tracks last accessed time
- Auto-expires after 24 hours
- Supports all modules (onboarding, requisitions, contracts, etc.)

## Prisma Client Usage

### Import Prisma Client
```typescript
import { prisma } from '@/lib/prisma'
```

### Query Examples

#### Create Supplier with Audit Log
```typescript
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-logger'

const supplier = await prisma.supplier.create({
  data: {
    supplierCode: 'SUP001',
    companyName: 'Acme Corp',
    contactPerson: 'John Doe',
    contactEmail: 'john@acme.com',
    businessType: 'PTY_LTD',
    sector: 'manufacturing',
    status: 'PENDING',
    createdById: userId,
  },
})

// Log the action
await createAuditLog({
  userId,
  userName: 'John Smith',
  action: 'CREATE',
  entityType: 'Supplier',
  entityId: supplier.id,
  metadata: { supplierCode: supplier.supplierCode },
})
```

#### Save Session State
```typescript
import { saveSessionState } from '@/lib/session-manager'

await saveSessionState({
  userId: 'user123',
  moduleType: 'SUPPLIER_ONBOARDING',
  processId: 'supplier456',
  processStep: 'DOCUMENT_UPLOAD',
  processData: {
    contactName: 'Jane Doe',
    businessType: 'PTY_LTD',
    documentsUploaded: ['cm1.pdf', 'tax_cert.pdf'],
  },
  expiresInHours: 24,
})
```

#### Resume Session
```typescript
import { getSessionState } from '@/lib/session-manager'

const session = await getSessionState(
  'user123',
  'SUPPLIER_ONBOARDING',
  'supplier456'
)

if (session) {
  console.log('Resume from step:', session.processStep)
  console.log('Form data:', session.processData)
}
```

#### Track Email
```typescript
const emailLog = await prisma.emailLog.create({
  data: {
    sentById: userId,
    recipientEmail: 'supplier@example.com',
    recipientName: 'Supplier Contact',
    subject: 'Supplier Onboarding Invitation',
    content: emailContent,
    emailType: 'ONBOARDING_INVITATION',
    referenceType: 'supplier_onboarding',
    referenceId: onboardingId,
    status: 'SENT',
    sentAt: new Date(),
  },
})
```

#### Query with Relations
```typescript
const requisition = await prisma.requisition.findUnique({
  where: { id: 'req123' },
  include: {
    requestedBy: true,
    lineItems: true,
    approvals: {
      include: {
        approver: true,
      },
    },
    comments: true,
  },
})
```

## Database Maintenance

### Backup Database
```bash
# Local PostgreSQL
pg_dump -U procurement_user procurement_db > backup.sql

# Restore
psql -U procurement_user procurement_db < backup.sql
```

### Clean up Expired Sessions (Recommended: Run daily)
```typescript
import { cleanupExpiredSessions } from '@/lib/session-manager'

// In a cron job or scheduled task
await cleanupExpiredSessions()
```

### View Database Schema
```bash
npx prisma db pull  # Pull schema from database
npx prisma format   # Format schema file
```

## Analytics Queries

### Supplier Onboarding Metrics
```typescript
// Average processing time
const avgTime = await prisma.supplierOnboarding.aggregate({
  _avg: {
    totalProcessingTimeHours: true,
  },
  where: {
    overallStatus: 'COMPLETED',
  },
})

// Onboarding by status
const statusCounts = await prisma.supplierOnboarding.groupBy({
  by: ['overallStatus'],
  _count: true,
})
```

### Requisition Approval Time
```typescript
// Average approval time
const requisitions = await prisma.requisition.findMany({
  where: {
    status: 'APPROVED',
    submittedAt: { not: null },
    approvedAt: { not: null },
  },
  select: {
    submittedAt: true,
    approvedAt: true,
  },
})

// Calculate average days
const avgDays = requisitions.reduce((sum, req) => {
  const days = (req.approvedAt.getTime() - req.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
  return sum + days
}, 0) / requisitions.length
```

### Supplier Performance
```typescript
const supplierMetrics = await prisma.supplier.findUnique({
  where: { id: supplierId },
  include: {
    evaluations: {
      orderBy: { evaluationDate: 'desc' },
      take: 5,
    },
    deliveries: {
      where: {
        actualDeliveryDate: { not: null },
      },
    },
  },
})

// Calculate on-time delivery rate
const onTimeDeliveries = supplierMetrics.deliveries.filter(d => d.onTime).length
const onTimeRate = (onTimeDeliveries / supplierMetrics.deliveries.length) * 100
```

## Troubleshooting

### Connection Issues
```bash
# Test database connection
npx prisma db execute --stdin <<< "SELECT NOW();"
```

### Migration Issues
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Apply specific migration
npx prisma migrate deploy
```

### Type Generation Issues
```bash
# Regenerate Prisma Client
npx prisma generate --force
```

## Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use strong passwords** for database users
3. **Enable SSL** for production database connections
4. **Limit database user permissions** to only what's needed
5. **Regular backups** - Automate database backups
6. **Monitor queries** - Use Prisma query logs in development
7. **Connection pooling** - Use PgBouncer or Prisma Data Proxy for production

## Next Steps

1. Create seed data for testing
2. Set up automated backups
3. Configure monitoring and alerts
4. Set up read replicas for analytics (optional)
5. Implement database migration strategy for production

## Support

For Prisma documentation: https://www.prisma.io/docs
For PostgreSQL documentation: https://www.postgresql.org/docs/


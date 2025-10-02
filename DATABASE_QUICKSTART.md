# Database Quick Start Guide

## 🚀 5-Minute Setup

### 1. Set up your PostgreSQL database

You have several options:

#### Option A: Use Prisma Postgres (Fastest - Recommended for Development)
```bash
npx prisma dev
```
This creates a local Prisma Postgres instance automatically.

#### Option B: Use a Free Managed Service (Recommended for Production)

**Supabase (Free tier):**
1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Settings → Database

**Railway (Free tier):**
1. Go to https://railway.app
2. Create new PostgreSQL database
3. Copy the connection string

**Neon (Free tier):**
1. Go to https://neon.tech
2. Create new project
3. Copy the connection string

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL and create database
psql -U postgres
CREATE DATABASE procurement_db;
\q
```

### 2. Configure Environment Variables

Copy the example file and update it:
```bash
# Copy example
cp .env.example .env

# Edit .env and update DATABASE_URL
# Example:
DATABASE_URL="postgresql://user:password@localhost:5432/procurement_db"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Create Database Tables
```bash
npm run db:migrate
```

When prompted for a migration name, enter: `init`

### 5. Seed Initial Data (Optional but Recommended)
```bash
npm run db:seed
```

This creates test users:
- **Admin**: admin@schauenburg.com / Admin123!
- **Manager**: manager@schauenburg.com / Manager123!
- **Specialist**: specialist@schauenburg.com / Specialist123!
- **Approver**: approver@schauenburg.com / Approver123!

### 6. View Your Database
```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

## ✅ You're Done!

Your database is now ready. Start the development server:
```bash
npm run dev
```

## 📋 Useful Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create a new migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Push schema changes without migration
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (WARNING: Deletes all data)
npm run db:reset
```

## 📊 Database Features

### ✅ Multi-User Support
- Multiple users can work simultaneously
- Role-based access control
- Session management per user

### ✅ Process Resumption
Users can resume incomplete processes:
- Supplier onboarding
- Purchase requisitions
- Contract creation
- All workflows save state automatically

### ✅ Complete Audit Trail
Every action is tracked:
- Who did what
- When it happened
- What changed (before/after values)
- IP address and user agent

### ✅ Email Tracking
Complete email lifecycle:
- Sent, delivered, opened, bounced
- Automated reminders
- Retry mechanism for failures

### ✅ Workflow Management
- Multi-step approval workflows
- Revision tracking
- Process time tracking (start to end)
- Status management

### ✅ Analytics Ready
All data structured for:
- Spend analysis
- Supplier performance metrics
- Delivery tracking
- Lead time analysis
- Contract management

## 🔍 Database Schema Overview

### Core Tables

**Users & Authentication**
- `users` - User accounts and roles
- `session_resumptions` - Active process tracking

**Supplier Management**
- `suppliers` - Supplier master data
- `supplier_onboardings` - Onboarding workflow
- `supplier_documents` - Document storage
- `supplier_evaluations` - Performance ratings
- `supplier_reviews` - User reviews
- `onboarding_timeline` - Complete audit trail
- `verification_checks` - Compliance checks

**Procurement**
- `requisitions` - Purchase requisitions
- `requisition_line_items` - Requisition details
- `requisition_approvals` - Approval workflow
- `requisition_comments` - Discussion threads
- `requisition_attachments` - Supporting documents

**Purchase Orders**
- `purchase_orders` - PO master
- `po_line_items` - PO details
- `deliveries` - Delivery tracking
- `invoices` - Invoice management

**Contracts**
- `contracts` - Contract management
- `contract_approvals` - Contract approval workflow
- `contract_documents` - Contract files
- `contract_amendments` - Change history

**Communication**
- `email_logs` - Email tracking
- `email_reminders` - Automated follow-ups
- `notifications` - In-app notifications

**System**
- `audit_logs` - Complete activity log
- `system_config` - System settings

## 🛠️ Common Tasks

### Check Database Connection
```bash
npx prisma db execute --stdin <<< "SELECT NOW();"
```

### View Schema
```bash
npx prisma format
```

### Backup Database
```bash
# Local PostgreSQL
pg_dump -U user database_name > backup.sql

# Restore
psql -U user database_name < backup.sql
```

### Update Schema
1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Enter migration name
4. Run `npm run db:generate`

## 🚨 Troubleshooting

**Problem: Can't connect to database**
- Check DATABASE_URL in .env
- Verify database is running
- Test connection: `npx prisma db execute --stdin <<< "SELECT 1;"`

**Problem: Migration fails**
- Check database permissions
- Verify schema changes are valid
- Try: `npm run db:reset` (WARNING: Deletes data)

**Problem: Prisma Client errors**
- Run: `npm run db:generate --force`
- Restart your dev server

**Problem: Type errors**
- Run: `npm run db:generate`
- Restart TypeScript server in your IDE

## 📚 Next Steps

1. Read full documentation: `DATABASE_SETUP.md`
2. Explore database: `npm run db:studio`
3. Create your first supplier onboarding
4. Set up email configuration (EMAIL_SETUP.md)
5. Configure production database

## 🔐 Security Reminders

- ✅ Never commit `.env` file
- ✅ Use strong passwords
- ✅ Enable SSL for production
- ✅ Regular backups
- ✅ Monitor database logs

## 💡 Tips

- Use Prisma Studio for quick data viewing
- Audit logs never expire - they're your compliance proof
- Session resumptions auto-expire after 24 hours
- Email reminders are scheduled automatically
- All timestamps are in UTC

## 🆘 Need Help?

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Supabase Docs: https://supabase.com/docs


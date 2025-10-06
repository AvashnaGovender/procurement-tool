# Local PostgreSQL Database Setup Guide

This guide will help you set up and run the Procurement Management System with a local PostgreSQL database.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or pnpm package manager

## Database Setup

### 1. Install PostgreSQL

#### Windows
- Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run the installer and follow the setup wizard
- Remember the password you set for the `postgres` user
- Default port is usually `5432`

#### macOS
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

Connect to PostgreSQL and create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres

# In the PostgreSQL prompt, create the database
CREATE DATABASE procurement;

# Exit
\q
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
# Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/procurement?schema=public"

# Generate a secure secret for NextAuth
# You can use: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

# Set your application URL
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Install Dependencies

Remove old dependencies and install fresh:

```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Install dependencies
npm install

# Or using pnpm
pnpm install
```

### 5. Run Database Migrations

Apply the Prisma schema to your local database:

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Optional: Seed the database with initial data
npm run db:seed
```

## Data Migration from Supabase

If you've already exported your Supabase data, you can restore it to your local PostgreSQL database:

### Option 1: Using pg_restore (if you have a .dump file)

```bash
# Restore the dump file
pg_restore -U postgres -d procurement supabase_backup.dump

# Or if you need to drop and recreate
dropdb -U postgres procurement
createdb -U postgres procurement
pg_restore -U postgres -d procurement supabase_backup.dump
```

### Option 2: Using psql (if you have a .sql file)

```bash
psql -U postgres -d procurement < backup.sql
```

### Option 3: Manual Migration

If you exported as CSV or JSON:

1. First, run migrations to create the schema:
   ```bash
   npm run db:migrate
   ```

2. Use Prisma Studio to manually import data:
   ```bash
   npm run db:studio
   ```

3. Or write a custom seed script in `prisma/seed.ts`

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Default Admin User

If you ran the seed script, a default admin user is created:

```
Email: admin@schauenburg.co.za
Password: admin123
```

**⚠️ Important:** Change this password immediately after first login!

## Database Management

### View Database in Browser

Prisma Studio provides a GUI to view and edit your database:

```bash
npm run db:studio
```

This opens at `http://localhost:5555`

### Common Commands

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Create a new migration
npm run db:migrate

# Push schema changes without creating migration
npm run db:push

# Reset database (⚠️ deletes all data)
npm run db:reset

# Seed database with initial data
npm run db:seed
```

## Troubleshooting

### Connection Refused

If you get "Connection refused" errors:

1. Check if PostgreSQL is running:
   ```bash
   # On macOS/Linux
   sudo systemctl status postgresql
   
   # On macOS with Homebrew
   brew services list
   ```

2. Verify the port (default is 5432):
   ```bash
   sudo netstat -plnt | grep postgres
   ```

3. Check PostgreSQL logs:
   ```bash
   # On Ubuntu/Debian
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   ```

### Authentication Failed

1. Check your DATABASE_URL in `.env`
2. Verify PostgreSQL user password:
   ```sql
   # In psql
   ALTER USER postgres WITH PASSWORD 'newpassword';
   ```

### Migration Errors

If migrations fail:

1. Reset the database:
   ```bash
   npm run db:reset
   ```

2. Or manually drop and recreate:
   ```bash
   dropdb -U postgres procurement
   createdb -U postgres procurement
   npm run db:migrate
   ```

### Port Already in Use

If port 3000 is in use:

```bash
# Run on a different port
PORT=3001 npm run dev
```

## Security Considerations

1. **Change Default Credentials**: Always change the default admin password
2. **Secure Database**: Don't expose PostgreSQL to the internet
3. **Environment Variables**: Never commit `.env` files to version control
4. **NEXTAUTH_SECRET**: Use a strong, randomly generated secret

## Database Backup

Regular backups are important:

```bash
# Backup entire database
pg_dump -U postgres procurement > backup_$(date +%Y%m%d).sql

# Backup with custom format (for pg_restore)
pg_dump -U postgres -Fc procurement > backup_$(date +%Y%m%d).dump

# Backup specific tables
pg_dump -U postgres -t suppliers -t users procurement > backup.sql
```

## Production Deployment

When deploying to production:

1. Use a hosted PostgreSQL service (e.g., AWS RDS, Railway, Render)
2. Update DATABASE_URL with production credentials
3. Set secure NEXTAUTH_SECRET
4. Run migrations: `npm run db:migrate:deploy`
5. Never use `db:push` in production

## Support

For issues or questions:
- Check Prisma docs: https://www.prisma.io/docs
- PostgreSQL docs: https://www.postgresql.org/docs
- NextAuth docs: https://next-auth.js.org

## Migration Complete! 🎉

Your application is now running on local PostgreSQL instead of Supabase. All authentication is handled through NextAuth with your local database.


# 🌐 Making the Supplier Form Publicly Accessible

The supplier form code is configured to be publicly accessible, but your server/application is only accessible via VPN. Here are your options to make it publicly accessible.

---

## 🔍 Understanding the Issue

- ✅ **Code is ready**: The form is configured to work without authentication
- ❌ **Network issue**: Your application is running on `localhost:3000` or a server only accessible via VPN
- 🔧 **Solution needed**: Deploy to a public server or use a tunneling service

---

## 🚀 Option 1: Quick Testing with ngrok (Recommended for Testing)

**Best for**: Quick testing, demonstrations, temporary access

### Steps:

1. **Install ngrok**
   - Download from: https://ngrok.com/download
   - Or install via: `npm install -g ngrok` or `choco install ngrok` (Windows)

2. **Start your Next.js application**
   ```bash
   npm run dev
   # Or if in production mode:
   npm run build
   npm start
   ```

3. **Create a public tunnel**
   ```bash
   ngrok http 3000
   ```

4. **Get your public URL**
   - ngrok will provide a URL like: `https://abc123.ngrok-free.app`
   - This URL is publicly accessible from anywhere
   - Share this URL with suppliers: `https://abc123.ngrok-free.app/supplier-onboarding-form`

### ⚠️ Limitations:
- Free tier has session time limits
- URL changes on each restart (unless you have a paid plan)
- Not suitable for permanent production use

---

## 🌍 Option 2: Deploy to Vercel (Recommended for Production)

**Best for**: Permanent production deployment, easiest setup for Next.js

### Steps:

1. **Install Vercel CLI** (optional, or use web interface)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Vercel will automatically detect it's a Next.js app

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all your `.env` variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (use your Vercel URL: `https://your-project.vercel.app`)
     - `NEXT_PUBLIC_APP_URL` (same as above)
     - Any other environment variables

5. **Configure Database**
   - Your database must be accessible from the internet
   - Options:
     - Use a cloud database (AWS RDS, Supabase, Neon, etc.)
     - Or keep your database on VPN but allow Vercel's IPs (complex)
     - Or use a database connection pooling service

6. **Your form will be at**:
   ```
   https://your-project.vercel.app/supplier-onboarding-form
   ```

### ✅ Advantages:
- Free tier available
- Automatic HTTPS
- Custom domain support
- Easy deployment via Git
- Built specifically for Next.js

---

## 🏢 Option 3: Deploy to Your Own Server (Production Setup)

**Best for**: Full control, existing infrastructure

### Requirements:
- Server with public IP address
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt is free)
- Reverse proxy (nginx or Apache)

### Steps:

1. **Build your Next.js application**
   ```bash
   npm run build
   ```

2. **Configure Environment Variables**
   Create `.env.production`:
   ```env
   DATABASE_URL="postgresql://user:pass@your-db-host:5432/procurement"
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="your-secret"
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```

3. **Start the application**
   ```bash
   npm start
   # Or use PM2 for process management:
   npm install -g pm2
   pm2 start npm --name "procurement-app" -- start
   ```

4. **Configure nginx reverse proxy**
   Create `/etc/nginx/sites-available/procurement`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

6. **Your form will be at**:
   ```
   https://yourdomain.com/supplier-onboarding-form
   ```

---

## 🔐 Option 4: Cloud Database + Vercel (Recommended Setup)

**Best for**: Best balance of ease and reliability

This combines Vercel for hosting with a cloud database:

1. **Set up a cloud database**:
   - **Supabase** (PostgreSQL): https://supabase.com
   - **Neon** (PostgreSQL): https://neon.tech
   - **AWS RDS**: https://aws.amazon.com/rds
   - **Azure Database**: https://azure.microsoft.com/services/postgresql

2. **Migrate your database**:
   - Export your current database
   - Import to cloud database
   - Update `DATABASE_URL` environment variable

3. **Deploy to Vercel** (see Option 2)

---

## 📋 Quick Comparison

| Option | Setup Time | Cost | Best For |
|--------|-----------|------|----------|
| ngrok | 5 minutes | Free/Paid | Quick testing |
| Vercel | 30 minutes | Free/Paid | Production |
| Own Server | 2-4 hours | Server costs | Full control |
| Vercel + Cloud DB | 1-2 hours | Free/Paid | Best balance |

---

## ✅ After Deployment Checklist

Once your form is publicly accessible:

- [ ] Test the form URL from outside VPN
- [ ] Test form submission
- [ ] Test file uploads
- [ ] Verify database connections
- [ ] Update email templates with new URL
- [ ] Test the form with a real supplier token
- [ ] Monitor error logs
- [ ] Set up monitoring/alerting (optional)

---

## 🆘 Common Issues

### Database Connection Errors
- **Issue**: Database not accessible from hosting service
- **Solution**: Use a cloud database or configure firewall rules

### File Upload Errors
- **Issue**: Files not saving on serverless platforms
- **Solution**: Use cloud storage (AWS S3, Vercel Blob, etc.)

### Environment Variables Not Working
- **Issue**: Variables not set in hosting platform
- **Solution**: Add all variables in hosting dashboard

### HTTPS Required
- **Issue**: Some browsers block mixed content
- **Solution**: Always use HTTPS in production (Vercel provides this automatically)

---

## 📞 Need Help?

If you need assistance with deployment:
1. Share which option you'd like to use
2. Share any error messages
3. Let me know your hosting preferences




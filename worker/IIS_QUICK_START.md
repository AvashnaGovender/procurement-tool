# IIS Intranet Setup - Quick Start

## 🚀 Fast Setup (15 minutes)

This is a condensed version for quick deployment. For detailed instructions, see `IIS_INTRANET_SETUP.md`.

---

## Prerequisites

- Windows Server with Administrator access
- Next.js app at: `C:\procurement\procurement-app`
- Worker at: `C:\procurement\worker`

---

## Step 1: Run Automated Setup

**Open PowerShell as Administrator:**

```powershell
cd C:\procurement\worker
.\setup-iis.ps1
```

This will:
- ✓ Install IIS
- ✓ Create website directory
- ✓ Configure reverse proxy
- ✓ Add firewall rules

**Note:** You'll still need to manually install:
- URL Rewrite Module: https://www.iis.net/downloads/microsoft/url-rewrite
- Application Request Routing (ARR): https://www.iis.net/downloads/microsoft/application-request-routing

---

## Step 2: Configure DNS

**Option A: Company DNS (Recommended)**

Ask IT admin to add:
```
A Record: procurement.schauenburg.local → 192.168.0.34
```

**Option B: Hosts File (Per User)**

On each PC, edit `C:\Windows\System32\drivers\etc\hosts`:
```
192.168.0.34    procurement.schauenburg.local
```

---

## Step 3: Update Environment

```powershell
cd C:\procurement\procurement-app

# Edit .env
notepad .env
```

Change this line:
```
NEXTAUTH_URL=http://procurement.schauenburg.local
```

---

## Step 4: Start Services

**Window 1 - Worker:**
```powershell
cd C:\procurement\worker
.\venv\Scripts\Activate.ps1
python main.py
```

**Window 2 - App:**
```powershell
cd C:\procurement\procurement-app
.\start-app.ps1
```

---

## Step 5: Test Access

**From any PC on network:**
```
http://procurement.schauenburg.local
```

**Login:**
- Email: `admin@schauenburg.co.za`
- Password: `Admin123!`

---

## 🔧 Troubleshooting

### Can't Access from Other PC

```powershell
# On server, check if website is running
Get-Website -Name "Procurement"

# Check if Next.js is running
Get-NetTCPConnection -LocalPort 3000, 80 -State Listen

# Test locally first
Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing
```

### IIS Shows Error

```powershell
# Restart IIS
iisreset

# Check application pool
Get-WebAppPoolState -Name "DefaultAppPool"
Start-WebAppPool -Name "DefaultAppPool"
```

### DNS Not Working

```powershell
# Test DNS
nslookup procurement.schauenburg.local

# Flush DNS
ipconfig /flushdns

# Test with IP directly
http://192.168.0.34
```

---

## 🎯 What You Get

✅ **Clean URL**: `http://procurement.schauenburg.local` (no port numbers)
✅ **Professional**: Standard Windows intranet setup
✅ **Accessible**: From any PC on network/VPN
✅ **Secure**: Internal network only (not internet-facing)

---

## 📦 Optional: Auto-Start Services

To make services start automatically with Windows, see:
- `IIS_INTRANET_SETUP.md` - Part 3: Configure Windows Services

This uses NSSM to run Worker and Next.js app as Windows Services.

---

## 📞 Need Help?

1. Check detailed guide: `IIS_INTRANET_SETUP.md`
2. Check IIS logs: `C:\inetpub\logs\LogFiles\`
3. Check Event Viewer → Application logs
4. Test direct access: `http://localhost:3000`

---

**Your intranet setup is complete!** 🎉




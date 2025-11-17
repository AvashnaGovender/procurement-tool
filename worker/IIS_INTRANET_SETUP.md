# IIS Intranet Setup Guide

This guide will help you host the Procurement App on your company intranet using IIS as a reverse proxy.

## 🎯 What This Achieves

- **Friendly URL**: `http://procurement` or `http://procurement.schauenburg.local`
- **No port numbers**: Users don't need to type `:3000`
- **Professional setup**: Standard Windows Server configuration
- **Auto-start**: App starts automatically with Windows
- **HTTPS ready**: Can add SSL certificate later

---

## 📋 Prerequisites

- Windows Server with IIS
- Administrator access
- Next.js app already installed at `C:\procurement\procurement-app`
- Worker service running at `C:\procurement\worker`

---

## Part 1: Install IIS and Required Modules

### Step 1: Install IIS

**Open PowerShell as Administrator:**

```powershell
# Install IIS with management tools
Install-WindowsFeature -Name Web-Server -IncludeManagementTools

Write-Host "✅ IIS installed successfully!" -ForegroundColor Green
```

### Step 2: Download and Install URL Rewrite Module

1. Download from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Run the installer: `rewrite_amd64_en-US.msi`
3. Click through the installation wizard

**Verify installation:**
```powershell
# Check if URL Rewrite is installed
$rewriteInstalled = Get-Module -ListAvailable | Where-Object { $_.Name -like "*rewrite*" }
if ($rewriteInstalled) {
    Write-Host "✅ URL Rewrite installed" -ForegroundColor Green
} else {
    Write-Host "⚠️ URL Rewrite not found - install from IIS Manager" -ForegroundColor Yellow
}
```

### Step 3: Download and Install Application Request Routing (ARR)

1. Download from: https://www.iis.net/downloads/microsoft/application-request-routing
2. Run the installer: `requestRouter_amd64.msi`
3. Click through the installation wizard

### Step 4: Enable ARR Proxy

**In PowerShell:**

```powershell
# Import WebAdministration module
Import-Module WebAdministration

# Enable proxy in ARR
Set-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/proxy" -Name "enabled" -Value "True"

Write-Host "✅ ARR proxy enabled" -ForegroundColor Green
```

---

## Part 2: Create IIS Website

### Step 1: Create Website Directory

```powershell
# Create IIS website directory
New-Item -ItemType Directory -Path "C:\inetpub\procurement" -Force

Write-Host "✅ Website directory created" -ForegroundColor Green
```

### Step 2: Create web.config File

**Create the file:**

```powershell
cd C:\inetpub\procurement
notepad web.config
```

**Copy the contents from `web.config` file (provided separately)**

### Step 3: Create IIS Website

```powershell
# Import WebAdministration module
Import-Module WebAdministration

# Create a new IIS website
New-Website -Name "Procurement" `
    -PhysicalPath "C:\inetpub\procurement" `
    -Port 80 `
    -HostHeader "procurement.schauenburg.local" `
    -Force

# Start the website
Start-Website -Name "Procurement"

Write-Host "✅ IIS website created and started" -ForegroundColor Green

# Verify
Get-Website -Name "Procurement"
```

---

## Part 3: Configure Windows Services (Auto-Start)

### Step 1: Install NSSM (Non-Sucking Service Manager)

```powershell
# Download NSSM
$nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
$nssmZip = "$env:TEMP\nssm.zip"
$nssmPath = "C:\Tools\nssm"

# Download
Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip

# Extract
Expand-Archive -Path $nssmZip -DestinationPath $nssmPath -Force

# Add to PATH
$env:Path += ";$nssmPath\nssm-2.24\win64"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)

Write-Host "✅ NSSM installed" -ForegroundColor Green
```

### Step 2: Create Worker Service

```powershell
cd C:\Tools\nssm\nssm-2.24\win64

# Install worker service
.\nssm.exe install ProcurementWorker "C:\procurement\worker\venv\Scripts\python.exe" "C:\procurement\worker\main.py"

# Set working directory
.\nssm.exe set ProcurementWorker AppDirectory "C:\procurement\worker"

# Set environment variables
.\nssm.exe set ProcurementWorker AppEnvironmentExtra DATABASE_URL=postgresql://postgres:admin123@localhost:5434/procurement_db
.\nssm.exe set ProcurementWorker AppEnvironmentExtra OLLAMA_BASE_URL=http://localhost:11434
.\nssm.exe set ProcurementWorker AppEnvironmentExtra OPENAI_API_KEY=dummy-key-for-ollama

# Set to start automatically
.\nssm.exe set ProcurementWorker Start SERVICE_AUTO_START

# Start the service
.\nssm.exe start ProcurementWorker

Write-Host "✅ Worker service created and started" -ForegroundColor Green
```

### Step 3: Create Next.js App Service

```powershell
# Install app service
.\nssm.exe install ProcurementApp "C:\Program Files\nodejs\npm.cmd" "start"

# Set working directory
.\nssm.exe set ProcurementApp AppDirectory "C:\procurement\procurement-app"

# Set environment variables (load from .env)
.\nssm.exe set ProcurementApp AppEnvironmentExtra DATABASE_URL=postgresql://postgres:admin123@localhost:5434/procurement_db
.\nssm.exe set ProcurementApp AppEnvironmentExtra NEXTAUTH_URL=http://procurement.schauenburg.local
.\nssm.exe set ProcurementApp AppEnvironmentExtra NEXTAUTH_SECRET=vLIcWSnaRKb0fMTw2pNzUQGu5hFmZr3s
.\nssm.exe set ProcurementApp AppEnvironmentExtra WORKER_API_URL=http://localhost:8001

# Set to start automatically
.\nssm.exe set ProcurementApp Start SERVICE_AUTO_START

# Set dependency on worker
.\nssm.exe set ProcurementApp DependOnService ProcurementWorker

# Start the service
.\nssm.exe start ProcurementApp

Write-Host "✅ App service created and started" -ForegroundColor Green
```

### Step 4: Verify Services

```powershell
# Check service status
Get-Service -Name "ProcurementWorker", "ProcurementApp" | Select-Object Name, Status, StartType

# Check if apps are listening
Get-NetTCPConnection -LocalPort 3000, 8001 -State Listen | Select-Object LocalAddress, LocalPort, State
```

---

## Part 4: Configure DNS (IT Admin Task)

### Option A: Company DNS Server (Recommended)

**Ask your IT admin to add an A record:**

```
Host: procurement
Domain: schauenburg.local
IP: 192.168.0.34
```

This makes it accessible as: `http://procurement.schauenburg.local`

### Option B: Windows Hosts File (Per User)

**On each user's PC (as Administrator):**

1. Edit: `C:\Windows\System32\drivers\etc\hosts`
2. Add line: `192.168.0.34    procurement.schauenburg.local`
3. Save and run: `ipconfig /flushdns`

---

## Part 5: Update Environment Variables

### Update .env on Server

```powershell
cd C:\procurement\procurement-app

# Edit .env file
notepad .env
```

**Update this line:**

```
NEXTAUTH_URL=http://procurement.schauenburg.local
```

**Save and restart the service:**

```powershell
Restart-Service ProcurementApp
```

---

## 🧪 Testing

### 1. Test from Server

```powershell
# Test IIS
Invoke-WebRequest -Uri "http://procurement.schauenburg.local" -UseBasicParsing

# Test worker
Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing
```

### 2. Test from Another PC

**In browser:** `http://procurement.schauenburg.local`

**Expected result:** Login page appears

---

## 🔧 Troubleshooting

### IIS Not Loading

```powershell
# Check IIS status
Get-Service W3SVC

# Start IIS if stopped
Start-Service W3SVC

# Check website
Get-Website -Name "Procurement"

# Check application pool
Get-WebAppPoolState -Name "DefaultAppPool"
```

### Reverse Proxy Not Working

```powershell
# Verify ARR proxy is enabled
Get-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" -Filter "system.webServer/proxy" -Name "enabled"

# Check if Next.js is running
Test-NetConnection localhost -Port 3000
```

### Service Won't Start

```powershell
# Check service status
Get-Service ProcurementApp, ProcurementWorker

# View service logs
Get-EventLog -LogName Application -Source "ProcurementApp" -Newest 10

# Manually test commands
cd C:\procurement\procurement-app
npm start
```

### DNS Not Resolving

```powershell
# Test DNS resolution
nslookup procurement.schauenburg.local

# Flush DNS cache
ipconfig /flushdns

# Ping the hostname
ping procurement.schauenburg.local
```

---

## 🔒 Adding HTTPS (Optional)

### Step 1: Get SSL Certificate

- Request from your IT admin
- Or use Let's Encrypt (for internet-facing)
- Or create self-signed certificate (testing only)

### Step 2: Bind Certificate in IIS

```powershell
# Import certificate
$cert = Import-PfxCertificate -FilePath "C:\path\to\certificate.pfx" -CertStoreLocation Cert:\LocalMachine\My -Password (ConvertTo-SecureString -String "password" -AsPlainText -Force)

# Add HTTPS binding
New-WebBinding -Name "Procurement" -Protocol "https" -Port 443 -HostHeader "procurement.schauenburg.local" -SslFlags 0

# Bind certificate
$binding = Get-WebBinding -Name "Procurement" -Protocol "https"
$binding.AddSslCertificate($cert.Thumbprint, "My")

Write-Host "✅ HTTPS enabled" -ForegroundColor Green
```

### Step 3: Update NEXTAUTH_URL

```
NEXTAUTH_URL=https://procurement.schauenburg.local
```

---

## 📊 Service Management

### Start Services

```powershell
Start-Service ProcurementWorker
Start-Service ProcurementApp
```

### Stop Services

```powershell
Stop-Service ProcurementApp
Stop-Service ProcurementWorker
```

### Restart Services

```powershell
Restart-Service ProcurementApp
Restart-Service ProcurementWorker
```

### View Service Status

```powershell
Get-Service Procurement* | Format-Table Name, Status, StartType -AutoSize
```

### Remove Services (if needed)

```powershell
cd C:\Tools\nssm\nssm-2.24\win64
.\nssm.exe stop ProcurementApp
.\nssm.exe remove ProcurementApp confirm
.\nssm.exe stop ProcurementWorker
.\nssm.exe remove ProcurementWorker confirm
```

---

## ✅ Success Checklist

- [ ] IIS installed and running
- [ ] URL Rewrite module installed
- [ ] ARR installed and proxy enabled
- [ ] web.config created with reverse proxy rules
- [ ] IIS website created and running
- [ ] Worker service running (port 8001)
- [ ] App service running (port 3000)
- [ ] DNS configured (A record or hosts file)
- [ ] NEXTAUTH_URL updated
- [ ] Services set to auto-start
- [ ] Can access from another PC on intranet
- [ ] Login working

---

## 📞 Support

If you encounter issues:

1. Check Windows Event Viewer → Application logs
2. Check IIS logs: `C:\inetpub\logs\LogFiles\`
3. Check service status: `Get-Service Procurement*`
4. Test direct access: `http://localhost:3000`
5. Test worker: `http://localhost:8001/health`

---

**Your procurement system is now professionally hosted on the intranet!** 🎉




# Setup Windows Services for Procurement System

This guide shows how to configure the Worker and Main App to run as Windows Services that start automatically and restart on failure.

---

## Prerequisites

### Install NSSM (Non-Sucking Service Manager)

NSSM is the best tool for running applications as Windows services.

```powershell
# Download NSSM
Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile "$env:TEMP\nssm.zip"

# Extract
Expand-Archive -Path "$env:TEMP\nssm.zip" -DestinationPath "$env:TEMP\nssm" -Force

# Copy to Program Files (64-bit)
Copy-Item "$env:TEMP\nssm\nssm-2.24\win64\nssm.exe" -Destination "C:\Windows\System32\" -Force

# Verify installation
nssm --version
```

---

## Service 1: Python Worker Service

### Step 1: Create Worker Start Script

```powershell
cd C:\procurement\worker

@"
@echo off
REM ============================================================================
REM WORKER SERVICE STARTUP SCRIPT
REM ============================================================================

cd /d C:\procurement\worker

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the worker
python main.py
"@ | Out-File -FilePath "start-worker.bat" -Encoding ASCII

Write-Host "✅ Created start-worker.bat" -ForegroundColor Green
```

### Step 2: Install Worker as Windows Service

```powershell
# Run as Administrator
nssm install ProcurementWorker "C:\procurement\worker\start-worker.bat"

# Configure service
nssm set ProcurementWorker DisplayName "Procurement AI Worker"
nssm set ProcurementWorker Description "AI document analysis worker service for procurement system"
nssm set ProcurementWorker Start SERVICE_AUTO_START
nssm set ProcurementWorker AppDirectory "C:\procurement\worker"

# Set restart options (restart on failure)
nssm set ProcurementWorker AppThrottle 1500
nssm set ProcurementWorker AppExit Default Restart
nssm set ProcurementWorker AppRestartDelay 5000

# Set output logging
nssm set ProcurementWorker AppStdout "C:\procurement\logs\worker-stdout.log"
nssm set ProcurementWorker AppStderr "C:\procurement\logs\worker-stderr.log"

# Create log directory
New-Item -Path "C:\procurement\logs" -ItemType Directory -Force

# Start the service
nssm start ProcurementWorker

Write-Host "✅ Worker service installed and started!" -ForegroundColor Green
```

### Step 3: Verify Worker Service

```powershell
# Check service status
Get-Service ProcurementWorker

# View service details
nssm status ProcurementWorker

# Test health endpoint
Start-Sleep -Seconds 5
Invoke-RestMethod -Uri "http://localhost:8001/health" | ConvertTo-Json
```

---

## Service 2: Next.js Main App Service

### Step 1: Create App Start Script

```powershell
cd C:\procurement\procurement-app

@"
@echo off
REM ============================================================================
REM PROCUREMENT APP SERVICE STARTUP SCRIPT
REM ============================================================================

cd /d C:\procurement\procurement-app

REM Load environment variables from .env
for /f `"usebackq tokens=1,2 delims==`" %%a in (`".env`") do (
    if not `"%%a`"==`"`" if not `"%%a:~0,1`"==`"#`" set `"%%a=%%b`"
)

REM Start the Next.js app
npm start
"@ | Out-File -FilePath "start-app.bat" -Encoding ASCII

Write-Host "✅ Created start-app.bat" -ForegroundColor Green
```

### Step 2: Install App as Windows Service

```powershell
# Run as Administrator
nssm install ProcurementApp "C:\procurement\procurement-app\start-app.bat"

# Configure service
nssm set ProcurementApp DisplayName "Procurement Main Application"
nssm set ProcurementApp Description "Next.js procurement management system"
nssm set ProcurementApp Start SERVICE_AUTO_START
nssm set ProcurementApp AppDirectory "C:\procurement\procurement-app"

# Set dependencies (wait for Worker to start first)
nssm set ProcurementApp DependOnService ProcurementWorker

# Set restart options
nssm set ProcurementApp AppThrottle 1500
nssm set ProcurementApp AppExit Default Restart
nssm set ProcurementApp AppRestartDelay 5000

# Set output logging
nssm set ProcurementApp AppStdout "C:\procurement\logs\app-stdout.log"
nssm set ProcurementApp AppStderr "C:\procurement\logs\app-stderr.log"

# Start the service
nssm start ProcurementApp

Write-Host "✅ App service installed and started!" -ForegroundColor Green
```

### Step 3: Verify App Service

```powershell
# Check service status
Get-Service ProcurementApp

# View service details
nssm status ProcurementApp

# Test app (wait for startup)
Start-Sleep -Seconds 10
Invoke-RestMethod -Uri "http://localhost:3000" -UseBasicParsing | Select-Object StatusCode
```

---

## Service 3: PostgreSQL Database

PostgreSQL should already be running as a service if installed correctly.

### Verify PostgreSQL Service

```powershell
# Check if PostgreSQL service exists
Get-Service -Name "postgresql*"

# Set to auto-start
Set-Service -Name "postgresql-x64-16" -StartupType Automatic

# Start if not running
Start-Service "postgresql-x64-16"
```

---

## Service 4: Ollama Service

Ollama also needs to run as a service.

### Check Ollama Service

```powershell
# Ollama installer usually creates a service automatically
Get-Service -Name "Ollama*"

# If service exists, set to auto-start
Set-Service -Name "OllamaService" -StartupType Automatic

# Start if not running
Start-Service "OllamaService"
```

### If Ollama Service Doesn't Exist

```powershell
# Create service for Ollama
nssm install OllamaService "C:\Program Files\Ollama\ollama.exe" serve

nssm set OllamaService DisplayName "Ollama AI Service"
nssm set OllamaService Description "Local LLM service for AI processing"
nssm set OllamaService Start SERVICE_AUTO_START
nssm set OllamaService AppStdout "C:\procurement\logs\ollama-stdout.log"
nssm set OllamaService AppStderr "C:\procurement\logs\ollama-stderr.log"

nssm start OllamaService
```

---

## Complete Setup Script

Save this as `C:\procurement\setup-all-services.ps1`:

```powershell
# =============================================================================
# SETUP ALL PROCUREMENT SERVICES
# =============================================================================
# Run this script as Administrator to install all services

Write-Host "🚀 Setting up Procurement System Services..." -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Install NSSM if not installed
if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing NSSM..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile "$env:TEMP\nssm.zip"
    Expand-Archive -Path "$env:TEMP\nssm.zip" -DestinationPath "$env:TEMP\nssm" -Force
    Copy-Item "$env:TEMP\nssm\nssm-2.24\win64\nssm.exe" -Destination "C:\Windows\System32\" -Force
    Write-Host "  ✓ NSSM installed" -ForegroundColor Green
}

# Create logs directory
New-Item -Path "C:\procurement\logs" -ItemType Directory -Force | Out-Null

# ==============================================================================
# SERVICE 1: WORKER
# ==============================================================================
Write-Host "`n📊 Setting up Worker Service..." -ForegroundColor Cyan

# Create worker start script
cd C:\procurement\worker
@"
@echo off
cd /d C:\procurement\worker
call venv\Scripts\activate.bat
python main.py
"@ | Out-File -FilePath "start-worker.bat" -Encoding ASCII

# Remove existing service if present
nssm stop ProcurementWorker 2>$null
nssm remove ProcurementWorker confirm 2>$null

# Install service
nssm install ProcurementWorker "C:\procurement\worker\start-worker.bat"
nssm set ProcurementWorker DisplayName "Procurement AI Worker"
nssm set ProcurementWorker Description "AI document analysis worker service"
nssm set ProcurementWorker Start SERVICE_AUTO_START
nssm set ProcurementWorker AppDirectory "C:\procurement\worker"
nssm set ProcurementWorker AppThrottle 1500
nssm set ProcurementWorker AppExit Default Restart
nssm set ProcurementWorker AppRestartDelay 5000
nssm set ProcurementWorker AppStdout "C:\procurement\logs\worker-stdout.log"
nssm set ProcurementWorker AppStderr "C:\procurement\logs\worker-stderr.log"

Write-Host "  ✓ Worker service configured" -ForegroundColor Green

# ==============================================================================
# SERVICE 2: MAIN APP
# ==============================================================================
Write-Host "`n🌐 Setting up Main App Service..." -ForegroundColor Cyan

# Create app start script
cd C:\procurement\procurement-app
@"
@echo off
cd /d C:\procurement\procurement-app
for /f `"usebackq tokens=1,2 delims==`" %%a in (`".env`") do (
    if not `"%%a`"==`"`" if not `"%%a:~0,1`"==`"#`" set `"%%a=%%b`"
)
npm start
"@ | Out-File -FilePath "start-app.bat" -Encoding ASCII

# Remove existing service if present
nssm stop ProcurementApp 2>$null
nssm remove ProcurementApp confirm 2>$null

# Install service
nssm install ProcurementApp "C:\procurement\procurement-app\start-app.bat"
nssm set ProcurementApp DisplayName "Procurement Main Application"
nssm set ProcurementApp Description "Next.js procurement management system"
nssm set ProcurementApp Start SERVICE_AUTO_START
nssm set ProcurementApp AppDirectory "C:\procurement\procurement-app"
nssm set ProcurementApp DependOnService ProcurementWorker
nssm set ProcurementApp AppThrottle 1500
nssm set ProcurementApp AppExit Default Restart
nssm set ProcurementApp AppRestartDelay 5000
nssm set ProcurementApp AppStdout "C:\procurement\logs\app-stdout.log"
nssm set ProcurementApp AppStderr "C:\procurement\logs\app-stderr.log"

Write-Host "  ✓ Main app service configured" -ForegroundColor Green

# ==============================================================================
# SERVICE 3: POSTGRESQL
# ==============================================================================
Write-Host "`n🗄️  Configuring PostgreSQL Service..." -ForegroundColor Cyan

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($pgService) {
    Set-Service -Name $pgService.Name -StartupType Automatic
    if ($pgService.Status -ne 'Running') {
        Start-Service $pgService.Name
    }
    Write-Host "  ✓ PostgreSQL configured: $($pgService.Name)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  PostgreSQL service not found - ensure it's installed" -ForegroundColor Yellow
}

# ==============================================================================
# SERVICE 4: OLLAMA
# ==============================================================================
Write-Host "`n🤖 Configuring Ollama Service..." -ForegroundColor Cyan

$ollamaService = Get-Service -Name "Ollama*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($ollamaService) {
    Set-Service -Name $ollamaService.Name -StartupType Automatic
    if ($ollamaService.Status -ne 'Running') {
        Start-Service $ollamaService.Name
    }
    Write-Host "  ✓ Ollama configured: $($ollamaService.Name)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Ollama service not found - creating..." -ForegroundColor Yellow
    
    $ollamaPath = "C:\Program Files\Ollama\ollama.exe"
    if (Test-Path $ollamaPath) {
        nssm install OllamaService $ollamaPath serve
        nssm set OllamaService DisplayName "Ollama AI Service"
        nssm set OllamaService Description "Local LLM service"
        nssm set OllamaService Start SERVICE_AUTO_START
        nssm set OllamaService AppStdout "C:\procurement\logs\ollama-stdout.log"
        nssm set OllamaService AppStderr "C:\procurement\logs\ollama-stderr.log"
        Write-Host "  ✓ Ollama service created" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Ollama not found at $ollamaPath" -ForegroundColor Yellow
    }
}

# ==============================================================================
# START ALL SERVICES
# ==============================================================================
Write-Host "`n🚀 Starting all services..." -ForegroundColor Cyan

# Start in correct order
$servicesToStart = @(
    @{ Name = "postgresql*"; Display = "PostgreSQL" },
    @{ Name = "Ollama*"; Display = "Ollama" },
    @{ Name = "ProcurementWorker"; Display = "Worker" },
    @{ Name = "ProcurementApp"; Display = "Main App" }
)

foreach ($svc in $servicesToStart) {
    $service = Get-Service -Name $svc.Name -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($service) {
        if ($service.Status -ne 'Running') {
            Start-Service $service.Name
            Write-Host "  ✓ Started $($svc.Display)" -ForegroundColor Green
        } else {
            Write-Host "  ✓ $($svc.Display) already running" -ForegroundColor Green
        }
    }
}

Write-Host "`n✅ All services configured and started!" -ForegroundColor Green
Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
Get-Service ProcurementWorker,ProcurementApp | Format-Table Name, Status, StartType

Write-Host "`n📋 Useful Commands:" -ForegroundColor Cyan
Write-Host "  View services:  Get-Service Procurement*" -ForegroundColor White
Write-Host "  Stop worker:    Stop-Service ProcurementWorker" -ForegroundColor White
Write-Host "  Start worker:   Start-Service ProcurementWorker" -ForegroundColor White
Write-Host "  Stop app:       Stop-Service ProcurementApp" -ForegroundColor White
Write-Host "  Start app:      Start-Service ProcurementApp" -ForegroundColor White
Write-Host "  View logs:      Get-Content C:\procurement\logs\worker-stdout.log -Tail 50" -ForegroundColor White
Write-Host ""
```

---

## Service Management Commands

### View All Services

```powershell
# List procurement services
Get-Service Procurement*,Ollama*,postgresql* | Format-Table Name, Status, StartType

# Detailed view
Get-Service ProcurementWorker | Format-List *
```

### Start/Stop Services

```powershell
# Stop all
Stop-Service ProcurementApp
Stop-Service ProcurementWorker

# Start all
Start-Service ProcurementWorker
Start-Service ProcurementApp
```

### Restart Services (After Updates)

```powershell
# Restart worker
Restart-Service ProcurementWorker

# Restart app
Restart-Service ProcurementApp
```

### View Service Logs

```powershell
# Worker logs (live tail)
Get-Content C:\procurement\logs\worker-stdout.log -Wait -Tail 50

# App logs
Get-Content C:\procurement\logs\app-stdout.log -Wait -Tail 50

# Errors only
Get-Content C:\procurement\logs\worker-stderr.log -Tail 20
```

### Remove Services (If Needed)

```powershell
# Stop and remove
nssm stop ProcurementWorker
nssm remove ProcurementWorker confirm

nssm stop ProcurementApp
nssm remove ProcurementApp confirm
```

---

## Update Workflow with Services

When you pull updates from Git:

```powershell
# 1. Stop services
Stop-Service ProcurementApp
Stop-Service ProcurementWorker

# 2. Update worker
cd C:\procurement\worker
git pull origin main
# Make any changes needed

# 3. Update app
cd C:\procurement\procurement-app
git pull origin main
npm install --legacy-peer-deps
npm run build

# 4. Start services
Start-Service ProcurementWorker
Start-Sleep -Seconds 5
Start-Service ProcurementApp

# 5. Verify
Get-Service Procurement* | Format-Table Name, Status
```

---

## Auto-Restart Configuration

Services are already configured to restart automatically on failure. To verify:

```powershell
# Check restart settings
nssm dump ProcurementWorker | Select-String "Restart"
```

---

## Monitoring

### Create Monitoring Script

```powershell
@"
# =============================================================================
# MONITOR PROCUREMENT SERVICES
# =============================================================================

Write-Host '📊 Procurement System Status' -ForegroundColor Cyan
Write-Host '=' * 60

# Check services
Write-Host '`n🔧 Services:' -ForegroundColor Yellow
Get-Service ProcurementWorker,ProcurementApp | Format-Table Name,Status,StartType

# Check worker health
Write-Host '`n🤖 Worker Health:' -ForegroundColor Yellow
try {
    `$health = Invoke-RestMethod -Uri 'http://localhost:8001/health' -TimeoutSec 5
    Write-Host '  Status: ' -NoNewline; Write-Host `$health.status -ForegroundColor Green
    Write-Host '  AI Mode: ' -NoNewline; Write-Host `$health.ai_mode -ForegroundColor Cyan
    Write-Host '  Worker: ' -NoNewline; Write-Host `$health.worker_status -ForegroundColor Cyan
} catch {
    Write-Host '  ❌ Worker not responding' -ForegroundColor Red
}

# Check app
Write-Host '`n🌐 Main App:' -ForegroundColor Yellow
try {
    `$app = Invoke-RestMethod -Uri 'http://localhost:3000' -Method HEAD -TimeoutSec 5
    Write-Host '  ✓ App is responding' -ForegroundColor Green
} catch {
    Write-Host '  ❌ App not responding' -ForegroundColor Red
}

# Check Ollama
Write-Host '`n🦙 Ollama:' -ForegroundColor Yellow
try {
    `$ollama = Invoke-RestMethod -Uri 'http://localhost:11434/api/version' -TimeoutSec 5
    Write-Host '  Version: ' -NoNewline; Write-Host `$ollama.version -ForegroundColor Cyan
} catch {
    Write-Host '  ❌ Ollama not responding' -ForegroundColor Red
}

# Check PostgreSQL
Write-Host '`n🗄️  PostgreSQL:' -ForegroundColor Yellow
`$pgService = Get-Service -Name 'postgresql*' | Select-Object -First 1
if (`$pgService) {
    Write-Host '  Status: ' -NoNewline; Write-Host `$pgService.Status -ForegroundColor Cyan
} else {
    Write-Host '  ❌ Service not found' -ForegroundColor Red
}

Write-Host ''
"@ | Out-File -FilePath "C:\procurement\monitor.ps1" -Encoding UTF8

Write-Host "✅ Created monitor script: C:\procurement\monitor.ps1"
```

**Run monitoring:**
```powershell
C:\procurement\monitor.ps1
```

---

## Boot Order

Services will start in this order after system restart:

1. **PostgreSQL** (database)
2. **Ollama** (AI models)
3. **ProcurementWorker** (depends on PostgreSQL & Ollama)
4. **ProcurementApp** (depends on Worker)

---

## Troubleshooting Services

### Service Won't Start

```powershell
# Check service configuration
nssm dump ProcurementWorker

# Check logs
Get-Content C:\procurement\logs\worker-stderr.log -Tail 20

# Try starting manually
cd C:\procurement\worker
.\start-worker.bat
```

### Service Keeps Restarting

```powershell
# View event log
Get-EventLog -LogName Application -Source "ProcurementWorker" -Newest 10

# Check error logs
Get-Content C:\procurement\logs\worker-stderr.log -Tail 50
```

---

## Quick Start Command

Run this on the server as Administrator:

```powershell
# Download and run complete setup
Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile "$env:TEMP\nssm.zip"
Expand-Archive -Path "$env:TEMP\nssm.zip" -DestinationPath "$env:TEMP\nssm" -Force
Copy-Item "$env:TEMP\nssm\nssm-2.24\win64\nssm.exe" -Destination "C:\Windows\System32\" -Force

# Then run the setup script (create it first from above)
C:\procurement\setup-all-services.ps1
```


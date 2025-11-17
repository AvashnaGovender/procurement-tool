# Windows Server Installation Guide

**Target Server**: Windows Server 2019/2022  
**Purpose**: AI Document Analysis Worker Service Prerequisites

---

## 📋 What Needs to Be Installed

All installations require **Administrator** privileges.

**Estimated Time**: 30-45 minutes (includes downloads)

---

## 1️⃣ Docker Desktop for Windows ⭐ **CRITICAL**

### Installation Steps:

1. **Download Docker Desktop**
   - Visit: https://docs.docker.com/desktop/install/windows-install/
   - Download: `Docker Desktop Installer.exe`

2. **System Requirements Check**
   - Windows Server 2019 or later
   - WSL 2 feature enabled (Docker will enable this)
   - Hyper-V enabled

3. **Install Docker Desktop**
   ```powershell
   # Run as Administrator
   # Double-click Docker Desktop Installer.exe
   # Follow the installation wizard
   # Choose "Use WSL 2 instead of Hyper-V" option
   ```

4. **Verify Installation**
   ```powershell
   # Open PowerShell as Administrator
   docker --version
   docker compose version
   
   # Test Docker
   docker run hello-world
   ```

### Troubleshooting:
- If WSL 2 error occurs, run:
  ```powershell
  wsl --install
  wsl --set-default-version 2
  ```

---

## 2️⃣ Ollama (AI Engine) ⭐ **CRITICAL**

### Installation Steps:

1. **Download Ollama**
   - Visit: https://ollama.ai/download/windows
   - Download: `OllamaSetup.exe`

2. **Install Ollama**
   ```powershell
   # Run as Administrator
   # Double-click OllamaSetup.exe
   # Follow installation wizard
   # Default installation path: C:\Users\[User]\AppData\Local\Programs\Ollama
   ```

3. **Verify Ollama Service**
   ```powershell
   # Open PowerShell (new window after install)
   ollama --version
   ```

4. **Download AI Model** (Important! - 4.7GB download)
   ```powershell
   # This will take 10-15 minutes depending on connection
   ollama pull llama3.1:latest
   
   # Verify model is downloaded
   ollama list
   ```

5. **Verify Ollama is Running**
   ```powershell
   # Should return JSON with version info
   Invoke-WebRequest -Uri http://localhost:11434/api/version
   ```

---

## 3️⃣ Tesseract OCR ⭐ **CRITICAL**

### Installation Steps:

1. **Download Tesseract**
   - Visit: https://github.com/UB-Mannheim/tesseract/wiki
   - Download: `tesseract-ocr-w64-setup-5.3.x.exe` (latest version)

2. **Install Tesseract**
   ```powershell
   # Run as Administrator
   # Double-click the installer
   # Install to default location: C:\Program Files\Tesseract-OCR
   # ✅ IMPORTANT: Check "Add to PATH" during installation
   ```

3. **Add to System PATH (if not checked during install)**
   ```powershell
   # Run as Administrator
   [Environment]::SetEnvironmentVariable(
       "Path",
       $env:Path + ";C:\Program Files\Tesseract-OCR",
       [System.EnvironmentVariableTarget]::Machine
   )
   ```

4. **Verify Installation**
   ```powershell
   # Close and reopen PowerShell, then:
   tesseract --version
   ```

---

## 4️⃣ Poppler (PDF Processing) ⭐ **CRITICAL**

### Installation Steps:

1. **Download Poppler**
   - Visit: https://github.com/oschwartz10612/poppler-windows/releases/latest
   - Download: `Release-xx.xx.x-0.zip` (latest version)

2. **Extract Poppler**
   ```powershell
   # Extract to: C:\Program Files\poppler
   # The bin folder should be at: C:\Program Files\poppler\Library\bin
   ```

3. **Add to System PATH**
   ```powershell
   # Run as Administrator
   [Environment]::SetEnvironmentVariable(
       "Path",
       $env:Path + ";C:\Program Files\poppler\Library\bin",
       [System.EnvironmentVariableTarget]::Machine
   )
   ```

4. **Verify Installation**
   ```powershell
   # Close and reopen PowerShell, then:
   pdfinfo -v
   ```

---

## 5️⃣ PostgreSQL Client (Optional but Recommended)

### Installation Steps:

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download: PostgreSQL installer (includes client tools)

2. **Install PostgreSQL**
   ```powershell
   # Run installer as Administrator
   # You can install just the "Command Line Tools" component
   # Or full PostgreSQL if not already installed
   ```

3. **Verify Installation**
   ```powershell
   psql --version
   ```

**Note**: If PostgreSQL is already installed on the server, the client libraries are already available.

---

## 6️⃣ Python 3.9+ (Backup - Docker includes this)

### Installation Steps (Optional):

1. **Download Python**
   - Visit: https://www.python.org/downloads/windows/
   - Download: Python 3.9 or higher

2. **Install Python**
   ```powershell
   # Run installer as Administrator
   # ✅ CHECK: "Add Python to PATH"
   # ✅ CHECK: "Install for all users"
   ```

3. **Verify Installation**
   ```powershell
   python --version
   pip --version
   ```

---

## 🔥 Windows Firewall Configuration

### Open Required Ports:

```powershell
# Run as Administrator

# Port 8001 - Worker API (Internal access only)
New-NetFirewallRule -DisplayName "Worker API" -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow

# Port 11434 - Ollama (Localhost only)
New-NetFirewallRule -DisplayName "Ollama AI" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow

# Port 5434 - PostgreSQL (If on same server)
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -LocalPort 5434 -Protocol TCP -Action Allow

# Verify firewall rules
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Worker*" -or $_.DisplayName -like "*Ollama*"}
```

---

## ✅ Complete Verification Script

Save this as `verify_install.ps1` and run as Administrator:

```powershell
# Windows Server Prerequisites Verification Script
# Run as Administrator

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Checking Prerequisites..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Docker: " -NoNewline
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "$dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "NOT INSTALLED" -ForegroundColor Red
}

# Check Docker Compose
Write-Host "Docker Compose: " -NoNewline
try {
    $composeVersion = docker compose version 2>&1
    Write-Host "$composeVersion" -ForegroundColor Green
} catch {
    Write-Host "NOT INSTALLED" -ForegroundColor Red
}

# Check Ollama
Write-Host "Ollama: " -NoNewline
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "$ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "NOT INSTALLED" -ForegroundColor Red
}

# Check Ollama Service
Write-Host "Ollama Service: " -NoNewline
try {
    $response = Invoke-WebRequest -Uri http://localhost:11434/api/version -ErrorAction Stop
    Write-Host "RUNNING" -ForegroundColor Green
} catch {
    Write-Host "NOT RUNNING" -ForegroundColor Red
}

# Check Ollama Model
Write-Host "Ollama Model (llama3.1): " -NoNewline
try {
    $models = ollama list 2>&1
    if ($models -like "*llama3.1*") {
        Write-Host "INSTALLED" -ForegroundColor Green
    } else {
        Write-Host "NOT INSTALLED - Run: ollama pull llama3.1:latest" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR CHECKING" -ForegroundColor Red
}

# Check Tesseract
Write-Host "Tesseract OCR: " -NoNewline
try {
    $tesseractVersion = tesseract --version 2>&1 | Select-Object -First 1
    Write-Host "$tesseractVersion" -ForegroundColor Green
} catch {
    Write-Host "NOT INSTALLED OR NOT IN PATH" -ForegroundColor Red
}

# Check Poppler
Write-Host "Poppler Utils: " -NoNewline
try {
    $popplerVersion = pdfinfo -v 2>&1 | Select-Object -First 1
    Write-Host "$popplerVersion" -ForegroundColor Green
} catch {
    Write-Host "NOT INSTALLED OR NOT IN PATH" -ForegroundColor Red
}

# Check Python (Optional)
Write-Host "Python: " -NoNewline
try {
    $pythonVersion = python --version 2>&1
    Write-Host "$pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "NOT INSTALLED (Optional - Docker includes Python)" -ForegroundColor Yellow
}

# Check PostgreSQL
Write-Host "PostgreSQL Client: " -NoNewline
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "$psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "NOT INSTALLED (Optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "System Information:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# System Info
$os = Get-CimInstance Win32_OperatingSystem
$cpu = Get-CimInstance Win32_Processor
$memory = Get-CimInstance Win32_ComputerSystem

Write-Host "OS: $($os.Caption)" -ForegroundColor Cyan
Write-Host "CPU: $($cpu.Name) - $($cpu.NumberOfCores) cores" -ForegroundColor Cyan
Write-Host "RAM: $([math]::Round($memory.TotalPhysicalMemory/1GB, 2)) GB" -ForegroundColor Cyan

# Disk Space
$disk = Get-PSDrive C
Write-Host "C: Drive Free Space: $([math]::Round($disk.Free/1GB, 2)) GB" -ForegroundColor Cyan

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Firewall Rules:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Get-NetFirewallRule | Where-Object {
    $_.DisplayName -like "*Worker*" -or 
    $_.DisplayName -like "*Ollama*" -or 
    $_.DisplayName -like "*PostgreSQL*"
} | Select-Object DisplayName, Enabled, Direction | Format-Table

Write-Host ""
Write-Host "Verification complete!" -ForegroundColor Green
```

**Run it:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\verify_install.ps1
```

---

## 📦 Installation Order & Time

| Step | Component | Time | Notes |
|------|-----------|------|-------|
| 1 | Docker Desktop | 10 min | Includes WSL 2 setup |
| 2 | Ollama | 3 min | Software install only |
| 3 | Ollama Model | 15 min | 4.7GB download |
| 4 | Tesseract OCR | 3 min | Include in PATH |
| 5 | Poppler | 5 min | Manual extraction + PATH |
| 6 | PostgreSQL | 5 min | Optional |
| 7 | Firewall | 2 min | PowerShell commands |
| **TOTAL** | | **45 min** | Mostly download time |

---

## 🔒 Security Considerations

### Service Accounts
```powershell
# Create dedicated service user (optional)
New-LocalUser -Name "WorkerService" -Description "Worker Service Account" -NoPassword
Add-LocalGroupMember -Group "docker-users" -Member "WorkerService"
```

### Firewall - Restrict by IP
```powershell
# Allow only from specific IPs (more secure)
New-NetFirewallRule -DisplayName "Worker API - Restricted" `
    -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow `
    -RemoteAddress 192.168.1.0/24
```

---

## 🌐 Network Requirements

### Outbound Internet Access Needed:
- Docker Hub (docker.io) - Pull images
- Ollama (ollama.ai) - Download AI model (~4.7GB)
- GitHub (github.com) - Downloads
- PyPI (pypi.org) - Python packages

### Inbound Ports:
- **8001** - Worker API (from Next.js app only)
- **11434** - Ollama (localhost only)
- **5434** - PostgreSQL (if needed)

---

## ❓ Troubleshooting

### Docker won't start
```powershell
# Enable WSL 2
wsl --install
wsl --set-default-version 2

# Enable Hyper-V (if needed)
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

### Ollama not responding
```powershell
# Check if Ollama service is running
Get-Process ollama

# Restart Ollama
Stop-Process -Name ollama -Force
# Start Ollama app again from Start menu
```

### Command not found (Tesseract/Poppler)
```powershell
# Check PATH
$env:Path

# Add to PATH permanently (run as Admin)
[Environment]::SetEnvironmentVariable(
    "Path",
    $env:Path + ";C:\Program Files\Tesseract-OCR;C:\Program Files\poppler\Library\bin",
    [System.EnvironmentVariableTarget]::Machine
)

# Restart PowerShell after PATH changes
```

### Firewall blocking connections
```powershell
# Disable Windows Firewall temporarily for testing (NOT recommended for production)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Re-enable after testing
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

---

## 📞 After Installation

Once all prerequisites are installed:

1. ✅ Run the verification script
2. ✅ Ensure all checks pass
3. ✅ Notify the deployment team
4. ✅ Provide any error messages if issues occur

The deployment team can then proceed with deploying the worker service (no admin access needed for that step).

---

**Questions?** See the complete guide in **ADMIN_PREREQUISITES.md** or contact the deployment team.

---

**Installation Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Complete

**Completed By**: ________________  
**Date**: ________________  
**Notes**: ________________




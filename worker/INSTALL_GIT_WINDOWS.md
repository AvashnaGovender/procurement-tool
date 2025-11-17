# Install Git on Windows Server

## Quick Installation

### Method 1: Download and Install (Recommended)

```powershell
# Download Git installer
$gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe"
Invoke-WebRequest -Uri $gitUrl -OutFile "$env:TEMP\git-installer.exe"

# Run installer (silent install)
Start-Process -FilePath "$env:TEMP\git-installer.exe" -ArgumentList "/VERYSILENT", "/NORESTART", "/NOCANCEL", "/SP-", "/CLOSEAPPLICATIONS", "/RESTARTAPPLICATIONS", "/COMPONENTS=icons,ext\reg\shellhere,assoc,assoc_sh" -Wait

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify installation
git --version
```

### Method 2: Using Winget (Windows Server 2022+)

```powershell
winget install --id Git.Git -e --source winget
```

### Method 3: Using Chocolatey

```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Git
choco install git -y

# Refresh PATH
refreshenv
```

---

## Configure Git

```powershell
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@schauenburg.co.za"

# Set default branch name
git config --global init.defaultBranch main

# Enable credential helper (store credentials)
git config --global credential.helper wincred

# Set line ending handling (Windows)
git config --global core.autocrlf true

# Verify configuration
git config --list
```

---

## Clone or Initialize Repository

### Option 1: Clone from GitHub (if using GitHub)

```powershell
# Navigate to parent directory
cd C:\procurement

# Clone the repository
git clone https://github.com/YOUR_USERNAME/procurement-tool.git procurement-app

# Or if already exists, navigate and pull
cd C:\procurement\procurement-app
git pull origin main
```

### Option 2: Initialize Existing Directory

If you've already copied files to the server:

```powershell
cd C:\procurement\procurement-app

# Initialize Git
git init

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/procurement-tool.git

# Fetch latest
git fetch origin

# Reset to match remote (WARNING: This will overwrite local changes)
git reset --hard origin/main

# Or merge if you want to keep local changes
git pull origin main --allow-unrelated-histories
```

---

## Set Up Authentication

### For HTTPS (Easier)

When you first pull/push, Windows will prompt for GitHub credentials. You can:

1. **Use Personal Access Token (Recommended)**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Use token as password when prompted
   - Windows Credential Manager will save it

2. **GitHub Desktop Alternative**:
   - Install GitHub Desktop (https://desktop.github.com/)
   - Sign in to authenticate
   - Use command line Git after

### For SSH (More Secure)

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@schauenburg.co.za"

# Start SSH agent
Start-Service ssh-agent

# Add key to agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519

# Copy public key to clipboard
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | clip

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
# Paste the key from clipboard

# Test connection
ssh -T git@github.com

# Use SSH URL for remote
git remote set-url origin git@github.com:YOUR_USERNAME/procurement-tool.git
```

---

## Deploy Updates Workflow

### 1. Create a Pull Script

```powershell
# Create C:\procurement\update-app.ps1
@"
# ============================================================================
# UPDATE PROCUREMENT APP FROM GIT
# ============================================================================

Write-Host "🔄 Updating Procurement App..." -ForegroundColor Cyan

# Navigate to app directory
cd C:\procurement\procurement-app

# Stash any local changes (like .env)
Write-Host "📦 Stashing local changes..." -ForegroundColor Yellow
git stash

# Pull latest changes
Write-Host "⬇️  Pulling latest changes from Git..." -ForegroundColor Yellow
git pull origin main

# Restore local changes
Write-Host "📂 Restoring local changes..." -ForegroundColor Yellow
git stash pop

# Install any new dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Rebuild the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Update complete!" -ForegroundColor Green
Write-Host "⚠️  Please restart the application:" -ForegroundColor Yellow
Write-Host "   1. Press Ctrl+C in the running app window" -ForegroundColor White
Write-Host "   2. Run: .\start-app.ps1" -ForegroundColor White
"@ | Out-File -FilePath "C:\procurement\update-app.ps1" -Encoding UTF8

Write-Host "✅ Created update-app.ps1" -ForegroundColor Green
```

### 2. Run Updates

```powershell
# Pull and update
cd C:\procurement
.\update-app.ps1

# Restart the app
cd C:\procurement\procurement-app
.\start-app.ps1
```

---

## Update Worker (Python Backend)

```powershell
# Create C:\procurement\update-worker.ps1
@"
# ============================================================================
# UPDATE WORKER FROM GIT
# ============================================================================

Write-Host "🔄 Updating Worker..." -ForegroundColor Cyan

# Navigate to worker directory
cd C:\procurement\worker

# Stash local changes
git stash

# Pull latest changes
git pull origin main

# Restore local changes
git stash pop

# Activate virtual environment and update dependencies
Write-Host "📦 Updating Python dependencies..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt --upgrade

Write-Host "✅ Worker update complete!" -ForegroundColor Green
Write-Host "⚠️  Please restart the worker:" -ForegroundColor Yellow
Write-Host "   1. Press Ctrl+C in the running worker window" -ForegroundColor White
Write-Host "   2. Run: python main.py" -ForegroundColor White
"@ | Out-File -FilePath "C:\procurement\update-worker.ps1" -Encoding UTF8

Write-Host "✅ Created update-worker.ps1" -ForegroundColor Green
```

---

## Protect Configuration Files

Create a `.gitignore` file to prevent overwriting environment variables:

```powershell
cd C:\procurement\procurement-app

# Check if .gitignore exists
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore already exists" -ForegroundColor Green
} else {
    @"
# Environment variables
.env
.env.local
.env.production.local

# Node modules
node_modules/
.next/
out/

# Python
__pycache__/
*.pyc
venv/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✅ Created .gitignore" -ForegroundColor Green
}
```

---

## Troubleshooting

### Git Not Found After Install

```powershell
# Refresh PATH in current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")

# Or restart PowerShell
```

### SSL Certificate Errors

```powershell
# Disable SSL verification (not recommended for production)
git config --global http.sslVerify false

# Or update certificates
git config --global http.sslCAInfo "C:\Program Files\Git\mingw64\ssl\certs\ca-bundle.crt"
```

### Permission Denied

```powershell
# Run as Administrator
Start-Process powershell -Verb RunAs
```

### Merge Conflicts

```powershell
# View conflicted files
git status

# Accept remote version (lose local changes)
git checkout --theirs path/to/file

# Accept local version (keep local changes)
git checkout --ours path/to/file

# After resolving all conflicts
git add .
git commit -m "Resolved merge conflicts"
```

---

## Next Steps

1. Install Git using Method 1 above
2. Configure Git with your details
3. Clone or initialize your repository
4. Set up authentication (Personal Access Token recommended)
5. Test pulling changes: `git pull origin main`
6. Use the update scripts for easy deployment

---

## Quick Commands Reference

```powershell
# Check Git status
git status

# View changes
git diff

# Pull latest changes
git pull origin main

# View commit history
git log --oneline -10

# Discard local changes
git checkout -- path/to/file

# Create a branch (for testing)
git checkout -b test-branch

# Switch back to main
git checkout main
```


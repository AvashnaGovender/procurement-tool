# =============================================================================
# IIS Intranet Setup - Automated Script
# =============================================================================
# This script automates the IIS setup for the Procurement App
# Run as Administrator

param(
    [string]$HostName = "procurement.schauenburg.local",
    [string]$ServerIP = "192.168.0.34",
    [string]$DbPassword = "admin123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Procurement App - IIS Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# =============================================================================
# Step 1: Install IIS
# =============================================================================

Write-Host "[Step 1/7] Installing IIS..." -ForegroundColor Yellow

$iisInstalled = Get-WindowsFeature -Name Web-Server | Where-Object { $_.Installed }

if ($iisInstalled) {
    Write-Host "✓ IIS already installed" -ForegroundColor Green
} else {
    Write-Host "Installing IIS (this may take a few minutes)..." -ForegroundColor Yellow
    Install-WindowsFeature -Name Web-Server -IncludeManagementTools -ErrorAction Stop
    Write-Host "✓ IIS installed successfully" -ForegroundColor Green
}

Write-Host ""

# =============================================================================
# Step 2: Check URL Rewrite Module
# =============================================================================

Write-Host "[Step 2/7] Checking URL Rewrite Module..." -ForegroundColor Yellow

$rewriteInstalled = Get-WebConfiguration -Filter "system.webServer/rewrite/rules" -ErrorAction SilentlyContinue

if ($rewriteInstalled) {
    Write-Host "✓ URL Rewrite module detected" -ForegroundColor Green
} else {
    Write-Host "⚠️  URL Rewrite module NOT found" -ForegroundColor Red
    Write-Host "Please download and install from:" -ForegroundColor Yellow
    Write-Host "https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""

# =============================================================================
# Step 3: Enable ARR Proxy
# =============================================================================

Write-Host "[Step 3/7] Enabling ARR Proxy..." -ForegroundColor Yellow

try {
    Import-Module WebAdministration -ErrorAction Stop
    
    # Enable proxy
    Set-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST" `
        -Filter "system.webServer/proxy" `
        -Name "enabled" `
        -Value "True" `
        -ErrorAction SilentlyContinue
    
    Write-Host "✓ ARR Proxy enabled" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not enable ARR Proxy (might not be installed)" -ForegroundColor Yellow
    Write-Host "Download from: https://www.iis.net/downloads/microsoft/application-request-routing" -ForegroundColor Cyan
}

Write-Host ""

# =============================================================================
# Step 4: Create Website Directory and Files
# =============================================================================

Write-Host "[Step 4/7] Creating website directory..." -ForegroundColor Yellow

$websitePath = "C:\inetpub\procurement"
New-Item -ItemType Directory -Path $websitePath -Force | Out-Null
Write-Host "✓ Created directory: $websitePath" -ForegroundColor Green

# Copy web.config
$webConfigSource = Join-Path $PSScriptRoot "web.config"
$webConfigDest = Join-Path $websitePath "web.config"

if (Test-Path $webConfigSource) {
    Copy-Item -Path $webConfigSource -Destination $webConfigDest -Force
    Write-Host "✓ Copied web.config" -ForegroundColor Green
} else {
    Write-Host "⚠️  web.config not found at: $webConfigSource" -ForegroundColor Yellow
    Write-Host "You'll need to create it manually" -ForegroundColor Yellow
}

Write-Host ""

# =============================================================================
# Step 5: Create IIS Website
# =============================================================================

Write-Host "[Step 5/7] Creating IIS website..." -ForegroundColor Yellow

# Remove existing website if it exists
$existingSite = Get-Website -Name "Procurement" -ErrorAction SilentlyContinue
if ($existingSite) {
    Remove-Website -Name "Procurement" -ErrorAction SilentlyContinue
    Write-Host "Removed existing website" -ForegroundColor Yellow
}

# Create new website
New-Website -Name "Procurement" `
    -PhysicalPath $websitePath `
    -Port 80 `
    -HostHeader $HostName `
    -Force `
    -ErrorAction Stop

# Start the website
Start-Website -Name "Procurement" -ErrorAction SilentlyContinue

Write-Host "✓ IIS website created: $HostName" -ForegroundColor Green
Write-Host ""

# =============================================================================
# Step 6: Add Firewall Rule
# =============================================================================

Write-Host "[Step 6/7] Configuring firewall..." -ForegroundColor Yellow

# Remove existing rule if it exists
$existingRule = Get-NetFirewallRule -DisplayName "Procurement App HTTP" -ErrorAction SilentlyContinue
if ($existingRule) {
    Remove-NetFirewallRule -DisplayName "Procurement App HTTP" -ErrorAction SilentlyContinue
}

# Add new rule
New-NetFirewallRule -DisplayName "Procurement App HTTP" `
    -Direction Inbound `
    -LocalPort 80 `
    -Protocol TCP `
    -Action Allow `
    -ErrorAction Stop

Write-Host "✓ Firewall rule added for port 80" -ForegroundColor Green
Write-Host ""

# =============================================================================
# Step 7: Verify Setup
# =============================================================================

Write-Host "[Step 7/7] Verifying setup..." -ForegroundColor Yellow
Write-Host ""

# Check IIS website
$website = Get-Website -Name "Procurement"
Write-Host "Website Status:" -ForegroundColor Cyan
Write-Host "  Name: $($website.Name)"
Write-Host "  State: $($website.State)"
Write-Host "  Port: 80"
Write-Host "  Host: $HostName"
Write-Host ""

# Check if Next.js is running
Write-Host "Checking backend services..." -ForegroundColor Cyan
$nextjsRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$workerRunning = Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue

if ($nextjsRunning) {
    Write-Host "  ✓ Next.js app running (port 3000)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Next.js app NOT running (port 3000)" -ForegroundColor Yellow
    Write-Host "     Start it with: .\start-app.ps1" -ForegroundColor Cyan
}

if ($workerRunning) {
    Write-Host "  ✓ Worker service running (port 8001)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Worker service NOT running (port 8001)" -ForegroundColor Yellow
    Write-Host "     Start it manually or set up as service" -ForegroundColor Cyan
}

Write-Host ""

# =============================================================================
# Summary
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure DNS (ask IT admin):" -ForegroundColor White
Write-Host "   Create A record: $HostName -> $ServerIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Update .env file:" -ForegroundColor White
Write-Host "   cd C:\procurement\procurement-app" -ForegroundColor Cyan
Write-Host "   Edit .env and set:" -ForegroundColor Cyan
Write-Host "   NEXTAUTH_URL=http://$HostName" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start backend services:" -ForegroundColor White
Write-Host "   cd C:\procurement\procurement-app" -ForegroundColor Cyan
Write-Host "   .\start-app.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Test access:" -ForegroundColor White
Write-Host "   http://$HostName" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. (Optional) Set up Windows Services:" -ForegroundColor White
Write-Host "   See IIS_INTRANET_SETUP.md Part 3" -ForegroundColor Cyan
Write-Host ""

Write-Host "Access URL: http://$HostName" -ForegroundColor Green
Write-Host ""




# =============================================================================
# Procurement App - Deploy Script
# =============================================================================
# Run this on the server after pulling new code changes.
# Usage: .\deploy.ps1

$AppDir  = "C:\procurement\procurement-app"
$Pm2     = "C:\Users\Administrator.STRATOSAT\AppData\Roaming\npm\pm2.cmd"
$AppName = "procurement"

Set-Location $AppDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Procurement App - Deploying..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Pull latest code ───────────────────────────────────────────────────────

if (Test-Path ".git") {
    Write-Host "[1/3] Pulling latest code..." -ForegroundColor Yellow
    git pull origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: git pull failed. Fix conflicts and retry." -ForegroundColor Red
        exit 1
    }
    Write-Host "  Done." -ForegroundColor Green
} else {
    Write-Host "[1/3] Skipping git pull (no .git folder found)." -ForegroundColor Yellow
}

Write-Host ""

# ── 2. Build ──────────────────────────────────────────────────────────────────

Write-Host "[2/3] Building..." -ForegroundColor Yellow
node --max-old-space-size=4096 node_modules/next/dist/bin/next build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed. The running app has NOT been restarted." -ForegroundColor Red
    exit 1
}

Write-Host "  Build complete." -ForegroundColor Green
Write-Host ""

# ── 3. Restart PM2 ───────────────────────────────────────────────────────────

Write-Host "[3/3] Restarting app..." -ForegroundColor Yellow
& $Pm2 restart $AppName

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PM2 restart failed. Try manually: pm2 restart $AppName" -ForegroundColor Red
    exit 1
}

Write-Host "  App restarted." -ForegroundColor Green
Write-Host ""

# ── Done ─────────────────────────────────────────────────────────────────────

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  https://suppliers.schauenburg.co.za:3000" -ForegroundColor Cyan
Write-Host ""

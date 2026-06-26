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

# Free port 3001 before restarting to avoid EADDRINUSE
$portPids = netstat -ano | Select-String ":3001 " | ForEach-Object {
    ($_ -split '\s+')[-1]
} | Sort-Object -Unique
foreach ($p in $portPids) {
    if ($p -match '^\d+$') {
        Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2

$pm2Status = & $Pm2 describe $AppName 2>&1
if ($pm2Status -match "not found|error" -or $LASTEXITCODE -ne 0) {
    Write-Host "  Process not found in PM2 — starting fresh..." -ForegroundColor Yellow
    & $Pm2 delete $AppName 2>$null
    & $Pm2 start node_modules/next/dist/bin/next `
        --name $AppName `
        --node-args="--max-old-space-size=4096" `
        --restart-delay=5000 `
        --max-restarts=10 `
        -- start -p 3001
} else {
    & $Pm2 restart $AppName
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PM2 failed. Check: pm2 logs $AppName" -ForegroundColor Red
    exit 1
}

& $Pm2 save | Out-Null

Write-Host "  App restarted." -ForegroundColor Green
Write-Host ""

# ── Done ─────────────────────────────────────────────────────────────────────

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  https://suppliers.schauenburg.co.za:3000" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# Fix: JavaScript heap out-of-memory on ProcurementApp service
# =============================================================================
# Run as Administrator on the server.
#
# What this does:
#   1. Sets NODE_OPTIONS on the ProcurementApp NSSM service so Node.js gets
#      4 GB of heap instead of the default ~1.5 GB.
#   2. Creates a daily scheduled Task that restarts the service at 03:00 as a
#      safety net while the root-cause code fix is deployed.
#
# Root cause (already fixed in lib/prisma.ts on the dev machine):
#   The Prisma singleton was only cached in `global` during development. In
#   production each new Next.js render context created a fresh PrismaClient
#   with its own connection pool, leaking memory over days of uptime.

param(
    [int]$HeapMb = 4096,
    [string]$ServiceName = "ProcurementApp",
    [string]$RestartTime = "03:00"
)

$ErrorActionPreference = "Stop"

# ── 1. Check prerequisites ────────────────────────────────────────────────────

$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Must be run as Administrator." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: nssm not found on PATH. Install it first (see SETUP_WINDOWS_SERVICES.md)." -ForegroundColor Red
    exit 1
}

# ── 2. Set NODE_OPTIONS on the NSSM service ──────────────────────────────────

Write-Host "Setting NODE_OPTIONS=--max-old-space-size=$HeapMb on service '$ServiceName'..." -ForegroundColor Cyan

nssm set $ServiceName AppEnvironmentExtra "NODE_OPTIONS=--max-old-space-size=$HeapMb"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: nssm set failed (exit $LASTEXITCODE). Is '$ServiceName' installed?" -ForegroundColor Red
    exit 1
}

Write-Host "  Done." -ForegroundColor Green

# ── 3. Restart the service so the env var takes effect ───────────────────────

Write-Host "Restarting '$ServiceName'..." -ForegroundColor Cyan
nssm restart $ServiceName
Start-Sleep -Seconds 5
$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -eq "Running") {
    Write-Host "  Service is running." -ForegroundColor Green
} else {
    Write-Host "  WARNING: Service may not be running. Check: Get-Service $ServiceName" -ForegroundColor Yellow
}

# ── 4. Create a daily scheduled restart task ─────────────────────────────────

$taskName = "RestartProcurementApp"
Write-Host "Creating daily restart task '$taskName' at $RestartTime..." -ForegroundColor Cyan

# Remove existing task if present
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$action  = New-ScheduledTaskAction -Execute "nssm.exe" -Argument "restart $ServiceName"
$trigger = New-ScheduledTaskTrigger -Daily -At $RestartTime
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5) -RestartOnIdle $false

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -RunLevel Highest `
    -Description "Daily restart of Procurement Next.js service to reclaim any residual heap" `
    -Force | Out-Null

Write-Host "  Scheduled task created." -ForegroundColor Green

# ── 5. Summary ────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Memory fix applied!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  NODE_OPTIONS : --max-old-space-size=$HeapMb (${HeapMb}MB heap cap)"
Write-Host "  Daily restart: $RestartTime via Task Scheduler ('$taskName')"
Write-Host ""
Write-Host "Deploy the updated lib/prisma.ts from the dev machine to make this" -ForegroundColor Yellow
Write-Host "permanent (the daily restart is only a safety net)." -ForegroundColor Yellow
Write-Host ""

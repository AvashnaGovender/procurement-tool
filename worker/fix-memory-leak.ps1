# =============================================================================
# Fix: JavaScript heap out-of-memory on ProcurementApp service
# =============================================================================
# Run as Administrator on the server.
#
# What this does:
#   1. Downloads and installs NSSM if not already on PATH.
#   2. Sets NODE_OPTIONS on the ProcurementApp service so Node.js gets
#      4 GB of heap instead of the default ~1.5 GB.
#   3. Creates a daily scheduled Task that restarts the service at 03:00 as a
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

# ── 1. Must be Administrator ──────────────────────────────────────────────────

$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Must be run as Administrator." -ForegroundColor Red
    exit 1
}

# ── 2. Install NSSM if missing ────────────────────────────────────────────────

function Ensure-Nssm {
    if (Get-Command nssm -ErrorAction SilentlyContinue) {
        Write-Host "  nssm already on PATH." -ForegroundColor Green
        return
    }

    Write-Host "  nssm not found - downloading..." -ForegroundColor Yellow

    $nssmZip  = "$env:TEMP\nssm.zip"
    $nssmDir  = "$env:TEMP\nssm-extracted"
    $nssmDest = "C:\Windows\System32\nssm.exe"

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" `
                          -OutFile $nssmZip -UseBasicParsing
    } catch {
        Write-Host "  Download failed: $_" -ForegroundColor Red
        Write-Host "  Falling back to registry method (no nssm needed)." -ForegroundColor Yellow
        return
    }

    Expand-Archive -Path $nssmZip -DestinationPath $nssmDir -Force
    $nssmExe = Get-ChildItem -Path $nssmDir -Recurse -Filter "nssm.exe" |
               Where-Object { $_.FullName -like "*win64*" } |
               Select-Object -First 1

    if (-not $nssmExe) {
        $nssmExe = Get-ChildItem -Path $nssmDir -Recurse -Filter "nssm.exe" |
                   Select-Object -First 1
    }

    if ($nssmExe) {
        Copy-Item -Path $nssmExe.FullName -Destination $nssmDest -Force
        Write-Host "  nssm installed to $nssmDest" -ForegroundColor Green
    } else {
        Write-Host "  Could not extract nssm.exe - falling back to registry method." -ForegroundColor Yellow
    }
}

Write-Host "Checking for nssm..." -ForegroundColor Cyan
Ensure-Nssm

# ── 3. Set NODE_OPTIONS on the service ───────────────────────────────────────
#
#  Primary path : nssm (preferred - cleaner, survives service reinstalls)
#  Fallback path: write directly to the service registry key
#                 HKLM\SYSTEM\CurrentControlSet\Services\<name>\Environment
# ─────────────────────────────────────────────────────────────────────────────

$nodeOpts = "--max-old-space-size=$HeapMb"

Write-Host "Setting NODE_OPTIONS=$nodeOpts on service '$ServiceName'..." -ForegroundColor Cyan

$usedNssm = $false

if (Get-Command nssm -ErrorAction SilentlyContinue) {
    # Check whether this service is actually managed by nssm
    $nssmCheck = nssm status $ServiceName 2>&1
    if ($LASTEXITCODE -eq 0 -or $nssmCheck -notmatch "not found") {
        nssm set $ServiceName AppEnvironmentExtra "NODE_OPTIONS=$nodeOpts"
        if ($LASTEXITCODE -eq 0) {
            $usedNssm = $true
            Write-Host "  Set via nssm." -ForegroundColor Green
        }
    }
}

if (-not $usedNssm) {
    # Registry fallback - works for any Windows service (nssm or native sc)
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName"

    if (-not (Test-Path $regPath)) {
        Write-Host "ERROR: Service '$ServiceName' not found in registry." -ForegroundColor Red
        Write-Host "Check the service name with: Get-Service | Where-Object { `$_.DisplayName -like '*Procurement*' }" -ForegroundColor Yellow
        exit 1
    }

    $existing = (Get-ItemProperty -Path $regPath -Name Environment -ErrorAction SilentlyContinue).Environment
    $newEntry  = "NODE_OPTIONS=$nodeOpts"

    if ($existing) {
        # Replace any existing NODE_OPTIONS entry, keep others
        $filtered = $existing | Where-Object { $_ -notmatch "^NODE_OPTIONS=" }
        $filtered += $newEntry
        Set-ItemProperty -Path $regPath -Name Environment -Value $filtered
    } else {
        New-ItemProperty -Path $regPath -Name Environment -Value @($newEntry) `
                         -PropertyType MultiString -Force | Out-Null
    }

    Write-Host "  Set via registry ($regPath)." -ForegroundColor Green
}

# ── 4. Restart the service ────────────────────────────────────────────────────

Write-Host "Restarting '$ServiceName'..." -ForegroundColor Cyan

try {
    if ($usedNssm) {
        nssm restart $ServiceName
    } else {
        Restart-Service -Name $ServiceName -Force
    }
    Start-Sleep -Seconds 8
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -eq "Running") {
        Write-Host "  Service is running." -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Service may not be running. Check:" -ForegroundColor Yellow
        Write-Host "  Get-Service $ServiceName" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  Could not restart automatically: $_" -ForegroundColor Yellow
    Write-Host "  Restart manually: Restart-Service $ServiceName" -ForegroundColor Cyan
}

# ── 5. Create a daily scheduled restart task ─────────────────────────────────

$taskName   = "RestartProcurementApp"
$restartCmd = if ($usedNssm) { "nssm.exe" } else { "powershell.exe" }
$restartArg = if ($usedNssm) { "restart $ServiceName" } `
              else { "-NonInteractive -Command `"Restart-Service -Name '$ServiceName' -Force`"" }

Write-Host "Creating daily restart task '$taskName' at $RestartTime..." -ForegroundColor Cyan

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$action   = New-ScheduledTaskAction -Execute $restartCmd -Argument $restartArg
$trigger  = New-ScheduledTaskTrigger -Daily -At $RestartTime
$settings = New-ScheduledTaskSettingsSet `
                -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
                -RestartOnIdle $false

Register-ScheduledTask `
    -TaskName    $taskName `
    -Action      $action `
    -Trigger     $trigger `
    -Settings    $settings `
    -RunLevel    Highest `
    -Description "Daily restart of Procurement Next.js service to reclaim residual heap" `
    -Force | Out-Null

Write-Host "  Scheduled task created." -ForegroundColor Green

# ── 6. Summary ────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Memory fix applied!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  NODE_OPTIONS : --max-old-space-size=$HeapMb (${HeapMb} MB heap cap)"
Write-Host "  Daily restart: $RestartTime  (Task Scheduler: '$taskName')"
Write-Host ""
Write-Host "Next step: deploy the updated lib/prisma.ts from the dev machine" -ForegroundColor Yellow
Write-Host "to make the fix permanent (the daily restart is only a safety net)." -ForegroundColor Yellow
Write-Host ""

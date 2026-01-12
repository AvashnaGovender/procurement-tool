# ============================================================================
# FIX GIT HEAD PERMISSION ISSUE
# ============================================================================

Write-Host "🔧 Fixing Git HEAD Permission Issue..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    Write-Host "   Please navigate to your repository directory first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# Check current permissions
Write-Host "1. Checking current permissions..." -ForegroundColor Yellow
try {
    if (Test-Path ".git\HEAD") {
        $headAcl = Get-Acl ".git\HEAD"
        Write-Host "   .git/HEAD owner: $($headAcl.Owner)" -ForegroundColor White
    } else {
        Write-Host "   ⚠️  .git/HEAD file not found!" -ForegroundColor Red
    }
    
    $gitAcl = Get-Acl ".git"
    Write-Host "   .git directory owner: $($gitAcl.Owner)" -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Could not read permissions: $_" -ForegroundColor Yellow
}

Write-Host ""

# Fix permissions
Write-Host "2. Fixing permissions..." -ForegroundColor Yellow

try {
    # Fix .git directory permissions
    Write-Host "   Fixing .git directory..." -ForegroundColor Gray
    icacls ".git" /grant "${env:USERNAME}:(OI)(CI)F" /T 2>&1 | Out-Null
    
    # Fix .git/HEAD specifically
    if (Test-Path ".git\HEAD") {
        Write-Host "   Fixing .git/HEAD file..." -ForegroundColor Gray
        icacls ".git\HEAD" /grant "${env:USERNAME}:F" 2>&1 | Out-Null
    }
    
    # Fix other important git files
    $gitFiles = @(".git\config", ".git\index", ".git\refs")
    foreach ($file in $gitFiles) {
        if (Test-Path $file) {
            icacls $file /grant "${env:USERNAME}:(OI)(CI)F" /T 2>&1 | Out-Null
        }
    }
    
    Write-Host "   ✅ Permissions updated" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Error fixing permissions: $_" -ForegroundColor Red
    Write-Host "   You may need to run PowerShell as Administrator" -ForegroundColor Yellow
}

Write-Host ""

# Test git command
Write-Host "3. Testing git command..." -ForegroundColor Yellow
try {
    $result = git status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Git is working!" -ForegroundColor Green
        Write-Host "   You can now run: git pull origin main" -ForegroundColor White
    } else {
        Write-Host "   ❌ Git still has issues:" -ForegroundColor Red
        Write-Host "   $result" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Try running this script as Administrator:" -ForegroundColor Yellow
        Write-Host "   Start-Process powershell -Verb RunAs -ArgumentList '-File', '$(Resolve-Path .\fix-git-head-permissions.ps1)'" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}

Write-Host ""


# ============================================================================
# GIT PERMISSION DIAGNOSTIC SCRIPT
# ============================================================================

Write-Host "🔍 Diagnosing Git Permission Issues..." -ForegroundColor Cyan
Write-Host ""

# 1. Check current user
Write-Host "1. Current User:" -ForegroundColor Yellow
Write-Host "   $env:USERNAME" -ForegroundColor White
Write-Host ""

# 2. Check current directory
Write-Host "2. Current Directory:" -ForegroundColor Yellow
Write-Host "   $(Get-Location)" -ForegroundColor White
Write-Host ""

# 3. Check if in a git repository
Write-Host "3. Git Repository Check:" -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   ✅ Git repository detected" -ForegroundColor Green
    Write-Host "   Remote URL:" -ForegroundColor White
    git remote -v 2>&1 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "   ❌ Not a git repository" -ForegroundColor Red
}
Write-Host ""

# 4. Check directory permissions
Write-Host "4. Directory Permissions:" -ForegroundColor Yellow
try {
    $acl = Get-Acl .
    Write-Host "   Owner: $($acl.Owner)" -ForegroundColor White
    Write-Host "   Permissions:" -ForegroundColor White
    $acl.Access | ForEach-Object {
        Write-Host "     $($_.IdentityReference): $($_.FileSystemRights)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Could not read permissions: $_" -ForegroundColor Red
}
Write-Host ""

# 5. Check SSH setup (if using SSH)
Write-Host "5. SSH Configuration:" -ForegroundColor Yellow
$sshKeyPath = "$env:USERPROFILE\.ssh\id_ed25519"
if (Test-Path $sshKeyPath) {
    Write-Host "   ✅ SSH key found at: $sshKeyPath" -ForegroundColor Green
    try {
        $sshAcl = Get-Acl $sshKeyPath
        Write-Host "   SSH key owner: $($sshAcl.Owner)" -ForegroundColor White
    } catch {
        Write-Host "   ⚠️  Could not read SSH key permissions" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  SSH key not found (using HTTPS?)" -ForegroundColor Yellow
}
Write-Host ""

# 6. Test git fetch (dry run)
Write-Host "6. Testing Git Connection:" -ForegroundColor Yellow
try {
    $remoteUrl = git remote get-url origin 2>&1
    if ($remoteUrl -match "git@") {
        Write-Host "   Using SSH: $remoteUrl" -ForegroundColor White
        Write-Host "   Testing SSH connection..." -ForegroundColor White
        ssh -T git@github.com 2>&1 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "   Using HTTPS: $remoteUrl" -ForegroundColor White
        Write-Host "   ⚠️  HTTPS requires credentials (Personal Access Token)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error: $_" -ForegroundColor Red
}
Write-Host ""

# 7. Check .git directory permissions
Write-Host "7. .git Directory Permissions:" -ForegroundColor Yellow
if (Test-Path ".git") {
    try {
        $gitAcl = Get-Acl .git
        Write-Host "   Owner: $($gitAcl.Owner)" -ForegroundColor White
    } catch {
        Write-Host "   ⚠️  Could not read .git permissions: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ .git directory not found" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Diagnostic complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Common Solutions:" -ForegroundColor Cyan
Write-Host "  1. If owner is different: Run 'takeown /F . /R /D Y' as Administrator" -ForegroundColor White
Write-Host "  2. If SSH issue: Check SSH key permissions and GitHub SSH key setup" -ForegroundColor White
Write-Host "  3. If HTTPS issue: Use Personal Access Token or switch to SSH" -ForegroundColor White
Write-Host "  4. If file locked: Close any programs using files in this directory" -ForegroundColor White


# Windows Server Prerequisites Verification Script
# For AI Document Analysis Worker Service
# Run as Administrator in PowerShell

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Worker Service Prerequisites Check" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "  ✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker: NOT INSTALLED" -ForegroundColor Red
    Write-Host "     Download: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Gray
    $allGood = $false
}

# Check Docker Compose
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version 2>&1
    Write-Host "  ✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker Compose: NOT INSTALLED" -ForegroundColor Red
    $allGood = $false
}

# Test Docker
Write-Host "Testing Docker..." -ForegroundColor Yellow
try {
    $dockerTest = docker run --rm hello-world 2>&1
    if ($dockerTest -like "*Hello from Docker*") {
        Write-Host "  ✅ Docker: Working correctly" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Docker: Installed but may have issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Docker: Cannot run containers" -ForegroundColor Red
    $allGood = $false
}

# Check Ollama
Write-Host "Checking Ollama..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "  ✅ Ollama: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Ollama: NOT INSTALLED" -ForegroundColor Red
    Write-Host "     Download: https://ollama.ai/download/windows" -ForegroundColor Gray
    $allGood = $false
}

# Check Ollama Service
Write-Host "Checking Ollama Service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:11434/api/version -UseBasicParsing -ErrorAction Stop
    $version = ($response.Content | ConvertFrom-Json).version
    Write-Host "  ✅ Ollama Service: Running (version $version)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Ollama Service: NOT RUNNING" -ForegroundColor Red
    Write-Host "     Start Ollama from Start Menu" -ForegroundColor Gray
    $allGood = $false
}

# Check Ollama Model
Write-Host "Checking Ollama Model..." -ForegroundColor Yellow
try {
    $models = ollama list 2>&1 | Out-String
    if ($models -like "*llama3.1*") {
        Write-Host "  ✅ Ollama Model: llama3.1:latest installed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Ollama Model: llama3.1:latest NOT INSTALLED" -ForegroundColor Red
        Write-Host "     Run: ollama pull llama3.1:latest" -ForegroundColor Gray
        $allGood = $false
    }
} catch {
    Write-Host "  ❌ Ollama Model: ERROR CHECKING" -ForegroundColor Red
    $allGood = $false
}

# Check Tesseract
Write-Host "Checking Tesseract OCR..." -ForegroundColor Yellow
try {
    $tesseractVersion = tesseract --version 2>&1 | Select-Object -First 1
    Write-Host "  ✅ Tesseract: $tesseractVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Tesseract: NOT INSTALLED OR NOT IN PATH" -ForegroundColor Red
    Write-Host "     Download: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Gray
    Write-Host "     Must be added to System PATH" -ForegroundColor Gray
    $allGood = $false
}

# Check Poppler
Write-Host "Checking Poppler Utils..." -ForegroundColor Yellow
try {
    $popplerVersion = pdfinfo -v 2>&1 | Select-Object -First 1
    Write-Host "  ✅ Poppler: $popplerVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Poppler: NOT INSTALLED OR NOT IN PATH" -ForegroundColor Red
    Write-Host "     Download: https://github.com/oschwartz10612/poppler-windows/releases" -ForegroundColor Gray
    Write-Host "     Extract to C:\Program Files\poppler and add to PATH" -ForegroundColor Gray
    $allGood = $false
}

# Check Python (Optional)
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Python: NOT INSTALLED (Optional - Docker includes Python)" -ForegroundColor Yellow
}

# Check PostgreSQL Client
Write-Host "Checking PostgreSQL Client..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "  ✅ PostgreSQL Client: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  PostgreSQL Client: NOT INSTALLED (Optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "System Information" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# System Info
$os = Get-CimInstance Win32_OperatingSystem
$cpu = Get-CimInstance Win32_Processor
$memory = Get-CimInstance Win32_ComputerSystem

Write-Host "OS:          $($os.Caption)" -ForegroundColor Cyan
Write-Host "Version:     $($os.Version)" -ForegroundColor Cyan
Write-Host "CPU:         $($cpu.Name)" -ForegroundColor Cyan
Write-Host "Cores:       $($cpu.NumberOfCores)" -ForegroundColor Cyan
Write-Host "RAM:         $([math]::Round($memory.TotalPhysicalMemory/1GB, 2)) GB" -ForegroundColor Cyan

# Disk Space
$disk = Get-PSDrive C
$freeGB = [math]::Round($disk.Free/1GB, 2)
Write-Host "C: Free:     $freeGB GB" -ForegroundColor Cyan

if ($freeGB -lt 15) {
    Write-Host "  ⚠️  WARNING: Less than 15GB free space!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Firewall Rules" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$firewallRules = Get-NetFirewallRule | Where-Object {
    $_.DisplayName -like "*Worker*" -or 
    $_.DisplayName -like "*Ollama*" -or 
    $_.DisplayName -like "*PostgreSQL*"
}

if ($firewallRules) {
    $firewallRules | Select-Object DisplayName, Enabled, Direction, Action | Format-Table -AutoSize
} else {
    Write-Host "  ⚠️  No firewall rules found for Worker/Ollama/PostgreSQL" -ForegroundColor Yellow
    Write-Host "     Run these commands to create rules:" -ForegroundColor Gray
    Write-Host "     New-NetFirewallRule -DisplayName 'Worker API' -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow" -ForegroundColor Gray
    Write-Host "     New-NetFirewallRule -DisplayName 'Ollama AI' -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow" -ForegroundColor Gray
    Write-Host "     New-NetFirewallRule -DisplayName 'PostgreSQL' -Direction Inbound -LocalPort 5434 -Protocol TCP -Action Allow" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "✅ ALL CRITICAL PREREQUISITES INSTALLED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The server is ready for worker service deployment." -ForegroundColor Green
    Write-Host "Please notify the deployment team." -ForegroundColor Green
} else {
    Write-Host "❌ SOME PREREQUISITES ARE MISSING" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install the missing components marked with ❌ above." -ForegroundColor Red
    Write-Host "Refer to ADMIN_INSTALL_WINDOWS.md for detailed instructions." -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "1. ✅ Prerequisites complete" -ForegroundColor Green
    Write-Host "2. 📧 Notify deployment team" -ForegroundColor Cyan
    Write-Host "3. ⏳ Wait for worker service deployment" -ForegroundColor Cyan
} else {
    Write-Host "1. 📖 Open ADMIN_INSTALL_WINDOWS.md" -ForegroundColor Cyan
    Write-Host "2. 🔧 Install missing components" -ForegroundColor Cyan
    Write-Host "3. ✅ Run this script again to verify" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Script completed at: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Save report to file
$reportPath = ".\prerequisites_check_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$transcript = Get-Content $reportPath -ErrorAction SilentlyContinue
if (-not $transcript) {
    Write-Host "💾 Saving report to: $reportPath" -ForegroundColor Gray
}




# 🔧 Troubleshooting: Virtualization Not Detected (Windows)

**Error**: "Docker Desktop failed to start because virtualisation support wasn't detected"

This is a common issue on Windows Server. Here's how to fix it:

---

## ✅ Solution Steps

### Step 1: Check if Virtualization is Enabled in BIOS

**Check Current Status:**
```powershell
# Run as Administrator
Get-ComputerInfo | Select-Object CsProcessors, HyperVisorPresent, HyperVRequirementVirtualizationFirmwareEnabled

# Or check with systeminfo
systeminfo | findstr /i "Hyper-V"
```

**Expected Output (if working):**
```
Hyper-V Requirements: A hypervisor has been detected
HyperVRequirementVirtualizationFirmwareEnabled: True
```

**If you see "False" or "Disabled"**, you need to enable it in BIOS:

---

### Step 2: Enable Virtualization in BIOS/UEFI

**⚠️ You need physical or remote console access to do this**

1. **Restart the server**
2. **Enter BIOS/UEFI Setup** (usually press F2, F10, Del, or Esc during boot)
3. **Navigate to CPU/Processor Configuration**
4. **Enable these settings:**
   - Intel: **Intel VT-x** or **Intel Virtualization Technology**
   - AMD: **AMD-V** or **SVM Mode**
5. **Save and Exit** (usually F10)

**Common BIOS locations:**
- Dell: System Configuration → Virtualization Support
- HP: System Options → Virtualization Technology (VTx/VTd)
- Lenovo: Config → CPU → Intel Virtualization Technology
- Generic: Advanced → CPU Configuration → Virtualization Technology

---

### Step 3: Enable Hyper-V in Windows

After BIOS is configured, enable Hyper-V in Windows:

```powershell
# Run as Administrator in PowerShell

# Enable Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Enable Containers feature
Enable-WindowsOptionalFeature -Online -FeatureName Containers -All

# Or use DISM
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V

# Restart is required
Restart-Computer
```

**Alternative: Using GUI**
1. Open **Server Manager**
2. Click **Add Roles and Features**
3. Select **Hyper-V** role
4. Complete the wizard
5. **Restart** the server

**Or via Control Panel:**
1. Open **Control Panel** → **Programs** → **Turn Windows features on or off**
2. Check **Hyper-V**
3. Check **Windows Hypervisor Platform**
4. Check **Virtual Machine Platform**
5. Click **OK** and **restart**

---

### Step 4: Enable WSL 2 Features

```powershell
# Run as Administrator

# Enable WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart
Restart-Computer
```

**After restart:**
```powershell
# Set WSL 2 as default
wsl --set-default-version 2

# Verify WSL is working
wsl --status
```

---

### Step 5: Verify Everything is Enabled

Run this comprehensive check:

```powershell
# Run as Administrator
Write-Host "=== Virtualization Status ===" -ForegroundColor Cyan

# Check if running as admin
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run as Administrator!" -ForegroundColor Red
    exit
}

# Check virtualization in BIOS
$computerInfo = Get-ComputerInfo
Write-Host "`nBIOS Virtualization: " -NoNewline
if ($computerInfo.HyperVRequirementVirtualizationFirmwareEnabled) {
    Write-Host "ENABLED" -ForegroundColor Green
} else {
    Write-Host "DISABLED - Enable in BIOS!" -ForegroundColor Red
}

# Check Hyper-V
Write-Host "Hyper-V Enabled: " -NoNewline
$hyperv = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
if ($hyperv.State -eq "Enabled") {
    Write-Host "YES" -ForegroundColor Green
} else {
    Write-Host "NO - Run: Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All" -ForegroundColor Red
}

# Check WSL
Write-Host "WSL Enabled: " -NoNewline
$wsl = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
if ($wsl.State -eq "Enabled") {
    Write-Host "YES" -ForegroundColor Green
} else {
    Write-Host "NO" -ForegroundColor Red
}

# Check Virtual Machine Platform
Write-Host "VM Platform: " -NoNewline
$vmPlatform = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
if ($vmPlatform.State -eq "Enabled") {
    Write-Host "YES" -ForegroundColor Green
} else {
    Write-Host "NO" -ForegroundColor Red
}

# Check if hypervisor is running
Write-Host "Hypervisor Running: " -NoNewline
if ($computerInfo.HyperVisorPresent) {
    Write-Host "YES" -ForegroundColor Green
} else {
    Write-Host "NO" -ForegroundColor Red
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
if (-not $computerInfo.HyperVRequirementVirtualizationFirmwareEnabled) {
    Write-Host "1. Enable virtualization in BIOS" -ForegroundColor Yellow
}
if ($hyperv.State -ne "Enabled") {
    Write-Host "2. Enable Hyper-V: Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All" -ForegroundColor Yellow
}
if ($wsl.State -ne "Enabled" -or $vmPlatform.State -ne "Enabled") {
    Write-Host "3. Enable WSL 2 features and restart" -ForegroundColor Yellow
}
if ($computerInfo.HyperVRequirementVirtualizationFirmwareEnabled -and $hyperv.State -eq "Enabled" -and $wsl.State -eq "Enabled") {
    Write-Host "✅ All virtualization features are enabled!" -ForegroundColor Green
    Write-Host "Try starting Docker Desktop now." -ForegroundColor Green
}
```

Save this as `check_virtualization.ps1` and run it.

---

### Step 6: Restart Docker Desktop

After all features are enabled and you've restarted:

```powershell
# Stop Docker if running
Stop-Service docker -ErrorAction SilentlyContinue

# Start Docker Desktop from Start Menu
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait a minute for it to start, then check
docker --version
docker run hello-world
```

---

## 🔍 Alternative: Check What's Wrong

```powershell
# Detailed system check
systeminfo

# Look for these sections:
# - Hyper-V Requirements: Should show "Yes" for all
# - Virtualization Enabled In Firmware: Yes
```

**Expected Output (Working System):**
```
Hyper-V Requirements:      
    VM Monitor Mode Extensions: Yes
    Virtualization Enabled In Firmware: Yes
    Second Level Address Translation: Yes
    Data Execution Prevention Available: Yes
```

---

## ⚠️ If Virtualization Cannot Be Enabled in BIOS

**Possible Reasons:**
1. **Virtual Machine**: You're running Windows Server inside a VM (VMware, Hyper-V, VirtualBox)
2. **Hardware**: Old CPU without virtualization support
3. **Cloud Instance**: Some cloud instances don't expose virtualization

**Solutions:**

### Option A: Use Docker Without Hyper-V (Windows Server)
If on Windows Server (not Windows 10/11), you can use Docker EE:

```powershell
# Install Docker Enterprise (Windows Server only)
Install-Module -Name DockerMsftProvider -Force
Install-Package -Name docker -ProviderName DockerMsftProvider -Force
Restart-Computer
```

### Option B: Enable Nested Virtualization (If in a VM)

**For VMware:**
1. Shutdown the VM
2. Edit VM settings
3. Enable "Virtualize Intel VT-x/EPT or AMD-V/RVI"
4. Start VM

**For Hyper-V:**
```powershell
# On the Hyper-V host (not guest)
Set-VMProcessor -VMName "YourVMName" -ExposeVirtualizationExtensions $true
```

**For VirtualBox:**
1. Shutdown VM
2. Settings → System → Processor
3. Enable "Enable Nested VT-x/AMD-V"
4. Start VM

### Option C: Run Worker Service Without Docker

You can run the worker service directly with Python instead of Docker:

```powershell
# Install Python 3.9+
# Install dependencies
pip install -r requirements.txt

# Install Tesseract, Poppler (as per guides)

# Run directly
python main.py
```

See **ADMIN_INSTALL_WINDOWS.md** for manual installation steps.

---

## 🎯 Quick Fix Checklist

Run these in order:

```powershell
# 1. Check current status
Get-ComputerInfo | Select-Object HyperVRequirementVirtualizationFirmwareEnabled, HyperVisorPresent

# 2. If False, reboot and enable in BIOS (requires physical/console access)

# 3. After BIOS is enabled, run:
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
Enable-WindowsOptionalFeature -Online -FeatureName Containers -All
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 4. Restart
Restart-Computer

# 5. After restart, set WSL 2
wsl --set-default-version 2

# 6. Start Docker Desktop
```

---

## 📞 Still Having Issues?

### Check Event Viewer
```powershell
# Open Event Viewer
eventvwr.msc

# Navigate to:
# Windows Logs → System
# Look for Hyper-V-Hypervisor errors
```

### Common Error Messages:

**"Hyper-V and Containers features are not enabled"**
→ Run: `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All`

**"WSL 2 installation is incomplete"**
→ Download: https://aka.ms/wsl2kernel
→ Install the WSL 2 kernel update

**"VT-x is disabled in BIOS"**
→ Enable Intel VT-x or AMD-V in BIOS

---

## ✅ Verification

Once everything works, you should see:

```powershell
PS> docker --version
Docker version 24.0.x, build xxxxx

PS> docker run hello-world
Hello from Docker!
This message shows that your installation appears to be working correctly.

PS> wsl --status
Default Version: 2
```

---

## 📚 Additional Resources

- **Docker Desktop Requirements**: https://docs.docker.com/desktop/install/windows-install/#system-requirements
- **Enable Hyper-V**: https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v
- **WSL 2 Setup**: https://docs.microsoft.com/en-us/windows/wsl/install

---

**Questions?** 
- Check if you're on a VM (virtualization in virtualization requires nested virt)
- Verify CPU supports virtualization (Intel VT-x or AMD-V)
- Contact your IT admin if you can't access BIOS

---

**Last Updated**: November 12, 2025




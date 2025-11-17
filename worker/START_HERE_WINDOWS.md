# 🪟 Windows Server Deployment - START HERE

**Target Server**: Windows Server 2019/2022  
**Deployment Time**: 1-2 hours (including prerequisites)

---

## 📋 Quick Overview

This worker service provides AI-powered document analysis for your procurement tool. It runs in Docker and uses Ollama for local AI processing.

---

## 🚀 Step-by-Step Deployment

### STEP 1: Send to Server Admin (45 minutes)

Your **server administrator** needs to install prerequisites first.

**📧 Send these 3 files to your admin:**

1. **EMAIL_TO_ADMIN_WINDOWS.txt** 
   - Copy-paste ready email with all instructions
   - Includes download links and commands

2. **ADMIN_INSTALL_WINDOWS.md**
   - Complete step-by-step installation guide
   - Windows-specific commands and troubleshooting

3. **verify_install.ps1**
   - PowerShell script to verify everything is installed
   - Admin runs this after installation

**What admin will install:**
- ✅ Docker Desktop for Windows
- ✅ Ollama + AI Model (4.7GB)
- ✅ Tesseract OCR
- ✅ Poppler Utils
- ✅ Firewall rules

---

### STEP 2: Verify Prerequisites (5 minutes)

After admin completes installation, verify everything is ready:

```powershell
# Run as Administrator
.\verify_install.ps1
```

**Expected output:**
```
✅ Docker: version 20.10+
✅ Docker Compose: version 2.0+
✅ Ollama: installed
✅ Ollama Service: Running
✅ Ollama Model: llama3.1:latest installed
✅ Tesseract: version 4.0+
✅ Poppler: installed
```

If all checks pass, proceed to Step 3. Otherwise, contact your admin.

---

### STEP 3: Copy Worker Folder (2 minutes)

Copy the entire `worker` folder to the Windows Server:

```powershell
# Option 1: If deploying from your machine to server
Copy-Item -Path "C:\path\to\worker" -Destination "\\server\c$\deployment\worker" -Recurse

# Option 2: Using Remote Desktop
# Simply copy/paste the folder via RDP

# Option 3: Using ZIP
# Zip the worker folder and transfer via email/USB
Compress-Archive -Path "worker" -DestinationPath "worker.zip"
```

**Recommended location on server:**
```
C:\deployment\worker\
```

---

### STEP 4: Configure Environment (10 minutes)

```powershell
# Navigate to worker folder
cd C:\deployment\worker

# Copy environment template
Copy-Item env.example .env

# Edit .env file with Notepad
notepad .env
```

**Update these values in `.env`:**

```env
# Database (update with your actual credentials)
DATABASE_URL=postgresql://postgres:YourPassword@localhost:5434/procurement_db

# Ollama (usually correct as-is)
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1:latest

# Worker settings (usually correct as-is)
API_HOST=0.0.0.0
API_PORT=8001
```

**Important for Windows:**
- Use `host.docker.internal` instead of `localhost` for OLLAMA_BASE_URL
- This allows Docker containers to reach services on Windows host

---

### STEP 5: Deploy with Docker (5 minutes)

```powershell
# Navigate to worker folder
cd C:\deployment\worker

# Start the service
docker compose up -d

# Check if running
docker compose ps

# View logs
docker compose logs -f worker
```

**Expected output:**
```
✅ Container worker-worker-1 is running
✅ Logs show: "Application startup complete"
✅ Logs show: "Uvicorn running on http://0.0.0.0:8001"
```

---

### STEP 6: Test the Service (5 minutes)

```powershell
# Test health endpoint
Invoke-WebRequest -Uri http://localhost:8001/health

# Expected response (Status 200):
# {
#   "status": "healthy",
#   "ollama_available": true,
#   "ai_mode": "ollama",
#   "ollama_model": "llama3.1:latest"
# }

# Open API documentation in browser
Start-Process "http://localhost:8001/docs"
```

**If health check passes** ✅ - Deployment successful!

---

### STEP 7: Configure Main App (2 minutes)

Update your main Next.js application's `.env`:

```env
# Add or update this line:
WORKER_API_URL=http://localhost:8001
```

Restart your Next.js application.

---

## ✅ Verify Integration

1. Log into your procurement tool admin interface
2. Go to **Supplier Submissions**
3. Select a supplier with documents
4. Click **"Run AI Analysis"**
5. Wait 10-20 seconds
6. Check that results appear with confidence scores

**If you see AI analysis results** ✅ - Everything is working!

---

## 🔧 Common Issues & Solutions

### Issue: "Ollama not available"

**Solution:**
```powershell
# Check if Ollama is running
Invoke-WebRequest -Uri http://localhost:11434/api/version

# If not, start Ollama from Start Menu
# Or check Docker is using host.docker.internal in .env:
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

---

### Issue: "Port 8001 already in use"

**Solution:**
```powershell
# Find what's using port 8001
netstat -ano | findstr :8001

# Kill the process (replace [PID] with actual process ID)
taskkill /PID [PID] /F

# Or change port in .env
API_PORT=8002
```

---

### Issue: Docker won't start

**Solution:**
```powershell
# Restart Docker Desktop
Restart-Service docker

# Or restart from Windows Services
services.msc
# Find "Docker Desktop Service" and restart
```

---

### Issue: "Database connection failed"

**Solution:**
Check `.env` file:
- Verify DATABASE_URL is correct
- Check PostgreSQL is running: `Get-Service postgresql*`
- Test connection: `psql -h localhost -p 5434 -U postgres -d procurement_db`

---

## 📊 Monitoring

### Check Service Status
```powershell
# View running containers
docker compose ps

# View logs
docker compose logs -f worker

# View last 100 lines
docker compose logs --tail=100 worker
```

### Health Monitoring
```powershell
# Check health every 30 seconds (Ctrl+C to stop)
while ($true) {
    $health = Invoke-WebRequest -Uri http://localhost:8001/health -UseBasicParsing
    Write-Host "$(Get-Date): $($health.StatusCode)" -ForegroundColor Green
    Start-Sleep -Seconds 30
}
```

---

## 🔄 Management Commands

### Restart Service
```powershell
docker compose restart worker
```

### Stop Service
```powershell
docker compose down
```

### Update Service (after code changes)
```powershell
docker compose down
docker compose build --no-cache
docker compose up -d
```

### View Resource Usage
```powershell
docker stats worker-worker-1
```

---

## 📁 Important Files

```
worker/
├── .env                          # Your configuration (NEVER commit!)
├── docker-compose.yml            # Docker orchestration
├── ADMIN_INSTALL_WINDOWS.md      # For server admin
├── EMAIL_TO_ADMIN_WINDOWS.txt    # Email to send admin
├── verify_install.ps1            # Admin verification script
├── START_HERE_WINDOWS.md         # This file
└── uploads/                      # Document storage
```

---

## 📞 Getting Help

### Check Logs First
```powershell
docker compose logs --tail=50 worker
```

### Review Documentation
1. **This file** - Quick start for Windows
2. **DEPLOYMENT.md** - Complete deployment guide
3. **ADMIN_INSTALL_WINDOWS.md** - Prerequisites guide
4. **docs/** folder - Specific validation guides

### Troubleshooting Checklist
- [ ] Prerequisites installed? (run `verify_install.ps1`)
- [ ] Docker running? (`docker ps`)
- [ ] Ollama running? (`Invoke-WebRequest http://localhost:11434/api/version`)
- [ ] .env configured correctly?
- [ ] Firewall allowing port 8001?
- [ ] Main app has WORKER_API_URL set?

---

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `docker compose up -d` | Start service |
| `docker compose down` | Stop service |
| `docker compose logs -f worker` | View logs |
| `docker compose restart worker` | Restart service |
| `Invoke-WebRequest http://localhost:8001/health` | Check health |
| `.\verify_install.ps1` | Verify prerequisites |

---

## 📈 Performance Tips

1. **Allocate Resources to Docker**
   - Docker Desktop → Settings → Resources
   - RAM: 4GB minimum, 8GB recommended
   - CPUs: 2 minimum, 4 recommended

2. **Use SSD Storage**
   - Store worker folder on SSD drive
   - Better performance for document processing

3. **Monitor Disk Space**
   - `uploads/` folder grows over time
   - Set up cleanup job for old files

---

## 🔒 Security Notes

- ✅ `.env` file contains secrets - never commit to git
- ✅ Ports 8001, 11434 should only be accessible internally
- ✅ Use strong database passwords
- ✅ Keep Docker and dependencies updated

---

## ✨ Success Checklist

Deployment is complete when:
- [ ] ✅ Prerequisites installed (admin completed)
- [ ] ✅ verify_install.ps1 passes all checks
- [ ] ✅ Worker folder copied to server
- [ ] ✅ .env configured with correct values
- [ ] ✅ `docker compose up -d` successful
- [ ] ✅ Health check returns "healthy"
- [ ] ✅ Main app has WORKER_API_URL configured
- [ ] ✅ AI analysis works from admin interface

---

**🎉 That's it! Your worker service is deployed and running!**

For detailed information, see **DEPLOYMENT.md** and **DEPLOYMENT_CHECKLIST.md**.

---

**Last Updated**: November 12, 2025  
**Version**: 1.0  
**Platform**: Windows Server 2019/2022




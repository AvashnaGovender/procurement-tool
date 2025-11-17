# Server Prerequisites - Admin Installation Required

**For**: AI Document Analysis Worker Service  
**Target Server**: Client Production Server

---

## 📋 Overview

This document lists all software that requires **admin/root access** to install on the server before deploying the worker service.

**Estimated Installation Time**: 30-45 minutes

---

## 🔧 Required Software

### 1. Docker & Docker Compose ⭐ **CRITICAL**

**Purpose**: Container runtime for the worker service  
**Version**: Docker Engine 20.10+ and Docker Compose 2.0+

#### Installation Commands:

**Ubuntu/Debian:**
```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
sudo docker --version
sudo docker compose version
```

**CentOS/RHEL:**
```bash
# Install dependencies
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
sudo docker --version
sudo docker compose version
```

**Windows Server:**
- Download Docker Desktop for Windows from: https://docs.docker.com/desktop/install/windows-install/
- Or use Docker Engine for Windows Server: https://docs.docker.com/engine/install/

**Verification:**
```bash
sudo docker run hello-world
```

---

### 2. Python 3.9+ (if not using Docker) ⚠️ **RECOMMENDED BACKUP**

**Purpose**: Run the service without Docker (fallback option)  
**Version**: Python 3.9 or higher

#### Installation Commands:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y python3.9 python3.9-dev python3-pip
python3 --version
```

**CentOS/RHEL:**
```bash
sudo yum install -y python39 python39-devel
python3 --version
```

**Windows Server:**
- Download from: https://www.python.org/downloads/
- Ensure "Add Python to PATH" is checked during installation

---

### 3. PostgreSQL Client Libraries ⭐ **CRITICAL**

**Purpose**: Database connectivity  
**Version**: PostgreSQL 13+ client libraries

#### Installation Commands:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y libpq-dev
```

**CentOS/RHEL:**
```bash
sudo yum install -y postgresql-devel
```

**Windows Server:**
- Included with PostgreSQL installation
- Or download from: https://www.postgresql.org/download/windows/

---

### 4. Tesseract OCR ⭐ **CRITICAL**

**Purpose**: Text extraction from scanned documents and images  
**Version**: Tesseract 4.0+

#### Installation Commands:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng
tesseract --version
```

**CentOS/RHEL:**
```bash
sudo yum install -y epel-release
sudo yum install -y tesseract tesseract-langpack-eng
```

**Windows Server:**
```powershell
# Download installer from:
# https://github.com/UB-Mannheim/tesseract/wiki

# Install to default location: C:\Program Files\Tesseract-OCR
# Add to system PATH:
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Tesseract-OCR", [System.EnvironmentVariableTarget]::Machine)
```

**Verification:**
```bash
tesseract --version
# Should show: tesseract 4.x.x or higher
```

---

### 5. Poppler Utils ⭐ **CRITICAL**

**Purpose**: PDF to image conversion for OCR  
**Version**: Latest stable

#### Installation Commands:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y poppler-utils
pdfinfo -v
```

**CentOS/RHEL:**
```bash
sudo yum install -y poppler-utils
```

**Windows Server:**
```powershell
# Download from: http://blog.alivate.com.au/poppler-windows/
# Or use: https://github.com/oschwartz10612/poppler-windows/releases/

# Extract to C:\Program Files\poppler
# Add to system PATH:
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\poppler\bin", [System.EnvironmentVariableTarget]::Machine)
```

---

### 6. Ollama ⭐ **CRITICAL**

**Purpose**: Local AI/LLM for document analysis  
**Version**: Latest stable

#### Installation Commands:

**Linux (Ubuntu/Debian/CentOS/RHEL):**
```bash
# Download and install
curl -fsSL https://ollama.ai/install.sh | sh

# Verify installation
ollama --version

# Start Ollama service
sudo systemctl start ollama
sudo systemctl enable ollama

# Pull required AI model (4.7GB download)
ollama pull llama3.1:latest

# Verify model
ollama list
```

**Windows Server:**
```powershell
# Download installer from:
# https://ollama.ai/download/windows

# Run the installer (OllamaSetup.exe)

# Open PowerShell and verify
ollama --version

# Pull required AI model
ollama pull llama3.1:latest

# Verify
ollama list
```

**macOS:**
```bash
# Download from: https://ollama.ai/download/mac
# Or use Homebrew:
brew install ollama

# Start service
ollama serve &

# Pull model
ollama pull llama3.1:latest
```

**Verification:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Should return JSON with version info
```

---

## 🔥 Firewall Rules

### Ports to Open:

```bash
# Worker API (internal access only)
sudo ufw allow 8001/tcp comment "Worker API"

# Ollama (internal access only)
sudo ufw allow 11434/tcp comment "Ollama AI"

# PostgreSQL (if database is on same server)
sudo ufw allow 5434/tcp comment "PostgreSQL"

# Apply changes
sudo ufw reload
```

**Or for firewalld (CentOS/RHEL):**
```bash
sudo firewall-cmd --permanent --add-port=8001/tcp
sudo firewall-cmd --permanent --add-port=11434/tcp
sudo firewall-cmd --permanent --add-port=5434/tcp
sudo firewall-cmd --reload
```

---

## 📦 System Resource Requirements

### Minimum Requirements:
- **CPU**: 2 cores (4+ recommended)
- **RAM**: 4GB (8GB+ recommended)
- **Disk**: 15GB free space
  - 5GB for Docker images
  - 5GB for Ollama model
  - 5GB for document storage

### Recommended for Production:
- **CPU**: 4+ cores
- **RAM**: 16GB
- **Disk**: 50GB+ SSD

---

## ✅ Installation Verification Script

Create and run this script to verify all prerequisites:

```bash
#!/bin/bash
# Save as: check_prerequisites.sh

echo "==================================="
echo "Checking Prerequisites..."
echo "==================================="
echo ""

# Check Docker
echo -n "Docker: "
if command -v docker &> /dev/null; then
    docker --version
else
    echo "❌ NOT INSTALLED"
fi

# Check Docker Compose
echo -n "Docker Compose: "
if docker compose version &> /dev/null; then
    docker compose version
else
    echo "❌ NOT INSTALLED"
fi

# Check Python
echo -n "Python: "
if command -v python3 &> /dev/null; then
    python3 --version
else
    echo "❌ NOT INSTALLED"
fi

# Check Tesseract
echo -n "Tesseract OCR: "
if command -v tesseract &> /dev/null; then
    tesseract --version | head -n 1
else
    echo "❌ NOT INSTALLED"
fi

# Check Poppler
echo -n "Poppler Utils: "
if command -v pdfinfo &> /dev/null; then
    pdfinfo -v 2>&1 | head -n 1
else
    echo "❌ NOT INSTALLED"
fi

# Check Ollama
echo -n "Ollama: "
if command -v ollama &> /dev/null; then
    ollama --version
else
    echo "❌ NOT INSTALLED"
fi

# Check Ollama service
echo -n "Ollama Service: "
if curl -s http://localhost:11434/api/version &> /dev/null; then
    echo "✅ RUNNING"
else
    echo "❌ NOT RUNNING"
fi

# Check Ollama model
echo -n "Ollama Model (llama3.1): "
if ollama list | grep -q "llama3.1"; then
    echo "✅ INSTALLED"
else
    echo "❌ NOT INSTALLED"
fi

# Check PostgreSQL client
echo -n "PostgreSQL Client: "
if command -v psql &> /dev/null; then
    psql --version
else
    echo "⚠️  NOT INSTALLED (optional)"
fi

echo ""
echo "==================================="
echo "Disk Space:"
df -h | grep -E "Filesystem|/$"
echo ""
echo "Memory:"
free -h
echo ""
echo "CPU:"
lscpu | grep -E "^CPU\(s\)|^Model name"
echo "==================================="
```

**Run it:**
```bash
chmod +x check_prerequisites.sh
./check_prerequisites.sh
```

---

## 🐳 Docker User Permissions

Add your deployment user to the docker group (so you don't need sudo):

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Activate the changes
newgrp docker

# Verify (should work without sudo)
docker ps
```

---

## 📝 Installation Order

**Recommended sequence:**

1. ✅ Docker & Docker Compose (30 min)
2. ✅ Ollama + Model Download (15 min) - **4.7GB download**
3. ✅ Tesseract OCR (2 min)
4. ✅ Poppler Utils (2 min)
5. ✅ PostgreSQL Client Libraries (2 min)
6. ✅ Python (optional, 5 min)
7. ✅ Configure Firewall (5 min)
8. ✅ Run Verification Script (2 min)

**Total Time**: ~60 minutes (including Ollama model download)

---

## 🔒 Security Considerations

### User Accounts
```bash
# Create dedicated service user (recommended)
sudo useradd -r -s /bin/bash -m -d /opt/worker worker-service
sudo usermod -aG docker worker-service
```

### File Permissions
```bash
# Set proper ownership
sudo chown -R worker-service:worker-service /opt/worker
sudo chmod 750 /opt/worker
```

### Firewall
```bash
# Allow only from specific IPs (if possible)
sudo ufw allow from 192.168.1.0/24 to any port 8001
```

---

## 🌐 Network Requirements

### Outbound Internet Access Needed For:
- Docker Hub (docker.io) - Pull images
- Ollama (ollama.ai) - Download AI model
- PyPI (pypi.org) - Python packages
- GitHub (github.com) - Additional dependencies

### Inbound Access Needed:
- Port 8001 (Worker API) - From Next.js app server only
- Port 11434 (Ollama) - Localhost only
- Port 5434 (PostgreSQL) - From worker only

---

## 📧 Request Template for IT Admin

Copy and send this to your system administrator:

---

**Subject**: Server Prerequisites for Worker Service Deployment

Hi [Admin Name],

I need the following software installed on **[server hostname/IP]** for deploying the AI Document Analysis Worker Service:

### Required Installations (with sudo/admin access):

1. **Docker Engine 20.10+** and **Docker Compose 2.0+**
   - Installation guide: https://docs.docker.com/engine/install/

2. **Ollama** (Local AI/LLM)
   - Installation: `curl -fsSL https://ollama.ai/install.sh | sh`
   - Pull model: `ollama pull llama3.1:latest` (4.7GB download)

3. **Tesseract OCR 4.0+**
   - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
   - CentOS/RHEL: `sudo yum install tesseract`

4. **Poppler Utils**
   - Ubuntu/Debian: `sudo apt-get install poppler-utils`
   - CentOS/RHEL: `sudo yum install poppler-utils`

5. **PostgreSQL Client Libraries**
   - Ubuntu/Debian: `sudo apt-get install libpq-dev`
   - CentOS/RHEL: `sudo yum install postgresql-devel`

### Firewall Rules:
- Open port **8001** (Worker API - internal only)
- Open port **11434** (Ollama - localhost only)
- Open port **5434** (PostgreSQL - if needed)

### User Permissions:
- Add my user account to the `docker` group: `sudo usermod -aG docker [my-username]`

### System Resources Required:
- CPU: 4+ cores
- RAM: 8GB+
- Disk: 15GB free space (SSD preferred)

I've attached the complete installation guide (**ADMIN_PREREQUISITES.md**) with detailed commands for your reference.

Please let me know once these are installed so I can proceed with the deployment.

Thank you!

---

## 📚 Additional Documentation

After prerequisites are installed, refer to:
- **DEPLOYMENT.md** - Complete deployment guide
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment
- **README.md** - Service overview

---

## ❓ FAQ

### Q: Do we need to install PostgreSQL server?
**A**: No, if you already have PostgreSQL running for the main Next.js app. You just need the client libraries for connectivity.

### Q: Can we skip Docker and install directly?
**A**: Yes, but Docker is strongly recommended. Without Docker, you'll need Python 3.9+, pip, and all Python dependencies manually installed.

### Q: How much internet bandwidth for Ollama model?
**A**: The llama3.1:latest model is approximately 4.7GB download. Plan accordingly.

### Q: Does Ollama need GPU?
**A**: No, Ollama works on CPU. GPU will make it faster but is not required.

### Q: Can we use a different port than 8001?
**A**: Yes, you can change it in the `.env` file after installation.

---

**Last Updated**: November 12, 2025  
**Version**: 1.0

---





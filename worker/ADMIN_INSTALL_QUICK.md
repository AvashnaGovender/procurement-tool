# Quick Install Guide for Server Admin

**Server**: Client Production Server  
**Purpose**: AI Document Analysis Worker Service

---

## 📦 Install These (Run as root/sudo):

### 1. Docker & Docker Compose ⭐
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install -y docker-compose-plugin

# Verify
sudo docker --version
sudo docker compose version
```

### 2. Ollama + AI Model ⭐
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start service
sudo systemctl start ollama
sudo systemctl enable ollama

# Download AI model (4.7GB - takes ~10 mins on fast connection)
ollama pull llama3.1:latest

# Verify
curl http://localhost:11434/api/version
```

### 3. Tesseract OCR ⭐
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng

# CentOS/RHEL
sudo yum install -y epel-release
sudo yum install -y tesseract tesseract-langpack-eng

# Verify
tesseract --version
```

### 4. Poppler Utils ⭐
```bash
# Ubuntu/Debian
sudo apt-get install -y poppler-utils

# CentOS/RHEL
sudo yum install -y poppler-utils

# Verify
pdfinfo -v
```

### 5. PostgreSQL Client Libraries ⭐
```bash
# Ubuntu/Debian
sudo apt-get install -y libpq-dev

# CentOS/RHEL
sudo yum install -y postgresql-devel
```

### 6. Python 3.9+ (Optional - Docker handles this)
```bash
# Ubuntu/Debian
sudo apt-get install -y python3.9 python3.9-dev python3-pip

# Verify
python3 --version
```

---

## 🔥 Firewall Rules

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 8001/tcp   # Worker API
sudo ufw allow 11434/tcp  # Ollama
sudo ufw allow 5434/tcp   # PostgreSQL (if needed)
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8001/tcp
sudo firewall-cmd --permanent --add-port=11434/tcp
sudo firewall-cmd --permanent --add-port=5434/tcp
sudo firewall-cmd --reload
```

---

## 👤 User Permissions

```bash
# Add deployment user to docker group
# Replace 'username' with actual deployment username
sudo usermod -aG docker username

# User must logout/login for this to take effect
```

---

## ✅ Verification Script

```bash
# Quick check
echo "Docker: $(docker --version 2>&1)"
echo "Docker Compose: $(docker compose version 2>&1)"
echo "Ollama: $(ollama --version 2>&1)"
echo "Tesseract: $(tesseract --version 2>&1 | head -n1)"
echo "Poppler: $(pdfinfo -v 2>&1 | head -n1)"
echo "PostgreSQL: $(dpkg -l | grep -i libpq-dev || echo 'Check with rpm -qa | grep postgres')"
echo ""
echo "Ollama Service: $(curl -s http://localhost:11434/api/version && echo 'Running' || echo 'Not running')"
echo "Ollama Models: $(ollama list 2>&1)"
```

---

## 💻 System Requirements

- **CPU**: 4+ cores
- **RAM**: 8GB+ (16GB recommended)
- **Disk**: 15GB+ free space
- **OS**: Ubuntu 20.04+, CentOS 7+, RHEL 7+, or Windows Server 2019+

---

## 🚀 All-in-One Install Script (Ubuntu/Debian)

```bash
#!/bin/bash
# Save as: install_prerequisites.sh

set -e

echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install -y docker-compose-plugin

echo "Installing Ollama..."
curl -fsSL https://ollama.ai/install.sh | sh
sudo systemctl start ollama
sudo systemctl enable ollama

echo "Installing Tesseract..."
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-eng

echo "Installing Poppler..."
sudo apt-get install -y poppler-utils

echo "Installing PostgreSQL client libraries..."
sudo apt-get install -y libpq-dev

echo "Downloading AI model (this takes ~10 minutes)..."
ollama pull llama3.1:latest

echo "Configuring firewall..."
sudo ufw allow 8001/tcp
sudo ufw allow 11434/tcp
sudo ufw allow 5434/tcp

echo "Adding current user to docker group..."
sudo usermod -aG docker $USER

echo ""
echo "✅ Installation complete!"
echo ""
echo "⚠️  IMPORTANT: You must logout and login again for docker group to take effect"
echo ""
echo "Verification:"
docker --version
docker compose version
ollama --version
tesseract --version | head -n1
ollama list
```

**Run it:**
```bash
chmod +x install_prerequisites.sh
./install_prerequisites.sh
```

---

## ⏱️ Installation Time

- Docker: ~5 minutes
- Ollama: ~3 minutes
- Ollama Model Download: ~10 minutes (4.7GB)
- Tesseract: ~2 minutes
- Poppler: ~1 minute
- PostgreSQL libs: ~1 minute
- Firewall: ~1 minute

**Total**: ~25 minutes (mostly model download)

---

## 📧 Questions?

See **ADMIN_PREREQUISITES.md** for detailed installation instructions, troubleshooting, and FAQs.

---

**Ready to install? Start from the top! ☝️**




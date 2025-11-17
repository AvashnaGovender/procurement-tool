# Worker Service Deployment Guide

This is the AI Document Analysis Worker Service for the Procurement Tool. It handles document processing, OCR extraction, and AI-powered validation using Ollama.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Installation](#manual-installation)
- [Configuration](#configuration)
- [Running the Service](#running-the-service)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)

---

## Prerequisites

### Required Software

1. **Docker & Docker Compose** (Recommended)
   - Docker Engine 20.10+
   - Docker Compose 2.0+

2. **For Manual Installation:**
   - Python 3.9+
   - PostgreSQL 13+
   - Ollama (for AI processing)
   - Tesseract OCR
   - Poppler (for PDF processing)

### System Requirements

- **Memory**: Minimum 4GB RAM (8GB+ recommended for Ollama)
- **Disk Space**: 10GB+ free space (for Ollama models)
- **CPU**: 2+ cores recommended

---

## Quick Start with Docker

### 1. Install Ollama

**Windows:**
```bash
# Download and run the installer from:
# https://ollama.ai/download/windows

# After installation, pull the model:
ollama pull llama3.1:latest
```

**Linux/Mac:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1:latest
```

### 2. Configure Environment

Create a `.env` file in the worker directory:

```bash
cp env.example .env
```

Edit `.env` and set your configuration (see [Configuration](#configuration) section).

### 3. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

The worker will be available at `http://localhost:8001`

---

## Manual Installation

### 1. Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y \
    python3-pip \
    tesseract-ocr \
    poppler-utils \
    libpq-dev \
    python3-dev
```

**Windows:**
- Install [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki)
- Install [Poppler](http://blog.alivate.com.au/poppler-windows/)
- Add both to system PATH

**macOS:**
```bash
brew install tesseract poppler
```

### 2. Install Python Dependencies

```bash
cd worker
pip install -r requirements.txt
```

### 3. Install and Configure Ollama

See step 1 in [Quick Start](#quick-start-with-docker)

### 4. Configure Environment

```bash
cp env.example .env
# Edit .env with your settings
```

### 5. Run the Service

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

Or manually:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

## Configuration

### Required Environment Variables

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5434/procurement_db

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:latest

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com

# Worker Settings
WORKER_PORT=8001
```

### Database URL Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Example:
```
DATABASE_URL=postgresql://postgres:Admin123@localhost:5434/procurement_db
```

### Ollama Configuration

- **OLLAMA_BASE_URL**: URL where Ollama is running (default: `http://localhost:11434`)
- **OLLAMA_MODEL**: Model to use for AI processing (recommended: `llama3.1:latest`)

Available models:
- `llama3.1:latest` (Recommended - 4.7GB)
- `llama3.1:8b` (Smaller - 4.7GB)
- `llama3.1:70b` (Larger, more accurate - 40GB)

---

## Running the Service

### With Docker (Recommended)

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f worker

# Restart
docker-compose restart worker

# Stop
docker-compose down
```

### Without Docker

```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

### Health Check

Test if the service is running:

```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "ollama_available": true,
  "ai_mode": "ollama",
  "ollama_model": "llama3.1:latest"
}
```

---

## API Documentation

Once the service is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Main Endpoints

1. **POST /upload**
   - Upload a document for processing
   - Returns document ID and extracted text

2. **POST /process-document**
   - Analyze a document with AI
   - Returns validation results and confidence scores

3. **GET /health**
   - Check service health and Ollama status

---

## Troubleshooting

### Common Issues

#### 1. "Ollama not available"

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# If not, start Ollama
ollama serve

# Pull the model if not already done
ollama pull llama3.1:latest
```

#### 2. "Database connection failed"

**Solution:**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure the database exists
- Check firewall settings for port 5434

#### 3. "Tesseract not found"

**Solution:**
- Verify Tesseract is installed: `tesseract --version`
- Add Tesseract to system PATH
- On Windows, default path: `C:\Program Files\Tesseract-OCR`

#### 4. Port 8001 already in use

**Solution:**
```bash
# Change port in .env
WORKER_PORT=8002

# Or find and kill the process using the port
# Windows:
netstat -ano | findstr :8001
taskkill /PID [PID] /F

# Linux/Mac:
lsof -i :8001
kill -9 [PID]
```

#### 5. Docker build fails

**Solution:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Logs Location

- **Docker**: `docker-compose logs worker`
- **Manual**: Check console output or `logs/` directory

---

## Architecture

### Core Components

1. **main.py** - FastAPI application, main entry point
2. **ocr_extractor.py** - Document text extraction (PDF, images, DOCX, Excel)
3. **crew_agents.py** - AI analysis using Ollama
4. **config.py** - Configuration management
5. **database.py** - Database connection utilities
6. **email_notifier.py** - Email notification system

### Document Processing Flow

```
1. Upload Document → /upload
   ↓
2. Extract Text (OCR if needed)
   ↓
3. Detect Document Type
   ↓
4. AI Analysis with Ollama → /process-document
   ↓
5. Validation & Confidence Scoring
   ↓
6. Return Results
```

---

## Integration with Main Application

The worker service integrates with the Next.js application:

1. **Next.js App** sends documents to worker via:
   - `POST http://localhost:8001/upload`
   - `POST http://localhost:8001/process-document`

2. **Worker** processes documents and returns:
   - Extracted text
   - Document type detection
   - AI validation results
   - Confidence scores
   - Document type mismatches

3. **Results** are displayed in the main app's admin interface

### Environment Variable in Main App

Ensure the main Next.js app has:

```env
WORKER_API_URL=http://localhost:8001
```

Or for production:
```env
WORKER_API_URL=http://worker:8001
```

---

## Production Deployment

### Recommended Setup

1. **Use Docker Compose** for easy orchestration
2. **Run Ollama** on the same server for performance
3. **Use PostgreSQL** (already configured in main app)
4. **Configure reverse proxy** (nginx) if needed
5. **Enable HTTPS** for production
6. **Set up monitoring** (health checks, logging)

### Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong database credentials
- [ ] Restrict network access (firewall rules)
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated
- [ ] Regular backups of uploaded documents
- [ ] Monitor disk space for uploads directory

### Performance Tips

1. **Ollama Model Selection**:
   - Use `llama3.1:latest` for best balance
   - Smaller models for faster processing
   - Larger models for higher accuracy

2. **Resource Allocation**:
   - Allocate 4GB+ RAM to Docker
   - Use SSD for better I/O performance
   - Monitor CPU usage during processing

3. **Scaling**:
   - Run multiple worker instances
   - Use load balancer for distribution
   - Shared database and storage

---

## Additional Documentation

See the `docs/` folder for detailed guides:

- **OLLAMA_SETUP.md** - Detailed Ollama installation
- **BANK_VALIDATION_GUIDE.md** - Bank document validation
- **BBBEE_VALIDATION_GUIDE.md** - B-BBEE certificate validation
- **CIPC_VALIDATION_GUIDE.md** - CIPC document validation
- **TAX_VALIDATION_GUIDE.md** - Tax clearance validation
- **CUSTOM_SMTP_SETUP.md** - Email configuration
- **TESTING_GUIDE.md** - Testing the worker service

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs for error messages
3. Check documentation in `docs/` folder
4. Verify all prerequisites are installed

---

## Version Information

- **Python**: 3.9+
- **FastAPI**: 0.104+
- **Ollama**: Latest
- **Tesseract**: 4.0+
- **PostgreSQL**: 13+

---

**Last Updated**: November 2025




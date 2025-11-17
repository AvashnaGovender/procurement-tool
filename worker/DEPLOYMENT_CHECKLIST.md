# 📋 Deployment Checklist

Use this checklist when deploying the Worker Service to the client's server.

---

## Pre-Deployment

### ✅ Prerequisites Installed

- [ ] **Docker & Docker Compose** installed
  - Docker Engine 20.10+
  - Docker Compose 2.0+
- [ ] **Ollama** installed and configured
  - Downloaded from https://ollama.ai/download
  - Model pulled: `ollama pull llama3.1:latest`
- [ ] **PostgreSQL** database accessible
  - Port 5434 open
  - Database `procurement_db` created
  - User credentials available

### ✅ System Requirements

- [ ] **RAM**: 8GB+ available
- [ ] **Disk Space**: 15GB+ free
- [ ] **CPU**: 2+ cores
- [ ] **Ports Available**:
  - 8001 (Worker API)
  - 11434 (Ollama)
  - 5434 (PostgreSQL)

---

## Configuration

### ✅ Environment Setup

- [ ] Copy `env.example` to `.env`
  ```bash
  cp env.example .env
  ```

- [ ] Update **DATABASE_URL** with actual credentials
  ```env
  DATABASE_URL=postgresql://[user]:[password]@[host]:5434/procurement_db
  ```

- [ ] Verify **OLLAMA_BASE_URL** is correct
  ```env
  OLLAMA_BASE_URL=http://localhost:11434
  ```

- [ ] Set **API_PORT** (default: 8001)
  ```env
  API_PORT=8001
  ```

- [ ] Configure **SMTP settings** (if using email notifications)
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password
  ```

### ✅ Security

- [ ] Changed all default passwords
- [ ] Used strong database credentials
- [ ] Removed any test data from `.env`
- [ ] Configured firewall rules
- [ ] Planned for HTTPS (if public-facing)

---

## Files & Directories

### ✅ Essential Files Present

- [ ] `main.py` - Main application
- [ ] `crew_agents.py` - AI analysis
- [ ] `ocr_extractor.py` - Text extraction
- [ ] `config.py` - Configuration
- [ ] `database.py` - Database utilities
- [ ] `email_notifier.py` - Email system
- [ ] `requirements.txt` - Python dependencies
- [ ] `Dockerfile` - Container definition
- [ ] `docker-compose.yml` - Service orchestration
- [ ] `.env` - Environment variables (created from env.example)
- [ ] `README.md` - Documentation
- [ ] `DEPLOYMENT.md` - Deployment guide

### ✅ Directories

- [ ] `uploads/` directory exists (empty or with .gitkeep)
- [ ] `docs/` directory with all guides
- [ ] No `__pycache__/` directories
- [ ] No test files (`test_*.py`)

---

## Installation

### ✅ Ollama Setup

- [ ] Ollama service running
  ```bash
  ollama serve
  ```

- [ ] Model downloaded
  ```bash
  ollama pull llama3.1:latest
  ```

- [ ] Test Ollama connectivity
  ```bash
  curl http://localhost:11434/api/version
  ```

### ✅ Docker Deployment

- [ ] Build Docker image
  ```bash
  docker-compose build
  ```

- [ ] Start services
  ```bash
  docker-compose up -d
  ```

- [ ] Check container status
  ```bash
  docker-compose ps
  ```

- [ ] View logs
  ```bash
  docker-compose logs -f worker
  ```

---

## Testing

### ✅ Service Health

- [ ] Health endpoint responds
  ```bash
  curl http://localhost:8001/health
  ```

- [ ] Response shows Ollama available
  ```json
  {
    "status": "healthy",
    "ollama_available": true,
    "ai_mode": "ollama",
    "ollama_model": "llama3.1:latest"
  }
  ```

### ✅ API Documentation

- [ ] Swagger UI accessible
  - http://localhost:8001/docs

- [ ] ReDoc accessible
  - http://localhost:8001/redoc

### ✅ Functionality Tests

- [ ] Upload endpoint works
  ```bash
  curl -X POST http://localhost:8001/upload \
    -F "file=@test_document.pdf"
  ```

- [ ] Process endpoint works (use document_id from upload)
  ```bash
  curl -X POST http://localhost:8001/process-document \
    -H "Content-Type: application/json" \
    -d '{"document_id":"test-id","content":"test","document_type":"bbbee_certificate"}'
  ```

- [ ] Document type detection working
- [ ] AI analysis returning results
- [ ] Confidence scores calculated correctly

---

## Integration

### ✅ Main Application Integration

- [ ] Main Next.js app has `WORKER_API_URL` configured
  ```env
  WORKER_API_URL=http://localhost:8001
  ```

- [ ] Test document upload from main app UI
- [ ] Test AI analysis from admin interface
- [ ] Verify results display correctly
- [ ] Check document type mismatch detection

---

## Monitoring & Maintenance

### ✅ Monitoring Setup

- [ ] Health check endpoint monitored
- [ ] Log rotation configured
- [ ] Disk space monitoring (uploads folder)
- [ ] CPU/Memory monitoring
- [ ] Ollama service monitoring

### ✅ Backup Strategy

- [ ] Uploaded documents backed up
- [ ] Database backups configured
- [ ] `.env` file backed up securely
- [ ] Docker volumes backed up

### ✅ Maintenance Plan

- [ ] Regular dependency updates planned
- [ ] Ollama model updates scheduled
- [ ] Log cleanup automated
- [ ] Uploads cleanup scheduled

---

## Documentation

### ✅ Handover Documentation

- [ ] README.md reviewed with client
- [ ] DEPLOYMENT.md explained
- [ ] Environment variables documented
- [ ] Troubleshooting guide reviewed
- [ ] Contact information for support provided

### ✅ Client Training

- [ ] API endpoints explained
- [ ] Health monitoring demonstrated
- [ ] Log access shown
- [ ] Restart procedures explained
- [ ] Common issues reviewed

---

## Production Checklist

### ✅ Performance Optimization

- [ ] Docker allocated sufficient resources
- [ ] Ollama model appropriate for use case
- [ ] Worker concurrency optimized
- [ ] Upload size limits appropriate

### ✅ Security Hardening

- [ ] Firewall rules configured
- [ ] Only necessary ports exposed
- [ ] HTTPS configured (if public)
- [ ] Strong passwords used
- [ ] Regular security updates planned

### ✅ Disaster Recovery

- [ ] Backup restoration tested
- [ ] Rollback procedure documented
- [ ] Service restart procedure documented
- [ ] Emergency contact list provided

---

## Sign-off

### ✅ Final Verification

- [ ] All tests passing
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Client satisfied
- [ ] Documentation complete

### Deployment Details

**Deployed By**: ___________________  
**Date**: ___________________  
**Server**: ___________________  
**Version**: 1.0  

### Notes

```
[Add any deployment-specific notes here]
```

---

## Post-Deployment

### Week 1

- [ ] Monitor logs daily
- [ ] Check disk space
- [ ] Verify all features working
- [ ] Respond to any client issues

### Week 2-4

- [ ] Review performance metrics
- [ ] Optimize if needed
- [ ] Update documentation if required
- [ ] Schedule first maintenance window

---

## Support Contacts

**For Technical Issues:**
- Review [DEPLOYMENT.md](DEPLOYMENT.md)
- Check [docs/](docs/) guides
- Review logs: `docker-compose logs -f worker`

**For Ollama Issues:**
- Official docs: https://ollama.ai/docs
- GitHub: https://github.com/ollama/ollama

**For FastAPI Issues:**
- Official docs: https://fastapi.tiangolo.com/

---

**Document Version**: 1.0  
**Last Updated**: November 2025




# CrewAI Automation Setup Guide

This guide explains how to set up and run the CrewAI-powered document processing automation for the procurement system.

## Overview

The automation workflow consists of:
1. **Python Worker Service** - FastAPI + Celery + CrewAI
2. **Redis Queue** - Message broker for task processing
3. **PostgreSQL Database** - Results storage
4. **Next.js Integration** - API endpoints to connect with worker service

## Architecture

```
Next.js App → Worker API → Celery Queue → CrewAI Agents → Database → Email Notifications
```

## Prerequisites

### System Requirements
- Python 3.8+
- Redis server
- PostgreSQL database
- Tesseract OCR
- Node.js (for main application)

### Python Dependencies
- FastAPI for REST API
- Celery for task queue
- CrewAI for AI agents
- Redis for message broker
- PostgreSQL for database
- Tesseract for OCR

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `worker/` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/procurement_tool

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# OpenAI Configuration (required for CrewAI)
OPENAI_API_KEY=your_openai_api_key_here

# FastAPI Configuration
API_HOST=0.0.0.0
API_PORT=8001
WORKER_CONCURRENCY=4

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# Application URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8001
```

### 2. Install Dependencies

```bash
cd worker
pip install -r requirements.txt
```

### 3. Install Tesseract OCR

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-eng
```

**macOS:**
```bash
brew install tesseract
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### 4. Start Services

#### Option A: Manual Setup

1. **Start Redis:**
```bash
redis-server
```

2. **Start Celery Worker:**
```bash
cd worker
celery -A celery_worker worker --loglevel=info
```

3. **Start FastAPI Server:**
```bash
cd worker
python main.py
```

#### Option B: Docker Setup

1. **Using Docker Compose:**
```bash
cd worker
docker-compose up -d
```

2. **Using Docker:**
```bash
# Build image
docker build -t procurement-worker .

# Run with docker-compose
docker-compose up
```

### 5. Update Main Application

Add environment variables to your main Next.js application:

```bash
# In your main .env file
WORKER_API_URL=http://localhost:8001
```

## API Endpoints

### Worker Service Endpoints

- `GET /health` - Health check
- `POST /process-submission` - Start document processing
- `GET /submission-status/{id}` - Get processing status
- `GET /submission-results/{id}` - Get processing results

### Main Application Integration

- `POST /api/worker/process-submission` - Trigger AI processing
- `GET /api/worker/status/{id}` - Check processing status
- `GET /api/worker/results/{id}` - Get processing results
- `GET /api/worker/health` - Health check

## Workflow Process

### 1. Document Upload
- Supplier uploads documents through the main application
- Documents are stored in the file system
- Document metadata is stored in the database

### 2. Processing Trigger
- Admin or system triggers AI processing
- Main application calls worker service API
- Worker service queues the processing task

### 3. AI Processing
- **OCR Extraction**: Extract text from all documents
- **Field Extraction**: Extract specific fields (company name, registration number, etc.)
- **Document Analysis**: CrewAI agents analyze document content
- **Compliance Checking**: Verify against business requirements
- **Risk Assessment**: Evaluate risk factors and score
- **Decision Summary**: Generate final recommendation

### 4. Results Storage
- Processing results stored in PostgreSQL
- Individual document results stored
- Compliance check results stored
- Risk assessment stored

### 5. Notifications
- Admin receives email notification with summary
- Link to review submission in main application
- Supplier receives status update (optional)

## CrewAI Agents

### Document Analyzer
- **Role**: Document Analysis Specialist
- **Goal**: Extract and analyze all relevant information from supplier documents
- **Tools**: Document analysis, OCR processing

### Compliance Officer
- **Role**: Compliance Officer
- **Goal**: Ensure all documents meet regulatory and company compliance requirements
- **Tools**: Compliance checking, regulatory verification

### Risk Assessor
- **Role**: Risk Assessment Specialist
- **Goal**: Evaluate supplier risk based on document analysis and compliance status
- **Tools**: Risk scoring, business risk evaluation

### Decision Maker
- **Role**: Decision Maker
- **Goal**: Generate final decision summary and recommendations
- **Tools**: Decision synthesis, recommendation generation

## Monitoring and Troubleshooting

### Health Checks
```bash
# Check worker service health
curl http://localhost:8001/health

# Check main application integration
curl http://localhost:3000/api/worker/health
```

### Logs
- Worker service logs: Check console output
- Celery worker logs: Check Celery output
- Database logs: Check PostgreSQL logs

### Common Issues

1. **Redis Connection Failed**
   - Ensure Redis server is running
   - Check REDIS_URL configuration

2. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check database permissions

3. **OpenAI API Errors**
   - Verify OPENAI_API_KEY is set
   - Check API key permissions
   - Monitor API usage limits

4. **OCR Processing Failed**
   - Ensure Tesseract is installed
   - Check file permissions
   - Verify document formats are supported

## Production Deployment

### Environment Variables
Set all required environment variables in production:
- Database credentials
- Redis configuration
- OpenAI API key
- SMTP settings
- File storage paths

### Scaling
- Run multiple Celery workers for parallel processing
- Use Redis Cluster for high availability
- Implement proper logging and monitoring
- Set up health checks and alerts

### Security
- Secure API endpoints
- Validate file uploads
- Implement rate limiting
- Use HTTPS in production
- Secure database connections

## Testing

### Test Processing
```bash
# Test health check
curl http://localhost:8001/health

# Test processing (replace with actual data)
curl -X POST http://localhost:8001/process-submission \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "test-001",
    "supplier_id": "supplier-001",
    "onboarding_id": "onboarding-001",
    "documents": [
      {
        "id": "doc-001",
        "type": "registration",
        "file_path": "/path/to/document.pdf",
        "file_name": "registration.pdf",
        "file_size": 1024000
      }
    ],
    "admin_emails": ["admin@company.com"]
  }'
```

### Test Notifications
```bash
# Test email notification
curl -X POST http://localhost:8001/test-notification \
  -H "Content-Type: application/json" \
  -d '["admin@company.com"]'
```

## Support

For issues or questions:
1. Check logs for error messages
2. Verify all services are running
3. Test individual components
4. Check environment configuration
5. Review API documentation



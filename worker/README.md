# Procurement Worker Service

This is a Python-based worker service that uses CrewAI to automate the supplier document processing workflow. It handles OCR, compliance checking, risk assessment, and decision making.

## Features

- **Document Processing**: OCR and text extraction from various document formats (PDF, DOCX, images)
- **AI-Powered Analysis**: Uses CrewAI agents with Ollama (local LLM) for intelligent document analysis
- **Compliance Checking**: Automated compliance verification against business requirements
- **Risk Assessment**: AI-driven risk scoring and recommendations
- **Decision Making**: Automated decision summaries and recommendations
- **Email Notifications**: Automated admin and supplier notifications
- **Database Integration**: Stores results in PostgreSQL database
- **Privacy-First**: All AI processing runs locally using Ollama - no data sent to external APIs

## Architecture

- **FastAPI**: REST API for receiving processing requests
- **Celery**: Task queue for background processing
- **Redis**: Message broker for Celery
- **CrewAI**: AI agent framework for document analysis
- **Ollama**: Local LLM runtime (replaces OpenAI for privacy and cost savings)
- **PostgreSQL**: Database for storing results
- **OCR**: Tesseract for text extraction from images

## Setup

### Prerequisites

- Python 3.8+
- Redis server
- PostgreSQL database
- Tesseract OCR installed
- **Ollama installed** - See [OLLAMA_SETUP.md](./OLLAMA_SETUP.md)

### Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Tesseract OCR:
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

3. Configure environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Create database tables:
```bash
python -c "from database import create_tables; create_tables()"
```

### Running the Service

1. Start Redis server:
```bash
redis-server
```

2. Start Celery worker:
```bash
celery -A celery_worker worker --loglevel=info
```

3. Start FastAPI server:
```bash
python main.py
```

## API Endpoints

### Health Check
```
GET /health
```

### Process Submission
```
POST /process-submission
{
  "submission_id": "string",
  "supplier_id": "string", 
  "onboarding_id": "string",
  "documents": [
    {
      "id": "string",
      "type": "string",
      "file_path": "string",
      "file_name": "string",
      "file_size": 0
    }
  ],
  "admin_emails": ["string"]
}
```

### Get Submission Status
```
GET /submission-status/{submission_id}
```

### Get Submission Results
```
GET /submission-results/{submission_id}
```

## Workflow

1. **Document Upload**: Supplier uploads documents through the main application
2. **Processing Request**: Main application sends processing request to worker service
3. **OCR Extraction**: Worker extracts text and fields from all documents
4. **AI Analysis**: CrewAI agents analyze documents for completeness and compliance
5. **Risk Assessment**: AI evaluates risk factors and provides scoring
6. **Decision Summary**: AI generates final decision recommendation
7. **Database Storage**: Results are stored in PostgreSQL
8. **Notifications**: Admin and supplier notifications are sent via email

## CrewAI Agents

- **Document Analyzer**: Extracts and analyzes document content
- **Compliance Officer**: Checks documents against regulatory requirements
- **Risk Assessor**: Evaluates business risk factors
- **Decision Maker**: Generates final recommendations

## Configuration

Key configuration options in `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `OLLAMA_BASE_URL`: Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL`: Ollama model to use (default: llama3.1)
- `SMTP_*`: Email configuration for notifications

See [OLLAMA_SETUP.md](./OLLAMA_SETUP.md) for detailed Ollama installation and configuration instructions.

## Monitoring

The service provides health check endpoints and logging for monitoring:

- Health status: `/health`
- Task status: Available through Celery monitoring tools
- Logs: Structured logging for debugging and monitoring

## Integration

This worker service integrates with the main Next.js procurement application:

1. Main app uploads documents and creates submission
2. Main app calls worker API to start processing
3. Worker processes documents using AI
4. Main app polls for results or receives webhook notifications
5. Admin reviews results and makes final decision


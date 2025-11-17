# AI Document Analysis Worker Service

> **Intelligent document processing and validation for the Procurement Tool**

This service handles AI-powered document analysis, OCR extraction, and validation for supplier onboarding documents including B-BBEE certificates, tax clearances, bank confirmations, and more.

---

## 🚀 Quick Start

### 🪟 **Windows Server?** → Start Here!

👉 **READ THIS FIRST**: [START_HERE_WINDOWS.md](START_HERE_WINDOWS.md)

Complete Windows Server deployment guide with:
- Email template for your admin
- PowerShell verification script
- Windows-specific commands
- Step-by-step deployment

---

### 🐧 Linux/Docker Quick Start

**Option 1: Docker (Recommended)**

```bash
# 1. Install Ollama and pull the model
ollama pull llama3.1:latest

# 2. Configure environment
cp env.example .env
# Edit .env with your settings

# 3. Start the service
docker-compose up -d

# 4. Check health
curl http://localhost:8001/health
```

**Option 2: Manual Setup**

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Install system packages (Ubuntu/Debian)
sudo apt-get install tesseract-ocr poppler-utils

# 3. Configure environment
cp env.example .env

# 4. Start the service
./start.sh  # Linux/Mac
start.bat   # Windows
```

---

## 📖 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[docs/OLLAMA_SETUP.md](docs/OLLAMA_SETUP.md)** - Ollama installation and configuration
- **[docs/SETUP_INSTRUCTIONS.md](docs/SETUP_INSTRUCTIONS.md)** - Detailed setup instructions
- **[docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Testing the worker service

### Validation Guides

- **[docs/BANK_VALIDATION_GUIDE.md](docs/BANK_VALIDATION_GUIDE.md)** - Bank confirmation validation
- **[docs/BBBEE_VALIDATION_GUIDE.md](docs/BBBEE_VALIDATION_GUIDE.md)** - B-BBEE certificate validation
- **[docs/CIPC_VALIDATION_GUIDE.md](docs/CIPC_VALIDATION_GUIDE.md)** - CIPC document validation
- **[docs/TAX_VALIDATION_GUIDE.md](docs/TAX_VALIDATION_GUIDE.md)** - Tax clearance validation

---

## 🔧 Configuration

Create a `.env` file based on `env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5434/procurement_db

# Ollama (AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:latest

# Worker
API_HOST=0.0.0.0
API_PORT=8001
```

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete configuration options.

---

## 🏗️ Architecture

### Core Files

- **main.py** - FastAPI application and API endpoints
- **ocr_extractor.py** - Document text extraction (PDF, images, DOCX)
- **crew_agents.py** - AI-powered document analysis with Ollama
- **config.py** - Configuration management
- **database.py** - Database connection utilities
- **email_notifier.py** - Email notification system

### Processing Flow

```
Upload Document → Extract Text → Detect Type → AI Analysis → Validation Results
```

---

## 🔌 API Endpoints

### Health Check
```bash
GET /health
```

### Upload Document
```bash
POST /upload
Content-Type: multipart/form-data

# Returns: document_id, extracted_content
```

### Process Document
```bash
POST /process-document
Content-Type: application/json

{
  "document_id": "uuid",
  "content": "extracted text",
  "document_type": "bbbee_certificate",
  "filename": "document.pdf",
  "supplier_name": "Company Name",
  "supplier_email": "email@company.com",
  "form_data": {}
}
```

**Interactive API docs**: http://localhost:8001/docs

---

## 🤖 AI Features

### Document Type Detection
- Automatically detects document type from content and filename
- Flags mismatches (e.g., wrong document uploaded)
- Confidence scoring based on detection

### Validation Capabilities

✅ **B-BBEE Certificates**
- Status level verification
- Black ownership percentage
- Expiry date validation
- Issuing authority verification

✅ **Tax Clearance / Good Standing**
- Taxpayer name matching
- Certificate validity period
- Purpose verification
- Age validation (< 3 months)

✅ **Bank Confirmations**
- Bank name verification
- Account number matching
- Branch validation
- Letter authenticity

✅ **Company Registration**
- Registration number verification
- Company name matching
- Director information
- Status validation

### Confidence Scoring
- High confidence: 85-100%
- Medium confidence: 50-84%
- Low confidence: <50%
- Document mismatch penalty: Reduces to 20-35%

---

## 🧪 Testing

```bash
# Check service health
curl http://localhost:8001/health

# Test document upload
curl -X POST http://localhost:8001/upload \
  -F "file=@test_document.pdf"

# View API documentation
open http://localhost:8001/docs
```

See **[docs/TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** for comprehensive testing procedures.

---

## 🐳 Docker Support

### Files
- **Dockerfile** - Container image definition
- **docker-compose.yml** - Multi-service orchestration

### Commands
```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f worker

# Stop services
docker-compose down

# Restart service
docker-compose restart worker
```

---

## 📦 Dependencies

### Python Packages (requirements.txt)
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **langchain-ollama** - Ollama integration
- **PyPDF2** - PDF text extraction
- **pytesseract** - OCR engine
- **pdf2image** - PDF to image conversion
- **Pillow** - Image processing
- **python-docx** - DOCX processing
- **openpyxl** - Excel processing
- **sqlalchemy** - Database ORM
- **psycopg2-binary** - PostgreSQL adapter

### System Dependencies
- **Tesseract OCR** - Text recognition
- **Poppler** - PDF rendering
- **PostgreSQL** - Database (shared with main app)
- **Ollama** - Local LLM for AI processing

---

## 🔒 Security

- Upload folder excluded from git (.gitignore)
- Environment variables for sensitive data
- No hardcoded credentials
- Input validation on all endpoints
- File type validation
- Size limits on uploads

---

## 🚨 Troubleshooting

### Common Issues

**"Ollama not available"**
```bash
ollama serve
ollama pull llama3.1:latest
```

**"Tesseract not found"**
- Install Tesseract OCR
- Add to system PATH
- Verify: `tesseract --version`

**"Database connection failed"**
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running on port 5434
- Verify database exists

**"Port 8001 already in use"**
```bash
# Change API_PORT in .env
API_PORT=8002
```

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed troubleshooting.

---

## 📊 Monitoring

### Health Endpoint
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "healthy",
  "ollama_available": true,
  "ai_mode": "ollama",
  "ollama_model": "llama3.1:latest",
  "ollama_base_url": "http://localhost:11434"
}
```

### Logs
- **Docker**: `docker-compose logs -f worker`
- **Manual**: Console output

---

## 🔄 Integration

### With Main Next.js App

The main application calls this worker service for document processing:

**Main App Environment:**
```env
WORKER_API_URL=http://localhost:8001
```

**API Flow:**
1. User uploads document in Next.js UI
2. Next.js sends to worker `/upload` endpoint
3. Worker extracts text and returns document ID
4. Next.js calls `/process-document` for AI analysis
5. Worker returns validation results
6. Results displayed in admin interface

---

## 📈 Performance

### Recommended Resources
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB+ recommended
- **Disk**: 10GB+ free (for Ollama models)

### Processing Times
- **PDF Text Extraction**: 1-3 seconds
- **OCR Processing**: 5-10 seconds
- **AI Analysis**: 3-8 seconds (depends on model)
- **Total**: ~10-20 seconds per document

### Optimization Tips
- Use SSD for faster I/O
- Allocate sufficient RAM to Docker
- Use smaller Ollama models for speed
- Scale horizontally with multiple workers

---

## 🛠️ Development

### Project Structure
```
worker/
├── main.py                 # FastAPI app
├── crew_agents.py          # AI analysis
├── ocr_extractor.py        # Text extraction
├── config.py               # Configuration
├── database.py             # DB utilities
├── email_notifier.py       # Email system
├── requirements.txt        # Python deps
├── docker-compose.yml      # Docker config
├── Dockerfile              # Container image
├── .env                    # Environment vars (create from env.example)
├── uploads/                # Uploaded documents
└── docs/                   # Documentation
```

### Local Development
```bash
# Install dev dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --port 8001

# Access API docs
open http://localhost:8001/docs
```

---

## 📝 License

This is proprietary software developed for the Procurement Tool.

---

## 📧 Support

For deployment assistance:
1. Review **[DEPLOYMENT.md](DEPLOYMENT.md)**
2. Check **[docs/](docs/)** for specific guides
3. Verify all prerequisites are installed
4. Check service logs for error messages

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Python**: 3.9+  
**FastAPI**: 0.104+  
**Ollama**: Latest


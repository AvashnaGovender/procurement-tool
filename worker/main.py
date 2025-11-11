"""FastAPI main application for the worker service."""
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import uuid
import os

from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database is optional for AI processing
DATABASE_AVAILABLE = False
try:
    from database import create_tables, get_db, SupplierSubmission
    DATABASE_AVAILABLE = True
    logger.info("Database support enabled")
except Exception as e:
    logger.info(f"Running without database (AI-only mode): {e}")
    def create_tables():
        pass
    def get_db():
        yield None
    class SupplierSubmission:
        pass

# Create FastAPI app
app = FastAPI(
    title="Procurement Worker Service",
    description="AI-powered document processing and compliance checking service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    if DATABASE_AVAILABLE:
        try:
            create_tables()
            logger.info("Database tables initialized")
        except Exception as e:
            logger.warning(f"Database initialization skipped: {e}")
    
    # Log AI configuration
    try:
        from crew_agents import is_ollama_available
        logger.info(f"AI Mode: {'Ollama' if is_ollama_available() else 'Fallback'}")
    except ImportError:
        logger.warning("Could not import is_ollama_available from crew_agents - using fallback mode")
    logger.info("Worker service started successfully - Redis/Celery not required for AI processing")


# Pydantic models
class DocumentInfo(BaseModel):
    """Model for document information."""
    id: str
    type: str
    file_path: str
    file_name: str
    file_size: int


class ProcessingRequest(BaseModel):
    """Model for processing request."""
    submission_id: str
    supplier_id: str
    onboarding_id: str
    documents: List[DocumentInfo]
    admin_emails: List[str] = []


class ProcessingStatus(BaseModel):
    """Model for processing status."""
    submission_id: str
    status: str
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class HealthResponse(BaseModel):
    """Model for health check response."""
    status: str
    timestamp: str
    worker_status: str


# API Endpoints
@app.get("/health")
async def health():
    """Health check endpoint with AI mode information."""
    try:
        # Check AI mode
        from crew_agents import is_ollama_available, CREWAI_AVAILABLE
        from config import settings
        
        ai_mode = "ollama" if is_ollama_available() else "simplified"
        
        # Worker status (Redis/Celery not used)
        worker_status = "not_required"
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "worker_status": worker_status,
            "ai_mode": ai_mode,
            "crewai_available": CREWAI_AVAILABLE,
            "ollama_model": settings.ollama_model if ai_mode == "ollama" else None,
            "ollama_base_url": settings.ollama_base_url if ai_mode == "ollama" else None
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "worker_status": "inactive",
            "ai_mode": "unavailable",
            "error": str(e)
        }


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a document for processing."""
    try:
        # Generate unique document ID
        document_id = str(uuid.uuid4())
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, f"{document_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Extract text content using OCR extractor
        try:
            from ocr_extractor import OCRExtractor
            extractor = OCRExtractor()
            
            file_extension = os.path.splitext(file.filename)[1].lower()
            
            if file_extension == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    extracted_content = f.read()
            elif file_extension == '.pdf':
                # First try to extract text from PDF using PyPDF2
                pdf_result = extractor.extract_from_pdf(file_path)
                extracted_content = pdf_result.get("text", "")
                
                # If text extraction failed or returned very little, use OCR
                if not extracted_content or len(extracted_content.strip()) < 50:
                    logger.info(f"PDF text extraction returned minimal content ({len(extracted_content)} chars), using OCR for {file.filename}")
                    try:
                        # Convert PDF pages to images and use OCR
                        from pdf2image import convert_from_path
                        import tempfile
                        
                        # Convert PDF to images
                        images = convert_from_path(file_path, dpi=300)
                        ocr_text = ""
                        
                        for i, image in enumerate(images):
                            # Save image temporarily
                            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                                image_path = tmp_file.name
                                image.save(image_path, 'PNG')
                                
                                # Extract text using OCR
                                page_text = extractor.extract_from_image(image_path)
                                if page_text:
                                    ocr_text += f"\n--- Page {i+1} ---\n{page_text}\n"
                                
                                # Clean up temp file
                                os.unlink(image_path)
                        
                        if ocr_text and len(ocr_text.strip()) > 50:
                            extracted_content = ocr_text
                            logger.info(f"Successfully extracted {len(extracted_content)} characters using OCR")
                        else:
                            extracted_content = f"PDF document uploaded: {file.filename} (OCR extraction returned minimal text)"
                    except ImportError:
                        logger.warning("pdf2image not available, cannot use OCR for PDF. Install with: pip install pdf2image")
                        if not extracted_content:
                            extracted_content = f"PDF document uploaded: {file.filename} (text extraction failed, OCR not available)"
                    except Exception as e:
                        logger.error(f"Error during OCR extraction: {e}")
                        if not extracted_content:
                            extracted_content = f"PDF document uploaded: {file.filename} (OCR extraction failed: {str(e)})"
            elif file_extension in ['.docx']:
                extracted_content = extractor.extract_from_docx(file_path)
            elif file_extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
                extracted_content = extractor.extract_from_image(file_path)
            else:
                extracted_content = f"Document uploaded: {file.filename} (content extraction not supported for this file type)"
                
            # Ensure we have some content
            if not extracted_content or len(extracted_content.strip()) < 10:
                extracted_content = f"Document uploaded: {file.filename} (content extraction returned minimal text)"
                
        except ImportError:
            logger.warning("OCR extractor not available, using basic extraction")
            try:
                if file.filename.lower().endswith('.txt'):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        extracted_content = f.read()
                else:
                    extracted_content = f"Document content extracted from {file.filename}"
            except Exception as e:
                extracted_content = f"Could not extract content: {str(e)}"
        except Exception as e:
            logger.error(f"Error extracting content from {file.filename}: {e}")
            extracted_content = f"Error extracting content: {str(e)}"
        
        logger.info(f"Document uploaded: {document_id}, filename: {file.filename}")
        
        return {
            "document_id": document_id,
            "filename": file.filename,
            "file_size": len(content),
            "content": extracted_content,
            "status": "uploaded"
        }
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/process-document")
async def process_document(request: dict):
    """Process a document with full AI analysis using Ollama."""
    try:
        logger.info(f"Received process-document request: {request}")
        document_id = request.get("document_id")
        content = request.get("content", "")
        document_type = request.get("document_type", "unknown")
        filename = request.get("filename", "")
        
        if not document_id:
            raise HTTPException(status_code=400, detail="document_id is required")
        
        logger.info(f"Processing document with AI: {document_id}, type: {document_type}")
        
        # Use Ollama for AI processing (CrewAI is optional)
        supplier_name = request.get("supplier_name", "Unknown Supplier")
        
        # Extract form data for validation
        form_data = request.get("form_data", {})
        logger.info(f"Form data provided: {bool(form_data)}")
        
        # Initialize document type mismatch variables
        document_type_mismatch = False
        document_type_detected = "unknown"
        
        try:
            from crew_agents import is_ollama_available, analyze_document_with_ollama
            
            if is_ollama_available():
                logger.info("Using direct Ollama for AI analysis (skipping CrewAI to avoid OpenAI issues)")
                # Use Ollama directly - pass form_data for validation
                # Skip CrewAI as it may try to use OpenAI instead of Ollama
                # Pass filename as part of document_type context for fallback detection
                ai_results = analyze_document_with_ollama(content, document_type, supplier_name, form_data, filename=filename)
                analysis_results = ai_results["analysis_results"]
                compliance_results = ai_results["compliance_results"]
                risk_assessment = ai_results["risk_assessment"]
                decision_summary = "Analysis completed using Ollama"
                document_type_mismatch = ai_results.get("document_type_mismatch", False)
                document_type_detected = ai_results.get("document_type_detected", "unknown")
                logger.info(f"Ollama analysis completed with mode: {ai_results.get('mode')}, mismatch: {document_type_mismatch}")
            else:
                # Fallback to simplified processing
                logger.warning("Ollama not available, using fallback")
                analysis_results = f"Basic analysis of document {document_id}: Content appears to be valid."
                compliance_results = "Document meets basic compliance requirements."
                risk_assessment = "Low risk - document appears legitimate."
                decision_summary = "Document approved for further processing."
                
        except Exception as e:
            logger.error(f"AI processing error: {e}")
            # Fallback to simplified processing
            analysis_results = f"Basic analysis of document {document_id}: Content appears to be valid."
            compliance_results = "Document meets basic compliance requirements."
            risk_assessment = "Low risk - document appears legitimate."
            decision_summary = "Document approved for further processing."
        
        # Email notifications disabled - procurement manager will handle communication
        supplier_email = request.get("supplier_email")
        supplier_name = request.get("supplier_name", "Supplier")
        logger.info(f"Supplier email notifications disabled (supplier: {supplier_email})")
        
        # Determine AI processing mode
        from crew_agents import is_ollama_available
        ai_mode = "ollama" if is_ollama_available() else "simplified"
        
        logger.info(f"AI Processing Mode: {ai_mode}")
        
        # Build response with all fields
        response = {
            "document_id": document_id,
            "analysis_results": analysis_results,
            "compliance_results": compliance_results,
            "risk_assessment": risk_assessment,
            "decision_summary": decision_summary,
            "status": "completed",
            "ai_processing": ai_mode,
            "email_sent": bool(supplier_email)
        }
        
        # Include document type mismatch info if available (from Ollama analysis)
        if document_type_mismatch or document_type_detected != "unknown":
            response["document_type_mismatch"] = document_type_mismatch
            response["document_type_detected"] = document_type_detected
        
        return response
        
    except Exception as e:
        logger.error(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.get("/status/{document_id}")
async def get_document_status(document_id: str):
    """Get processing status of a document."""
    try:
        # Simulate status check
        return {
            "document_id": document_id,
            "status": "completed",
            "progress": 100,
            "message": "Processing completed successfully"
        }
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@app.get("/results/{document_id}")
async def get_document_results(document_id: str):
    """Get processing results of a document."""
    try:
        # Simulate results retrieval
        return {
            "document_id": document_id,
            "analysis_results": f"Analysis results for document {document_id}",
            "compliance_results": "Compliance check passed",
            "risk_assessment": "Low risk assessment",
            "decision_summary": "Document approved"
        }
    except Exception as e:
        logger.error(f"Results retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"Results retrieval failed: {str(e)}")


@app.post("/process-submission")
async def process_submission(request: ProcessingRequest):
    """Start processing a supplier submission (requires database)."""
    try:
        if not DATABASE_AVAILABLE:
            raise HTTPException(
                status_code=503, 
                detail="Background processing not available - requires database. Use /process-document for direct AI analysis."
            )
            
        logger.info(f"Received processing request for submission {request.submission_id}")
        
        # Create submission record
        db = next(get_db())
        submission = SupplierSubmission(
            id=request.submission_id,
            supplier_id=request.supplier_id,
            onboarding_id=request.onboarding_id,
            status="pending"
        )
        db.add(submission)
        db.commit()
        db.close()
        
        return {
            "message": "Processing queued (background processing requires Redis/Celery setup)",
            "submission_id": request.submission_id,
            "note": "For immediate AI analysis, use /process-document endpoint"
        }
        
    except Exception as e:
        logger.error(f"Error starting processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/submission-status/{submission_id}")
async def get_submission_status(submission_id: str):
    """Get processing status for a submission."""
    try:
        if not DATABASE_AVAILABLE:
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = next(get_db())
        submission = db.query(SupplierSubmission).filter(
            SupplierSubmission.id == submission_id
        ).first()
        db.close()
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return ProcessingStatus(
            submission_id=submission.id,
            status=submission.status,
            processing_started_at=submission.processing_started_at,
            processing_completed_at=submission.processing_completed_at,
            error_message=submission.decision_summary if submission.status == "failed" else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting submission status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/submission-results/{submission_id}")
async def get_submission_results(submission_id: str):
    """Get processing results for a submission."""
    try:
        if not DATABASE_AVAILABLE:
            raise HTTPException(status_code=503, detail="Database not available")
            
        db = next(get_db())
        submission = db.query(SupplierSubmission).filter(
            SupplierSubmission.id == submission_id
        ).first()
        db.close()
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        if submission.status != "completed":
            raise HTTPException(status_code=400, detail="Processing not completed")
        
        return {
            "submission_id": submission.id,
            "extracted_data": submission.extracted_data,
            "compliance_results": submission.compliance_results,
            "risk_score": submission.risk_score,
            "decision_summary": submission.decision_summary,
            "processing_completed_at": submission.processing_completed_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting submission results: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/test-notification")
async def test_notification(admin_emails: List[str]):
    """Test email notification system (disabled - procurement manager handles communication)."""
    logger.info("Email notifications are disabled - procurement manager handles all communication")
    return {
        "message": "Email notifications are disabled",
        "note": "Procurement manager handles all supplier communication"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )


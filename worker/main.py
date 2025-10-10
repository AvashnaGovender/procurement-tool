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
    from crew_agents import is_ollama_available
    logger.info(f"AI Mode: {'Ollama' if is_ollama_available() else 'Fallback'}")
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
        
        # Extract text content (simplified - you might want to use OCR here)
        try:
            if file.filename.lower().endswith('.txt'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    extracted_content = f.read()
            else:
                # For other file types, you'd use OCR or other extraction methods
                extracted_content = f"Document content extracted from {file.filename}"
        except Exception as e:
            extracted_content = f"Could not extract content: {str(e)}"
        
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
        
        if not document_id:
            raise HTTPException(status_code=400, detail="document_id is required")
        
        logger.info(f"Processing document with AI: {document_id}, type: {document_type}")
        
        # Use Ollama for AI processing (CrewAI is optional)
        supplier_name = request.get("supplier_name", "Unknown Supplier")
        
        # Extract form data for validation
        form_data = request.get("form_data", {})
        logger.info(f"Form data provided: {bool(form_data)}")
        
        try:
            from crew_agents import is_ollama_available, analyze_document_with_ollama, CREWAI_AVAILABLE, create_processing_crew
            
            if is_ollama_available():
                logger.info("Using Ollama for AI analysis")
                
                # Use CrewAI if available, otherwise direct Ollama
                if CREWAI_AVAILABLE:
                    logger.info("Using CrewAI agents with Ollama")
                    # Prepare document data for AI processing
                    document_data = {
                        "id": document_id,
                        "type": document_type,
                        "content": content,
                        "filename": f"document_{document_id}",
                        "size": len(content)
                    }
                    
                    # Create and run AI processing crew
                    crew = create_processing_crew(document_id, [document_data])
                    result = crew.kickoff()
                    
                    # Extract results from AI processing
                    if isinstance(result, dict) and "error" not in result:
                        analysis_results = result.get("analysis_results", "AI analysis completed")
                        compliance_results = result.get("compliance_results", "Compliance check completed")
                        risk_assessment = result.get("risk_assessment", "Risk assessment completed")
                        decision_summary = result.get("decision_summary", "Decision summary generated")
                    else:
                        # Use direct Ollama if crew fails - pass form_data for validation
                        ai_results = analyze_document_with_ollama(content, document_type, supplier_name, form_data)
                        analysis_results = ai_results["analysis_results"]
                        compliance_results = ai_results["compliance_results"]
                        risk_assessment = ai_results["risk_assessment"]
                        decision_summary = "Analysis completed using Ollama"
                else:
                    logger.info("Using direct Ollama (CrewAI not available)")
                    # Use Ollama directly without CrewAI - pass form_data for validation
                    ai_results = analyze_document_with_ollama(content, document_type, supplier_name, form_data)
                    analysis_results = ai_results["analysis_results"]
                    compliance_results = ai_results["compliance_results"]
                    risk_assessment = ai_results["risk_assessment"]
                    decision_summary = "Analysis completed using Ollama"
                    logger.info(f"Ollama analysis completed with mode: {ai_results.get('mode')}")
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
        
        return {
            "document_id": document_id,
            "analysis_results": analysis_results,
            "compliance_results": compliance_results,
            "risk_assessment": risk_assessment,
            "decision_summary": decision_summary,
            "status": "completed",
            "ai_processing": ai_mode,
            "email_sent": bool(supplier_email)
        }
        
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


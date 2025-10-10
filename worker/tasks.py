"""Celery tasks for document processing workflow."""
from celery import Celery
from typing import Dict, List, Any, Optional
import json
import os
from datetime import datetime
import logging

from config import settings
from database import get_db, SupplierSubmission, DocumentProcessingResult, ComplianceCheck
from ocr_extractor import OCRExtractor
try:
    from crew_agents import create_processing_crew, CREWAI_AVAILABLE
except ImportError:
    CREWAI_AVAILABLE = False
    def create_processing_crew(*args, **kwargs):
        return None
from email_notifier import EmailNotifier

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    'procurement_worker',
    broker=settings.redis_url,
    backend=settings.redis_url
)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour timeout
    worker_concurrency=settings.worker_concurrency
)

# Initialize services
ocr_extractor = OCRExtractor()
email_notifier = EmailNotifier()


@celery_app.task(bind=True, name='process_supplier_submission')
def process_supplier_submission(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main task to process supplier submission.
    
    Args:
        submission_data: Dictionary containing:
            - submission_id: Unique submission ID
            - supplier_id: Supplier ID
            - onboarding_id: Onboarding ID
            - documents: List of document information
            - admin_emails: List of admin emails for notifications
    """
    submission_id = submission_data.get('submission_id')
    supplier_id = submission_data.get('supplier_id')
    onboarding_id = submission_data.get('onboarding_id')
    documents = submission_data.get('documents', [])
    admin_emails = submission_data.get('admin_emails', [])
    
    logger.info(f"Starting processing for submission {submission_id}")
    
    try:
        # Update status to processing
        update_submission_status(submission_id, "processing", started_at=datetime.utcnow())
        
        # Step 1: OCR and document extraction
        logger.info(f"Step 1: OCR and document extraction for {submission_id}")
        extraction_results = extract_documents(submission_id, documents)
        
        # Step 2: Run CrewAI workflow
        logger.info(f"Step 2: Running CrewAI workflow for {submission_id}")
        crew_results = run_crewai_workflow(submission_id, extraction_results)
        
        # Step 3: Save results to database
        logger.info(f"Step 3: Saving results to database for {submission_id}")
        save_processing_results(submission_id, extraction_results, crew_results)
        
        # Step 4: Send notifications
        logger.info(f"Step 4: Sending notifications for {submission_id}")
        send_notifications(submission_id, supplier_id, admin_emails, crew_results)
        
        # Update status to completed
        update_submission_status(submission_id, "completed", completed_at=datetime.utcnow())
        
        logger.info(f"Successfully completed processing for submission {submission_id}")
        
        return {
            "status": "success",
            "submission_id": submission_id,
            "message": "Processing completed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error processing submission {submission_id}: {e}")
        update_submission_status(submission_id, "failed", error_message=str(e))
        
        return {
            "status": "error",
            "submission_id": submission_id,
            "error": str(e)
        }


def extract_documents(submission_id: str, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Extract text and fields from all documents."""
    extraction_results = {
        "submission_id": submission_id,
        "documents": [],
        "extracted_data": {},
        "total_processing_time": 0
    }
    
    for doc in documents:
        try:
            doc_id = doc.get('id')
            doc_type = doc.get('type', 'unknown')
            file_path = doc.get('file_path')
            
            if not file_path or not os.path.exists(file_path):
                logger.warning(f"Document file not found: {file_path}")
                continue
            
            # Process document
            result = ocr_extractor.process_document(file_path, doc_type)
            
            # Store result
            doc_result = {
                "document_id": doc_id,
                "document_type": doc_type,
                "extracted_text": result.extracted_text,
                "extracted_fields": [field.dict() for field in result.extracted_fields],
                "confidence_score": result.confidence_score,
                "processing_time": result.processing_time
            }
            
            extraction_results["documents"].append(doc_result)
            extraction_results["total_processing_time"] += result.processing_time
            
            # Save individual document result
            save_document_result(submission_id, doc_id, doc_type, result)
            
        except Exception as e:
            logger.error(f"Error processing document {doc.get('id', 'unknown')}: {e}")
            continue
    
    return extraction_results


def run_crewai_workflow(submission_id: str, extraction_results: Dict[str, Any]) -> Dict[str, Any]:
    """Run CrewAI workflow for analysis and decision making."""
    try:
        # Create crew
        crew = create_processing_crew(submission_id, extraction_results["documents"])
        
        # Execute workflow
        results = crew.kickoff()
        
        # Parse results (this would need to be adapted based on actual CrewAI output format)
        return {
            "analysis_results": str(results.get("analysis_task", "")),
            "compliance_results": str(results.get("compliance_task", "")),
            "risk_assessment": str(results.get("risk_task", "")),
            "decision_summary": str(results.get("decision_task", ""))
        }
        
    except Exception as e:
        logger.error(f"Error in CrewAI workflow for {submission_id}: {e}")
        return {
            "analysis_results": f"Error in analysis: {e}",
            "compliance_results": f"Error in compliance check: {e}",
            "risk_assessment": f"Error in risk assessment: {e}",
            "decision_summary": f"Error in decision making: {e}"
        }


def save_processing_results(submission_id: str, extraction_results: Dict[str, Any], crew_results: Dict[str, Any]):
    """Save processing results to database."""
    try:
        db = next(get_db())
        
        # Update submission with results
        submission = db.query(SupplierSubmission).filter(
            SupplierSubmission.id == submission_id
        ).first()
        
        if submission:
            submission.extracted_data = extraction_results
            submission.compliance_results = crew_results
            submission.risk_score = extract_risk_score(crew_results.get("risk_assessment", ""))
            submission.decision_summary = crew_results.get("decision_summary", "")
            submission.updated_at = datetime.utcnow()
            
            db.commit()
            logger.info(f"Saved processing results for submission {submission_id}")
        
    except Exception as e:
        logger.error(f"Error saving results for {submission_id}: {e}")
    finally:
        db.close()


def save_document_result(submission_id: str, document_id: str, document_type: str, result):
    """Save individual document processing result."""
    try:
        db = next(get_db())
        
        doc_result = DocumentProcessingResult(
            id=f"{submission_id}_{document_id}",
            submission_id=submission_id,
            document_id=document_id,
            document_type=document_type,
            extracted_text=result.extracted_text,
            confidence_score=result.confidence_score,
            extracted_fields=result.extracted_fields,
            processing_time=result.processing_time
        )
        
        db.add(doc_result)
        db.commit()
        
    except Exception as e:
        logger.error(f"Error saving document result: {e}")
    finally:
        db.close()


def extract_risk_score(risk_assessment: str) -> float:
    """Extract risk score from risk assessment text."""
    try:
        # This would parse the risk assessment text to extract the score
        # For now, return a default score
        return 50.0
    except:
        return 50.0


def update_submission_status(submission_id: str, status: str, **kwargs):
    """Update submission status in database."""
    try:
        db = next(get_db())
        
        submission = db.query(SupplierSubmission).filter(
            SupplierSubmission.id == submission_id
        ).first()
        
        if submission:
            submission.status = status
            if 'started_at' in kwargs:
                submission.processing_started_at = kwargs['started_at']
            if 'completed_at' in kwargs:
                submission.processing_completed_at = kwargs['completed_at']
            if 'error_message' in kwargs:
                submission.decision_summary = kwargs['error_message']
            
            submission.updated_at = datetime.utcnow()
            db.commit()
        
    except Exception as e:
        logger.error(f"Error updating submission status: {e}")
    finally:
        db.close()


def send_notifications(submission_id: str, supplier_id: str, admin_emails: List[str], crew_results: Dict[str, Any]):
    """Send notifications to admins and suppliers."""
    try:
        # Send admin notification
        if admin_emails:
            decision_summary = crew_results.get("decision_summary", "Processing completed")
            risk_score = extract_risk_score(crew_results.get("risk_assessment", ""))
            review_url = f"{settings.frontend_url}/admin/supplier-submissions/{submission_id}"
            
            email_notifier.send_admin_notification(
                admin_emails=admin_emails,
                submission_id=submission_id,
                supplier_name="Supplier Name",  # This would be fetched from database
                decision_summary=decision_summary,
                risk_score=risk_score,
                review_url=review_url
            )
        
        logger.info(f"Notifications sent for submission {submission_id}")
        
    except Exception as e:
        logger.error(f"Error sending notifications: {e}")


# Health check task
@celery_app.task(name='health_check')
def health_check():
    """Health check task."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


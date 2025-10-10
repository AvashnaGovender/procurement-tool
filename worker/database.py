"""Database connection and models for the worker service."""
import os
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Text, Integer, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from typing import Optional, Dict, Any
from config import settings

# Database setup
# Convert postgresql:// to postgresql+psycopg:// for psycopg3 compatibility
database_url = settings.database_url.replace('postgresql://', 'postgresql+psycopg://')
engine = create_engine(database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class SupplierSubmission(Base):
    """Model for supplier submissions being processed."""
    __tablename__ = "supplier_submissions"
    
    id = Column(String, primary_key=True)
    supplier_id = Column(String, nullable=False)
    onboarding_id = Column(String, nullable=False)
    
    # Processing status
    status = Column(String, default="pending")  # pending, processing, completed, failed
    processing_started_at = Column(DateTime)
    processing_completed_at = Column(DateTime)
    
    # Document processing results
    extracted_data = Column(JSON)  # OCR and field extraction results
    compliance_results = Column(JSON)  # Policy/compliance check results
    risk_score = Column(Float)  # Overall risk score (0-100)
    decision_summary = Column(Text)  # AI-generated decision summary
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DocumentProcessingResult(Base):
    """Model for individual document processing results."""
    __tablename__ = "document_processing_results"
    
    id = Column(String, primary_key=True)
    submission_id = Column(String, nullable=False)
    document_id = Column(String, nullable=False)
    document_type = Column(String, nullable=False)
    
    # OCR results
    extracted_text = Column(Text)
    confidence_score = Column(Float)
    
    # Field extraction
    extracted_fields = Column(JSON)
    
    # Processing metadata
    processing_time = Column(Float)  # seconds
    created_at = Column(DateTime, default=datetime.utcnow)


class ComplianceCheck(Base):
    """Model for compliance check results."""
    __tablename__ = "compliance_checks"
    
    id = Column(String, primary_key=True)
    submission_id = Column(String, nullable=False)
    check_type = Column(String, nullable=False)  # document_completeness, tax_compliance, etc.
    
    # Check results
    status = Column(String)  # passed, failed, warning
    score = Column(Float)  # 0-100
    details = Column(Text)
    recommendations = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create database tables."""
    Base.metadata.create_all(bind=engine)


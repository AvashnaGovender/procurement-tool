#!/usr/bin/env python3
"""Simplified main.py without CrewAI dependencies."""

import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Procurement Worker Service",
    description="Simplified version without CrewAI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Procurement Worker Service - Simplified Version"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "procurement-worker",
        "version": "1.0.0-simple",
        "crewai_available": False
    }

@app.get("/test-smtp")
async def test_smtp():
    """Test SMTP configuration."""
    try:
        import smtplib
        import os
        
        smtp_host = os.getenv('SMTP_HOST', 'mail.theinnoverse.co.za')
        smtp_port = int(os.getenv('SMTP_PORT', '465'))
        smtp_user = os.getenv('SMTP_USER', '')
        smtp_pass = os.getenv('SMTP_PASS', '')
        
        if not smtp_user or not smtp_pass:
            return {"status": "error", "message": "SMTP credentials not configured"}
        
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                return {"status": "success", "message": "SMTP connection successful"}
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                return {"status": "success", "message": "SMTP connection successful"}
                
    except Exception as e:
        return {"status": "error", "message": f"SMTP test failed: {str(e)}"}

@app.get("/test-redis")
async def test_redis():
    """Test Redis connection."""
    try:
        import redis
        import os
        
        redis_url = os.getenv('REDIS_URL', 'redis://redis:6379/0')
        r = redis.from_url(redis_url)
        r.ping()
        return {"status": "success", "message": "Redis connection successful"}
        
    except Exception as e:
        return {"status": "error", "message": f"Redis test failed: {str(e)}"}

if __name__ == "__main__":
    logger.info("Starting Procurement Worker Service (Simplified)")
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )



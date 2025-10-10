"""Configuration settings for the worker service."""
import os
from typing import Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Database (optional - only needed for background processing)
    database_url: str = "postgresql://username:password@localhost:5432/procurement_tool"
    
    # Ollama Configuration (main AI engine)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"  # Default model, can be changed to llama2, mistral, etc.
    
    # FastAPI
    api_host: str = "0.0.0.0"
    api_port: int = 8001
    worker_concurrency: int = 4
    
    # File Storage
    upload_dir: str = "./uploads"
    max_file_size: int = 10485760  # 10MB
    
    # Email (optional - notifications disabled)
    smtp_host: str = "mail.theinnoverse.co.za"
    smtp_port: int = 465
    smtp_secure: bool = True
    smtp_user: str = ""
    smtp_pass: str = ""
    smtp_from: str = ""
    
    # URLs
    frontend_url: str = "http://localhost:3000"
    api_base_url: str = "http://localhost:8001"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = 'ignore'  # Ignore extra fields like redis_url


# Global settings instance
settings = Settings()


"""
Quick fix script to update the health endpoint in main.py
Run this on the server to patch the health check function
"""

import re

# Read the current main.py
with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new health function
new_health_function = '''@app.get("/health")
async def health():
    """Health check endpoint with AI mode information."""
    try:
        from config import settings
        
        # Try to import and check AI mode, but don't fail if there are warnings
        ai_mode = "simplified"
        crewai_available = False
        
        try:
            from crew_agents import is_ollama_available, CREWAI_AVAILABLE
            ai_mode = "ollama" if is_ollama_available() else "simplified"
            crewai_available = CREWAI_AVAILABLE
        except Exception as import_error:
            # Import errors are non-critical - Ollama can work without CrewAI
            logger.warning(f"CrewAI import warning (non-critical): {import_error}")
            # Check if Ollama is directly available
            try:
                import requests
                response = requests.get(f"{settings.ollama_base_url}/api/version", timeout=2)
                if response.status_code == 200:
                    ai_mode = "ollama"
            except:
                pass
        
        # Worker status (Redis/Celery not used)
        worker_status = "active"
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "worker_status": worker_status,
            "ai_mode": ai_mode,
            "crewai_available": crewai_available,
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
        }'''

# Find and replace the old health function
# Pattern to match the entire health function
pattern = r'@app\.get\("/health"\)\s+async def health\(\):.*?(?=\n@app\.|$)'

# Replace with new function
new_content = re.sub(pattern, new_health_function, content, flags=re.DOTALL)

# Backup original
with open('main.py.backup', 'w', encoding='utf-8') as f:
    f.write(content)
    
print("✅ Backed up original main.py to main.py.backup")

# Write updated content
with open('main.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Updated main.py with fixed health endpoint")
print("\n📋 Next steps:")
print("  1. Stop the worker (Ctrl+C)")
print("  2. Restart: python main.py")


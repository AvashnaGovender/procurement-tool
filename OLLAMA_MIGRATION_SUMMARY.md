# Ollama Migration Summary

This document summarizes the migration from OpenAI to Ollama for AI-powered document analysis.

## What Changed

### ✅ Benefits of Migration

1. **No API Costs**: Run unlimited AI queries locally without per-request charges
2. **Data Privacy**: All supplier documents and AI processing stay on your infrastructure
3. **No Rate Limits**: Process as many documents as your hardware allows
4. **Offline Capability**: Works without internet connection
5. **Full Control**: Choose and customize models for your specific needs

## Files Updated

### 1. Configuration Files

#### `worker/config.py`
- ❌ Removed: `openai_api_key`
- ✅ Added: `ollama_base_url` (default: http://localhost:11434)
- ✅ Added: `ollama_model` (default: llama3.1)

#### `worker/env.example`
- ❌ Removed: `OPENAI_API_KEY`
- ✅ Added: `OLLAMA_BASE_URL`
- ✅ Added: `OLLAMA_MODEL`

### 2. AI Agent Configuration

#### `worker/crew_agents.py`
- ✅ Imported `ChatOllama` from `langchain_ollama`
- ✅ Initialized Ollama LLM with configuration from settings
- ✅ Updated all 4 agents to use Ollama LLM:
  - Document Analysis Specialist
  - Compliance Officer
  - Risk Assessment Specialist
  - Decision Maker

### 3. Dependencies

#### `worker/requirements.txt` (and all variants)
- ❌ Removed: `langchain-openai>=0.0.5`
- ✅ Added: `langchain-ollama>=0.1.0`

Updated files:
- `requirements.txt`
- `requirements-with-crewai.txt`
- `requirements-compatible-ai.txt`
- `requirements-full-ai.txt`
- `requirements-staged.txt`
- `requirements-minimal.txt`
- `requirements-fixed.txt`

### 4. Docker Configuration

#### `worker/docker-compose.yml`
- ✅ Added `ollama` service container
- ❌ Removed: `OPENAI_API_KEY` environment variables
- ✅ Added: `OLLAMA_BASE_URL` and `OLLAMA_MODEL` environment variables
- ✅ Added `ollama` as dependency for worker services
- ✅ Added `ollama_data` volume for model storage
- ✅ Included GPU support configuration (commented out, can be enabled)

### 5. Documentation

#### New Files Created:
- ✅ `worker/OLLAMA_SETUP.md` - Comprehensive Ollama setup guide
- ✅ `worker/setup-ollama.sh` - Linux/macOS setup script
- ✅ `worker/setup-ollama.bat` - Windows setup script
- ✅ `OLLAMA_MIGRATION_SUMMARY.md` - This file

#### Updated Files:
- ✅ `worker/README.md` - Updated to reference Ollama instead of OpenAI

## How the AI Agent Works Now

### Architecture Flow:

```
Supplier Submission
      ↓
Frontend (AI Insights Tab)
      ↓
Worker Client API
      ↓
FastAPI Worker Service
      ↓
CrewAI Agents → Ollama (Local LLM)
      ↓
Analysis Results
      ↓
Display in UI
```

### Agent Processing:

1. **Document Analyzer Agent** (uses Ollama)
   - Extracts text and data from documents
   - Identifies document types
   - Evaluates document quality

2. **Compliance Officer Agent** (uses Ollama)
   - Verifies required documents
   - Checks South African business compliance
   - Validates BBBEE, tax, and banking documents

3. **Risk Assessor Agent** (uses Ollama)
   - Calculates risk scores
   - Identifies risk factors
   - Provides mitigation recommendations

4. **Decision Maker Agent** (uses Ollama)
   - Generates overall recommendation
   - Provides action items
   - Creates summary for procurement manager

## Installation Steps

### Quick Start (Local Development)

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh  # Linux/macOS
# Or download from ollama.com/download/windows for Windows

# 2. Pull a model
ollama pull llama3.1

# 3. Navigate to worker directory
cd worker

# 4. Run setup script (optional - automates steps 2 & 5)
./setup-ollama.sh          # Linux/macOS
# or
setup-ollama.bat           # Windows

# 5. Install Python dependencies
pip install -r requirements.txt

# 6. Configure environment
cp env.example .env
# Edit .env and ensure:
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.1

# 7. Start services
redis-server                    # Terminal 1
python main.py                  # Terminal 2
```

### Docker Setup

```bash
cd worker

# Build and start all services (includes Ollama)
docker-compose up -d

# Pull model inside Ollama container
docker-compose exec ollama ollama pull llama3.1

# View logs
docker-compose logs -f worker
```

## Recommended Models

| Model | Best For | RAM | Speed |
|-------|----------|-----|-------|
| **llama3.1** | General use (Recommended) | 8GB | Fast ⚡⚡⚡ |
| mistral | Document analysis | 8GB | Fast ⚡⚡⚡ |
| phi3 | Low resource systems | 4GB | Very Fast ⚡⚡⚡⚡ |
| llama2 | Testing/Development | 8GB | Fast ⚡⚡⚡ |
| llama3.1:70b | Maximum accuracy | 64GB | Slow ⚡ |

## Testing the Integration

### 1. Test Ollama Directly
```bash
ollama run llama3.1 "Analyze this supplier document: Company XYZ, Registration: 2024/001234"
```

### 2. Test Worker Service
```bash
curl http://localhost:8001/health
```

### 3. Test AI Insights in Application
1. Navigate to supplier review page
2. Click "AI Insights" tab
3. Click "Start AI Analysis"
4. Watch real-time logs
5. Review AI summary

## Troubleshooting

### Issue: "Could not initialize Ollama LLM"
**Solution**: 
- Ensure Ollama is running: `ollama serve`
- Check model is pulled: `ollama list`
- Verify URL in .env: `OLLAMA_BASE_URL=http://localhost:11434`

### Issue: Slow processing
**Solution**:
- Use smaller model (phi3, mistral)
- Enable GPU if available
- Close other applications

### Issue: Docker container can't connect to Ollama
**Solution**:
- Use `http://ollama:11434` (service name) in Docker environment
- Ensure Ollama service is running: `docker-compose ps`
- Pull model: `docker-compose exec ollama ollama pull llama3.1`

## Performance Expectations

| Documents | Model | Estimated Time |
|-----------|-------|----------------|
| 5 docs | llama3.1 | 30-60 seconds |
| 10 docs | llama3.1 | 1-2 minutes |
| 5 docs | phi3 | 15-30 seconds |
| 5 docs | llama3.1:70b | 2-5 minutes |

*Times vary based on hardware and document complexity*

## Environment Variables Reference

### Before (OpenAI):
```env
OPENAI_API_KEY=sk-xxx...xxx
AI_MODEL=gpt-4
AI_TEMPERATURE=0.1
AI_MAX_TOKENS=4000
```

### After (Ollama):
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## Rollback (if needed)

If you need to switch back to OpenAI:

1. Update `worker/crew_agents.py`:
   ```python
   from langchain_openai import ChatOpenAI
   
   llm = ChatOpenAI(
       model="gpt-4",
       temperature=0.7,
       api_key=settings.openai_api_key
   )
   ```

2. Update `worker/config.py`:
   ```python
   openai_api_key: str = ""
   ```

3. Update `worker/requirements.txt`:
   ```
   langchain-openai>=0.0.5
   ```

4. Install dependencies:
   ```bash
   pip install langchain-openai
   ```

## Additional Resources

- **Ollama Documentation**: https://ollama.com/docs
- **Ollama Models Library**: https://ollama.com/library
- **LangChain Ollama Integration**: https://python.langchain.com/docs/integrations/llms/ollama
- **CrewAI Documentation**: https://docs.crewai.com/

## Support

For issues specific to:
- **Ollama**: See `worker/OLLAMA_SETUP.md`
- **Integration**: Check worker service logs
- **Performance**: Try different models or adjust hardware resources


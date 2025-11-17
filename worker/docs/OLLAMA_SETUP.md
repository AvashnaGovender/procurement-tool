# Ollama Setup Guide

This guide will help you set up Ollama as the AI backend for the procurement tool's document analysis system.

## What is Ollama?

Ollama is a local LLM (Large Language Model) runtime that allows you to run models like Llama, Mistral, and others on your own hardware without requiring API keys or external services.

## Prerequisites

- Minimum 8GB RAM (16GB+ recommended for larger models)
- ~10GB free disk space for model storage
- Windows, macOS, or Linux

## Installation Steps

### 1. Install Ollama

#### Windows
1. Download from [ollama.com/download/windows](https://ollama.com/download/windows)
2. Run the installer
3. Ollama will start automatically

#### macOS
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

#### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Verify Installation

```bash
ollama --version
```

You should see the Ollama version number.

### 3. Pull a Model

Choose and download one of the following models:

#### Recommended Models:

**Llama 3.1 (8B)** - Best balance of speed and quality
```bash
ollama pull llama3.1
```

**Llama 3.1 (70B)** - Best quality (requires 64GB+ RAM)
```bash
ollama pull llama3.1:70b
```

**Llama 2** - Faster, good for testing
```bash
ollama pull llama2
```

**Mistral** - Excellent for business documents
```bash
ollama pull mistral
```

**Phi-3** - Very fast, lower resource usage
```bash
ollama pull phi3
```

### 4. Test the Model

```bash
ollama run llama3.1
```

Type a test prompt like "What is procurement?" and verify it responds correctly.

### 5. Configure Worker Service

Update your `.env` file in the `worker/` directory:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

**Available Models:**
- `llama3.1` - Default (8B parameters)
- `llama3.1:70b` - Larger model (requires more RAM)
- `llama2` - Llama 2
- `mistral` - Mistral 7B
- `phi3` - Microsoft Phi-3

### 6. Install Python Dependencies

```bash
cd worker
pip install langchain-ollama
```

Or update all dependencies:
```bash
pip install -r requirements.txt
```

### 7. Start the Worker Service

```bash
# Windows
start.bat

# Linux/macOS
./start.sh
```

## Verifying Ollama is Running

### Check Ollama Service Status
```bash
# Windows (PowerShell)
Get-Process ollama

# Linux/macOS
ps aux | grep ollama
```

### Test API Endpoint
```bash
curl http://localhost:11434/api/tags
```

This should return a list of installed models.

### Test Model Inference
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "Analyze this document",
  "stream": false
}'
```

## Model Comparison

| Model | Size | RAM Required | Speed | Quality | Best For |
|-------|------|--------------|-------|---------|----------|
| Llama 3.1 (8B) | ~5GB | 8GB | Fast | Excellent | General use (Recommended) |
| Llama 3.1 (70B) | ~40GB | 64GB | Slow | Best | High accuracy needs |
| Mistral | ~4GB | 8GB | Fast | Excellent | Document analysis |
| Llama 2 | ~4GB | 8GB | Fast | Good | Testing |
| Phi-3 | ~2GB | 4GB | Very Fast | Good | Low resource systems |

## Troubleshooting

### Issue: Ollama not found
**Solution:** Ensure Ollama is installed and running. Check with `ollama --version`

### Issue: Model download fails
**Solution:** Check internet connection and disk space. Try again with:
```bash
ollama pull llama3.1
```

### Issue: Out of memory
**Solution:** Use a smaller model like `phi3` or `llama2`, or close other applications

### Issue: Connection refused (localhost:11434)
**Solution:** Start Ollama service:
```bash
# Windows: Ollama should auto-start, or run from Start menu
# Linux/macOS:
ollama serve
```

### Issue: Model responses are slow
**Solution:** 
- Use a smaller model (`phi3`, `llama2`)
- Close other applications
- Consider GPU acceleration if available

## Performance Optimization

### Enable GPU Acceleration (if available)
Ollama automatically uses GPU if available (NVIDIA CUDA, AMD ROCm, or Metal on Mac).

Check GPU usage:
```bash
# During model inference, check GPU usage
nvidia-smi  # For NVIDIA GPUs
```

### Adjust Model Parameters

In `worker/crew_agents.py`, you can adjust:
- `temperature` (0.0-1.0): Lower = more focused, Higher = more creative
- Add other parameters like `top_p`, `num_ctx` for fine-tuning

```python
llm = ChatOllama(
    model=settings.ollama_model,
    base_url=settings.ollama_base_url,
    temperature=0.5,  # More focused for document analysis
    num_ctx=4096,     # Context window size
)
```

## Switching Models

To change models at runtime, update your `.env` file:

```env
OLLAMA_MODEL=mistral  # Change to mistral
```

Or pull and use a different model:
```bash
ollama pull phi3
```

Then update `.env`:
```env
OLLAMA_MODEL=phi3
```

Restart the worker service for changes to take effect.

## Benefits of Ollama vs OpenAI

✅ **No API Costs** - Run unlimited queries locally
✅ **Data Privacy** - All data stays on your server
✅ **No Rate Limits** - Process as many documents as your hardware allows
✅ **Offline Capability** - Works without internet connection
✅ **Customizable** - Fine-tune models for your specific needs
✅ **Fast Response** - No network latency

## Next Steps

1. Install Ollama
2. Pull your chosen model
3. Update `.env` configuration
4. Install Python dependencies
5. Start the worker service
6. Test document analysis in the AI Insights tab

## Support

For Ollama-specific issues:
- Documentation: https://ollama.com/docs
- GitHub: https://github.com/ollama/ollama
- Models: https://ollama.com/library

For integration issues, check the worker service logs.


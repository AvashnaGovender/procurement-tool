# Dependency Resolution Guide

## Problem
CrewAI and LangChain have complex dependency conflicts that are difficult to resolve in a single requirements.txt file.

## Solutions Implemented

### 1. Essential Requirements (Current)
- **File**: `requirements-essential.txt`
- **Approach**: Install only essential packages without AI/ML dependencies
- **Use Case**: Basic worker functionality without CrewAI features

### 2. Alternative Dockerfile
- **File**: `Dockerfile.alternative`
- **Approach**: Multi-stage build with fallback installation
- **Use Case**: When you need CrewAI functionality

### 3. Staged Installation
- **File**: `requirements-staged.txt`
- **Approach**: Install packages in stages to avoid conflicts
- **Use Case**: Manual installation outside Docker

## Recommended Approach

### For Basic Functionality
Use the current `Dockerfile` with `requirements-essential.txt`:
```bash
docker-compose build
```

### For Full AI Features
1. **Option A**: Use alternative Dockerfile
   ```bash
   # Copy Dockerfile.alternative to Dockerfile
   cp Dockerfile.alternative Dockerfile
   docker-compose build
   ```

2. **Option B**: Install CrewAI separately after build
   ```bash
   # Build with essential requirements
   docker-compose build
   
   # Install CrewAI in running container
   docker-compose exec worker pip install crewai langchain langchain-openai langchain-community
   ```

## Manual Installation (Local Development)

If Docker continues to have issues, install locally:

```bash
# Install essential packages
pip install -r requirements-essential.txt

# Try to install CrewAI (may have conflicts)
pip install crewai langchain langchain-openai langchain-community

# If conflicts occur, install with --force-reinstall
pip install --force-reinstall crewai langchain langchain-openai langchain-community
```

## Testing Without CrewAI

If CrewAI continues to cause issues, you can:

1. **Comment out CrewAI imports** in your Python files
2. **Use essential requirements** for basic functionality
3. **Add CrewAI later** when dependency conflicts are resolved

## Files Created

- `requirements-essential.txt` - Basic packages only
- `requirements-staged.txt` - Staged installation
- `requirements-minimal.txt` - Minimal with version constraints
- `Dockerfile.alternative` - Alternative build approach
- `DEPENDENCY_RESOLUTION_GUIDE.md` - This guide

## Next Steps

1. Try building with essential requirements first
2. If successful, test basic functionality
3. Add CrewAI features incrementally
4. Consider using virtual environments for local development



#!/bin/bash

# Ollama Setup Script for Procurement Worker Service
# This script helps you set up Ollama for AI document processing

set -e

echo "========================================="
echo "  Ollama Setup for Procurement Worker"
echo "========================================="
echo ""

# Check if Ollama is installed
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed"
    ollama --version
else
    echo "❌ Ollama is not installed"
    echo ""
    echo "Please install Ollama first:"
    echo "  - macOS/Linux: curl -fsSL https://ollama.com/install.sh | sh"
    echo "  - Windows: Download from https://ollama.com/download/windows"
    echo ""
    exit 1
fi

echo ""
echo "========================================="
echo "  Available Models"
echo "========================================="
echo ""
echo "1. llama3.1 (8B)    - Recommended (Fast, Excellent quality)"
echo "2. llama3.1:70b     - Best quality (Requires 64GB+ RAM)"
echo "3. mistral          - Excellent for documents"
echo "4. llama2           - Good for testing"
echo "5. phi3             - Fastest, lowest resources"
echo ""
read -p "Enter model number to install (1-5) [1]: " model_choice
model_choice=${model_choice:-1}

case $model_choice in
    1)
        MODEL="llama3.1"
        ;;
    2)
        MODEL="llama3.1:70b"
        ;;
    3)
        MODEL="mistral"
        ;;
    4)
        MODEL="llama2"
        ;;
    5)
        MODEL="phi3"
        ;;
    *)
        echo "Invalid choice, using default: llama3.1"
        MODEL="llama3.1"
        ;;
esac

echo ""
echo "========================================="
echo "  Downloading Model: $MODEL"
echo "========================================="
echo ""

ollama pull $MODEL

echo ""
echo "✅ Model downloaded successfully!"
echo ""

# Test the model
echo "========================================="
echo "  Testing Model"
echo "========================================="
echo ""

echo "Testing $MODEL with a simple prompt..."
echo "Analyze this supplier document: Company XYZ provides manufacturing services." | ollama run $MODEL

echo ""
echo "✅ Model test completed!"
echo ""

# Update .env file
if [ -f ".env" ]; then
    echo "========================================="
    echo "  Updating .env Configuration"
    echo "========================================="
    echo ""
    
    # Update or add OLLAMA_MODEL
    if grep -q "OLLAMA_MODEL" .env; then
        sed -i.bak "s/OLLAMA_MODEL=.*/OLLAMA_MODEL=$MODEL/" .env
        echo "✅ Updated OLLAMA_MODEL=$MODEL in .env"
    else
        echo "OLLAMA_MODEL=$MODEL" >> .env
        echo "✅ Added OLLAMA_MODEL=$MODEL to .env"
    fi
    
    # Ensure OLLAMA_BASE_URL exists
    if ! grep -q "OLLAMA_BASE_URL" .env; then
        echo "OLLAMA_BASE_URL=http://localhost:11434" >> .env
        echo "✅ Added OLLAMA_BASE_URL to .env"
    fi
else
    echo "⚠️  .env file not found. Creating from env.example..."
    cp env.example .env
    sed -i.bak "s/OLLAMA_MODEL=.*/OLLAMA_MODEL=$MODEL/" .env
    echo "✅ Created .env file with OLLAMA_MODEL=$MODEL"
fi

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Ollama is ready to use with model: $MODEL"
echo ""
echo "Next steps:"
echo "1. Install Python dependencies: pip install -r requirements.txt"
echo "2. Start Redis: redis-server"
echo "3. Start the worker service: python main.py"
echo ""
echo "To change models later:"
echo "  - Pull new model: ollama pull <model-name>"
echo "  - Update .env: OLLAMA_MODEL=<model-name>"
echo "  - Restart worker service"
echo ""
echo "For more information, see OLLAMA_SETUP.md"
echo ""


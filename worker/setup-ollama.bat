@echo off
REM Ollama Setup Script for Procurement Worker Service (Windows)
REM This script helps you set up Ollama for AI document processing

echo =========================================
echo   Ollama Setup for Procurement Worker
echo =========================================
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Ollama is already installed
    ollama --version
) else (
    echo ❌ Ollama is not installed
    echo.
    echo Please install Ollama first:
    echo   Download from: https://ollama.com/download/windows
    echo.
    pause
    exit /b 1
)

echo.
echo =========================================
echo   Available Models
echo =========================================
echo.
echo 1. llama3.1 (8B)    - Recommended (Fast, Excellent quality)
echo 2. llama3.1:70b     - Best quality (Requires 64GB+ RAM)
echo 3. mistral          - Excellent for documents
echo 4. llama2           - Good for testing
echo 5. phi3             - Fastest, lowest resources
echo.
set /p model_choice="Enter model number to install (1-5) [1]: "
if "%model_choice%"=="" set model_choice=1

if "%model_choice%"=="1" set MODEL=llama3.1
if "%model_choice%"=="2" set MODEL=llama3.1:70b
if "%model_choice%"=="3" set MODEL=mistral
if "%model_choice%"=="4" set MODEL=llama2
if "%model_choice%"=="5" set MODEL=phi3

if not defined MODEL (
    echo Invalid choice, using default: llama3.1
    set MODEL=llama3.1
)

echo.
echo =========================================
echo   Downloading Model: %MODEL%
echo =========================================
echo.

ollama pull %MODEL%

echo.
echo ✅ Model downloaded successfully!
echo.

REM Test the model
echo =========================================
echo   Testing Model
echo =========================================
echo.

echo Testing %MODEL% with a simple prompt...
echo Analyze this supplier document: Company XYZ provides manufacturing services. | ollama run %MODEL%

echo.
echo ✅ Model test completed!
echo.

REM Update .env file
if exist .env (
    echo =========================================
    echo   Updating .env Configuration
    echo =========================================
    echo.
    
    REM Create backup
    copy .env .env.bak >nul
    
    REM Update OLLAMA_MODEL
    findstr /C:"OLLAMA_MODEL" .env >nul
    if %ERRORLEVEL% EQU 0 (
        powershell -Command "(Get-Content .env) -replace 'OLLAMA_MODEL=.*', 'OLLAMA_MODEL=%MODEL%' | Set-Content .env"
        echo ✅ Updated OLLAMA_MODEL=%MODEL% in .env
    ) else (
        echo OLLAMA_MODEL=%MODEL% >> .env
        echo ✅ Added OLLAMA_MODEL=%MODEL% to .env
    )
    
    REM Ensure OLLAMA_BASE_URL exists
    findstr /C:"OLLAMA_BASE_URL" .env >nul
    if %ERRORLEVEL% NEQ 0 (
        echo OLLAMA_BASE_URL=http://localhost:11434 >> .env
        echo ✅ Added OLLAMA_BASE_URL to .env
    )
) else (
    echo ⚠️  .env file not found. Creating from env.example...
    copy env.example .env >nul
    powershell -Command "(Get-Content .env) -replace 'OLLAMA_MODEL=.*', 'OLLAMA_MODEL=%MODEL%' | Set-Content .env"
    echo ✅ Created .env file with OLLAMA_MODEL=%MODEL%
)

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo Ollama is ready to use with model: %MODEL%
echo.
echo Next steps:
echo 1. Install Python dependencies: pip install -r requirements.txt
echo 2. Start Redis: redis-server (or use WSL/Docker)
echo 3. Start the worker service: python main.py
echo.
echo To change models later:
echo   - Pull new model: ollama pull ^<model-name^>
echo   - Update .env: OLLAMA_MODEL=^<model-name^>
echo   - Restart worker service
echo.
echo For more information, see OLLAMA_SETUP.md
echo.
pause


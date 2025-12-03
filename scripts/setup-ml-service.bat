@echo off
echo ========================================
echo ML Service Setup
echo Using existing .venv environment
echo ========================================
echo.

REM Check if .venv exists
if not exist ".venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found at .venv
    echo Creating new virtual environment...
    python -m venv .venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        echo Make sure Python is installed
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Installing ML Service dependencies...
if exist "ml_service\requirements.txt" (
    pip install -r ml_service\requirements.txt
) else (
    echo ERROR: ml_service\requirements.txt not found
    pause
    exit /b 1
)

echo.
echo Downloading NLTK data...
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the ML service:
echo   1. Run: activate-ml-env.bat
echo   2. Then: cd ml_service
echo   3. Then: python app.py
echo.
pause

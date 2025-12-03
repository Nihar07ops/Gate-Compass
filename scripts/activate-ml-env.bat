@echo off
echo Activating Python environment...

if not exist ".venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found
    echo Please run setup-ml-service.bat first
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat

echo.
echo Python environment activated!
echo You can now run: cd ml_service ^&^& python app.py
echo.
cmd /k

@echo off
echo Activating Python Development Environment...
echo.

if not exist "A:\python-dev\venvs\gate-cse-prep\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found at A:\python-dev\venvs\gate-cse-prep
    echo Please run setup-python-env.bat first
    pause
    exit /b 1
)

call "A:\python-dev\venvs\gate-cse-prep\Scripts\activate.bat"

echo.
echo Python environment activated!
echo Location: A:\python-dev\venvs\gate-cse-prep
echo.
echo You can now run:
echo   - cd ml_service ^&^& python app.py
echo   - pip install package-name
echo   - python your-script.py
echo.
cmd /k

@echo off
echo ========================================
echo Starting Frontend Server
echo ========================================
echo.

echo Checking dependencies...
if not exist node_modules (
    echo [ERROR] node_modules not found!
    echo.
    echo Please install dependencies first:
    echo   install_frontend.bat
    echo.
    echo Or manually:
    echo   npm install
    echo.
    pause
    exit /b 1
)

if not exist node_modules\vite (
    echo [ERROR] Vite not installed!
    echo.
    echo Please run: install_frontend.bat
    echo.
    pause
    exit /b 1
)

echo [OK] Dependencies found
echo.
echo Starting Vite dev server...
call npm run dev

pause

@echo off
echo ========================================
echo Localhost Diagnostic Tool
echo ========================================
echo.

echo 1. Checking if ports are in use...
echo.
echo Backend (Port 8000):
netstat -ano | findstr ":8000"
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 8000
) else (
    echo [X] Backend is NOT running on port 8000
)
echo.

echo Frontend (Port 5173):
netstat -ano | findstr ":5173"
if %errorlevel% equ 0 (
    echo [OK] Frontend is running on port 5173
) else (
    echo [X] Frontend is NOT running on port 5173
)
echo.

echo 2. Testing localhost connectivity...
echo.
echo Testing 127.0.0.1...
ping 127.0.0.1 -n 1
echo.

echo 3. Checking hosts file...
type C:\Windows\System32\drivers\etc\hosts | findstr "localhost"
echo.

echo 4. Testing backend API...
curl http://127.0.0.1:8000/api/users/ 2>nul
if %errorlevel% equ 0 (
    echo [OK] Backend API is accessible
) else (
    echo [X] Cannot reach backend API
)
echo.

echo 5. Checking Python...
python --version 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python is installed
) else (
    echo [X] Python not found
)
echo.

echo 6. Checking Node.js...
node --version 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js is installed
) else (
    echo [X] Node.js not found
)
echo.

echo ========================================
echo Diagnostic Complete
echo ========================================
echo.
echo What's the issue?
echo 1. Cannot access http://localhost:8000
echo 2. Cannot access http://localhost:5173
echo 3. Browser shows error
echo 4. Other issue
echo.
pause

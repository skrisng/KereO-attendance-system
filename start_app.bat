@echo off
echo ========================================
echo Starting Kereo Attendance System
echo ========================================
echo.

echo [1/2] Starting Django Backend (Port 8000)...
start "Django Backend" cmd /k "cd backend & venv\Scripts\activate & python manage.py runserver"

echo [2/2] Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend (Port 3000)...
start "React Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul

@echo off
echo ========================================
echo  KereO Attendance System - LAN Deploy
echo ========================================
echo.

REM Get WiFi IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "169.254"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo Your network IP: %IP%
echo.
echo Starting server accessible to ALL devices on your network...
echo.

cd backend
call venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000

echo.
echo ========================================
echo  Access the app from any device:
echo  http://%IP%:8000
echo ========================================
pause

@echo off
echo Starting KereO Backend...
echo.
echo App will be available at: http://localhost:8000
echo For LAN access use your WiFi IP:8000
echo.
echo Press CTRL+C to stop the server
echo.
.\backend\venv\Scripts\python.exe .\backend\manage.py runserver 0.0.0.0:8000
pause

@echo off
echo Starting Django Backend...
echo.

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please edit .env file with your API_KEY before continuing!
    pause
)

echo Installing dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo ========================================
echo Backend is ready!
echo Starting server at http://localhost:8000
echo ========================================
echo.

python manage.py runserver

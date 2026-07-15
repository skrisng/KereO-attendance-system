# Django Backend - Attendance System

Django REST API backend for the Kereo Attendance System with facial recognition.

## Features

- RESTful API for user profiles and attendance records
- Facial recognition using Google Gemini AI
- SQLite database (easily switchable to PostgreSQL/MySQL)
- CORS enabled for React frontend
- Admin panel for data management

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
copy .env.example .env
```

Edit `.env`:
```
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
API_KEY=your-gemini-api-key-here
```

### 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Users
- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Get user details
- `DELETE /api/users/{id}/` - Delete user

### Attendance
- `GET /api/attendance/` - List all attendance records
- `POST /api/attendance/` - Create attendance record
- `POST /api/attendance/recognize/` - Facial recognition endpoint
- `GET /api/attendance/stats/` - Get attendance statistics

### Admin Panel
Access at `http://localhost:8000/admin/`

## Database Schema

### UserProfile
- `id` (CharField, PK)
- `name` (CharField)
- `department` (CharField)
- `photo_base64` (TextField)
- `registered_at` (DateTimeField)

### AttendanceRecord
- `id` (CharField, PK)
- `user_id` (CharField)
- `name` (CharField)
- `department` (CharField, optional)
- `timestamp` (DateTimeField)
- `status` (CharField: Present/Late/Check-out)
- `confidence` (FloatField)
- `snapshot_base64` (TextField, optional)

## Production Deployment

For production:
1. Set `DEBUG=False` in `.env`
2. Update `ALLOWED_HOSTS` in `settings.py`
3. Use PostgreSQL instead of SQLite
4. Configure static files with WhiteNoise or CDN
5. Use gunicorn: `gunicorn attendance_system.wsgi:application`

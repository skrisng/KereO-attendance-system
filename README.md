<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Kereo Attendance System

AI-powered facial recognition attendance system with React frontend and Django REST API backend.

## Features

- 🎯 Real-time facial recognition using Google Gemini AI
- 📸 Live camera scanning with auto-detection
- 👥 Student profile management
- 📊 Attendance tracking and history
- 🔄 RESTful API backend with Django
- 💾 Persistent database storage
- 📱 Responsive modern UI

## Tech Stack

**Frontend:** React 19 + TypeScript + Vite  
**Backend:** Django 5.0 + Django REST Framework  
**Database:** SQLite (dev) / PostgreSQL (prod)  
**AI:** Google Gemini 1.5 Flash

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://localhost:8000`

### Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Configure API Key

Edit `backend/.env` and add your Gemini API key:
```
API_KEY=your-gemini-api-key-here
```

## Documentation

- [SETUP.md](SETUP.md) - Quick setup guide
- [INTEGRATION.md](INTEGRATION.md) - Frontend-backend integration
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [backend/README.md](backend/README.md) - Backend docs

## API Endpoints

- `GET /api/users/` - List users
- `POST /api/users/` - Register user
- `POST /api/attendance/recognize/` - Facial recognition
- `GET /api/attendance/` - Attendance records

## Admin Panel

Access at `http://localhost:8000/admin/`

Create superuser:
```bash
python manage.py createsuperuser
```

View your app in AI Studio: https://ai.studio/apps/e0e7a2a7-ba6f-4f2c-8fd0-479b5707c621

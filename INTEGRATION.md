# Frontend-Backend Integration Guide

## Overview

Your React attendance app now uses a Django REST API backend instead of localStorage.

## What Changed

### Frontend Changes

1. **New API Service** (`services/api.ts`)
   - `userAPI.getAll()` - Fetch all users
   - `userAPI.create(user)` - Register new user
   - `userAPI.delete(id)` - Delete user
   - `attendanceAPI.getAll()` - Fetch attendance records
   - `attendanceAPI.create(record)` - Mark attendance
   - `attendanceAPI.recognize(image, users)` - Facial recognition

2. **Updated App.tsx**
   - Removed localStorage
   - Added API calls with async/await
   - Added loading state
   - Error handling for network issues

3. **Updated LiveScanner.tsx**
   - Uses `attendanceAPI.recognize()` instead of local Gemini service
   - Facial recognition now runs on backend

### Backend Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env (create from .env.example)
├── attendance_system/
│   ├── settings.py (Django config)
│   └── urls.py (URL routing)
└── api/
    ├── models.py (Database models)
    ├── serializers.py (JSON serialization)
    ├── views.py (API endpoints)
    ├── urls.py (API routes)
    └── gemini_service.py (Facial recognition)
```

## Setup Steps

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your API_KEY
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

### 2. Frontend Setup

Your frontend already has the updated code. Just ensure the backend is running before starting the frontend:

```bash
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## API Configuration

The frontend connects to the backend via `services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

If you deploy the backend elsewhere, update this URL.

## Environment Variables

### Backend (.env)
```
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
API_KEY=your-gemini-api-key
```

### Frontend (.env.local)
```
API_KEY=your-gemini-api-key  # No longer used, kept for compatibility
```

The Gemini API key is now only needed in the backend `.env` file.

## Testing the Integration

1. Start backend: `cd backend && python manage.py runserver`
2. Start frontend: `npm run dev`
3. Register a user in the app
4. Check Django admin at `http://localhost:8000/admin/` to see the data
5. Try the live scanner to test facial recognition

## Data Migration

If you have existing localStorage data, it won't automatically transfer. You can:

1. Export data from browser console:
```javascript
console.log(localStorage.getItem('kereo_users'));
console.log(localStorage.getItem('kereo_records'));
```

2. Manually re-register users through the app (recommended)

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 8000
- Check `CORS_ALLOWED_ORIGINS` in `backend/attendance_system/settings.py`

### Connection Refused
- Verify backend is running: `http://localhost:8000/api/users/`
- Check firewall settings

### API Key Issues
- Ensure `API_KEY` is set in `backend/.env`
- Restart Django server after changing `.env`

## Next Steps

- Add authentication (JWT tokens)
- Deploy backend to cloud (Heroku, Railway, AWS)
- Switch to PostgreSQL for production
- Add real-time updates with WebSockets
- Implement user roles and permissions

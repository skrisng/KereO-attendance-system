# Start Frontend & Backend Together

## Quick Start

### Option 1: Use the Batch Script (Recommended)
Simply double-click or run:
```bash
start_app.bat
```

This will:
1. Start Django backend on http://localhost:8000
2. Start React frontend on http://localhost:3000
3. Open both in separate terminal windows

### Option 2: Use NPM Command
```bash
npm start
```

### Option 3: Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Access the Application

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Django Admin:** http://localhost:8000/admin

## How They're Connected

The frontend (React + Vite) communicates with the backend (Django) through:

1. **API Base URL:** `http://localhost:8000/api` (configured in `services/api.ts`)
2. **CORS:** Backend allows requests from `                                                        ` (configured in `backend/attendance_system/settings.py`)
3. **Endpoints:**
   - `/api/users/` - User management
   - `/api/attendance/` - Attendance records
   - `/api/attendance/recognize/` - Face recognition
   - `/api/attendance/stats/` - Statistics

## Troubleshooting

### Backend won't start
- Ensure virtual environment is activated
- Check if port 8000 is available
- Run: `cd backend && python manage.py migrate`

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check CORS settings in `backend/attendance_system/settings.py`
- Ensure API_BASE_URL in `services/api.ts` is correct

### Port conflicts
- Backend uses port 8000
- Frontend uses port 3000
- Change ports in `vite.config.ts` (frontend) or Django settings (backend) if needed

## Environment Variables

Make sure these are configured:

**Frontend (.env.local):**
```
GEMINI_API_KEY=your_actual_api_key_here
```

**Backend (backend/.env):**
```
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
API_KEY=your_actual_api_key_here
```

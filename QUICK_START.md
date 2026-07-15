# Quick Start Guide - CORRECT PORTS ✓

## Your Configuration

- **Backend:** Port 8000 (Django)
- **Frontend:** Port 3000 (Vite/React)

## Start in 3 Steps

### Step 1: Start Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

✓ Wait for: `Starting development server at http://127.0.0.1:8000/`

### Step 2: Start Frontend (Terminal 2)

```bash
npm run dev
```

✓ Wait for: `Local: http://localhost:3000/`

### Step 3: Open Browser

```
http://localhost:3000
```

## Test Backend First

Before opening the frontend, verify backend is working:

Open in browser: http://localhost:8000/api/users/

Should see: `[]` (empty JSON array)

## Test Frontend

Open: http://localhost:3000

Should see: Attendance System interface with tabs:
- Dashboard
- User Registry
- User List
- Live Scanner
- Attendance History

## Quick Test

1. Click "User Registry"
2. Fill in name, employee ID, department
3. Enable camera and take photo
4. Click "Register User"
5. ✓ User should appear in "User List"

## Troubleshooting

### Backend won't start
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
```

### Frontend won't start
```bash
npm install
```

### "Connection refused" error
- Make sure backend is running first
- Check backend terminal for errors
- Verify port 8000 is not blocked

### CORS error in browser
- Backend is now configured for port 3000 ✓
- Restart backend if you just updated settings
- Clear browser cache

## Verify Ports

Check what's running:
```bash
netstat -ano | findstr "8000 3000"
```

Should see:
```
TCP    127.0.0.1:8000    ...    LISTENING
TCP    0.0.0.0:3000      ...    LISTENING
```

## URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:8000/api/ | REST API |
| Users Endpoint | http://localhost:8000/api/users/ | User management |
| Attendance | http://localhost:8000/api/attendance/ | Attendance records |
| Stats | http://localhost:8000/api/attendance/stats/ | Statistics |
| Admin Panel | http://localhost:8000/admin/ | Django admin |
| Frontend | http://localhost:3000 | React UI |

## What I Fixed

1. ✓ Updated CORS settings in `backend/attendance_system/settings.py`
2. ✓ Added port 3000 to allowed origins
3. ✓ Verified API service points to correct backend
4. ✓ Created correct startup guides

## Next Steps

Once both servers are running:
1. Register a test user
2. Test face scanning
3. Check attendance records
4. View dashboard stats
5. Verify data persists after refresh

## Need Help?

Run diagnostic:
```bash
diagnose_localhost.bat
```

Check detailed guide:
- `LOCALHOST_ISSUE_SOLVED.md` - Port configuration
- `FIX_LOCALHOST.md` - Troubleshooting
- `INTEGRATION_TEST.md` - Full testing guide

## Success!

You should now be able to:
- ✓ Access backend at http://localhost:8000
- ✓ Access frontend at http://localhost:3000
- ✓ Register users
- ✓ Scan faces
- ✓ Record attendance
- ✓ View statistics

Happy coding! 🚀

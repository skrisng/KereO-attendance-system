# Localhost Not Working - Troubleshooting Guide

## Current Status
- ✓ Backend IS running on port 8000
- ✗ Frontend is NOT running on port 5173
- ✓ Localhost (127.0.0.1) is responding

## Quick Fixes

### Issue 1: Frontend Not Running

The frontend server is not started. Start it now:

```bash
npm run dev
```

Or use the batch file:
```bash
start_frontend.bat
```

### Issue 2: Browser Shows "Can't Reach This Page"

**Try these URLs instead:**
- Backend: http://127.0.0.1:8000/api/users/
- Frontend: http://127.0.0.1:5173/

(Use 127.0.0.1 instead of localhost)

### Issue 3: Port Already in Use

If you see "Port 5173 is already in use":

```bash
# Find what's using the port
netstat -ano | findstr :5173

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Then restart
npm run dev
```

### Issue 4: CORS Error in Browser

If you see CORS errors in browser console:

1. Make sure backend is running
2. Check backend settings allow http://localhost:5173
3. Restart both servers
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue 5: "Module Not Found" Error

Frontend dependencies not installed:

```bash
npm install
```

Backend dependencies not installed:

```bash
cd backend
pip install -r requirements.txt
```

## Step-by-Step Startup

### 1. Start Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

Wait for: `Starting development server at http://127.0.0.1:8000/`

### 2. Start Frontend (Terminal 2)

```bash
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### 3. Open Browser

Try these URLs in order:
1. http://localhost:5173
2. http://127.0.0.1:5173
3. http://localhost:5173/

## Verify Everything is Working

Run this command:
```bash
diagnose_localhost.bat
```

Expected output:
```
[OK] Backend is running on port 8000
[OK] Frontend is running on port 5173
[OK] Python is installed
[OK] Node.js is installed
[OK] Backend API is accessible
```

## Common Browser Issues

### Chrome/Edge
- Clear cache: Ctrl+Shift+Delete
- Try incognito mode: Ctrl+Shift+N
- Check extensions aren't blocking

### Firefox
- Clear cache: Ctrl+Shift+Delete
- Try private window: Ctrl+Shift+P

### All Browsers
- Disable VPN if running
- Disable antivirus temporarily
- Check firewall settings
- Try different browser

## Test Backend Directly

Open these URLs in browser:

1. **Users API:**
   http://127.0.0.1:8000/api/users/
   
   Should show: `[]` or list of users

2. **Attendance API:**
   http://127.0.0.1:8000/api/attendance/
   
   Should show: `[]` or list of records

3. **Stats API:**
   http://127.0.0.1:8000/api/attendance/stats/
   
   Should show: `{"total": 0, "today": 0}`

## Test Frontend Directly

1. Open: http://127.0.0.1:5173
2. Should see the attendance system UI
3. Check browser console (F12) for errors

## Network Configuration Issues

### Check Hosts File

Open: `C:\Windows\System32\drivers\etc\hosts`

Should contain:
```
127.0.0.1       localhost
::1             localhost
```

### Check Firewall

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Make sure Python and Node.js are allowed

### Check Antivirus

Some antivirus software blocks localhost:
- Temporarily disable antivirus
- Add exception for Python and Node.js
- Add exception for ports 8000 and 5173

## Still Not Working?

### Get Detailed Error Info

1. **Backend Errors:**
   - Check terminal where backend is running
   - Look for error messages
   - Check `backend/db.sqlite3` exists

2. **Frontend Errors:**
   - Open browser console (F12)
   - Look for red error messages
   - Check Network tab for failed requests

3. **System Errors:**
   - Check Windows Event Viewer
   - Look for port conflicts
   - Check if other apps are using ports

### Alternative Ports

If ports are blocked, change them:

**Backend (backend/attendance_system/settings.py):**
```python
# Run on different port
# python manage.py runserver 8080
```

**Frontend (vite.config.ts):**
```typescript
export default defineConfig({
  server: {
    port: 3000  // Change from 5173
  }
})
```

Then update API_BASE_URL in `services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Quick Test Commands

```bash
# Test if backend is running
curl http://127.0.0.1:8000/api/users/

# Test if frontend is running
curl http://127.0.0.1:5173

# Check what's using ports
netstat -ano | findstr "8000 5173"

# Check Python
python --version

# Check Node
node --version

# Check npm
npm --version
```

## Emergency Reset

If nothing works, try a complete reset:

```bash
# Stop all servers (Ctrl+C in terminals)

# Backend reset
cd backend
rmdir /s /q venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
del db.sqlite3
python manage.py migrate
python manage.py runserver

# Frontend reset (new terminal)
rmdir /s /q node_modules
npm install
npm run dev
```

## Get Help

If still not working, provide these details:
1. Error message from terminal
2. Error message from browser console (F12)
3. Output of `diagnose_localhost.bat`
4. Windows version
5. Python version (`python --version`)
6. Node version (`node --version`)

## Most Likely Issue

Based on the diagnostic, your issue is:
**Frontend is not running**

Solution:
```bash
npm run dev
```

Then open: http://localhost:5173

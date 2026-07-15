# Step-by-Step: How to Know It's Working

## Current Situation

I'm installing the frontend dependencies for you right now. Here's what's happening:

### What's Running:
- ✅ **Backend:** Running on port 8000
- ⏳ **npm install:** Installing frontend dependencies (in progress)
- ⏳ **Frontend:** Will start after npm install completes

## How to Check Status

### Option 1: Run the Status Checker (Easiest)
```bash
python check_status.py
```

This will tell you exactly what's working and what's not.

### Option 2: Check Manually

**Check Backend:**
Open in browser: http://localhost:8000/api/users/
- ✅ If you see `[]` → Backend is working
- ❌ If you see error → Backend is not running

**Check Frontend:**
Open in browser: http://localhost:3000
- ✅ If you see the attendance system UI → Frontend is working
- ❌ If you see "can't reach this page" → Frontend is not running

### Option 3: Check Ports
```bash
netstat -ano | findstr "8000 3000"
```

Should see:
```
TCP    127.0.0.1:8000    ...    LISTENING    (backend)
TCP    0.0.0.0:3000      ...    LISTENING    (frontend)
```

## What You Should See When It's Working

### 1. Backend Terminal
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### 2. Frontend Terminal
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

### 3. Browser at http://localhost:3000
You should see:
- Navigation tabs: Dashboard, User Registry, User List, Live Scanner, Attendance History
- Clean UI with no error messages
- No red errors in browser console (F12)

### 4. Browser Console (F12)
- No red error messages
- May see some info messages (that's fine)
- No CORS errors
- No "Failed to fetch" errors

## What Errors Look Like

### Frontend Not Running
```
This site can't be reached
localhost refused to connect
ERR_CONNECTION_REFUSED
```
**Solution:** Start frontend with `npm run dev`

### Backend Not Running
Browser console shows:
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```
**Solution:** Start backend with `cd backend && python manage.py runserver`

### CORS Error
Browser console shows:
```
Access to fetch at 'http://localhost:8000/api/users/' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:** Restart backend (I already fixed the CORS settings)

### Dependencies Not Installed
Terminal shows:
```
'vite' is not recognized as an internal or external command
```
**Solution:** Run `npm install` (I'm doing this now)

## Testing the Integration

Once both servers are running, test these:

### Test 1: Backend API
Open: http://localhost:8000/api/users/
Expected: `[]` (empty array)

### Test 2: Frontend UI
Open: http://localhost:3000
Expected: See the attendance system interface

### Test 3: Register a User
1. Go to "User Registry" tab
2. Fill in: Name, Employee ID, Department
3. Enable camera and take photo
4. Click "Register User"
5. ✅ Should see success message
6. ✅ User should appear in "User List" tab

### Test 4: Check Backend Received Data
Open: http://localhost:8000/api/users/
Expected: See your registered user in the JSON response

### Test 5: Browser Console
Press F12, go to Console tab
Expected: No red errors

## Timeline

Here's what's happening right now:

1. ✅ **Backend started** - Already running on port 8000
2. ⏳ **npm install running** - Installing dependencies (takes 1-2 minutes)
3. ⏳ **Frontend will start** - After npm install completes
4. ⏳ **You can test** - Once frontend shows "Local: http://localhost:3000/"

## What to Do Next

### Wait for npm install to finish
You'll see in the terminal:
```
added XXX packages in XXs
```

### Then I'll start the frontend
Or you can start it manually:
```bash
npm run dev
```

### Then open browser
Go to: http://localhost:3000

### Run status check
```bash
python check_status.py
```

Should show:
```
✅ Backend API is WORKING
✅ Frontend is WORKING
```

## Quick Commands Reference

```bash
# Check status
python check_status.py

# Check ports
netstat -ano | findstr "8000 3000"

# Start backend (if not running)
cd backend
venv\Scripts\activate
python manage.py runserver

# Start frontend (if not running)
npm run dev

# Install dependencies (if needed)
npm install
```

## You'll Know It's Working When:

1. ✅ `python check_status.py` shows both servers working
2. ✅ http://localhost:8000/api/users/ shows `[]`
3. ✅ http://localhost:3000 shows the UI
4. ✅ You can register a user successfully
5. ✅ No errors in browser console (F12)
6. ✅ Registered user appears in user list

## Current Status (Real-Time)

Run this anytime to check:
```bash
python check_status.py
```

It will tell you exactly what's working and what needs to be started.

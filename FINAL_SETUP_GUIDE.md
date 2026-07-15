# Final Setup Guide - Get Your System Working

## The Problem

Your frontend dependencies (especially Vite) are not installed correctly. This is why you're getting "unable to connect" - the frontend server can't start.

## The Solution (3 Steps)

### Step 1: Install Frontend Dependencies

Open a terminal in your project folder and run:

```bash
install_frontend.bat
```

Or manually:
```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

This will take 2-3 minutes. Wait for it to complete.

### Step 2: Start Backend (if not already running)

Open a NEW terminal and run:

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 3: Start Frontend

Open ANOTHER NEW terminal and run:

```bash
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Step 4: Open Browser

Go to: **http://localhost:3000**

You should see the attendance system interface!

## How to Know It's Working

### ✅ Backend Working:
- Terminal shows: "Starting development server at http://127.0.0.1:8000/"
- Browser at http://localhost:8000/api/users/ shows: `[]`

### ✅ Frontend Working:
- Terminal shows: "Local: http://localhost:3000/"
- Browser at http://localhost:3000 shows: Attendance System UI

### ✅ Integration Working:
- Can register a user
- Can scan face
- Can view attendance history
- No errors in browser console (F12)

## Quick Test

Run this to check status:
```bash
python check_status.py
```

Should show:
```
✅ Backend API is WORKING
✅ Frontend is WORKING
✅ EVERYTHING IS WORKING!
```

## Common Issues

### Issue: "vite is not recognized"
**Cause:** Dependencies not installed
**Solution:** Run `install_frontend.bat`

### Issue: "npm install" takes forever
**Cause:** Slow internet or npm cache issues
**Solution:** 
```bash
npm cache clean --force
npm install
```

### Issue: "Cannot find module"
**Cause:** Incomplete installation
**Solution:** Delete node_modules and reinstall:
```bash
rmdir /s /q node_modules
npm install
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Then start again
npm run dev
```

## Manual Installation Steps

If the batch file doesn't work, do this manually:

1. **Delete old files:**
   ```bash
   rmdir /s /q node_modules
   del package-lock.json
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify Vite is installed:**
   ```bash
   dir node_modules\vite
   ```
   Should show the vite folder.

4. **Start the server:**
   ```bash
   npm run dev
   ```

## What Each Command Does

- `rmdir /s /q node_modules` - Removes old dependencies
- `del package-lock.json` - Removes lock file
- `npm install` - Installs all dependencies from package.json
- `npm run dev` - Starts Vite development server

## Expected Timeline

1. **npm install:** 2-3 minutes
2. **Backend start:** 2-3 seconds
3. **Frontend start:** 5-10 seconds
4. **Total:** About 3-4 minutes

## Files You Need

All created for you:
- ✅ `install_frontend.bat` - Installs dependencies
- ✅ `start_backend.bat` - Starts backend
- ✅ `start_frontend.bat` - Starts frontend
- ✅ `check_status.py` - Checks if everything is working

## Step-by-Step Checklist

- [ ] Run `install_frontend.bat` (wait for completion)
- [ ] Open terminal 1: Run `start_backend.bat`
- [ ] Wait for "Starting development server at http://127.0.0.1:8000/"
- [ ] Open terminal 2: Run `npm run dev`
- [ ] Wait for "Local: http://localhost:3000/"
- [ ] Open browser: http://localhost:3000
- [ ] Test: Register a user
- [ ] Test: Scan face
- [ ] Test: View attendance

## Success Indicators

When everything is working:

1. **Backend terminal:**
   ```
   Django version 5.x.x
   Starting development server at http://127.0.0.1:8000/
   Quit the server with CTRL-BREAK.
   ```

2. **Frontend terminal:**
   ```
   VITE v6.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:3000/
   ➜  Network: http://192.168.x.x:3000/
   ```

3. **Browser:**
   - Shows attendance system UI
   - No error messages
   - Can click on tabs
   - Can register users

4. **Browser Console (F12):**
   - No red errors
   - May see blue info messages (that's fine)

## If Nothing Works

Try this nuclear option:

```bash
# Delete everything
rmdir /s /q node_modules
del package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Start
npm run dev
```

## Need Help?

1. Run `python check_status.py` to see what's working
2. Check terminal for error messages
3. Check browser console (F12) for errors
4. Make sure you're using the correct URLs:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

## Summary

The main issue is that Vite isn't installed. Running `install_frontend.bat` or `npm install` will fix this. Then you can start both servers and everything should work!

Your backend is complete and working. You just need to get the frontend dependencies installed properly.

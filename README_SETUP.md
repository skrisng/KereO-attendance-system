# Setup Instructions

## Problem: Frontend Won't Start

**Error:** "vite is not recognized" or "unable to connect"

**Cause:** Frontend dependencies (Vite) are not installed

**Solution:** Install dependencies first!

## Quick Fix (3 Commands)

```bash
# 1. Install dependencies (takes 2-3 minutes)
npm install

# 2. Start backend (new terminal)
cd backend
venv\Scripts\activate
python manage.py runserver

# 3. Start frontend (new terminal)
npm run dev
```

Then open: http://localhost:3000

## Using Batch Files

Even easier - just double-click these files:

1. **install_frontend.bat** (first time only)
2. **start_backend.bat** (terminal 1)
3. **start_frontend.bat** (terminal 2)

## Verify It's Working

```bash
python check_status.py
```

Should show both servers working.

## What's Happening

Your backend is complete and working on port 8000. The frontend code is also complete, but the dependencies (especially Vite) need to be installed before the frontend server can start on port 3000.

Once you run `npm install`, everything will work!

## Files to Help You

- **START_HERE.md** - Quick start guide
- **FINAL_SETUP_G
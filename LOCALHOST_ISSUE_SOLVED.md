# Localhost Issue - SOLVED! 🎉

## The Problem

Your frontend is configured to run on **port 3000**, not port 5173!

Check `vite.config.ts`:
```typescript
server: {
  port: 3000,  // ← Here's the issue!
  host: '0.0.0.0',
}
```

## The Solution

### Option 1: Use Port 3000 (Recommended - No Changes Needed)

Your frontend is already configured for port 3000. Just use the correct URL:

**Start Frontend:**
```bash
npm run dev
```

**Open Browser:**
```
http://localhost:3000
```

### Option 2: Change to Port 5173 (Standard Vite Port)

If you prefer port 5173, update `vite.config.ts`:

```typescript
server: {
  port: 5173,  // Change from 3000 to 5173
  host: '0.0.0.0',
}
```

## Correct URLs

### Backend
- http://localhost:8000
- http://127.0.0.1:8000
- API: http://localhost:8000/api/users/

### Frontend (Current Config)
- http://localhost:3000
- http://127.0.0.1:3000

### Frontend (If Changed to 5173)
- http://localhost:5173
- http://127.0.0.1:5173

## Quick Start Guide

### Terminal 1: Backend
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```
✓ Backend running at: http://localhost:8000

### Terminal 2: Frontend
```bash
npm run dev
```
✓ Frontend running at: http://localhost:3000

### Browser
Open: **http://localhost:3000**

## Verify It's Working

1. **Backend Test:**
   Open: http://localhost:8000/api/users/
   Should see: `[]` (empty array)

2. **Frontend Test:**
   Open: http://localhost:3000
   Should see: Attendance System UI

3. **Integration Test:**
   - Register a user in the UI
   - Check it appears in user list
   - Scan face with camera
   - Check attendance is recorded

## Why Port 3000?

Your `vite.config.ts` is configured with:
```typescript
server: {
  port: 3000,
  host: '0.0.0.0',
}
```

This is perfectly fine! Port 3000 is commonly used for React apps.

## CORS Configuration

Make sure backend allows port 3000. Check `backend/attendance_system/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # ← Should be 3000, not 5173
    "http://127.0.0.1:3000",
]
```

## Updated Test Commands

```bash
# Test backend
curl http://localhost:8000/api/users/

# Test frontend
curl http://localhost:3000

# Check ports in use
netstat -ano | findstr "8000 3000"
```

## Summary

- Backend: Port 8000 ✓ (Running)
- Frontend: Port 3000 ✓ (Need to start)
- Just run `npm run dev` and open http://localhost:3000

That's it! Your localhost is working fine, you just need to use port 3000 instead of 5173.

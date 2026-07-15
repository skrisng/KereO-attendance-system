# 🚀 Get Started in 5 Minutes

Your attendance app now has a Django backend! Here's how to run it:

## Step 1: Install Backend Dependencies (2 min)

Open terminal in project root:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
```

## Step 2: Add Your API Key (30 sec)

Edit `backend/.env`:
```
API_KEY=your-actual-gemini-api-key-here
```

## Step 3: Start Backend (10 sec)

```bash
python manage.py runserver
```

✓ Backend running at http://localhost:8000

## Step 4: Start Frontend (1 min)

Open NEW terminal in project root:

```bash
npm install
npm run dev
```

✓ Frontend running at http://localhost:5173

## Step 5: Test It! (1 min)

1. Open http://localhost:5173
2. Click "Register User"
3. Add a student with photo
4. Go to "Live Scanner"
5. Test facial recognition
6. Check "Attendance History"

## 🎉 Done!

Your app now:
- Stores data in a database (not localStorage)
- Runs facial recognition on the server
- Has a professional REST API
- Is ready for production deployment

## What's Different?

Before: Data stored in browser localStorage  
After: Data stored in Django database

Before: Facial recognition in browser  
After: Facial recognition on server

## Quick Commands

Start backend:
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

Start frontend:
```bash
npm run dev
```

Test API:
```bash
cd backend
python test_api.py
```

## Admin Panel

Create admin user:
```bash
cd backend
python manage.py createsuperuser
```

Access at: http://localhost:8000/admin/

## Need Help?

- [CHECKLIST.md](CHECKLIST.md) - Step-by-step checklist
- [SETUP.md](SETUP.md) - Detailed setup guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - How it works
- [INTEGRATION.md](INTEGRATION.md) - Technical details

## Troubleshooting

**Backend won't start?**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
```

**Frontend can't connect?**
- Make sure backend is running first
- Check http://localhost:8000/api/users/

**Still stuck?**
- Check [CHECKLIST.md](CHECKLIST.md) for common issues
- Verify both servers are running
- Clear browser cache

---

**Pro Tip:** Keep both terminals open while developing. Backend in one, frontend in the other.

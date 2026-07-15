# Quick Setup Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Your Gemini API key

## Step 1: Backend Setup (5 minutes)

Open a terminal in the project root:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Keep this terminal open. Backend runs at `http://localhost:8000`

## Step 2: Frontend Setup (2 minutes)

Open a NEW terminal in the project root:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Step 3: Test the App

1. Open `http://localhost:5173` in your browser
2. Go to "Register User" and add a student
3. Go to "Live Scanner" and test facial recognition
4. Check "Attendance History" to see records

## What's Different?

Your app now uses a Django backend instead of localStorage:
- Data persists in a database (db.sqlite3)
- Facial recognition runs on the server
- Multiple users can access the same data
- Ready for production deployment

## Troubleshooting

**"Connection refused" error?**
- Make sure backend is running on port 8000
- Check `http://localhost:8000/api/users/` in browser

**CORS error?**
- Restart both frontend and backend
- Clear browser cache

**API key error?**
- Update `API_KEY` in `backend/.env`
- Restart Django server

## Next Steps

- View data in Django admin: `http://localhost:8000/admin/`
  (Create superuser: `python manage.py createsuperuser`)
- Deploy backend to cloud (Railway, Heroku, AWS)
- Add authentication and user roles

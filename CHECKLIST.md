# Setup Checklist ✓

Follow these steps to get your Django-powered attendance system running:

## Prerequisites
- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] Gemini API key ready

## Backend Setup

- [ ] Navigate to backend folder: `cd backend`
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate virtual environment: `venv\Scripts\activate` (Windows)
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Update API key in `backend/.env`
- [ ] Run migrations: `python manage.py migrate`
- [ ] Start backend server: `python manage.py runserver`
- [ ] Verify backend at: http://localhost:8000/api/users/

## Frontend Setup

- [ ] Open new terminal in project root
- [ ] Install dependencies: `npm install`
- [ ] Start frontend: `npm run dev`
- [ ] Open browser at: http://localhost:5173

## Testing

- [ ] Register a test user in the app
- [ ] Check user appears in database
- [ ] Test live scanner with facial recognition
- [ ] Check attendance history
- [ ] Verify data persists after browser refresh

## Optional: Admin Panel

- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Access admin at: http://localhost:8000/admin/
- [ ] Login and view data

## Verification

Run the test script:
```bash
cd backend
python test_api.py
```

Expected output:
```
✓ Backend is running!
✓ Users endpoint working!
✓ Attendance endpoint working!
✓ Stats endpoint working!
```

## Common Issues

### "Module not found" error
```bash
cd backend
pip install -r requirements.txt
```

### "Connection refused" error
- Make sure backend is running on port 8000
- Check firewall settings

### CORS error
- Restart both frontend and backend
- Clear browser cache

### API key error
- Update `API_KEY` in `backend/.env`
- Restart Django server

## Success Indicators

✓ Backend running at http://localhost:8000  
✓ Frontend running at http://localhost:5173  
✓ Can register users  
✓ Can scan faces  
✓ Data persists after refresh  
✓ No console errors  

## Next Steps

Once everything works:
- [ ] Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
- [ ] Explore Django admin panel
- [ ] Consider deployment options
- [ ] Add more features (authentication, reports, etc.)

## Need Help?

Check these files:
- [SETUP.md](SETUP.md) - Detailed setup guide
- [INTEGRATION.md](INTEGRATION.md) - How frontend connects to backend
- [CHANGES.md](CHANGES.md) - What changed from localStorage version
- [backend/README.md](backend/README.md) - Backend documentation

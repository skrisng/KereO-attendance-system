# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│                  (localhost:5173)                           │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Dashboard │  │ Register │  │  Scanner │  │ History  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │              │             │         │
│       └─────────────┴──────────────┴─────────────┘         │
│                          │                                  │
│                   ┌──────▼──────┐                          │
│                   │ services/   │                          │
│                   │   api.ts    │                          │
│                   └──────┬──────┘                          │
└──────────────────────────┼─────────────────────────────────┘
                           │
                    HTTP REST API
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                  Django Backend                            │
│                 (localhost:8000)                           │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │              API Endpoints                         │   │
│  │  /api/users/          - User CRUD                  │   │
│  │  /api/attendance/     - Attendance CRUD            │   │
│  │  /api/attendance/recognize/ - Face Recognition     │   │
│  │  /api/attendance/stats/     - Statistics           │   │
│  └────────────┬───────────────────────────────────────┘   │
│               │                                            │
│  ┌────────────▼───────────────────────────────────────┐   │
│  │         Business Logic Layer                       │   │
│  │  - views.py (API handlers)                         │   │
│  │  - serializers.py (JSON conversion)                │   │
│  │  - gemini_service.py (AI recognition)              │   │
│  └────────────┬───────────────────────────────────────┘   │
│               │                                            │
│  ┌────────────▼───────────────────────────────────────┐   │
│  │         Database Layer (SQLite)                    │   │
│  │  - UserProfile model                               │   │
│  │  - AttendanceRecord model                          │   │
│  └────────────┬───────────────────────────────────────┘   │
│               │                                            │
│         db.sqlite3                                         │
└────────────────────────────────────────────────────────────┘
                           │
                    External API
                           │
                  ┌────────▼────────┐
                  │  Google Gemini  │
                  │   AI Service    │
                  └─────────────────┘
```

## Data Flow

### 1. User Registration
```
User → Register Form → api.ts → POST /api/users/ → Django View
→ Serializer → Database → Response → Update React State
```

### 2. Facial Recognition
```
Camera → Capture Frame → api.ts → POST /api/attendance/recognize/
→ gemini_service.py → Google Gemini API → Recognition Result
→ Response → Update UI
```

### 3. Mark Attendance
```
Recognition Success → api.ts → POST /api/attendance/
→ Django View → Validate (no duplicates) → Database
→ Response → Update Records List
```

## Technology Stack

### Frontend
- React 19 with TypeScript
- Vite (build tool)
- Lucide React (icons)
- Native Fetch API (HTTP client)

### Backend
- Django 5.0
- Django REST Framework
- SQLite (development)
- Python 3.8+

### AI/ML
- Google Gemini 1.5 Flash
- Base64 image processing
- Facial recognition & matching

## Security Features

- CORS protection (only localhost:5173 allowed)
- CSRF protection (Django middleware)
- Input validation (serializers)
- Duplicate prevention (30-second cooldown)
- Base64 image sanitization

## Database Models

### UserProfile
```python
{
  "id": "unique-string",
  "name": "Student Name",
  "department": "Computer Science",
  "photo_base64": "data:image/jpeg;base64,...",
  "registered_at": "2026-02-23T10:30:00Z"
}
```

### AttendanceRecord
```python
{
  "id": "unique-string",
  "user_id": "user-id-reference",
  "name": "Student Name",
  "department": "Computer Science",
  "timestamp": "2026-02-23T14:30:00Z",
  "status": "Present|Late|Check-out",
  "confidence": 0.95,
  "snapshot_base64": "data:image/jpeg;base64,..."
}
```

## API Response Format

### Success Response
```json
{
  "id": "123",
  "name": "John Doe",
  "department": "CS"
}
```

### Error Response
```json
{
  "error": "User already exists"
}
```

## Deployment Architecture (Future)

```
Frontend (Vercel/Netlify)
    ↓
Backend (Railway/Heroku)
    ↓
PostgreSQL (Cloud Database)
    ↓
Google Gemini API
```

# Django Backend Design Document

## Architecture Overview

The backend follows Django's MVT (Model-View-Template) pattern, adapted for REST API development using Django REST Framework.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                           │
│                  (HTTP REST API)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   URL ROUTING                               │
│  attendance_system/urls.py → api/urls.py                   │
│  Maps URLs to ViewSets                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   VIEWSETS (Controllers)                    │
│  api/views.py                                               │
│  - UserProfileViewSet                                       │
│  - AttendanceRecordViewSet                                  │
│  Business logic, validation, orchestration                  │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             │                           │
┌────────────▼────────────┐  ┌──────────▼─────────────────────┐
│    SERIALIZERS          │  │   EXTERNAL SERVICES            │
│  api/serializers.py     │  │   api/gemini_service.py        │
│  - Data validation      │  │   - Facial recognition         │
│  - JSON conversion      │  │   - Google Gemini AI           │
│  - Field mapping        │  │   - Image processing           │
└────────────┬────────────┘  └────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                   MODELS (ORM)                              │
│  api/models.py                                              │
│  - UserProfile                                              │
│  - AttendanceRecord                                         │
│  Database abstraction layer                                 │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                   DATABASE                                  │
│  SQLite (dev) / PostgreSQL (prod)                          │
│  Persistent data storage                                    │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. RESTful API Design
- Resource-based URLs (`/api/users/`, `/api/attendance/`)
- HTTP methods for CRUD (GET, POST, PUT, DELETE)
- Stateless communication
- JSON request/response format

### 2. Separation of Concerns
- **Models**: Data structure and database logic
- **Serializers**: Data validation and transformation
- **Views**: Business logic and request handling
- **Services**: External integrations (Gemini AI)

### 3. DRY (Don't Repeat Yourself)
- Reusable serializers
- Generic ViewSets from DRF
- Centralized configuration in settings.py

### 4. Security First
- CORS protection
- CSRF tokens
- Input validation
- Environment variable for secrets

## Core Components

### 1. Models (`api/models.py`)

#### UserProfile Model
```python
class UserProfile(models.Model):
    id = CharField(primary_key=True)      # Unique identifier
    name = CharField(max_length=200)      # Student name
    department = CharField(max_length=200) # Department/Class
    photo_base64 = TextField()            # Base64 encoded photo
    registered_at = DateTimeField()       # Registration timestamp
```

**Design Decisions:**
- `id` as CharField for flexibility (UUID, custom IDs)
- `photo_base64` as TextField to store images directly (no file storage needed)
- `registered_at` auto-set for audit trail

#### AttendanceRecord Model
```python
class AttendanceRecord(models.Model):
    id = CharField(primary_key=True)
    user_id = CharField()                 # Reference to user
    name = CharField()                    # Denormalized for performance
    department = CharField(optional)
    timestamp = DateTimeField()
    status = CharField(choices)           # Present/Late/Check-out
    confidence = FloatField()             # AI confidence score
    snapshot_base64 = TextField(optional) # Captured image
```

**Design Decisions:**
- Denormalized `name` and `department` for faster queries
- `user_id` as CharField (not ForeignKey) for flexibility
- `confidence` to track AI accuracy
- `snapshot_base64` for audit/verification

### 2. Serializers (`api/serializers.py`)

```python
class UserProfileSerializer(serializers.ModelSerializer):
    photoBase64 = serializers.CharField(source='photo_base64')
    registeredAt = serializers.DateTimeField(source='registered_at')
```

**Design Decisions:**
- Field name mapping (snake_case DB ↔ camelCase API)
- Automatic validation from model constraints
- Read-only fields for timestamps

### 3. ViewSets (`api/views.py`)

#### UserProfileViewSet
```python
class UserProfileViewSet(viewsets.ModelViewSet):
    - list()    # GET /api/users/
    - create()  # POST /api/users/
    - retrieve() # GET /api/users/{id}/
    - destroy() # DELETE /api/users/{id}/
```

**Custom Logic:**
- Duplicate prevention in `create()`
- Validation before database operations

#### AttendanceRecordViewSet
```python
class AttendanceRecordViewSet(viewsets.ModelViewSet):
    - list()    # GET /api/attendance/
    - create()  # POST /api/attendance/
    
    @action(methods=['post'])
    - recognize() # POST /api/attendance/recognize/
    
    @action(methods=['get'])
    - stats()    # GET /api/attendance/stats/
```

**Custom Logic:**
- 30-second duplicate prevention
- Custom `recognize()` action for facial recognition
- `stats()` action for analytics

### 4. Services (`api/gemini_service.py`)

```python
def recognize_face(target_image, known_users):
    """
    Facial recognition using Google Gemini AI
    
    Process:
    1. Clean base64 images
    2. Build prompt with reference images
    3. Call Gemini API
    4. Parse JSON response
    5. Return recognition result
    """
```

**Design Decisions:**
- Separate service layer for external APIs
- Error handling with fallback responses
- JSON schema validation
- Base64 image sanitization

## API Endpoints Design

### User Management

#### List Users
```
GET /api/users/
Response: [
  {
    "id": "user123",
    "name": "John Doe",
    "department": "Computer Science",
    "photoBase64": "data:image/jpeg;base64,...",
    "registeredAt": "2026-02-23T10:30:00Z"
  }
]
```

#### Create User
```
POST /api/users/
Body: {
  "id": "user123",
  "name": "John Doe",
  "department": "Computer Science",
  "photoBase64": "data:image/jpeg;base64,..."
}
Response: 201 Created (same structure)
Error: 400 Bad Request if duplicate
```

#### Delete User
```
DELETE /api/users/{id}/
Response: 204 No Content
```

### Attendance Management

#### List Attendance
```
GET /api/attendance/
Response: [
  {
    "id": "att123",
    "userId": "user123",
    "name": "John Doe",
    "department": "Computer Science",
    "timestamp": "2026-02-23T14:30:00Z",
    "status": "Present",
    "confidence": 0.95,
    "snapshotBase64": "data:image/jpeg;base64,..."
  }
]
```

#### Mark Attendance
```
POST /api/attendance/
Body: {
  "id": "att123",
  "userId": "user123",
  "name": "John Doe",
  "status": "Present",
  "confidence": 0.95,
  "snapshotBase64": "..."
}
Response: 201 Created
Error: 400 if duplicate within 30 seconds
```

#### Facial Recognition
```
POST /api/attendance/recognize/
Body: {
  "targetImage": "data:image/jpeg;base64,...",
  "knownUsers": [
    {
      "id": "user123",
      "name": "John Doe",
      "photoBase64": "..."
    }
  ]
}
Response: {
  "match": true,
  "isHuman": true,
  "userId": "user123",
  "name": "John Doe",
  "confidence": 0.95,
  "reasoning": "Strong facial match"
}
```

#### Get Statistics
```
GET /api/attendance/stats/
Response: {
  "total": 150,
  "today": 25
}
```

## Database Design

### Schema Diagram
```
┌─────────────────────────┐
│     UserProfile         │
├─────────────────────────┤
│ id (PK)                 │
│ name                    │
│ department              │
│ photo_base64            │
│ registered_at           │
└─────────────────────────┘
           │
           │ (logical reference)
           │
           ▼
┌─────────────────────────┐
│   AttendanceRecord      │
├─────────────────────────┤
│ id (PK)                 │
│ user_id                 │ ← References UserProfile.id
│ name                    │ ← Denormalized
│ department              │ ← Denormalized
│ timestamp               │
│ status                  │
│ confidence              │
│ snapshot_base64         │
└─────────────────────────┘
```

**Design Decisions:**
- No foreign key constraint for flexibility
- Denormalization for read performance
- Base64 storage to avoid file system complexity
- Indexes on timestamp for fast queries

## Configuration (`settings.py`)

### Key Settings

```python
# CORS - Allow frontend access
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Media files
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'
```

## Security Considerations

### 1. CORS Protection
- Only localhost:5173 allowed in development
- Update for production domains

### 2. Input Validation
- Serializers validate all input
- Model constraints enforce data integrity
- Custom validation in ViewSets

### 3. Environment Variables
- API keys in `.env` file
- Secret key not in source code
- `.gitignore` protects sensitive files

### 4. Duplicate Prevention
- Check existing users before creation
- 30-second cooldown for attendance
- Prevents spam and errors

### 5. Error Handling
- Try-catch in Gemini service
- Graceful fallbacks
- Informative error messages

## Performance Optimizations

### 1. Database Queries
- Denormalized fields reduce JOINs
- Indexes on frequently queried fields
- Ordering at database level

### 2. API Response
- Only necessary fields in serializers
- Pagination ready (can add later)
- Efficient JSON rendering

### 3. Image Handling
- Base64 encoding (no file I/O)
- Client-side image compression recommended
- Consider CDN for production

## Scalability Considerations

### Current (Development)
- SQLite database
- Single server
- Synchronous requests

### Future (Production)
- PostgreSQL with connection pooling
- Horizontal scaling with load balancer
- Async tasks for AI processing (Celery)
- Redis for caching
- CDN for static files

## Testing Strategy

### Unit Tests
```python
# Test models
- UserProfile creation
- AttendanceRecord validation

# Test serializers
- Field mapping
- Validation rules

# Test views
- CRUD operations
- Custom actions
- Error handling
```

### Integration Tests
```python
# Test API endpoints
- User registration flow
- Attendance marking flow
- Facial recognition flow
```

### Manual Testing
```bash
python test_api.py  # Quick API verification
```

## Deployment Architecture

### Development
```
Frontend (localhost:5173)
    ↓
Backend (localhost:8000)
    ↓
SQLite (db.sqlite3)
```

### Production
```
Frontend (Vercel/Netlify)
    ↓ HTTPS
Backend (Railway/Heroku)
    ↓
PostgreSQL (Cloud DB)
    ↓
Google Gemini API
```

## Future Enhancements

### Phase 1: Authentication
- JWT token authentication
- User roles (admin, teacher, student)
- Permission-based access

### Phase 2: Advanced Features
- Real-time updates (WebSockets)
- Bulk operations
- Export reports (PDF, Excel)
- Email notifications

### Phase 3: Analytics
- Attendance trends
- Department statistics
- Late arrival patterns
- Confidence score analysis

### Phase 4: Optimization
- Caching with Redis
- Async task queue (Celery)
- Image optimization
- Database query optimization

## Monitoring & Logging

### Development
- Django debug toolbar
- Console logging
- SQLite browser

### Production
- Application monitoring (Sentry)
- Performance monitoring (New Relic)
- Log aggregation (Papertrail)
- Database monitoring

## Maintenance

### Regular Tasks
- Database backups
- Log rotation
- Dependency updates
- Security patches

### Monitoring Metrics
- API response times
- Error rates
- Database size
- Active users

## Conclusion

This Django backend provides:
- ✓ RESTful API design
- ✓ Clean architecture
- ✓ Security best practices
- ✓ Scalability foundation
- ✓ Easy maintenance
- ✓ Production-ready structure

The design balances simplicity for development with flexibility for future growth.

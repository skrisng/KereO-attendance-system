# API Documentation

Complete REST API documentation for the Attendance System backend.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, the API is open (no authentication required). For production, implement JWT authentication.

---

## User Management Endpoints

### 1. List All Users

**Endpoint:** `GET /api/users/`

**Description:** Retrieve all registered users with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Results per page (default: 50, max: 1000)
- `search` (optional): Search by name, department, or ID
- `ordering` (optional): Sort by field (e.g., `name`, `-registered_at`)

**Example Request:**
```bash
GET /api/users/?search=John&ordering=-registered_at
```

**Response:** `200 OK`
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": "user_001",
      "name": "John Doe",
      "department": "Computer Science",
      "photoBase64": "data:image/jpeg;base64,...",
      "registeredAt": "2026-02-23T10:30:00Z"
    }
  ]
}
```

---

### 2. Create User

**Endpoint:** `POST /api/users/`

**Description:** Register a new user profile.

**Request Body:**
```json
{
  "id": "user_001",
  "name": "John Doe",
  "department": "Computer Science",
  "photoBase64": "data:image/jpeg;base64,..."
}
```

**Response:** `201 Created`
```json
{
  "id": "user_001",
  "name": "John Doe",
  "department": "Computer Science",
  "photoBase64": "data:image/jpeg;base64,...",
  "registeredAt": "2026-02-23T10:30:00Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "User already exists"
}
```

---

### 3. Get User Details

**Endpoint:** `GET /api/users/{id}/`

**Description:** Retrieve details of a specific user.

**Response:** `200 OK`
```json
{
  "id": "user_001",
  "name": "John Doe",
  "department": "Computer Science",
  "photoBase64": "data:image/jpeg;base64,...",
  "registeredAt": "2026-02-23T10:30:00Z"
}
```

---

### 4. Update User

**Endpoint:** `PUT /api/users/{id}/`

**Description:** Update user profile information.

**Request Body:**
```json
{
  "name": "John Smith",
  "department": "Engineering",
  "photoBase64": "data:image/jpeg;base64,..."
}
```

**Response:** `200 OK`

---

### 5. Delete User

**Endpoint:** `DELETE /api/users/{id}/`

**Description:** Delete a user profile.

**Response:** `204 No Content`

---

### 6. Get User Attendance Rate

**Endpoint:** `GET /api/users/{id}/attendance_rate/`

**Description:** Calculate attendance statistics for a user.

**Query Parameters:**
- `period` (optional): Time period - `today`, `week`, `month`, `year` (default: `month`)

**Example Request:**
```bash
GET /api/users/user_001/attendance_rate/?period=month
```

**Response:** `200 OK`
```json
{
  "user_id": "user_001",
  "name": "John Doe",
  "department": "Computer Science",
  "period": "month",
  "statistics": {
    "total_days": 30,
    "present_days": 25,
    "late_days": 3,
    "absent_days": 2,
    "attendance_rate": 83.33,
    "punctuality_rate": 89.29
  }
}
```

---

### 7. List Departments

**Endpoint:** `GET /api/users/departments/`

**Description:** Get all unique departments.

**Response:** `200 OK`
```json
{
  "departments": [
    "Computer Science",
    "Engineering",
    "Business",
    "Arts"
  ],
  "count": 4
}
```

---

### 8. User Summary

**Endpoint:** `GET /api/users/summary/`

**Description:** Get summary statistics for all users.

**Response:** `200 OK`
```json
{
  "total_users": 150,
  "departments": [
    {
      "department": "Computer Science",
      "count": 45
    },
    {
      "department": "Engineering",
      "count": 38
    }
  ],
  "recent_registrations": [
    {
      "id": "user_150",
      "name": "Jane Smith",
      "department": "Business",
      "registered_at": "2026-02-23T14:20:00Z"
    }
  ]
}
```

---

## Attendance Management Endpoints

### 1. List Attendance Records

**Endpoint:** `GET /api/attendance/`

**Description:** Retrieve attendance records with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number
- `page_size` (optional): Results per page
- `search` (optional): Search by name, user_id, or department
- `ordering` (optional): Sort by field (e.g., `-timestamp`, `confidence`)
- `date_from` (optional): Filter from date (ISO format)
- `date_to` (optional): Filter to date (ISO format)
- `status` (optional): Filter by status (`Present`, `Late`, `Check-out`)
- `department` (optional): Filter by department
- `user_id` (optional): Filter by user ID

**Example Request:**
```bash
GET /api/attendance/?status=Present&date_from=2026-02-01&ordering=-timestamp
```

**Response:** `200 OK`
```json
{
  "count": 500,
  "next": "http://localhost:8000/api/attendance/?page=2",
  "previous": null,
  "results": [
    {
      "id": "att_001",
      "userId": "user_001",
      "name": "John Doe",
      "department": "Computer Science",
      "timestamp": "2026-02-23T14:30:00Z",
      "status": "Present",
      "confidence": 0.95,
      "snapshotBase64": "data:image/jpeg;base64,..."
    }
  ]
}
```

---

### 2. Create Attendance Record

**Endpoint:** `POST /api/attendance/`

**Description:** Mark attendance for a user.

**Request Body:**
```json
{
  "id": "att_001",
  "userId": "user_001",
  "name": "John Doe",
  "department": "Computer Science",
  "status": "Present",
  "confidence": 0.95,
  "snapshotBase64": "data:image/jpeg;base64,..."
}
```

**Response:** `201 Created`
```json
{
  "id": "att_001",
  "userId": "user_001",
  "name": "John Doe",
  "department": "Computer Science",
  "timestamp": "2026-02-23T14:30:00Z",
  "status": "Present",
  "confidence": 0.95,
  "snapshotBase64": "data:image/jpeg;base64,..."
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "Attendance already marked recently"
}
```

**Note:** Duplicate prevention - cannot mark attendance within 30 seconds.

---

### 3. Facial Recognition

**Endpoint:** `POST /api/attendance/recognize/`

**Description:** Perform facial recognition to identify a person.

**Request Body:**
```json
{
  "targetImage": "data:image/jpeg;base64,...",
  "knownUsers": [
    {
      "id": "user_001",
      "name": "John Doe",
      "photoBase64": "data:image/jpeg;base64,..."
    },
    {
      "id": "user_002",
      "name": "Jane Smith",
      "photoBase64": "data:image/jpeg;base64,..."
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "match": true,
  "isHuman": true,
  "userId": "user_001",
  "name": "John Doe",
  "confidence": 0.95,
  "reasoning": "Strong facial match with high confidence"
}
```

**No Match Response:**
```json
{
  "match": false,
  "isHuman": true,
  "confidence": 0.0,
  "reasoning": "No matching profile found"
}
```

---

### 4. Get Statistics

**Endpoint:** `GET /api/attendance/stats/`

**Description:** Get attendance statistics for a time period.

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year` (default: `today`)

**Example Request:**
```bash
GET /api/attendance/stats/?period=week
```

**Response:** `200 OK`
```json
{
  "period": "week",
  "total_records": 350,
  "unique_users": 75,
  "status_breakdown": [
    {
      "status": "Present",
      "count": 280
    },
    {
      "status": "Late",
      "count": 50
    },
    {
      "status": "Check-out",
      "count": 20
    }
  ],
  "average_confidence": 0.92,
  "date_range": {
    "from": "2026-02-16T00:00:00Z",
    "to": "2026-02-23T14:30:00Z"
  }
}
```

---

### 5. Generate Report

**Endpoint:** `GET /api/attendance/report/`

**Description:** Generate detailed attendance report.

**Query Parameters:**
- `department` (optional): Filter by department
- `date_from` (optional): Start date (ISO format)
- `date_to` (optional): End date (ISO format)

**Example Request:**
```bash
GET /api/attendance/report/?department=Computer%20Science&date_from=2026-02-01
```

**Response:** `200 OK`
```json
{
  "total_records": 450,
  "unique_users": 45,
  "status_breakdown": [
    {
      "status": "Present",
      "count": 380
    },
    {
      "status": "Late",
      "count": 60
    },
    {
      "status": "Check-out",
      "count": 10
    }
  ],
  "average_confidence": 0.93,
  "period": {
    "from": "2026-02-01T00:00:00Z",
    "to": null
  }
}
```

---

### 6. Today's Attendance

**Endpoint:** `GET /api/attendance/today/`

**Description:** Get all attendance records for today.

**Response:** `200 OK`
```json
{
  "date": "2026-02-23",
  "count": 85,
  "records": [
    {
      "id": "att_001",
      "userId": "user_001",
      "name": "John Doe",
      "department": "Computer Science",
      "timestamp": "2026-02-23T08:30:00Z",
      "status": "Present",
      "confidence": 0.95
    }
  ]
}
```

---

### 7. User Attendance History

**Endpoint:** `GET /api/attendance/by_user/{user_id}/`

**Description:** Get attendance history for a specific user.

**Example Request:**
```bash
GET /api/attendance/by_user/user_001/
```

**Response:** `200 OK`
```json
{
  "user_id": "user_001",
  "total_records": 28,
  "records": [
    {
      "id": "att_150",
      "userId": "user_001",
      "name": "John Doe",
      "department": "Computer Science",
      "timestamp": "2026-02-23T08:30:00Z",
      "status": "Present",
      "confidence": 0.95
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Detailed error message"
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "detail": "Error description"
}
```

---

## Rate Limiting

Currently no rate limiting. For production, implement rate limiting:
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Pagination

All list endpoints support pagination:

**Request:**
```bash
GET /api/users/?page=2&page_size=25
```

**Response:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/users/?page=3",
  "previous": "http://localhost:8000/api/users/?page=1",
  "results": [...]
}
```

---

## Filtering & Search

### Search
```bash
GET /api/users/?search=john
```

### Ordering
```bash
GET /api/attendance/?ordering=-timestamp
GET /api/users/?ordering=name
```

### Multiple Filters
```bash
GET /api/attendance/?status=Present&department=Computer%20Science&date_from=2026-02-01
```

---

## Testing the API

### Using cURL

```bash
# List users
curl http://localhost:8000/api/users/

# Create user
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"id":"test_001","name":"Test User","department":"CS","photoBase64":"data:image/jpeg;base64,test"}'

# Get statistics
curl http://localhost:8000/api/attendance/stats/?period=week
```

### Using Python

```python
import requests

# List users
response = requests.get('http://localhost:8000/api/users/')
users = response.json()

# Create user
data = {
    'id': 'test_001',
    'name': 'Test User',
    'department': 'Computer Science',
    'photoBase64': 'data:image/jpeg;base64,...'
}
response = requests.post('http://localhost:8000/api/users/', json=data)
```

### Using the Test Script

```bash
cd backend
python test_api.py
```

---

## Best Practices

1. **Always validate input** - Check required fields before sending
2. **Handle errors gracefully** - Check response status codes
3. **Use pagination** - Don't fetch all records at once
4. **Compress images** - Reduce base64 image size before upload
5. **Cache responses** - Cache user lists and department data
6. **Use filters** - Filter on server-side, not client-side

---

## Future Enhancements

- JWT authentication
- WebSocket support for real-time updates
- Bulk operations
- Export endpoints (CSV, PDF)
- Advanced analytics endpoints
- Rate limiting
- API versioning

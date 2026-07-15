from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import UserProfile, AttendanceRecord
from datetime import timedelta


class UserProfileModelTest(TestCase):
    """Test UserProfile model"""
    
    def setUp(self):
        self.user = UserProfile.objects.create(
            id='test_user_001',
            name='Test User',
            department='Computer Science',
            photo_base64='data:image/jpeg;base64,test',
        )
    
    def test_user_creation(self):
        """Test user profile creation"""
        self.assertEqual(self.user.name, 'Test User')
        self.assertEqual(self.user.department, 'Computer Science')
        self.assertIsNotNone(self.user.registered_at)
    
    def test_user_string_representation(self):
        """Test string representation"""
        expected = f"{self.user.name} ({self.user.department})"
        self.assertEqual(str(self.user), expected)


class AttendanceRecordModelTest(TestCase):
    """Test AttendanceRecord model"""
    
    def setUp(self):
        self.record = AttendanceRecord.objects.create(
            id='test_att_001',
            user_id='test_user_001',
            name='Test User',
            department='Computer Science',
            status='Present',
            confidence=0.95
        )
    
    def test_record_creation(self):
        """Test attendance record creation"""
        self.assertEqual(self.record.user_id, 'test_user_001')
        self.assertEqual(self.record.status, 'Present')
        self.assertEqual(self.record.confidence, 0.95)
        self.assertIsNotNone(self.record.timestamp)
    
    def test_record_string_representation(self):
        """Test string representation"""
        self.assertIn(self.record.name, str(self.record))
        self.assertIn(self.record.status, str(self.record))


class UserProfileAPITest(APITestCase):
    """Test UserProfile API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'id': 'api_test_001',
            'name': 'API Test User',
            'department': 'Engineering',
            'photoBase64': 'data:image/jpeg;base64,test'
        }
    
    def test_create_user(self):
        """Test creating a user via API"""
        response = self.client.post('/api/users/', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UserProfile.objects.count(), 1)
        self.assertEqual(UserProfile.objects.get().name, 'API Test User')
    
    def test_create_duplicate_user(self):
        """Test creating duplicate user fails"""
        self.client.post('/api/users/', self.user_data, format='json')
        response = self.client.post('/api/users/', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_users(self):
        """Test listing users"""
        UserProfile.objects.create(
            id='list_test_001',
            name='List Test',
            department='Science',
            photo_base64='test'
        )
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_delete_user(self):
        """Test deleting a user"""
        user = UserProfile.objects.create(
            id='delete_test_001',
            name='Delete Test',
            department='Arts',
            photo_base64='test'
        )
        response = self.client.delete(f'/api/users/{user.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserProfile.objects.count(), 0)


class AttendanceRecordAPITest(APITestCase):
    """Test AttendanceRecord API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = UserProfile.objects.create(
            id='att_api_test_001',
            name='Attendance Test User',
            department='Business',
            photo_base64='test'
        )
        self.record_data = {
            'id': 'rec_001',
            'userId': self.user.id,
            'name': self.user.name,
            'department': self.user.department,
            'status': 'Present',
            'confidence': 0.92
        }
    
    def test_create_attendance_record(self):
        """Test creating attendance record"""
        response = self.client.post('/api/attendance/', self.record_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AttendanceRecord.objects.count(), 1)
    
    def test_duplicate_prevention(self):
        """Test duplicate attendance prevention"""
        self.client.post('/api/attendance/', self.record_data, format='json')
        
        # Try to create another record immediately
        self.record_data['id'] = 'rec_002'
        response = self.client.post('/api/attendance/', self.record_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_attendance_records(self):
        """Test listing attendance records"""
        AttendanceRecord.objects.create(
            id='list_rec_001',
            user_id=self.user.id,
            name=self.user.name,
            status='Present',
            confidence=0.90
        )
        response = self.client.get('/api/attendance/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_stats_endpoint(self):
        """Test statistics endpoint"""
        AttendanceRecord.objects.create(
            id='stats_rec_001',
            user_id=self.user.id,
            name=self.user.name,
            status='Present',
            confidence=0.95
        )
        response = self.client.get('/api/attendance/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_records', response.data)
        self.assertIn('unique_users', response.data)
    
    def test_today_endpoint(self):
        """Test today's attendance endpoint"""
        AttendanceRecord.objects.create(
            id='today_rec_001',
            user_id=self.user.id,
            name=self.user.name,
            status='Present',
            confidence=0.88
        )
        response = self.client.get('/api/attendance/today/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('records', response.data)


class UtilsTest(TestCase):
    """Test utility functions"""
    
    def test_get_date_range_today(self):
        """Test date range calculation for today"""
        from .utils import get_date_range
        start, end = get_date_range('today')
        self.assertEqual(start.date(), timezone.now().date())
    
    def test_get_date_range_week(self):
        """Test date range calculation for week"""
        from .utils import get_date_range
        start, end = get_date_range('week')
        expected_start = timezone.now() - timedelta(days=7)
        self.assertAlmostEqual(
            start.timestamp(),
            expected_start.timestamp(),
            delta=60  # Within 1 minute
        )

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q, Avg
from datetime import timedelta, datetime
from .models import UserProfile, AttendanceRecord
from .serializers import UserProfileSerializer, AttendanceRecordSerializer
from .gemini_service import recognize_face
from .pagination import StandardResultsSetPagination
from .utils import calculate_attendance_rate, generate_attendance_report, get_date_range


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user profiles
    
    Endpoints:
    - GET /api/users/ - List all users
    - POST /api/users/ - Create new user
    - GET /api/users/{id}/ - Get user details
    - PUT /api/users/{id}/ - Update user
    - DELETE /api/users/{id}/ - Delete user
    - GET /api/users/{id}/attendance_rate/ - Get user attendance rate
    - GET /api/users/departments/ - List all departments
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'department', 'id']
    ordering_fields = ['name', 'department', 'registered_at']
    ordering = ['-registered_at']

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def public_register(self, request):
        """Public endpoint - students self-register without login"""
        user_id = request.data.get('id')
        if not user_id:
            return Response({'error': 'Student ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        if UserProfile.objects.filter(id=user_id).exists():
            return Response({'error': 'A student with this ID is already registered'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data={
            'id': user_id,
            'name': request.data.get('name', ''),
            'department': request.data.get('department', ''),
            'photo_base64': request.data.get('photoBase64', ''),
        })
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Registered successfully', 'id': user_id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        """Create new user with duplicate check"""
        user_id = request.data.get('id')
        if UserProfile.objects.filter(id=user_id).exists():
            return Response(
                {'error': 'User already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def attendance_rate(self, request, pk=None):
        """Get attendance rate for a specific user"""
        user = self.get_object()
        period = request.query_params.get('period', 'month')
        
        stats = calculate_attendance_rate(user.id, period)
        
        return Response({
            'user_id': user.id,
            'name': user.name,
            'department': user.department,
            'period': period,
            'statistics': stats
        })

    @action(detail=False, methods=['get'])
    def departments(self, request):
        """List all unique departments"""
        departments = UserProfile.objects.values_list('department', flat=True).distinct()
        return Response({
            'departments': list(departments),
            'count': len(departments)
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary statistics for all users"""
        total_users = UserProfile.objects.count()
        departments = UserProfile.objects.values('department').annotate(
            count=Count('id')
        )
        
        return Response({
            'total_users': total_users,
            'departments': list(departments),
            'recent_registrations': UserProfile.objects.order_by('-registered_at')[:5].values(
                'id', 'name', 'department', 'registered_at'
            )
        })


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance records
    
    Endpoints:
    - GET /api/attendance/ - List all records
    - POST /api/attendance/ - Create attendance record
    - POST /api/attendance/recognize/ - Facial recognition
    - GET /api/attendance/stats/ - Get statistics
    - GET /api/attendance/report/ - Generate report
    - GET /api/attendance/today/ - Today's attendance
    - GET /api/attendance/by_user/{user_id}/ - User's attendance history
    """
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'user_id', 'department']
    ordering_fields = ['timestamp', 'confidence', 'status']
    ordering = ['-timestamp']

    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(timestamp__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__lte=date_to)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by department
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department__icontains=department)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset

    def create(self, request, *args, **kwargs):
        """Create attendance record with duplicate prevention"""
        user_id = request.data.get('userId')
        thirty_seconds_ago = timezone.now() - timedelta(seconds=30)
        
        recent_record = AttendanceRecord.objects.filter(
            user_id=user_id,
            timestamp__gte=thirty_seconds_ago
        ).first()
        
        if recent_record:
            return Response(
                {'error': 'Attendance already marked recently'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def recognize(self, request):
        """
        Facial recognition endpoint
        Expects: { "targetImage": "base64...", "knownUsers": [...] }
        """
        target_image = request.data.get('targetImage')
        known_users_data = request.data.get('knownUsers', [])
        
        if not target_image:
            return Response(
                {'error': 'targetImage is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = recognize_face(target_image, known_users_data)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e), 'match': False, 'confidence': 0},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get attendance statistics"""
        period = request.query_params.get('period', 'today')
        start_date, end_date = get_date_range(period)
        
        queryset = AttendanceRecord.objects.filter(
            timestamp__range=(start_date, end_date)
        )
        
        total_records = queryset.count()
        unique_users = queryset.values('user_id').distinct().count()
        
        status_breakdown = queryset.values('status').annotate(
            count=Count('id')
        )
        
        avg_confidence = queryset.aggregate(Avg('confidence'))['confidence__avg'] or 0
        
        return Response({
            'period': period,
            'total_records': total_records,
            'unique_users': unique_users,
            'status_breakdown': list(status_breakdown),
            'average_confidence': round(avg_confidence, 2),
            'date_range': {
                'from': start_date.isoformat(),
                'to': end_date.isoformat()
            }
        })

    @action(detail=False, methods=['get'])
    def report(self, request):
        """Generate detailed attendance report"""
        department = request.query_params.get('department')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            date_from = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
        if date_to:
            date_to = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
        
        report = generate_attendance_report(department, date_from, date_to)
        return Response(report)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's attendance records"""
        today = timezone.now().date()
        records = AttendanceRecord.objects.filter(
            timestamp__date=today
        ).order_by('-timestamp')
        
        serializer = self.get_serializer(records, many=True)
        
        return Response({
            'date': today.isoformat(),
            'count': records.count(),
            'records': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='by_user/(?P<user_id>[^/.]+)')
    def by_user(self, request, user_id=None):
        """Get attendance history for a specific user"""
        records = AttendanceRecord.objects.filter(user_id=user_id).order_by('-timestamp')
        
        # Pagination
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(records, many=True)
        return Response({
            'user_id': user_id,
            'total_records': records.count(),
            'records': serializer.data
        })

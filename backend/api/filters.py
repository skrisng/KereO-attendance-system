from django_filters import rest_framework as filters
from .models import AttendanceRecord, UserProfile


class AttendanceRecordFilter(filters.FilterSet):
    """Filter attendance records by various criteria"""
    date_from = filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')
    status = filters.ChoiceFilter(choices=AttendanceRecord.STATUS_CHOICES)
    department = filters.CharFilter(lookup_expr='icontains')
    user_id = filters.CharFilter()
    min_confidence = filters.NumberFilter(field_name='confidence', lookup_expr='gte')
    
    class Meta:
        model = AttendanceRecord
        fields = ['status', 'department', 'user_id', 'date_from', 'date_to', 'min_confidence']


class UserProfileFilter(filters.FilterSet):
    """Filter user profiles by various criteria"""
    department = filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(lookup_expr='icontains')
    registered_after = filters.DateTimeFilter(field_name='registered_at', lookup_expr='gte')
    
    class Meta:
        model = UserProfile
        fields = ['department', 'name', 'registered_after']

from django.contrib import admin
from .models import UserProfile, AttendanceRecord


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'department', 'registered_at']
    search_fields = ['name', 'department', 'id']
    list_filter = ['department', 'registered_at']


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['name', 'user_id', 'status', 'confidence', 'timestamp']
    search_fields = ['name', 'user_id']
    list_filter = ['status', 'timestamp']
    date_hierarchy = 'timestamp'

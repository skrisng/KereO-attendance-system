from rest_framework import serializers
from .models import UserProfile, AttendanceRecord


class UserProfileSerializer(serializers.ModelSerializer):
    photoBase64 = serializers.CharField(source='photo_base64')
    registeredAt = serializers.DateTimeField(source='registered_at', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'name', 'department', 'photoBase64', 'registeredAt']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user_id')
    snapshotBase64 = serializers.CharField(source='snapshot_base64', required=False, allow_blank=True)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'userId', 'name', 'department', 'timestamp', 'status', 'confidence', 'snapshotBase64']

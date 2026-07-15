from django.db import models
from django.utils import timezone


class UserProfile(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    department = models.CharField(max_length=200)
    photo_base64 = models.TextField()
    registered_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-registered_at']

    def __str__(self):
        return f"{self.name} ({self.department})"


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Late', 'Late'),
        ('Check-out', 'Check-out'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    user_id = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    department = models.CharField(max_length=200, blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    confidence = models.FloatField()
    snapshot_base64 = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.name} - {self.status} at {self.timestamp}"

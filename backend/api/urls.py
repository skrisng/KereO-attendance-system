from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, AttendanceRecordViewSet

router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='user')
router.register(r'attendance', AttendanceRecordViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]

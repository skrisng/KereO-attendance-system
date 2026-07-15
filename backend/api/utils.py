import base64
import io
from PIL import Image
from datetime import datetime, timedelta
from django.utils import timezone


def compress_base64_image(base64_string, max_size_kb=500, quality=85):
    """
    Compress a base64 encoded image to reduce size
    
    Args:
        base64_string: Base64 encoded image
        max_size_kb: Maximum size in KB
        quality: JPEG quality (1-100)
    
    Returns:
        Compressed base64 string
    """
    try:
        # Remove data URI prefix if present
        if ',' in base64_string:
            header, base64_string = base64_string.split(',', 1)
        else:
            header = 'data:image/jpeg;base64'
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Compress
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=quality, optimize=True)
        compressed_data = output.getvalue()
        
        # Check size and reduce quality if needed
        while len(compressed_data) > max_size_kb * 1024 and quality > 20:
            quality -= 10
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=quality, optimize=True)
            compressed_data = output.getvalue()
        
        # Encode back to base64
        compressed_base64 = base64.b64encode(compressed_data).decode('utf-8')
        return f"{header},{compressed_base64}"
    
    except Exception as e:
        print(f"Image compression error: {e}")
        return base64_string


def get_date_range(period='today'):
    """
    Get date range for filtering
    
    Args:
        period: 'today', 'week', 'month', 'year'
    
    Returns:
        tuple: (start_date, end_date)
    """
    now = timezone.now()
    
    if period == 'today':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif period == 'week':
        start = now - timedelta(days=7)
        end = now
    elif period == 'month':
        start = now - timedelta(days=30)
        end = now
    elif period == 'year':
        start = now - timedelta(days=365)
        end = now
    else:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    
    return start, end


def calculate_attendance_rate(user_id, period='month'):
    """
    Calculate attendance rate for a user
    
    Args:
        user_id: User ID
        period: Time period
    
    Returns:
        dict: Attendance statistics
    """
    from .models import AttendanceRecord
    
    start_date, end_date = get_date_range(period)
    
    records = AttendanceRecord.objects.filter(
        user_id=user_id,
        timestamp__range=(start_date, end_date)
    )
    
    total_days = (end_date - start_date).days + 1
    present_days = records.filter(status='Present').count()
    late_days = records.filter(status='Late').count()
    
    return {
        'total_days': total_days,
        'present_days': present_days,
        'late_days': late_days,
        'absent_days': total_days - present_days - late_days,
        'attendance_rate': (present_days / total_days * 100) if total_days > 0 else 0,
        'punctuality_rate': (present_days / (present_days + late_days) * 100) if (present_days + late_days) > 0 else 0
    }


def generate_attendance_report(department=None, date_from=None, date_to=None):
    """
    Generate attendance report
    
    Args:
        department: Filter by department
        date_from: Start date
        date_to: End date
    
    Returns:
        dict: Report data
    """
    from .models import AttendanceRecord, UserProfile
    from django.db.models import Count, Avg
    
    # Build query
    query = AttendanceRecord.objects.all()
    
    if department:
        query = query.filter(department__icontains=department)
    
    if date_from:
        query = query.filter(timestamp__gte=date_from)
    
    if date_to:
        query = query.filter(timestamp__lte=date_to)
    
    # Calculate statistics
    total_records = query.count()
    status_breakdown = query.values('status').annotate(count=Count('status'))
    avg_confidence = query.aggregate(Avg('confidence'))['confidence__avg'] or 0
    
    # Unique users
    unique_users = query.values('user_id').distinct().count()
    
    return {
        'total_records': total_records,
        'unique_users': unique_users,
        'status_breakdown': list(status_breakdown),
        'average_confidence': round(avg_confidence, 2),
        'period': {
            'from': date_from,
            'to': date_to
        }
    }

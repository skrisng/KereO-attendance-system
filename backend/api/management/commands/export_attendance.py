from django.core.management.base import BaseCommand
from django.utils import timezone
import csv
from datetime import datetime
from api.models import AttendanceRecord


class Command(BaseCommand):
    help = 'Export attendance records to CSV'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='attendance_export.csv',
            help='Output CSV file path'
        )
        parser.add_argument(
            '--date-from',
            type=str,
            help='Start date (YYYY-MM-DD)'
        )
        parser.add_argument(
            '--date-to',
            type=str,
            help='End date (YYYY-MM-DD)'
        )
        parser.add_argument(
            '--department',
            type=str,
            help='Filter by department'
        )

    def handle(self, *args, **options):
        output_file = options['output']
        date_from = options.get('date_from')
        date_to = options.get('date_to')
        department = options.get('department')

        # Build query
        queryset = AttendanceRecord.objects.all()

        if date_from:
            date_from = datetime.strptime(date_from, '%Y-%m-%d')
            queryset = queryset.filter(timestamp__gte=date_from)

        if date_to:
            date_to = datetime.strptime(date_to, '%Y-%m-%d')
            queryset = queryset.filter(timestamp__lte=date_to)

        if department:
            queryset = queryset.filter(department__icontains=department)

        queryset = queryset.order_by('-timestamp')

        # Export to CSV
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            
            # Header
            writer.writerow([
                'ID', 'User ID', 'Name', 'Department', 
                'Timestamp', 'Status', 'Confidence'
            ])
            
            # Data
            for record in queryset:
                writer.writerow([
                    record.id,
                    record.user_id,
                    record.name,
                    record.department or '',
                    record.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    record.status,
                    record.confidence
                ])

        count = queryset.count()
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully exported {count} records to {output_file}'
            )
        )

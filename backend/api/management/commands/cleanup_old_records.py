from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import AttendanceRecord


class Command(BaseCommand):
    help = 'Clean up old attendance records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=365,
            help='Delete records older than this many days'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']

        cutoff_date = timezone.now() - timedelta(days=days)
        
        old_records = AttendanceRecord.objects.filter(
            timestamp__lt=cutoff_date
        )
        
        count = old_records.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would delete {count} records older than {days} days'
                )
            )
        else:
            old_records.delete()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully deleted {count} records older than {days} days'
                )
            )

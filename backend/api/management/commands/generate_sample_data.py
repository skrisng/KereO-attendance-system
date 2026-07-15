from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from api.models import UserProfile, AttendanceRecord


class Command(BaseCommand):
    help = 'Generate sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Number of users to create'
        )
        parser.add_argument(
            '--records',
            type=int,
            default=50,
            help='Number of attendance records to create'
        )

    def handle(self, *args, **options):
        num_users = options['users']
        num_records = options['records']

        self.stdout.write('Generating sample data...')

        # Sample data
        departments = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Science']
        first_names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
        statuses = ['Present', 'Late', 'Check-out']

        # Create users
        users = []
        for i in range(num_users):
            user_id = f"user_{i+1:03d}"
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            department = random.choice(departments)
            
            user, created = UserProfile.objects.get_or_create(
                id=user_id,
                defaults={
                    'name': name,
                    'department': department,
                    'photo_base64': 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',  # Placeholder
                    'registered_at': timezone.now() - timedelta(days=random.randint(1, 90))
                }
            )
            
            if created:
                users.append(user)
                self.stdout.write(f'Created user: {name}')

        # Create attendance records
        for i in range(num_records):
            user = random.choice(users)
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            
            record_id = f"att_{i+1:05d}"
            
            AttendanceRecord.objects.get_or_create(
                id=record_id,
                defaults={
                    'user_id': user.id,
                    'name': user.name,
                    'department': user.department,
                    'timestamp': timezone.now() - timedelta(days=days_ago, hours=hours_ago),
                    'status': random.choice(statuses),
                    'confidence': round(random.uniform(0.75, 0.99), 2),
                    'snapshot_base64': 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(users)} users and {num_records} attendance records'))

from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Package, Event, Wish, ContactLead
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Seeds the database with packages, sample host, event, and wishes.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # 1. Create Packages
        basic, _ = Package.objects.get_or_create(
            name='Basic',
            defaults={
                'price_in_inr': 2999.00,
                'storage_limit_gb': 2,
                'duration_days': 30,
                'multi_event': False,
                'allow_zip': False,
                'custom_design': False
            }
        )
        premium, _ = Package.objects.get_or_create(
            name='Premium',
            defaults={
                'price_in_inr': 5999.00,
                'storage_limit_gb': 10,
                'duration_days': 90,
                'multi_event': False,
                'allow_zip': True,
                'custom_design': False
            }
        )
        luxury, _ = Package.objects.get_or_create(
            name='Luxury',
            defaults={
                'price_in_inr': 14999.00,
                'storage_limit_gb': 50,
                'duration_days': 365,
                'multi_event': True,
                'allow_zip': True,
                'custom_design': True
            }
        )
        self.stdout.write(self.style.SUCCESS("Created packages: Basic, Premium, Luxury"))

        # 2. Create Admin & Host users
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@shaadiqr.com',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user (credentials: admin / admin123)"))

        host_user, created = User.objects.get_or_create(
            username='arjun',
            defaults={
                'email': 'arjun@gmail.com',
                'phone': '9876543210',
                'role': 'host',
                'is_verified': True
            }
        )
        if created:
            host_user.set_password('arjun123')
            host_user.save()
            self.stdout.write(self.style.SUCCESS("Created host user (credentials: arjun / arjun123)"))

        # 3. Create Sample Event
        event, created = Event.objects.get_or_create(
            slug='priya-arjun-wedding',
            defaults={
                'user': host_user,
                'name': 'Priya & Arjun Wedding Bash',
                'bride_name': 'Priya',
                'groom_name': 'Arjun',
                'date': date.today() + timedelta(days=15),
                'location': 'Leela Palace, Delhi',
                'is_password_protected': False,
                'is_public': True,
                'watermark_enabled': False,
                'expiry_date': date.today() + timedelta(days=90),
                'package': premium
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created event '{event.name}' with slug '{event.slug}'"))

            # Create wishes for event
            Wish.objects.create(
                event=event,
                guest_name="Ramesh Chawla",
                message="Congratulations Priya and Arjun! Wishing you a lifetime of love and happiness.",
                is_approved=True
            )
            Wish.objects.create(
                event=event,
                guest_name="Karan Johar",
                message="Have a great married life ahead guys! Sending lots of love from Mumbai.",
                is_approved=True
            )
            Wish.objects.create(
                event=event,
                guest_name="Anjali Sharma",
                message="So happy for both of you! Let's party hard tonight! 💃✨",
                is_approved=False # Pending approval
            )
            self.stdout.write(self.style.SUCCESS("Created sample guest wishes"))

        # 4. Create Contact Lead
        ContactLead.objects.get_or_create(
            email='enquiry@gmail.com',
            defaults={
                'name': 'Sanjay Singhania',
                'message': 'Looking for a custom luxury package for a high-profile destination wedding in Udaipur with 1000+ guests.'
            }
        )
        self.stdout.write(self.style.SUCCESS("Created sample contact lead"))
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))

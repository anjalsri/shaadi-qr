import os
import zipfile
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from api.models import Event

class Command(BaseCommand):
    help = 'Backs up all uploaded guest media for a given event or all events into a ZIP file.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--slug',
            type=str,
            help='Slug of the event to backup. If omitted, backups will be run for all events.',
        )

    def handle(self, *args, **options):
        slug = options.get('slug')
        
        if slug:
            events = Event.objects.filter(slug=slug)
            if not events.exists():
                raise CommandError(f"Event with slug '{slug}' does not exist.")
        else:
            events = Event.objects.all()
            if not events.exists():
                self.stdout.write(self.style.WARNING("No events found in database to backup."))
                return

        backup_root = getattr(settings, 'BACKUP_DIR', os.path.join(settings.BASE_DIR, 'backups'))
        os.makedirs(backup_root, exist_ok=True)

        for event in events:
            uploads = event.uploads.all()
            if not uploads.exists():
                self.stdout.write(self.style.NOTICE(f"Event '{event.slug}' has no uploads. Skipping."))
                continue

            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            zip_filename = f"backup_{event.slug}_{timestamp}.zip"
            zip_filepath = os.path.join(backup_root, zip_filename)

            self.stdout.write(f"Backing up {uploads.count()} files for event '{event.slug}'...")

            success_count = 0
            with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for upload in uploads:
                    if upload.file and os.path.exists(upload.file.path):
                        # Archive as flat files using the basename
                        arcname = os.path.basename(upload.file.name)
                        zip_file.write(upload.file.path, arcname)
                        success_count += 1
                    else:
                        self.stdout.write(
                            self.style.WARNING(f"File not found on disk for upload ID {upload.id}: {upload.file}")
                        )

            if success_count > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Successfully backed up {success_count} files for '{event.slug}' into {zip_filepath}"
                    )
                )
            else:
                # Remove empty zip if no files were added
                if os.path.exists(zip_filepath):
                    os.remove(zip_filepath)
                self.stdout.write(self.style.WARNING(f"Backup failed or empty for event '{event.slug}'."))

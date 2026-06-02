from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from datetime import date

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('host', 'Event Host'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='host')
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verification_otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    # Resolve reverse accessor clashes for standard auth User model
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return f"{self.email} ({self.role})"


class Package(models.Model):
    name = models.CharField(max_length=20, unique=True) # Basic, Premium, Luxury
    price_in_inr = models.DecimalField(max_digits=10, decimal_places=2)
    storage_limit_gb = models.IntegerField()
    duration_days = models.IntegerField()
    multi_event = models.BooleanField(default=False)
    allow_zip = models.BooleanField(default=True)
    custom_design = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Event(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    bride_name = models.CharField(max_length=50)
    groom_name = models.CharField(max_length=50)
    date = models.DateField()
    location = models.CharField(max_length=100)
    cover_photo = models.ImageField(blank=True, null=True, upload_to='event_covers/')
    is_password_protected = models.BooleanField(default=False)
    password = models.CharField(max_length=128, blank=True, null=True)
    is_public = models.BooleanField(default=True)
    watermark_enabled = models.BooleanField(default=False)
    expiry_date = models.DateField(blank=True, null=True)
    
    # Custom QR Code themes
    # Store theme details like color hexes, custom couple names, logos, borders
    qr_theme = models.CharField(max_length=200, default='{"color": "#7B1B2A", "bg": "#FBF6EE", "style": "classic"}')
    couple_custom_name = models.CharField(max_length=100, blank=True, null=True)
    
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)

    @property
    def is_expired(self):
        if self.expiry_date and self.expiry_date < date.today():
            return True
        return False

    def __str__(self):
        return f"{self.name} ({self.slug})"


class GuestUpload(models.Model):
    FILE_TYPES = (
        ('photo', 'Photo'),
        ('video', 'Video'),
    )
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='uploads')
    file = models.FileField(upload_to='guest_uploads/')
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    file_size_bytes = models.BigIntegerField()
    guest_name = models.CharField(max_length=50)
    guest_ip = models.GenericIPAddressField(blank=True, null=True)
    guest_mobile = models.CharField(max_length=15, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.guest_name} - {self.file_type} ({self.event.name})"


class Wish(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='wishes')
    guest_name = models.CharField(max_length=50)
    message = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wish by {self.guest_name} for {self.event.name}"


class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=200, blank=True, null=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    # Billing Info
    billing_name = models.CharField(max_length=100)
    billing_email = models.EmailField()
    billing_phone = models.CharField(max_length=15)
    invoice_number = models.CharField(max_length=50, unique=True)
    razorpay_mode = models.CharField(max_length=10, default='test')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.invoice_number} ({self.status})"


class ContactLead(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lead from {self.name} ({self.email})"

import re
from rest_framework import serializers
from .models import User, Package, Event, GuestUpload, Wish, Payment, ContactLead

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'role', 'is_verified', 'password')
        read_only_fields = ('id', 'is_verified')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        if value and not re.match(r'^\+?[0-9]{10,15}$', value):
            raise serializers.ValidationError("Enter a valid phone number (10 to 15 digits).")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            role=validated_data.get('role', 'host'),
            password=validated_data['password']
        )
        return user


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True)

    class Meta:
        model = Event
        fields = (
            'id', 'name', 'slug', 'bride_name', 'groom_name', 'date', 
            'location', 'cover_photo', 'is_password_protected', 'password', 
            'is_public', 'watermark_enabled', 'expiry_date', 'qr_theme', 
            'couple_custom_name', 'package', 'package_name', 'is_expired'
        )
        read_only_fields = ('id', 'expiry_date')

    def validate_slug(self, value):
        if not re.match(r'^[a-z0-9-]+$', value):
            raise serializers.ValidationError("Slug must contain only lowercase letters, numbers, and hyphens (e.g. 'priya-arjun-wedding').")
        return value

    def validate_password(self, value):
        if self.initial_data.get('is_password_protected') and not value:
            raise serializers.ValidationError("Password is required if password protection is enabled.")
        return value


class GuestUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestUpload
        fields = (
            'id', 'event', 'file', 'file_type', 'file_size_bytes', 
            'guest_name', 'guest_mobile', 'created_at', 'is_approved'
        )
        read_only_fields = ('id', 'file_size_bytes', 'file_type', 'created_at', 'is_approved')

    def validate_file(self, value):
        # 1. Size Validation
        # Photo max: 10MB, Video max: 100MB
        content_type = value.content_type
        size = value.size
        
        is_photo = content_type.startswith('image/')
        is_video = content_type.startswith('video/')
        
        # Check extensions manually too
        ext = value.name.split('.')[-1].lower()
        allowed_photo_exts = ['jpg', 'jpeg', 'png']
        allowed_video_exts = ['mp4', 'mov']

        if is_photo or ext in allowed_photo_exts:
            if ext not in allowed_photo_exts:
                raise serializers.ValidationError("Invalid photo format. Only JPG, JPEG, and PNG are allowed.")
            if size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Photos cannot exceed 10 MB in size.")
        elif is_video or ext in allowed_video_exts:
            if ext not in allowed_video_exts:
                raise serializers.ValidationError("Invalid video format. Only MP4 and MOV are allowed.")
            if size > 100 * 1024 * 1024:
                raise serializers.ValidationError("Videos cannot exceed 100 MB in size.")
        else:
            raise serializers.ValidationError("Unsupported file type. Only image (JPG, PNG) and video (MP4, MOV) files are allowed.")

        return value


class WishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wish
        fields = ('id', 'event', 'guest_name', 'message', 'is_approved', 'created_at')
        read_only_fields = ('id', 'created_at', 'is_approved')

    def validate_guest_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Guest name cannot be empty.")
        return value

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Wish/blessing message cannot be empty.")
        return value


class PaymentSerializer(serializers.ModelSerializer):
    package_name = serializers.CharField(source='package.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = (
            'id', 'package', 'package_name', 'razorpay_order_id', 'razorpay_payment_id', 
            'amount', 'status', 'billing_name', 'billing_email', 'billing_phone', 
            'invoice_number', 'razorpay_mode', 'created_at'
        )
        read_only_fields = ('id', 'razorpay_order_id', 'razorpay_payment_id', 'invoice_number', 'created_at')


class ContactLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactLead
        fields = '__all__'

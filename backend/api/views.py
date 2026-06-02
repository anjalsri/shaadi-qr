import os
import re
import random
import zipfile
import json
from io import BytesIO
from datetime import datetime, date, timedelta

from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, FileResponse

from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Dynamic imports with fallbacks
try:
    import qrcode
except ImportError:
    qrcode = None

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    Image = None

try:
    import razorpay
except ImportError:
    razorpay = None

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
except ImportError:
    SimpleDocTemplate = None

from .models import User, Package, Event, GuestUpload, Wish, Payment, ContactLead
from .serializers import (
    UserSerializer, PackageSerializer, EventSerializer, 
    GuestUploadSerializer, WishSerializer, PaymentSerializer, ContactLeadSerializer
)


# ==========================================
# 1. AUTHENTICATION & OTP FLOWS
# ==========================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_verified:
            raise serializers.ValidationError("This account email is not verified yet. Please verify using OTP.")
        data['user'] = {
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'id': self.user.id
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate OTP
            otp = f"{random.randint(100000, 999999)}"
            user.verification_otp = otp
            user.otp_created_at = timezone.now()
            user.is_active = False # Deactivate until verified
            user.save()
            
            # Send Email (Or mock print)
            subject = "Shaadi QR - Verify your account"
            message = f"Hello {user.username},\n\nYour OTP for registration is: {otp}\n\nThis OTP is valid for 10 minutes."
            
            print(f"\n[EMAIL MOCK] Sending OTP to {user.email}: {otp}\n")
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True
                )
            except Exception as e:
                # Log email errors silently in dev
                pass
                
            return Response({
                "message": "User registered successfully. An OTP has been sent to your email.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        
        if not email or not otp:
            return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(User, email=email)
        
        # Check expiry (10 mins)
        if not user.otp_created_at or timezone.now() - user.otp_created_at > timedelta(minutes=10):
            return Response({"error": "OTP has expired. Please register again or request another OTP."}, status=status.HTTP_400_BAD_REQUEST)
            
        if user.verification_otp != otp:
            return Response({"error": "Invalid OTP. Please try again."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verify and activate
        user.is_verified = True
        user.is_active = True
        user.verification_otp = None
        user.save()
        
        return Response({"message": "Email verified successfully. You can now login."}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(User, email=email)
        
        # Generate Reset OTP
        otp = f"{random.randint(100000, 999999)}"
        user.verification_otp = otp
        user.otp_created_at = timezone.now()
        user.save()
        
        print(f"\n[EMAIL MOCK] Password Reset OTP to {user.email}: {otp}\n")
        
        try:
            send_mail(
                "Shaadi QR - Reset your password",
                f"Hello {user.username},\n\nYour OTP for resetting your password is: {otp}\n\nValid for 10 minutes.",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True
            )
        except Exception:
            pass
            
        return Response({"message": "OTP for resetting password sent to your email."}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")
        
        if not email or not otp or not new_password:
            return Response({"error": "Email, OTP and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(User, email=email)
        
        if not user.otp_created_at or timezone.now() - user.otp_created_at > timedelta(minutes=10):
            return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
            
        if user.verification_otp != otp:
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.verification_otp = None
        user.save()
        
        return Response({"message": "Password reset successfully. You can login now."}, status=status.HTTP_200_OK)


# ==========================================
# 2. PACKAGES API
# ==========================================

class PackageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [AllowAny]


# ==========================================
# 3. EVENTS CRUD & CUSTOM QR CODE
# ==========================================

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin can view all, Host only their own
        if self.request.user.role == 'admin':
            return Event.objects.all()
        return Event.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Set default package (Basic) if not provided, and set default expiry date (30 days)
        package = serializer.validated_data.get('package')
        if not package:
            package = Package.objects.filter(name='Basic').first()
        
        duration = package.duration_days if package else 30
        expiry = date.today() + timedelta(days=duration)
        
        serializer.save(user=self.request.user, package=package, expiry_date=expiry)

    @action(detail=False, methods=['get'], url_path='check-slug', permission_classes=[AllowAny])
    def check_slug(self, request):
        slug = request.query_params.get('slug', '').strip().lower()
        if not slug:
            return Response({"available": False, "error": "Slug cannot be empty."}, status=400)
        
        exists = Event.objects.filter(slug=slug).exists()
        return Response({"available": not exists})

    @action(detail=True, methods=['get'], url_path='qr-custom', permission_classes=[AllowAny])
    def get_custom_qr(self, request, pk=None):
        """Generates dynamic customized QR code for the event upload page."""
        event = get_object_or_404(Event, pk=pk)
        
        # Color values (hex)
        fg_hex = request.query_params.get('fg', '#7B1B2A')  # Maroon default
        bg_hex = request.query_params.get('bg', '#FBF6EE')  # Cream default
        couple_name = request.query_params.get('label', f"{event.bride_name} & {event.groom_name}")
        
        # Target URL
        # For local dev we direct to the standard host frontend upload page format
        guest_url = f"http://localhost:5173/e/{event.slug}"
        
        if not qrcode or not Image:
            return HttpResponse("Pillow and qrcode modules are required on backend to generate QR.", status=500)
            
        try:
            # Generate raw QR
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(guest_url)
            qr.make(fit=True)
            
            # Convert hex to RGB tuples
            def hex_to_rgb(h):
                h = h.lstrip('#')
                return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
                
            fg_rgb = hex_to_rgb(fg_hex)
            bg_rgb = hex_to_rgb(bg_hex)
            
            # Generate Pil image
            qr_img = qr.make_image(fill_color=fg_rgb, back_color=bg_rgb).convert('RGBA')
            
            # Create customized canvas (Taller to add text overlay banner at bottom)
            w, h = qr_img.size
            canvas = Image.new('RGBA', (w, h + 60), bg_rgb)
            canvas.paste(qr_img, (0, 0))
            
            # Draw label
            draw = ImageDraw.Draw(canvas)
            # Try to load a nice font, fallback to default
            try:
                font = ImageFont.load_default()
            except Exception:
                font = None
                
            # Render a text banner
            text = f"Scan to Upload: {couple_name}"
            draw.text((w/2, h + 20), text, fill=fg_rgb, font=font, anchor="mm")
            
            # Return image stream
            buffer = BytesIO()
            canvas.save(buffer, format="PNG")
            buffer.seek(0)
            return HttpResponse(buffer.getvalue(), content_type="image/png")
            
        except Exception as e:
            return HttpResponse(f"Error generating customized QR: {str(e)}", status=500)


# ==========================================
# 4. GUEST PUBLIC PORTAL / ACCESSIBILITY
# ==========================================

class PublicEventView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        event = get_object_or_404(Event, slug=slug)
        
        # Check Expiry
        if event.is_expired:
            return Response({
                "error": "This wedding album has expired.",
                "is_expired": True
            }, status=status.HTTP_403_FORBIDDEN)
            
        # Check Password protection
        password_provided = request.query_params.get('password')
        if event.is_password_protected:
            if not password_provided or password_provided != event.password:
                return Response({
                    "name": event.name,
                    "couple": f"{event.bride_name} & {event.groom_name}",
                    "date": event.date,
                    "location": event.location,
                    "is_password_protected": True,
                    "error": "Password required to view this album."
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Gather Approved media
        uploads = event.uploads.filter(is_approved=True).order_by('-created_at')
        wishes = event.wishes.filter(is_approved=True).order_by('-created_at')
        
        upload_serializer = GuestUploadSerializer(uploads, many=True)
        wish_serializer = WishSerializer(wishes, many=True)
        
        return Response({
            "id": event.id,
            "name": event.name,
            "slug": event.slug,
            "bride_name": event.bride_name,
            "groom_name": event.groom_name,
            "date": event.date,
            "location": event.location,
            "cover_photo": event.cover_photo.url if event.cover_photo else None,
            "is_password_protected": event.is_password_protected,
            "is_public": event.is_public,
            "watermark_enabled": event.watermark_enabled,
            "qr_theme": event.qr_theme,
            "uploads": upload_serializer.data if event.is_public else [],
            "wishes": wish_serializer.data if event.is_public else []
        }, status=status.HTTP_200_OK)


# ==========================================
# 5. GUEST UPLOADS (VALIDATION & RATE LIMITS)
# ==========================================

class GuestUploadView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # 1. Basic math Captcha spam validation
        captcha_q = request.data.get('captcha_q')
        captcha_a = request.data.get('captcha_a')
        
        if not captcha_q or not captcha_a:
            return Response({"error": "Spam protection CAPTCHA details are required."}, status=400)
            
        # Parse simple pattern (e.g. "8 + 4" or "9 - 2")
        match = re.match(r'^\s*(\d+)\s*([\+\-\*])\s*(\d+)\s*$', captcha_q)
        if not match:
            return Response({"error": "Invalid CAPTCHA format."}, status=400)
            
        num1, op, num2 = int(match.group(1)), match.group(2), int(match.group(3))
        correct_answer = 0
        if op == '+': correct_answer = num1 + num2
        elif op == '-': correct_answer = num1 - num2
        elif op == '*': correct_answer = num1 * num2
        
        try:
            if int(captcha_a) != correct_answer:
                return Response({"error": "Incorrect CAPTCHA answer. Please solve correctly."}, status=400)
        except ValueError:
            return Response({"error": "CAPTCHA answer must be a number."}, status=400)

        event_id = request.data.get('event')
        event = get_object_or_404(Event, id=event_id)
        
        # Check Expiry
        if event.is_expired:
            return Response({"error": "Uploads closed. This event has expired."}, status=403)

        guest_ip = request.META.get('REMOTE_ADDR')
        guest_mobile = request.data.get('guest_mobile', '').strip()
        guest_name = request.data.get('guest_name', '').strip()
        
        # 2. Rate-limiting check: Max 10 uploads per IP/Mobile in the last hour
        one_hour_ago = timezone.now() - timedelta(hours=1)
        
        ip_upload_count = GuestUpload.objects.filter(
            event=event,
            guest_ip=guest_ip,
            created_at__gte=one_hour_ago
        ).count()
        
        mobile_upload_count = 0
        if guest_mobile:
            mobile_upload_count = GuestUpload.objects.filter(
                event=event,
                guest_mobile=guest_mobile,
                created_at__gte=one_hour_ago
            ).count()
            
        if ip_upload_count >= 10 or mobile_upload_count >= 10:
            return Response({
                "error": "Hourly upload limit reached (Max 10 files per person per hour) to prevent spam. Please try again later."
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # 3. File validations (via Serializer)
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded."}, status=400)
            
        file_type = 'photo'
        if file_obj.content_type.startswith('video/'):
            file_type = 'video'
            
        # Build upload model details
        data = {
            'event': event.id,
            'guest_name': guest_name or 'Anonymous Guest',
            'guest_mobile': guest_mobile
        }
        
        serializer = GuestUploadSerializer(data=data)
        if serializer.is_valid():
            # Inject un-serialized properties
            upload = serializer.save(
                file=file_obj,
                file_type=file_type,
                file_size_bytes=file_obj.size,
                guest_ip=guest_ip,
                is_approved=False # Requires host approval
            )
            
            # Check storage limits
            storage_used = GuestUpload.objects.filter(event__user=event.user).aggregate(Sum('file_size_bytes'))['file_size_bytes__sum'] or 0
            limit_bytes = (event.package.storage_limit_gb if event.package else 2) * 1024 * 1024 * 1024
            
            if storage_used > limit_bytes:
                # Delete newly created file to release space
                upload.delete()
                return Response({"error": "Event storage limit exceeded. The host needs to upgrade their package plan."}, status=403)
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GuestWishView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Math Captcha verification
        captcha_q = request.data.get('captcha_q')
        captcha_a = request.data.get('captcha_a')
        
        if not captcha_q or not captcha_a:
            return Response({"error": "CAPTCHA required."}, status=400)
            
        match = re.match(r'^\s*(\d+)\s*([\+\-\*])\s*(\d+)\s*$', captcha_q)
        if not match:
            return Response({"error": "CAPTCHA format error."}, status=400)
            
        n1, op, n2 = int(match.group(1)), match.group(2), int(match.group(3))
        ans = n1 + n2 if op == '+' else (n1 - n2 if op == '-' else n1 * n2)
        
        if int(captcha_a) != ans:
            return Response({"error": "Incorrect CAPTCHA solution."}, status=400)

        event_id = request.data.get('event')
        event = get_object_or_404(Event, id=event_id)
        
        if event.is_expired:
            return Response({"error": "Uploads closed. This event has expired."}, status=403)

        serializer = WishSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                is_approved=False # Host needs to approve
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# 6. HOST ALBUM MANAGEMENT & ZIP DOWNLOADS
# ==========================================

class HostAlbumView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        if event.user != request.user and request.user.role != 'admin':
            return Response({"error": "Unauthorized access to this event."}, status=403)
            
        uploads = event.uploads.all().order_by('-created_at')
        wishes = event.wishes.all().order_by('-created_at')
        
        upload_serializer = GuestUploadSerializer(uploads, many=True)
        wish_serializer = WishSerializer(wishes, many=True)
        
        return Response({
            "uploads": upload_serializer.data,
            "wishes": wish_serializer.data
        })


class ApproveRejectMediaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, item_type, item_id, action_type):
        """Action type can be 'approve' or 'reject'."""
        if item_type == 'media':
            item = get_object_or_404(GuestUpload, id=item_id)
        elif item_type == 'wish':
            item = get_object_or_404(Wish, id=item_id)
        else:
            return Response({"error": "Invalid item type."}, status=400)
            
        # Verify ownership
        if item.event.user != request.user and request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
            
        if action_type == 'approve':
            item.is_approved = True
            item.save()
        elif action_type == 'reject':
            item.is_approved = False
            item.save()
        else:
            return Response({"error": "Invalid action. Use 'approve' or 'reject'."}, status=400)
            
        return Response({"success": True, "status": "approved" if item.is_approved else "pending/rejected"})


class DeleteMediaView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_type, item_id):
        if item_type == 'media':
            item = get_object_or_404(GuestUpload, id=item_id)
            # Delete file from local media path
            if item.file:
                if os.path.exists(item.file.path):
                    os.remove(item.file.path)
        elif item_type == 'wish':
            item = get_object_or_404(Wish, id=item_id)
        else:
            return Response({"error": "Invalid item type."}, status=400)
            
        if item.event.user != request.user and request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
            
        item.delete()
        return Response({"success": True})


class DownloadAlbumZIPView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        if event.user != request.user and request.user.role != 'admin':
            return Response({"error": "Unauthorized access to this event."}, status=403)
            
        # Get all approved media
        uploads = event.uploads.filter(is_approved=True)
        if not uploads.exists():
            return Response({"error": "No approved media to export inside this wedding album."}, status=400)
            
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for upload in uploads:
                if upload.file and os.path.exists(upload.file.path):
                    # Add to zip using original file extension
                    filename = os.path.basename(upload.file.name)
                    zip_file.write(upload.file.path, filename)
                    
        zip_buffer.seek(0)
        response = FileResponse(zip_buffer, as_attachment=True, filename=f"{event.slug}_wedding_memories.zip")
        return response


# ==========================================
# 7. RAZORPAY PAYMENT MOCK & WEBHOOKS
# ==========================================

class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        package_id = request.data.get('package_id')
        event_id = request.data.get('event_id')
        
        package = get_object_or_404(Package, id=package_id)
        event = get_object_or_404(Event, id=event_id) if event_id else None
        
        amount_paise = int(package.price_in_inr * 100)
        
        # Test Mode
        if settings.RAZORPAY_TEST_MODE:
            mock_order_id = f"order_mock_{random.randint(100000, 999999)}"
            return Response({
                "order_id": mock_order_id,
                "amount": package.price_in_inr,
                "key_id": settings.RAZORPAY_KEY_ID,
                "currency": "INR",
                "test_mode": True
            })
            
        # Live razorpay client integration
        if not razorpay:
            return Response({"error": "razorpay SDK not installed on server backend."}, status=500)
            
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            payment_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"rcpt_{event.slug if event else 'user'}_{random.randint(1000, 9999)}",
                "payment_capture": 1
            }
            order = client.order.create(data=payment_data)
            return Response({
                "order_id": order["id"],
                "amount": package.price_in_inr,
                "key_id": settings.RAZORPAY_KEY_ID,
                "currency": "INR",
                "test_mode": False
            })
        except Exception as e:
            return Response({"error": f"Failed to connect to Razorpay payments gateway: {str(e)}"}, status=500)


class VerifyRazorpayPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature')
        package_id = request.data.get('package_id')
        event_id = request.data.get('event_id')
        
        # Billing details
        billing_name = request.data.get('billing_name', request.user.username)
        billing_email = request.data.get('billing_email', request.user.email)
        billing_phone = request.data.get('billing_phone', getattr(request.user, 'phone', ''))
        
        package = get_object_or_404(Package, id=package_id)
        event = get_object_or_404(Event, id=event_id)
        
        success = False
        mode = 'test'
        
        if settings.RAZORPAY_TEST_MODE and order_id.startswith('order_mock_'):
            success = True
            mode = 'mock'
        else:
            if not razorpay:
                return Response({"error": "razorpay SDK not installed."}, status=500)
            try:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                params_dict = {
                    'razorpay_order_id': order_id,
                    'razorpay_payment_id': payment_id,
                    'razorpay_signature': signature
                }
                client.utility.verify_payment_signature(params_dict)
                success = True
                mode = 'live'
            except Exception:
                success = False

        if success:
            # Activate and extend package plan
            event.package = package
            event.expiry_date = date.today() + timedelta(days=package.duration_days)
            event.save()
            
            # Generate unique invoice format: INV-YEAR-SERIAL
            invoice_serial = random.randint(10000, 99999)
            invoice_num = f"INV-{datetime.now().year}-{invoice_serial}"
            
            payment = Payment.objects.create(
                user=request.user,
                event=event,
                package=package,
                razorpay_order_id=order_id,
                razorpay_payment_id=payment_id or f"pay_mock_{random.randint(100000, 999999)}",
                razorpay_signature=signature or "sig_mock_123456",
                amount=package.price_in_inr,
                status='success',
                billing_name=billing_name,
                billing_email=billing_email,
                billing_phone=billing_phone,
                invoice_number=invoice_num,
                razorpay_mode=mode
            )
            
            return Response({
                "message": "Payment verified successfully. Package activated!",
                "payment_id": payment.id,
                "invoice_number": invoice_num
            })
            
        return Response({"error": "Payment signature verification failed."}, status=400)


# ==========================================
# 8. INVOICE GENERATOR VIEW (PDF)
# ==========================================

class DownloadInvoicePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id)
        if payment.user != request.user and request.user.role != 'admin':
            return Response({"error": "Access denied."}, status=403)
            
        if not SimpleDocTemplate:
            return HttpResponse("ReportLab library not installed on backend.", status=500)
            
        # Compile PDF invoice inside a buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        
        styles = getSampleStyleSheet()
        # Title Styling
        title_style = ParagraphStyle(
            'InvoiceTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            textColor=colors.HexColor('#7B1B2A'), # Wedding Maroon
            spaceAfter=15
        )
        
        normal_style = styles['Normal']
        
        story.append(Paragraph("SHAADI QR INVOICE", title_style))
        story.append(Spacer(1, 10))
        
        # Details Grid
        details_data = [
            [Paragraph(f"<b>Invoice Number:</b> {payment.invoice_number}", normal_style), Paragraph(f"<b>Date:</b> {payment.created_at.strftime('%d-%b-%Y')}", normal_style)],
            [Paragraph(f"<b>Host / Client:</b> {payment.billing_name}", normal_style), Paragraph(f"<b>Email:</b> {payment.billing_email}", normal_style)],
            [Paragraph(f"<b>Event Slug:</b> {payment.event.slug if payment.event else 'N/A'}", normal_style), Paragraph(f"<b>Phone:</b> {payment.billing_phone}", normal_style)],
            [Paragraph(f"<b>Payment Mode:</b> {payment.razorpay_mode.upper()}", normal_style), Paragraph(f"<b>Order ID:</b> {payment.razorpay_order_id}", normal_style)]
        ]
        
        t1 = Table(details_data, colWidths=[260, 260])
        t1.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t1)
        story.append(Spacer(1, 20))
        
        # Line Items table
        items_data = [
            ["Description", "Qty", "Price (INR)", "Amount (INR)"],
            [f"Shaadi QR package upgrade: {payment.package.name} Plan\nEvent: {payment.event.name if payment.event else 'N/A'}", "1", f"Rs. {payment.amount}", f"Rs. {payment.amount}"],
            ["", "", "Total Paid:", f"Rs. {payment.amount}"]
        ]
        t2 = Table(items_data, colWidths=[240, 60, 110, 110])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#7B1B2A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-2), 0.5, colors.grey),
            ('LINEABOVE', (2, -1), (3, -1), 1, colors.HexColor('#7B1B2A')),
            ('FONTNAME', (2, -1), (3, -1), 'Helvetica-Bold'),
        ]))
        story.append(t2)
        
        story.append(Spacer(1, 40))
        story.append(Paragraph("Thank you for choosing Shaadi QR to preserve your wedding moments! Blessings to the couple.", styles['Italic']))
        
        doc.build(story)
        
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"invoice_{payment.invoice_number}.pdf")


# ==========================================
# 9. ADMIN PANEL & ANALYTICS VIEWS
# ==========================================

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Admin checks
        if request.user.role != 'admin':
            return Response({"error": "Admin permission required."}, status=403)
            
        total_hosts = User.objects.filter(role='host').count()
        total_events = Event.objects.count()
        total_uploads = GuestUpload.objects.count()
        total_wishes = Wish.objects.count()
        
        # Calculate total storage size
        total_storage_bytes = GuestUpload.objects.aggregate(Sum('file_size_bytes'))['file_size_bytes__sum'] or 0
        total_storage_gb = round(total_storage_bytes / (1024 * 1024 * 1024), 2)
        
        # Revenue stats
        total_revenue = Payment.objects.filter(status='success').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Contacts
        leads_count = ContactLead.objects.count()
        
        # Packages breakdown
        packages = Package.objects.all()
        package_breakdown = {}
        for p in packages:
            package_breakdown[p.name] = Event.objects.filter(package=p).count()
            
        return Response({
            "total_hosts": total_hosts,
            "total_events": total_events,
            "total_uploads": total_uploads,
            "total_wishes": total_wishes,
            "total_storage_gb": total_storage_gb,
            "total_revenue": total_revenue,
            "leads_count": leads_count,
            "package_breakdown": package_breakdown
        })


class AdminFilterPanelListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Admin permission required."}, status=403)
            
        payment_status = request.query_params.get('payment_status') # success, pending, failed
        event_status = request.query_params.get('event_status') # active, expired
        plan_id = request.query_params.get('plan_id')
        
        events = Event.objects.all()
        payments = Payment.objects.all()
        leads = ContactLead.objects.all().order_by('-created_at')
        
        # Apply filters to events
        if event_status == 'active':
            events = [e for e in events if not e.is_expired]
        elif event_status == 'expired':
            events = [e for e in events if e.is_expired]
            
        if plan_id:
            events = [e for e in events if e.package_id == int(plan_id)]
            
        # Apply filters to payments
        if payment_status:
            payments = payments.filter(status=payment_status)
            
        event_serializer = EventSerializer(events, many=True)
        payment_serializer = PaymentSerializer(payments, many=True)
        lead_serializer = ContactLeadSerializer(leads, many=True)
        
        return Response({
            "events": event_serializer.data,
            "payments": payment_serializer.data,
            "leads": lead_serializer.data
        })


# ==========================================
# 10. HOST WORKSPACE ANALYTICS
# ==========================================

class HostAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        if event.user != request.user and request.user.role != 'admin':
            return Response({"error": "Unauthorized access."}, status=403)
            
        # Count stats for specific event
        uploads_count = event.uploads.count()
        photos_count = event.uploads.filter(file_type='photo').count()
        videos_count = event.uploads.filter(file_type='video').count()
        wishes_count = event.wishes.count()
        
        # Storage usage gauge details
        storage_limit_gb = event.package.storage_limit_gb if event.package else 2
        storage_limit_bytes = storage_limit_gb * 1024 * 1024 * 1024
        
        storage_used_bytes = event.uploads.aggregate(Sum('file_size_bytes'))['file_size_bytes__sum'] or 0
        storage_used_gb = round(storage_used_bytes / (1024 * 1024 * 1024), 3)
        storage_percentage = round((storage_used_bytes / storage_limit_bytes) * 100, 1) if storage_limit_bytes else 0
        
        # Guest counts (count unique guest mobiles or IPs)
        guest_ips = event.uploads.values_list('guest_ip', flat=True).distinct()
        guest_mobiles = event.uploads.values_list('guest_mobile', flat=True).distinct()
        unique_guests = len(set(list(guest_ips) + list(guest_mobiles)))
        
        return Response({
            "uploads_count": uploads_count,
            "photos_count": photos_count,
            "videos_count": videos_count,
            "wishes_count": wishes_count,
            "unique_guests": max(unique_guests, wishes_count),
            "storage_used_gb": storage_used_gb,
            "storage_limit_gb": storage_limit_gb,
            "storage_percentage": min(storage_percentage, 100.0)
        })


# ==========================================
# 11. GENERAL PUBLIC LEADS (CONTACT FORM)
# ==========================================

class CreateLeadView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactLeadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Lead submitted successfully. We'll get back to you shortly!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

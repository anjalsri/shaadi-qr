from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import date, timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User, Package, Event, GuestUpload, Wish
from django.core.files.uploadedfile import SimpleUploadedFile

class ShaadiQRAPITests(APITestCase):
    def setUp(self):
        # Create a Package
        self.package = Package.objects.create(
            name='Basic',
            price_in_inr=2999.00,
            storage_limit_gb=2,
            duration_days=30,
            multi_event=False,
            allow_zip=False,
            custom_design=False
        )
        
        # Create a Host User
        self.host_user = User.objects.create_user(
            username='host_test',
            email='host@test.com',
            phone='9876543210',
            role='host',
            is_verified=True
        )

        # Create an Event
        self.event = Event.objects.create(
            user=self.host_user,
            name='Test Wedding',
            slug='test-wedding',
            bride_name='Jane',
            groom_name='John',
            date=date.today() + timedelta(days=10),
            location='Delhi',
            package=self.package,
            expiry_date=date.today() + timedelta(days=30)
        )

    def test_client_registration_and_otp(self):
        url = reverse('auth_register')
        data = {
            'username': 'new_host',
            'email': 'new_host@gmail.com',
            'phone': '9876543211',
            'password': 'testpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('email', response.data)
        
        # Verify the user is inactive and has OTP
        user = User.objects.get(email='new_host@gmail.com')
        self.assertFalse(user.is_verified)
        self.assertFalse(user.is_active)
        self.assertIsNotNone(user.verification_otp)

    def test_client_otp_verification(self):
        # Register user
        user = User.objects.create_user(
            username='otp_user',
            email='otp@gmail.com',
            phone='9876543212',
            password='testpassword123',
            is_active=False
        )
        user.verification_otp = '123456'
        user.otp_created_at = timezone.now()
        user.save()

        url = reverse('auth_verify_otp')
        
        # Submit wrong OTP
        response = self.client.post(url, {'email': 'otp@gmail.com', 'otp': '000000'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Submit correct OTP
        response = self.client.post(url, {'email': 'otp@gmail.com', 'otp': '123456'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # User should now be active
        user.refresh_from_db()
        self.assertTrue(user.is_verified)
        self.assertTrue(user.is_active)

    def test_guest_captcha_rejection(self):
        url = reverse('guest_wish')
        data = {
            'event': self.event.id,
            'guest_name': 'Guest Sender',
            'message': 'Happy Married Life!',
            'captcha_q': '5 + 4',
            'captcha_a': '99' # Incorrect CAPTCHA answer
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Incorrect CAPTCHA solution.')

    def test_guest_correct_captcha_wish(self):
        url = reverse('guest_wish')
        data = {
            'event': self.event.id,
            'guest_name': 'Guest Sender',
            'message': 'Congratulations guys!',
            'captcha_q': '3 * 4',
            'captcha_a': '12' # Correct CAPTCHA
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Wish should be created in DB (is_approved=False)
        wish = Wish.objects.get(guest_name='Guest Sender')
        self.assertFalse(wish.is_approved)

    def test_guest_upload_size_validation(self):
        url = reverse('guest_upload')
        
        # Create a massive mock text file pretend as image
        huge_file = SimpleUploadedFile(
            "huge_photo.jpg", 
            b"x" * (12 * 1024 * 1024), # 12 Megabytes (Max photo limit is 10MB)
            content_type="image/jpeg"
        )
        
        data = {
            'event': self.event.id,
            'guest_name': 'Big Upload Guest',
            'guest_mobile': '9876543210',
            'file': huge_file,
            'captcha_q': '6 + 2',
            'captcha_a': '8'
        }
        
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('file', response.data)
        self.assertIn('Photos cannot exceed 10 MB', str(response.data['file']))

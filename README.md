# Shaadi QR - Wedding Memory QR Platform (India)

[![Deploy to Render](https://render.com/images/deploy-to-render.svg)](https://render.com/deploy?repo=https://github.com/anjalsri/shaadi-qr)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/anjalsri/shaadi-qr&root-directory=frontend)

🚀 **Live Demo (GitHub Pages)**: [https://anjalsri.github.io/shaadi-qr/](https://anjalsri.github.io/shaadi-qr/)

Shaadi QR is an Indian-themed web application designed to collect wedding photos, videos, and blessings from wedding guests instantly through custom-styled QR codes. Guests can upload media files (photos & videos) and blessings without downloading any mobile app or going through a login form.

The platform includes client dashboards with interactive QR customization, ZIP album exports, PDF payment invoice generation, dynamic analytics, contact logs, spam protections (CAPTCHA), and superuser consoles.

---

## Technical Architecture & Stack
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Django + Django REST Framework (DRF)
- **Database**: SQLite (Local Dev) / PostgreSQL (Production)
- **Authentication**: JSON Web Tokens (Simple JWT)
- **QR Generation**: Python `qrcode` + `Pillow` library
- **PDF Invoice**: Python `reportlab` library
- **Payments Gateway**: Razorpay Payments API integration
- **File Storage**: Local filesystem (Dev) / Cloudinary or AWS S3 (Production settings provided)

---

## Getting Started: Local Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

---

### Part 1: Backend Setup (Django)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   *Note: By default, `MOCK_OTP=True` and `RAZORPAY_TEST_MODE=True` are enabled. This skips SMTP configuration and utilizes local test modes for checkouts.*

4. **Run Migrations**:
   Prepare your database schema:
   ```bash
   python manage.py makemigrations api
   python manage.py migrate
   ```

5. **Seed Database**:
   Prepopulate pricing plans (Basic, Premium, Luxury), a mock host user, a sample event, and wishes:
   ```bash
   python manage.py seed_db
   ```
   *Seeded credentials created:*
   - **Superuser/Admin**: `admin` / `admin123`
   - **Sample Host User**: `arjun` / `arjun123`
   - **Sample Event Slug**: `priya-arjun-wedding`

6. **Start Development Server**:
   ```bash
   python manage.py runserver
   ```
   The backend API will run on `http://127.0.0.1:8000`.

---

### Part 2: Frontend Setup (React + Vite)

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Node modules**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The frontend application will boot on `http://localhost:5173`. Open this URL in your web browser.

---

## Database Schema (API App Models)

### `User` (extends `AbstractUser`)
- `role`: Choices (`admin`, `host`)
- `phone`: Character field (max 15 chars)
- `is_verified`: Boolean (activation flag)
- `verification_otp`: Char field (6 digits OTP storage)
- `otp_created_at`: DateTime field (for 10 min expiry)

### `Package`
- `name`: Plan category name (Basic, Premium, Luxury)
- `price_in_inr`: Decimal (e.g. 2999.00)
- `storage_limit_gb`: Integer (2, 10, 50 GB)
- `duration_days`: Integer (30, 90, 365 days)
- `multi_event`: Boolean (allow multiple event links)
- `allow_zip`: Boolean
- `custom_design`: Boolean

### `Event`
- `user`: Foreign key pointing to `User`
- `name`: Character field (max 100)
- `slug`: Unique slug (e.g., `priya-arjun-wedding`)
- `bride_name`: Character field
- `groom_name`: Character field
- `date`: Date field
- `location`: Character field
- `cover_photo`: Image field (stores path)
- `is_password_protected`: Boolean
- `password`: Hashed / plain passcode string
- `is_public`: Boolean (controls public gallery visibility)
- `watermark_enabled`: Boolean
- `expiry_date`: Date (set automatically by plan)
- `qr_theme`: JSON string (color hexes, layout settings)
- `couple_custom_name`: Custom label overlay for QR banner
- `package`: Foreign key to `Package`

### `GuestUpload`
- `event`: Foreign key to `Event`
- `file`: Media File field (Photos/Videos)
- `file_type`: Choices (`photo`, `video`)
- `file_size_bytes`: Large Integer
- `guest_name`: Character field
- `guest_ip`: Client IP Address
- `guest_mobile`: Guest mobile number
- `is_approved`: Boolean (moderator queue flag)
- `created_at`: DateTime field

### `Wish`
- `event`: Foreign key to `Event`
- `guest_name`: Character field
- `message`: Text area blessings
- `is_approved`: Boolean
- `created_at`: DateTime field

### `Payment`
- `user`: Foreign key to `User`
- `event`: Foreign key to `Event`
- `package`: Foreign key to `Package`
- `razorpay_order_id`: String
- `razorpay_payment_id`: String
- `razorpay_signature`: String
- `amount`: Decimal
- `status`: Choices (`pending`, `success`, `failed`)
- `billing_name`, `billing_email`, `billing_phone`: Billing fields
- `invoice_number`: Unique invoice string
- `razorpay_mode`: String (test / live)
- `created_at`, `updated_at`: DateTime fields

### `ContactLead`
- `name`, `email`, `message`: String/Text fields
- `created_at`: DateTime field

---

## API Endpoints Documentation

### Authentication
- `POST /api/auth/register/` - Register new client. Generates OTP.
- `POST /api/auth/verify-otp/` - Submit OTP code to activate account.
- `POST /api/auth/login/` - Login with credentials. Returns JWT.
- `POST /api/auth/forgot-password/` - Trigger password reset OTP code email.
- `POST /api/auth/reset-password/` - Reset passcode using OTP verify code.

### Host Event Actions
- `GET /api/events/` - List all events created by host.
- `POST /api/events/` - Create a new event.
- `PUT /api/events/<id>/` - Update event parameters.
- `DELETE /api/events/<id>/` - Delete wedding event.
- `GET /api/events/check-slug/?slug=<slug>` - Checks if a custom link slug is available.
- `GET /api/events/<id>/qr-custom/?fg=<hex>&bg=<hex>&label=<text>` - Generates customized QR image.

### Guest Interactions (No Auth Required)
- `GET /api/events/slug/<slug>/` - Retrieve public details (requires `?password=` if passcode locked).
- `POST /api/guest/upload/` - Accepts guest media file + IP/mobile validations.
- `POST /api/guest/wish/` - Accepts guest text blessings + captcha challenge checks.

### Moderation & Management
- `GET /api/events/<event_id>/album/` - Fetch all uploads/wishes for host workspace.
- `GET /api/events/<event_id>/analytics/` - Returns upload metrics & storage limits.
- `POST /api/items/<item_type>/<item_id>/<action_type>/` - Approve or reject guest upload (`media` / `wish`).
- `DELETE /api/items/<item_type>/<item_id>/delete/` - Delete memory upload entry.
- `GET /api/events/<event_id>/download-zip/` - Download ZIP folder.

### Payments & Invoicing
- `POST /api/payments/create-order/` - Starts Razorpay checkout order.
- `POST /api/payments/verify-payment/` - Submits order hashes, updates plan, generates PDF invoice.
- `GET /api/payments/<payment_id>/invoice/` - Streams ReportLab PDF invoice file.

### Admin Dashboard (Staff Only)
- `GET /api/admin/dashboard-stats/` - Quick metrics counts.
- `GET /api/admin/filters-list/` - List entries filtered by status/plans.

---

## Production Deployment Guide

### Backend: Render/Railway (Django + PostgreSQL)
1. Set up a PostgreSQL database on Render or Railway.
2. Add a `build.sh` script in the root directory:
   ```bash
   #!/usr/bin/env bash
   exit on error
   set -o errexit
   pip install -r requirements.txt
   python manage.py collectstatic --no-input
   python manage.py migrate
   ```
3. Set environment variables on the hosting platform:
   - `SECRET_KEY`
   - `DEBUG=False`
   - `DATABASE_URL` (connecting to your cloud database)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_TEST_MODE=False` (Live mode)
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS=True`
   - `MOCK_OTP=False`
4. Use a Gunicorn server command to spin up settings:
   ```bash
   gunicorn shaadi_qr.wsgi:application
   ```

### Frontend: Vercel (React + Vite)
1. Connect your git repository to Vercel.
2. Select Framework Preset as **Vite**.
3. Configure the Root Directory as `frontend`.
4. Deploy the application. API requests are dynamically proxied using relative URLs or can be hardcoded to the production backend API URL in `frontend/src/api.js`.

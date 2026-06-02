from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, VerifyOTPView, CustomTokenObtainPairView, ForgotPasswordView, ResetPasswordView,
    PackageViewSet, EventViewSet, PublicEventView, GuestUploadView, GuestWishView,
    HostAlbumView, ApproveRejectMediaView, DeleteMediaView, DownloadAlbumZIPView,
    CreateRazorpayOrderView, VerifyRazorpayPaymentView, DownloadInvoicePDFView,
    AdminDashboardStatsView, AdminFilterPanelListView, HostAnalyticsView, CreateLeadView
)

router = DefaultRouter()
router.register('packages', PackageViewSet, basename='package')
router.register('events', EventViewSet, basename='event')

urlpatterns = [
    # Router views (packages, events)
    path('', include(router.urls)),
    
    # User authentication
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='auth_verify_otp'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),
    
    # Public Event / Guest Views
    path('events/slug/<slug>/', PublicEventView.as_view(), name='public_event_detail'),
    path('guest/upload/', GuestUploadView.as_view(), name='guest_upload'),
    path('guest/wish/', GuestWishView.as_view(), name='guest_wish'),
    
    # Host Workspaces
    path('events/<int:event_id>/album/', HostAlbumView.as_view(), name='host_album'),
    path('events/<int:event_id>/analytics/', HostAnalyticsView.as_view(), name='host_analytics'),
    path('events/<int:event_id>/download-zip/', DownloadAlbumZIPView.as_view(), name='host_download_zip'),
    
    # Approvals & Deletion
    path('items/<str:item_type>/<int:item_id>/<str:action_type>/', ApproveRejectMediaView.as_view(), name='approve_reject_media'),
    path('items/<str:item_type>/<int:item_id>/delete/', DeleteMediaView.as_view(), name='delete_media'),
    
    # Payment Processing
    path('payments/create-order/', CreateRazorpayOrderView.as_view(), name='create_razorpay_order'),
    path('payments/verify-payment/', VerifyRazorpayPaymentView.as_view(), name='verify_razorpay_payment'),
    path('payments/<int:payment_id>/invoice/', DownloadInvoicePDFView.as_view(), name='download_invoice_pdf'),
    
    # Admin Consolidation Panel
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('admin/filters-list/', AdminFilterPanelListView.as_view(), name='admin_filters_list'),
    
    # Public Leads
    path('leads/create/', CreateLeadView.as_view(), name='create_lead'),
]

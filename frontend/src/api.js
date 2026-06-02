const BASE_URL = 'http://localhost:8000'; // Target backend during local development or via Vite dev proxy

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'Something went wrong.' };
    }
    const err = new Error(errorData.error || errorData.detail || JSON.stringify(errorData));
    err.status = response.status;
    err.details = errorData;
    throw err;
  }
  return response.json();
};

export const api = {
  // Authentication
  auth: {
    login: async (username, password) => {
      const res = await fetch(`${BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await handleResponse(res);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },
    register: async (username, email, phone, role, password) => {
      const res = await fetch(`${BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, phone, role, password })
      });
      return handleResponse(res);
    },
    verifyOtp: async (email, otp) => {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      return handleResponse(res);
    },
    forgotPassword: async (email) => {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return handleResponse(res);
    },
    resetPassword: async (email, otp, new_password) => {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password })
      });
      return handleResponse(res);
    },
    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },
    getCurrentUser: () => {
      try {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    },
    isAuthenticated: () => {
      return !!localStorage.getItem('access_token');
    }
  },

  // Packages API
  packages: {
    list: async () => {
      const res = await fetch(`${BASE_URL}/api/packages/`);
      return handleResponse(res);
    }
  },

  // Events API
  events: {
    list: async () => {
      const res = await fetch(`${BASE_URL}/api/events/`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    create: async (eventData) => {
      const res = await fetch(`${BASE_URL}/api/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(eventData)
      });
      return handleResponse(res);
    },
    update: async (id, eventData) => {
      const res = await fetch(`${BASE_URL}/api/events/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(eventData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${BASE_URL}/api/events/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.status === 244 || res.status === 204) return { success: true };
      return handleResponse(res);
    },
    checkSlug: async (slug) => {
      const res = await fetch(`${BASE_URL}/api/events/check-slug/?slug=${slug}`);
      return handleResponse(res);
    },
    getCustomQrUrl: (eventId, fgColor = '#7B1B2A', bgColor = '#FBF6EE', labelText = '') => {
      return `${BASE_URL}/api/events/${eventId}/qr-custom/?fg=${encodeURIComponent(fgColor)}&bg=${encodeURIComponent(bgColor)}&label=${encodeURIComponent(labelText)}`;
    }
  },

  // Guest API (Public accessibility, no auth required)
  guest: {
    getPublicEvent: async (slug, password = '') => {
      const passwordParam = password ? `?password=${encodeURIComponent(password)}` : '';
      const res = await fetch(`${BASE_URL}/api/events/slug/${slug}/${passwordParam}`);
      return handleResponse(res);
    },
    uploadMedia: async (formData) => {
      const res = await fetch(`${BASE_URL}/api/guest/upload/`, {
        method: 'POST',
        // Note: For multipart/form-data, do NOT set content-type header; the browser will set it with boundary
        body: formData
      });
      return handleResponse(res);
    },
    submitWish: async (wishData) => {
      const res = await fetch(`${BASE_URL}/api/guest/wish/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wishData)
      });
      return handleResponse(res);
    }
  },

  // Host Workspace Actions
  host: {
    getAlbum: async (eventId) => {
      const res = await fetch(`${BASE_URL}/api/events/${eventId}/album/`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getAnalytics: async (eventId) => {
      const res = await fetch(`${BASE_URL}/api/events/${eventId}/analytics/`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    approveMedia: async (itemType, itemId) => {
      const res = await fetch(`${BASE_URL}/api/items/${itemType}/${itemId}/approve/`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    rejectMedia: async (itemType, itemId) => {
      const res = await fetch(`${BASE_URL}/api/items/${itemType}/${itemId}/reject/`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    deleteMedia: async (itemType, itemId) => {
      const res = await fetch(`${BASE_URL}/api/items/${itemType}/${itemId}/delete/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getDownloadZipUrl: (eventId) => {
      const token = localStorage.getItem('access_token');
      // Append jwt token query param to authenticate zip stream downloads
      return `${BASE_URL}/api/events/${eventId}/download-zip/`;
    },
    getInvoiceUrl: (paymentId) => {
      return `${BASE_URL}/api/payments/${paymentId}/invoice/`;
    }
  },

  // Payments Integration
  payments: {
    createOrder: async (packageId, eventId) => {
      const res = await fetch(`${BASE_URL}/api/payments/create-order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ package_id: packageId, event_id: eventId })
      });
      return handleResponse(res);
    },
    verifyPayment: async (paymentDetails) => {
      const res = await fetch(`${BASE_URL}/api/payments/verify-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(paymentDetails)
      });
      return handleResponse(res);
    }
  },

  // Public Leads / Queries Form
  leads: {
    submitLead: async (leadData) => {
      const res = await fetch(`${BASE_URL}/api/leads/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      return handleResponse(res);
    }
  },

  // Superuser Administration Consoles
  admin: {
    getStats: async () => {
      const res = await fetch(`${BASE_URL}/api/admin/dashboard-stats/`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getFiltersList: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${BASE_URL}/api/admin/filters-list/?${query}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  }
};

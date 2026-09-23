import { getApiUrl } from '@/lib/api';
import { useAppStore } from '@/lib/store/useAppStore';

export const loginUser = async (email: string, password: string, role?: string) => {
  const bodyData: any = { email, password };
  if (role) {
    bodyData.role = role;
  }
  
  const res = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed. Please check your credentials.');
  }

  const data = await res.json();
  
  // Map backend TokenResponse to the structure expected by the frontend store/UI
  return {
    access_token: data.access_token,
    user: {
      id: data.user_id,
      role: data.role,
      email: email,
    },
    has_completed_profile: data.has_completed_profile ?? true,
    is_verified: data.is_verified ?? true,
  };
};

/**
 * Helper to make authenticated fetch requests.
 * Automatically injects the bearer token from the App Store.
 */
export const fetchAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAppStore.getState().token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // ensure JSON content-type if there is a body and it's not FormData
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let cleanUrl = url;
  if (cleanUrl.startsWith('/api/')) {
    cleanUrl = cleanUrl.substring(4);
  } else if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  const res = await fetch(getApiUrl(cleanUrl), {
    ...options,
    headers,
  });
  
  if (res.status === 401) {
    const isPublicPage = typeof window !== 'undefined' && 
      (window.location.pathname === '/' || 
       window.location.pathname === '/about' ||
       window.location.pathname === '/terms' ||
       window.location.pathname === '/privacy' ||
       window.location.pathname === '/companies' ||
       window.location.pathname.startsWith('/companies/'));

    if (!isPublicPage) {
      // Optional: auto-logout on 401
      useAppStore.getState().logout();
      if (typeof window !== 'undefined') {
        const isPelamar = window.location.pathname.startsWith('/applicant');
        const isAdmin = window.location.pathname.startsWith('/admin');
        const isCampus = window.location.pathname.startsWith('/campus');
        const isPerusahaan = window.location.pathname.startsWith('/jobs') || window.location.pathname.startsWith('/pipeline');
        
        if (isAdmin) {
          window.location.href = '/admin/login';
        } else if (isPelamar) {
          window.location.href = '/applicant/login';
        } else if (isCampus) {
          window.location.href = '/campus/login';
        } else if (isPerusahaan) {
          window.location.href = '/perusahaan/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
  }
  
  return res;
};

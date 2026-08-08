import { getBaseUrl } from '@/lib/api';

export const loginUser = async (email: string, password: string, role?: string) => {
  const bodyData: any = { email, password };
  if (role) {
    bodyData.role = role;
  }
  
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/auth/login`, {
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
  };
};

/**
 * Helper to make authenticated fetch requests.
 * Automatically injects the bearer token from the App Store.
 */
import { useAppStore } from '@/lib/store/useAppStore';

export const fetchAuth = async (url: string, options: RequestInit = {}) => {
  const token = useAppStore.getState().token;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // ensure JSON content-type if there is a body and it's not FormData
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const baseUrl = getBaseUrl();
  let cleanUrl = url;
  if (cleanUrl.startsWith('/api/')) {
    cleanUrl = cleanUrl.substring(4);
  } else if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  const res = await fetch(`${baseUrl}${cleanUrl}`, {
    ...options,
    headers,
  });
  
  if (res.status === 401) {
    // Optional: auto-logout on 401
    useAppStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }
  
  return res;
};

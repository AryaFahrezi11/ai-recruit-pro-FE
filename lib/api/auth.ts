export const loginUser = async (email: string, password: string) => {
  const res = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
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

  const res = await fetch(`http://localhost:8000${url}`, {
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

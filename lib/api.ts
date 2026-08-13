export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

const BASE_URL = getBaseUrl();

export interface ApiErrorResponse {
  detail?: string | Array<{ msg: string; loc: string[] }>;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('isPerusahaanLoggedIn');
    localStorage.removeItem('isPelamarLoggedIn');
    localStorage.removeItem('candidateCvData');
    localStorage.removeItem('candidateCvCreated');
  }
}

export function parseErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.data?.detail) {
    if (typeof error.data.detail === 'string') {
      return error.data.detail;
    }
    if (Array.isArray(error.data.detail)) {
      return error.data.detail.map((item: any) => item.msg || JSON.stringify(item)).join(', ');
    }
  }
  if (error?.message) return error.message;
  return 'Terjadi kesalahan pada server. Silakan coba lagi.';
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { isFormData?: boolean } = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type if not sending FormData
  if (!options.isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      removeAuthToken();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        const isPelamar = window.location.pathname.startsWith('/applicant');
        const isAdmin = window.location.pathname.startsWith('/admin');
        
        if (isAdmin) {
          window.location.href = '/admin/login';
        } else if (isPelamar) {
          window.location.href = '/applicant/login';
        } else {
          window.location.href = '/login';
        }
      }
    }

    let responseData: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        typeof responseData === 'object' && responseData?.detail
          ? typeof responseData.detail === 'string'
            ? responseData.detail
            : JSON.stringify(responseData.detail)
          : response.statusText || 'Request failed';
      throw new ApiError(errorMsg, response.status, responseData);
    }

    return responseData as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Gagal terhubung ke server', 0);
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      isFormData,
    });
  },

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
      isFormData,
    });
  },

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

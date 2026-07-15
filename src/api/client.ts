import axios, { AxiosError } from 'axios';
import { supabase } from '../lib/supabaseClient';
import { ApiError, ApiSuccess } from '../types/api';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
});

apiClient.interceptors.request.use(async (requestConfig) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

let isRefreshing = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosError['config'] & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          isRefreshing = false;
          if (!refreshError && data.session) {
            return apiClient(original);
          }
        } catch {
          isRefreshing = false;
        }
      }

      await supabase.auth.signOut();
      window.location.assign('/login');
    }

    const apiError: ApiError = error.response?.data
      ? (error.response.data as ApiError)
      : {
          success: false,
          error: { code: 'NETWORK_ERROR', message: error.message || 'Network error' },
        };

    return Promise.reject(apiError);
  }
);

function unwrap<T>(response: { data: ApiSuccess<T> | ApiError }): T {
  const body = response.data;
  if (!body.success) {
    throw body;
  }
  return body.data;
}

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiSuccess<T> | ApiError>(url, { params });
  return unwrap(response);
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<ApiSuccess<T> | ApiError>(url, body);
  return unwrap(response);
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<ApiSuccess<T> | ApiError>(url, body);
  return unwrap(response);
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiSuccess<T> | ApiError>(url);
  return unwrap(response);
}

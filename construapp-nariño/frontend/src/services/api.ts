import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

const ACCESS_KEY = 'construapp.accessToken';
const REFRESH_KEY = 'construapp.refreshToken';

/* ------------------------------------------------------ almacén de tokens --- */

export const tokenStore = {
  get access(): string | null {
    try {
      return localStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },
  get refresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  set(access: string, refresh?: string) {
    try {
      localStorage.setItem(ACCESS_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    } catch {
      /* modo incógnito / almacenamiento bloqueado */
    }
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* nada */
    }
  },
};

/* ------------------------------------------------------------ instancia --- */

export const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Se dispara cuando el refresh falla: el AuthContext lo usa para cerrar sesión. */
let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(cb: () => void) {
  onSessionExpired = cb;
}

// Refresh transparente: un solo intento por respuesta 401.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post('/api/auth/refresh', { refreshToken });
    tokenStore.set(data.token, data.refreshToken);
    return data.token as string;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const url = original?.url ?? '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      onSessionExpired?.();
    }
    return Promise.reject(error);
  }
);

/** Extrae un mensaje legible de un error de axios. */
export function apiErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { error?: string; details?: Record<string, string> } | undefined;
    if (data?.details) return Object.values(data.details).join(' · ');
    if (data?.error) return data.error;
    if (error.message) return error.message;
  }
  return fallback;
}

export default api;

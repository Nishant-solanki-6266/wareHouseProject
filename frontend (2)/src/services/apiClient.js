let authPromise = null;

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? '/api/v1'
  : 'http://127.0.0.1:5000/api/v1';

export const apiClient = {
  getToken() {
    return localStorage.getItem('kers_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('kers_token', token);
    } else {
      localStorage.removeItem('kers_token');
    }
  },

  isTokenExpired(token) {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      return Date.now() >= (payload.exp * 1000) - 15000;
    } catch {
      return true;
    }
  },

  async ensureToken() {
    let token = this.getToken();
    if (token && !this.isTokenExpired(token)) return token;

    if (!authPromise) {
      authPromise = (async () => {
        try {
          let email = 'elena.r@vicustoms.com';
          try {
            const saved = localStorage.getItem('kers_active_user');
            if (saved) {
              const u = JSON.parse(saved);
              if (u?.email) email = u.email;
            }
          } catch {}

          const loginUrl = typeof window !== 'undefined' && window.location.port === '5173'
            ? '/api/v1/auth/login'
            : 'http://127.0.0.1:5000/api/v1/auth/login';

          const res = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'Password123!' }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.data?.token) {
              this.setToken(data.data.token);
              return data.data.token;
            }
          }
        } catch (e) {
          console.warn('Auto auth error:', e.message);
        } finally {
          authPromise = null;
        }
        return null;
      })();
    }

    return authPromise;
  },

  async request(endpoint, options = {}, isRetry = false) {
    const isAuthOrHealth = endpoint.includes('/auth/login') || endpoint.includes('/health');
    let token = this.getToken();
    if (!token && !isAuthOrHealth) {
      token = await this.ensureToken();
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401 && !isRetry && !isAuthOrHealth) {
          this.setToken(null);
          const newToken = await this.ensureToken();
          if (newToken) {
            return this.request(endpoint, options, true);
          }
        }
        const errorMsg = data?.message || `HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.warn(`[API Client] Call to ${endpoint} failed:`, err.message);
      throw err;
    }
  },

  async checkHealth() {
    try {
      const target = typeof window !== 'undefined' && window.location.port === '5173'
        ? '/api/v1/health'
        : 'http://127.0.0.1:5000/health';
      const res = await fetch(target);
      return res.ok;
    } catch {
      return false;
    }
  },

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  patch(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  },

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

const API_BASE = 'http://127.0.0.1:5000/api/v1';

let isAuthenticating = false;

async function getOrFetchToken() {
  let token = localStorage.getItem('kers_jwt_token') || localStorage.getItem('kers_token');
  if (token) return token;

  if (isAuthenticating) return null;
  isAuthenticating = true;

  try {
    const activeUser = JSON.parse(localStorage.getItem('kers_active_user') || '{}');
    const email = activeUser.email || 'carlos.m@vicustoms.com';
    const password = 'Password123!';

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      const freshToken = data?.data?.token || data?.token;
      if (freshToken) {
        localStorage.setItem('kers_jwt_token', freshToken);
        localStorage.setItem('kers_token', freshToken);
        token = freshToken;
      }
    }
  } catch (err) {
    console.warn('Auto token fetch notice:', err.message);
  } finally {
    isAuthenticating = false;
  }

  return token;
}

export const apiClient = {
  getToken() {
    return localStorage.getItem('kers_jwt_token') || localStorage.getItem('kers_token') || null;
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('kers_jwt_token', token);
      localStorage.setItem('kers_token', token);
    } else {
      localStorage.removeItem('kers_jwt_token');
      localStorage.removeItem('kers_token');
    }
  },

  async fetchApi(endpoint, options = {}, isRetry = false) {
    const token = await getOrFetchToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const resUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      const response = await fetch(resUrl, {
        ...options,
        headers,
      });

      if (response.status === 401 && !isRetry) {
        localStorage.removeItem('kers_jwt_token');
        localStorage.removeItem('kers_token');
        const newToken = await getOrFetchToken();
        if (newToken) {
          return this.fetchApi(endpoint, options, true);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error ${response.status}`);
      }

      const resJson = await response.json();
      return resJson.data !== undefined ? resJson.data : resJson;
    } catch (err) {
      console.warn(`API call ${endpoint} notice:`, err.message);
      throw err;
    }
  },

  get(endpoint, params = {}) {
    let url = endpoint;
    if (params && typeof params === 'object' && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.fetchApi(url, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.fetchApi(endpoint, {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.fetchApi(endpoint, {
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  },

  patch(endpoint, body) {
    return this.fetchApi(endpoint, {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.fetchApi(endpoint, { method: 'DELETE' });
  }
};

export default apiClient;

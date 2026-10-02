/**
 * Central API Client for VI Customs Brokers & Logistics
 * Connects frontend React components to Fastify backend (http://127.0.0.1:5001/api/v1)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('kers_token') || null;
  }

  setToken(token) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('kers_token', token);
    } else {
      localStorage.removeItem('kers_token');
    }
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;

    const headers = this.getHeaders(options.headers);

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle empty responses
      if (response.status === 204) {
        return { success: true };
      }

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: response.ok, message: text };
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP Error ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;

        if (response.status === 401) {
          console.warn('[ApiClient] 401 Unauthorized - Session may have expired');
        } else if (response.status === 403) {
          console.warn('[ApiClient] 403 Forbidden - Insufficient permissions');
        }

        throw error;
      }

      return data;
    } catch (err) {
      // Network failure or fetch error
      if (!err.status) {
        console.error(`[ApiClient] Network or CORS failure calling ${url}:`, err.message);
      }
      throw err;
    }
  }

  get(endpoint, params = {}) {
    let url = endpoint;
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

    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body,
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

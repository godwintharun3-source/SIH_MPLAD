/**
 * API Service for MPLAD AI Risk & Anomaly Intelligence System
 */

const RAW_URL = import.meta.env.VITE_API_URL || '/api';
const API_BASE = RAW_URL.replace(/\/+$/, '');

async function fetchJson(endpoint, options = {}, retries = 2) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      if (!res.ok) {
        if ([502, 503, 504].includes(res.status) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      console.error(`API Error on ${url}:`, error);
      throw error;
    }
  }
}

export const api = {
  // System Health
  getHealth: () => fetchJson('/health'),

  // Dashboard
  getDashboardSummary: (params = {}) => {
    const query = new URLSearchParams();
    if (params.house && params.house !== 'All') query.append('house', params.house);
    if (params.state && params.state !== 'All') query.append('state', params.state);
    const qs = query.toString();
    return fetchJson(`/dashboard/summary${qs ? `?${qs}` : ''}`);
  },
  
  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        query.append(key, val);
      }
    });
    return fetchJson(`/projects?${query.toString()}`);
  },
  
  getHighRiskProjects: (limit = 50, params = {}) => {
    const query = new URLSearchParams({ limit });
    if (params.house && params.house !== 'All') query.append('house', params.house);
    if (params.state && params.state !== 'All') query.append('state', params.state);
    return fetchJson(`/projects/high-risk?${query.toString()}`);
  },
  getProjectDetail: (projectId) => fetchJson(`/projects/${projectId}`),
  getProjectSimilar: (projectId, limit = 5) => fetchJson(`/projects/${projectId}/similar?limit=${limit}`),
  getProjectTransactions: (projectId) => fetchJson(`/projects/${projectId}/transactions`),
  
  // Parliamentary Division Analytics
  getHouseAnalytics: (state = null) => {
    const query = state && state !== 'All' ? `?state=${encodeURIComponent(state)}` : '';
    return fetchJson(`/house/analytics${query}`);
  },

  // Anomalies
  getCostAnomalies: (limit = 50) => fetchJson(`/anomalies/cost?limit=${limit}`),
  getCompletionAnomalies: (limit = 50) => fetchJson(`/anomalies/completion?limit=${limit}`),
  getSectorAnomalies: (limit = 50) => fetchJson(`/anomalies/sector?limit=${limit}`),
  getDuplicateAnomalies: (limit = 50) => fetchJson(`/anomalies/duplicate?limit=${limit}`),
  getPaymentAnomalies: (limit = 50) => fetchJson(`/anomalies/payment?limit=${limit}`),
  
  // MPs and Constituencies
  getMps: (search = '', limit = 100, params = {}) => {
    const query = new URLSearchParams({ limit });
    if (search) query.append('search', search);
    if (params.house && params.house !== 'All') query.append('house', params.house);
    if (params.state && params.state !== 'All') query.append('state', params.state);
    return fetchJson(`/mps?${query.toString()}`);
  },
  getMpDetail: (mpName) => fetchJson(`/mps/${encodeURIComponent(mpName)}`),
  getConstituencies: (limit = 100) => fetchJson(`/constituencies?limit=${limit}`),
  getStateAnalytics: () => fetchJson('/analytics/states'),
  
  // Authentication & RBAC
  getStates: () => fetchJson('/auth/states'),
  login: (credentials) => fetchJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (formData) => fetchJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData)
  }),
  getMe: (token) => fetchJson('/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),
  getAdminNotifications: (token) => fetchJson('/auth/notifications', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }),

  // AI Query Assistant
  queryAI: (query, contextProjectId = null) => fetchJson('/ai/query', {
    method: 'POST',
    body: JSON.stringify({ query, context_project_id: contextProjectId })
  }),
  
  // Report Generation
  getProjectReport: (projectId) => fetchJson(`/reports/project/${projectId}`),
  
  // Recalculate Risk
  recalculateRisk: (projectId, weights) => fetchJson(`/analyze/recalculate?project_id=${projectId}`, {
    method: 'POST',
    body: JSON.stringify(weights)
  })
};

export default api;

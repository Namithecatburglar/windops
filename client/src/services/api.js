const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('windops_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `Request failed with status ${response.status}`;
    if (response.status === 401) {
      // If unauthorized, clean invalid token
      localStorage.removeItem('windops_token');
      localStorage.removeItem('windops_user');
      window.dispatchEvent(new Event('windops-auth-expired'));
    }
    throw new Error(message);
  }
  return response.json();
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getDemoUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return handleResponse(res);
  },

  // Turbines
  getTurbines: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/turbines${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getTurbineById: async (id) => {
    const res = await fetch(`${API_BASE}/turbines/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getTurbineSummary: async () => {
    const res = await fetch(`${API_BASE}/turbines/summary/kpi`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  updateTurbine: async (id, data) => {
    const res = await fetch(`${API_BASE}/turbines/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Maintenance
  getMaintenance: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/maintenance${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getMaintenanceSummary: async () => {
    const res = await fetch(`${API_BASE}/maintenance/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createMaintenance: async (data) => {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateMaintenance: async (id, data) => {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  addMaintenanceNote: async (id, text) => {
    const res = await fetch(`${API_BASE}/maintenance/${id}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  // Inspections
  getInspections: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/inspections${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getInspectionSummary: async () => {
    const res = await fetch(`${API_BASE}/inspections/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createInspection: async (data) => {
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateInspection: async (id, data) => {
    const res = await fetch(`${API_BASE}/inspections/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Weather
  getCurrentWeather: async () => {
    const res = await fetch(`${API_BASE}/weather/current`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getWeatherForecast: async () => {
    const res = await fetch(`${API_BASE}/weather/forecast`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Vessels
  getVessels: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/vessels${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  updateVessel: async (id, data) => {
    const res = await fetch(`${API_BASE}/vessels/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  assignTurbineToVessel: async (id, assignment) => {
    const res = await fetch(`${API_BASE}/vessels/${id}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignment),
    });
    return handleResponse(res);
  },

  // Performance
  getPerformance: async (timeframe = 'MONTH') => {
    const res = await fetch(`${API_BASE}/performance?timeframe=${timeframe}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Alerts
  getAlerts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/alerts${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getAlertSummary: async () => {
    const res = await fetch(`${API_BASE}/alerts/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  acknowledgeAlert: async (id) => {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  resolveAlert: async (id) => {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Reports
  getReports: async () => {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  generateReport: async (type) => {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type }),
    });
    return handleResponse(res);
  },
  downloadReportCSV: async (id, filename) => {
    const res = await fetch(`${API_BASE}/reports/${id}/download`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'windops_report.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },

  // Simulation
  triggerSimulationTick: async () => {
    const res = await fetch(`${API_BASE}/simulation/tick`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

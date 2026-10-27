/**
 * Centralized DC-Intelli API Client
 * Secure communication bridge between React frontend and Express/MongoDB backend.
 */

const API_BASE = (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) || '/api';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('dc_intelli_auth_token') ||
    sessionStorage.getItem('dc_intelli_auth_token')
  );
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody.message || errorBody.error || `HTTP error ${res.status}: ${res.statusText}`;
      throw new Error(message);
    }

    return await res.json();
  } catch (err: any) {
    // If backend is unreachable, throw so calling service can provide graceful fallback
    throw err;
  }
}

// 1. Device Service
export const deviceService = {
  getAll: (params?: Record<string, any>) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return request<any>(`/devices${query}`);
  },
  getById: (id: string) => request<any>(`/devices/${id}`),
  getRacks: (siteId: string = 'dc-va-01') => request<any>(`/devices/racks/all?siteId=${siteId}`),
};

// 2. Telemetry Service
export const telemetryService = {
  ingest: (packet: any) =>
    request<any>('/telemetry', {
      method: 'POST',
      body: JSON.stringify(packet),
    }),
  ingestBatch: (batch: any[]) =>
    request<any>('/telemetry/batch', {
      method: 'POST',
      body: JSON.stringify({ batch }),
    }),
  getHistory: (deviceId: string, metric?: string, limit: number = 60) => {
    const q = metric ? `?metric=${metric}&limit=${limit}` : `?limit=${limit}`;
    return request<any>(`/telemetry/history/${deviceId}${q}`);
  },
  getLive: (assetId: string) => request<any>(`/telemetry/live/${assetId}`),
  getAnomalies: () => request<any>('/telemetry/anomalies'),
  getQuality: () => request<any>('/telemetry/quality'),
  getPlatformHealth: () => request<any>('/telemetry/platform-health'),
};

// 3. Alert Service
export const alertService = {
  getAll: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<any>(`/alerts${q}`);
  },
  acknowledge: (id: string) =>
    request<any>(`/alerts/${id}/acknowledge`, {
      method: 'PATCH',
    }),
};

// 4. Incident Service
export const incidentService = {
  getAll: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<any>(`/incidents${q}`);
  },
  getById: (id: string) => request<any>(`/incidents/${id}`),
  updateStatus: (id: string, status: string) =>
    request<any>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// 5. Predictive Service
export const predictionService = {
  getAll: () => request<any>('/predictions'),
  getRecommendations: () => request<any>('/recommendations'),
};

// 6. Maintenance & Work Order Service
export const workOrderService = {
  getAll: () => request<any>('/work-orders'),
  create: (workOrder: any) =>
    request<any>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(workOrder),
    }),
  getAssets: () => request<any>('/assets'),
};

// 7. Topology & Site Service
export const topologyService = {
  getSites: () => request<any>('/sites'),
  getGraph: () => request<any>('/topology/graph'),
  getDependencies: () => request<any>('/dependencies'),
};

// 8. Simulation Service
export const simulationService = {
  getAll: () => request<any>('/simulations'),
  saveRun: (scenario: any) =>
    request<any>('/simulations', {
      method: 'POST',
      body: JSON.stringify(scenario),
    }),
  triggerIncident: (scenarioType: string) =>
    request<any>(`/simulator/incidents/${scenarioType}`, {
      method: 'POST',
    }),
};

// 9. Health & System
export const systemService = {
  getHealth: () => request<any>('/health'),
  getAuditLogs: () => request<any>('/audit-logs'),
};

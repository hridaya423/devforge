export interface Endpoint {
  id: number;
  url: string;
  name: string;
  status?: 'up' | 'down';
  responseTime?: number;
  statusCode?: number;
  error?: string;
  lastChecked?: string;
}

export interface PerformanceData {
  time: string;
  responseTime: number;
  status: 'up' | 'down';
}

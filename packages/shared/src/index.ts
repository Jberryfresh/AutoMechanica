export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  environment: string;
  timestamp: string;
}

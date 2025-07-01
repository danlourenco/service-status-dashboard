export interface ServiceConfig {
  name: string;
  description?: string;
  method?: string;
  timeout?: number;
  slowThreshold?: number;
  expectedStatus?: number[];
  headers?: Record<string, string>;
}

export interface EnvironmentConfig {
  [serviceName: string]: {
    url: string;
  };
}

export interface InstanceConfig {
  name: string;
  environments: {
    [envName: string]: {
      name: string;
      services: EnvironmentConfig;
    };
  };
}

export interface AppConfig {
  title?: string;
  description?: string;
  refreshInterval?: number;
}

export interface ConfigData {
  app: AppConfig;
  services: ServiceConfig[];
  instances: {
    [instanceKey: string]: InstanceConfig;
  };
}

export interface ServiceStatus {
  status: 'operational' | 'degraded' | 'outage' | 'unknown';
  responseTime: number;
  uptime: number;
  lastChecked: string;
  statusCode?: number;
  error?: string;
}

export type ServiceStatusMap = Record<string, Record<string, ServiceStatus>>; // [instance-env][serviceName]
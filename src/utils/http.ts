import type { ServiceConfig, ServiceStatus } from '../types';

export const checkService = async (service: ServiceConfig, url: string): Promise<ServiceStatus> => {
  const startTime = Date.now();
  const timeout = service.timeout || 5000;
  
  try {
    const response = await fetch(url, {
      method: service.method || 'GET',
      headers: service.headers || {},
      signal: AbortSignal.timeout(timeout)
    });
    
    const responseTime = Date.now() - startTime;
    const expectedStatuses = service.expectedStatus || [200];
    const isHealthy = expectedStatuses.includes(response.status);
    
    let status: ServiceStatus['status'] = 'operational';
    if (!isHealthy) {
      status = 'outage';
    } else if (responseTime > (service.slowThreshold || 2000)) {
      status = 'degraded';
    }
    
    return {
      status,
      responseTime,
      uptime: isHealthy ? 99.9 : 0,
      lastChecked: new Date().toLocaleTimeString(),
      statusCode: response.status
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'outage',
      responseTime,
      uptime: 0,
      lastChecked: new Date().toLocaleTimeString(),
      error: (error as Error).message
    };
  }
};
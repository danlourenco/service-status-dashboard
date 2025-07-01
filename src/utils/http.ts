import type { ServiceConfig, ServiceStatus } from '../types';

// Cache for storing last successful JSON responses by URL
const responseCache = new Map<string, any>();

// Export for testing
export const getProxyUrl = (originalUrl: string, isProduction = import.meta.env.PROD): string => {
  // Only proxy in development mode
  if (isProduction) {
    return originalUrl;
  }
  
  try {
    const url = new URL(originalUrl);
    // Convert to proxy URL: https://api.example.com/health -> /api/api.example.com/health
    return `/api/${url.host}${url.pathname}${url.search}`;
  } catch (e) {
    // If URL parsing fails, return original
    return originalUrl;
  }
};

export const checkService = async (service: ServiceConfig, url: string): Promise<ServiceStatus> => {
  const startTime = Date.now();
  const timeout = service.timeout || 5000;
  const proxyUrl = getProxyUrl(url);
  
  try {
    const response = await fetch(proxyUrl, {
      method: service.method || 'GET',
      headers: service.headers || {},
      signal: AbortSignal.timeout(timeout)
    });
    
    const responseTime = Date.now() - startTime;
    const expectedStatuses = service.expectedStatus || [200];
    const isHealthy = expectedStatuses.includes(response.status);
    
    // Debug logging in development
    if (!import.meta.env.PROD) {
      const contentType = response.headers.get('content-type');
      const hasCachedData = responseCache.has(url);
      console.log(`Service check for ${service.name}:`, {
        originalUrl: url,
        proxyUrl,
        status: response.status,
        statusText: response.statusText,
        isHealthy,
        contentType,
        hasCachedData,
        willShowResponseData: isHealthy && (
          (response.status === 200 && contentType?.includes('application/json')) ||
          (response.status === 304 && hasCachedData)
        )
      });
    }
    
    let status: ServiceStatus['status'] = 'operational';
    if (!isHealthy) {
      status = 'outage';
    } else if (responseTime > (service.slowThreshold || 2000)) {
      status = 'degraded';
    }
    
    // Try to capture JSON response data for successful responses
    let responseData;
    if (isHealthy) {
      if (response.status === 200) {
        // For 200 responses, try to get fresh JSON data
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
            // Cache the fresh response for future 304s
            responseCache.set(url, responseData);
          }
        } catch (e) {
          // If JSON parsing fails, ignore - don't fail the health check
        }
      } else if (response.status === 304) {
        // For 304 Not Modified, use cached response if available
        responseData = responseCache.get(url);
      }
    }
    
    return {
      status,
      responseTime,
      lastChecked: new Date().toLocaleTimeString(),
      statusCode: response.status,
      responseData
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'outage',
      responseTime,
      lastChecked: new Date().toLocaleTimeString(),
      error: (error as Error).message
    };
  }
};
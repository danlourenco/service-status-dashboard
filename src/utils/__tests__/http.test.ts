import { describe, it, expect, beforeEach, vi } from 'vitest';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { checkService } from '../http';
import type { ServiceConfig } from '../../types';

describe('checkService', () => {
  const baseService: ServiceConfig = {
    name: 'Test Service',
    description: 'A test service',
    timeout: 5000,
    expectedStatus: [200],
    headers: {}
  };

  beforeEach(() => {
    server.resetHandlers();
    // Mock production environment by default for existing tests
    vi.stubGlobal('import', {
      meta: {
        env: {
          PROD: true
        }
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns operational status for successful request within threshold', async () => {
    server.use(
      http.get('https://api.test.com/health', () => {
        return new HttpResponse(null, { status: 200 });
      })
    );

    const result = await checkService(baseService, 'https://api.test.com/health');

    expect(result.status).toBe('operational');
    expect(result.statusCode).toBe(200);
    expect(result.uptime).toBe(99.9);
    expect(result.responseTime).toBeGreaterThan(0);
    expect(result.responseTime).toBeLessThan(2000);
    expect(result.lastChecked).toBeTruthy();
  });

  it('returns degraded status for slow response', async () => {
    const slowService = { ...baseService, slowThreshold: 1000 };
    
    server.use(
      http.get('https://api.test.com/health', async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return new HttpResponse(null, { status: 200 });
      })
    );

    const result = await checkService(slowService, 'https://api.test.com/health');

    expect(result.status).toBe('degraded');
    expect(result.statusCode).toBe(200);
    expect(result.uptime).toBe(99.9);
    expect(result.responseTime).toBeGreaterThanOrEqual(1500);
  });

  it('returns outage status for unexpected status code', async () => {
    server.use(
      http.get('https://api.test.com/health', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const result = await checkService(baseService, 'https://api.test.com/health');

    expect(result.status).toBe('outage');
    expect(result.statusCode).toBe(500);
    expect(result.uptime).toBe(0);
    expect(result.responseTime).toBeGreaterThan(0);
  });

  it('accepts multiple expected status codes', async () => {
    const multiStatusService = {
      ...baseService,
      expectedStatus: [200, 201, 202]
    };

    server.use(
      http.get('https://api.test.com/health', () => {
        return new HttpResponse(null, { status: 201 });
      })
    );

    const result = await checkService(multiStatusService, 'https://api.test.com/health');

    expect(result.status).toBe('operational');
    expect(result.statusCode).toBe(201);
    expect(result.uptime).toBe(99.9);
  });

  it('handles network errors', async () => {
    server.use(
      http.get('https://api.test.com/health', () => {
        return HttpResponse.error();
      })
    );

    const result = await checkService(baseService, 'https://api.test.com/health');

    expect(result.status).toBe('outage');
    expect(result.uptime).toBe(0);
    expect(result.error).toBeTruthy();
    expect(result.responseTime).toBeGreaterThan(0);
  });

  it('handles timeout correctly', async () => {
    const timeoutService = { ...baseService, timeout: 1000 };
    
    server.use(
      http.get('https://api.test.com/health', async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return new HttpResponse(null, { status: 200 });
      })
    );

    const result = await checkService(timeoutService, 'https://api.test.com/health');

    expect(result.status).toBe('outage');
    expect(result.uptime).toBe(0);
    expect(result.error).toBeTruthy();
    expect(result.responseTime).toBeGreaterThanOrEqual(1000);
  });

  it('uses custom headers when provided', async () => {
    const serviceWithHeaders = {
      ...baseService,
      headers: {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'custom-value'
      }
    };

    let capturedHeaders: Record<string, string> = {};
    
    server.use(
      http.get('https://api.test.com/health', ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries());
        return new HttpResponse(null, { status: 200 });
      })
    );

    await checkService(serviceWithHeaders, 'https://api.test.com/health');

    expect(capturedHeaders['authorization']).toBe('Bearer token123');
    expect(capturedHeaders['x-custom-header']).toBe('custom-value');
  });

  it('uses custom HTTP method when provided', async () => {
    const postService = { ...baseService, method: 'POST' };
    let capturedMethod = '';

    server.use(
      http.post('https://api.test.com/health', ({ request }) => {
        capturedMethod = request.method;
        return new HttpResponse(null, { status: 200 });
      })
    );

    await checkService(postService, 'https://api.test.com/health');

    expect(capturedMethod).toBe('POST');
  });

  it('defaults to GET method when none specified', async () => {
    let capturedMethod = '';

    server.use(
      http.get('https://api.test.com/health', ({ request }) => {
        capturedMethod = request.method;
        return new HttpResponse(null, { status: 200 });
      })
    );

    await checkService(baseService, 'https://api.test.com/health');

    expect(capturedMethod).toBe('GET');
  });

  it('uses default timeout when none specified', async () => {
    const serviceWithoutTimeout = {
      name: 'Test Service',
      description: 'A test service',
      expectedStatus: [200],
      headers: {}
    };

    server.use(
      http.get('https://api.test.com/health', () => {
        return new HttpResponse(null, { status: 200 });
      })
    );

    const result = await checkService(serviceWithoutTimeout, 'https://api.test.com/health');

    expect(result.status).toBe('operational');
  });

  it('uses default expected status when none specified', async () => {
    const serviceWithoutExpectedStatus = {
      name: 'Test Service',
      description: 'A test service',
      timeout: 5000,
      headers: {}
    };

    server.use(
      http.get('https://api.test.com/health', () => {
        return new HttpResponse(null, { status: 200 });
      })
    );

    const result = await checkService(serviceWithoutExpectedStatus, 'https://api.test.com/health');

    expect(result.status).toBe('operational');
    expect(result.statusCode).toBe(200);
  });

  describe('proxy URL conversion in development', () => {
    beforeEach(() => {
      // Mock development environment
      vi.stubGlobal('import', {
        meta: {
          env: {
            PROD: false
          }
        }
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('converts external URLs to proxy paths in development mode', async () => {
      let capturedUrl = '';
      
      server.use(
        http.get('/api/api.test.com/health', ({ request }) => {
          capturedUrl = request.url;
          return new HttpResponse(null, { status: 200 });
        })
      );

      await checkService(baseService, 'https://api.test.com/health');

      expect(capturedUrl).toContain('/api/api.test.com/health');
    });

    it('preserves path and query parameters in proxy URL', async () => {
      let capturedUrl = '';
      
      server.use(
        http.get('/api/api.test.com/v1/health', ({ request }) => {
          capturedUrl = request.url;
          return new HttpResponse(null, { status: 200 });
        })
      );

      await checkService(baseService, 'https://api.test.com/v1/health?key=value');

      expect(capturedUrl).toContain('/api/api.test.com/v1/health');
      expect(capturedUrl).toContain('key=value');
    });

    it('handles different status codes through proxy', async () => {
      // Test 404
      server.use(
        http.get('/api/api.test.com/health', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const result404 = await checkService(baseService, 'https://api.test.com/health');
      expect(result404.statusCode).toBe(404);
      expect(result404.status).toBe('outage');

      // Test 500
      server.use(
        http.get('/api/api.test.com/health', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result500 = await checkService(baseService, 'https://api.test.com/health');
      expect(result500.statusCode).toBe(500);
      expect(result500.status).toBe('outage');

      // Test 503
      server.use(
        http.get('/api/api.test.com/health', () => {
          return new HttpResponse(null, { status: 503 });
        })
      );

      const result503 = await checkService(baseService, 'https://api.test.com/health');
      expect(result503.statusCode).toBe(503);
      expect(result503.status).toBe('outage');
    });

    it('handles invalid URLs gracefully', async () => {
      server.use(
        http.get('not-a-valid-url', () => {
          return new HttpResponse(null, { status: 200 });
        })
      );

      const result = await checkService(baseService, 'not-a-valid-url');
      
      // Should still try to fetch the invalid URL as-is
      expect(result.status).toBe('operational');
    });
  });

  describe('production mode', () => {
    beforeEach(() => {
      // Mock production environment
      vi.stubGlobal('import', {
        meta: {
          env: {
            PROD: true
          }
        }
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('uses original URLs without proxy in production', async () => {
      let capturedUrl = '';
      
      server.use(
        http.get('https://api.test.com/health', ({ request }) => {
          capturedUrl = request.url;
          return new HttpResponse(null, { status: 200 });
        })
      );

      await checkService(baseService, 'https://api.test.com/health');

      expect(capturedUrl).toContain('https://api.test.com/health');
      expect(capturedUrl).not.toContain('/api/api.test.com');
    });
  });
});
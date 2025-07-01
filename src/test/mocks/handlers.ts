import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock httpbin.org endpoints used in default config
  http.get('https://httpbin.org/status/200', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  http.get('https://httpbin.org/status/500', () => {
    return new HttpResponse(null, { status: 500 });
  }),

  http.get('https://httpbin.org/status/503', () => {
    return new HttpResponse(null, { status: 503 });
  }),

  http.get('https://httpbin.org/delay/1', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return new HttpResponse(null, { status: 200 });
  }),

  http.get('https://httpbin.org/delay/2', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return new HttpResponse(null, { status: 200 });
  }),

  http.get('https://httpbin.org/delay/3', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return new HttpResponse(null, { status: 200 });
  }),

  http.get('https://httpbin.org/delay/4', async () => {
    await new Promise(resolve => setTimeout(resolve, 4000));
    return new HttpResponse(null, { status: 200 });
  }),

  http.get('https://httpbin.org/delay/5', async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    return new HttpResponse(null, { status: 200 });
  }),

  // Mock config.json endpoint
  http.get('./config.json', () => {
    return HttpResponse.json({
      app: {
        title: "Test Service Status Monitor",
        description: "Test monitoring across application instances",
        refreshInterval: 5000
      },
      services: [
        {
          name: 'Test Database',
          description: 'Test database instance',
          timeout: 5000,
          expectedStatus: [200],
          headers: {}
        },
        {
          name: 'Test Cache',
          description: 'Test caching layer',
          timeout: 3000,
          expectedStatus: [200],
          headers: {}
        }
      ],
      instances: {
        test: {
          name: 'Test Application',
          environments: {
            dev: {
              name: 'Development',
              services: {
                'Test Database': { url: 'https://httpbin.org/status/200' },
                'Test Cache': { url: 'https://httpbin.org/delay/1' }
              }
            }
          }
        }
      }
    });
  }),

  // Mock error responses for testing
  http.get('https://httpbin.org/error', () => {
    return HttpResponse.error();
  }),

  // Mock timeout response
  http.get('https://httpbin.org/timeout', async () => {
    await new Promise(resolve => setTimeout(resolve, 10000));
    return new HttpResponse(null, { status: 200 });
  }),
];
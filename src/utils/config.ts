import { defu } from 'defu';
import type { ConfigData } from '../types';

export const getDefaultConfig = (): ConfigData => ({
  app: {
    title: "Service Status Monitor",
    description: "Real-time monitoring across application instances",
    refreshInterval: 30000
  },
  services: [
    {
      name: 'Database',
      description: 'Primary database instance',
      timeout: 5000,
      expectedStatus: [200],
      headers: {}
    },
    {
      name: 'Cache',
      description: 'Redis caching layer',
      timeout: 3000,
      expectedStatus: [200],
      headers: {}
    },
    {
      name: 'API Gateway',
      description: 'Main API routing service',
      timeout: 5000,
      expectedStatus: [200, 201],
      headers: {}
    },
    {
      name: 'Payment Service',
      description: 'Payment processing service',
      timeout: 15000,
      expectedStatus: [200],
      headers: {}
    }
  ],
  instances: {
    primary: {
      name: 'Primary Application',
      environments: {
        dev: {
          name: 'Development',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/delay/1' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        },
        qa: {
          name: 'QA',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/delay/2' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/500' }
          }
        },
        staging: {
          name: 'Staging',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/delay/3' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        },
        prod: {
          name: 'Production',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        }
      }
    },
    analytics: {
      name: 'Analytics Platform',
      environments: {
        dev: {
          name: 'Development',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/delay/4' }
          }
        },
        qa: {
          name: 'QA',
          services: {
            'Database': { url: 'https://httpbin.org/status/500' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        },
        staging: {
          name: 'Staging',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        },
        prod: {
          name: 'Production',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/delay/2' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        }
      }
    },
    payments: {
      name: 'Payment Platform',
      environments: {
        dev: {
          name: 'Development',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        },
        qa: {
          name: 'QA',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/delay/5' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        },
        staging: {
          name: 'Staging',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/503' }
          }
        },
        prod: {
          name: 'Production',
          services: {
            'Database': { url: 'https://httpbin.org/status/200' },
            'Cache': { url: 'https://httpbin.org/status/200' },
            'API Gateway': { url: 'https://httpbin.org/status/200' },
            'Payment Service': { url: 'https://httpbin.org/status/200' }
          }
        }
      }
    }
  }
});

export const loadConfiguration = async (): Promise<ConfigData> => {
  try {
    // Try to fetch config.json from public directory
    const response = await fetch('./config.json');
    if (!response.ok) {
      console.warn('Config file not found, using default configuration');
      return getDefaultConfig();
    }
    const configData = await response.json();
    
    // Merge with defaults to ensure all required fields exist
    return defu(configData, getDefaultConfig()) as ConfigData;
  } catch (error) {
    console.warn('Error loading config file:', error);
    return getDefaultConfig();
  }
};
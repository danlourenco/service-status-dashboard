import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { loadConfiguration, getDefaultConfig } from '../config';

describe('config utilities', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('getDefaultConfig', () => {
    it('returns a valid default configuration', () => {
      const config = getDefaultConfig();

      expect(config.app).toBeDefined();
      expect(config.app.title).toBe('Service Status Monitor');
      expect(config.app.description).toBe('Real-time monitoring across application instances');
      expect(config.app.refreshInterval).toBe(30000);

      expect(config.services).toHaveLength(4);
      expect(config.services[0].name).toBe('Database');
      expect(config.services[1].name).toBe('Cache');
      expect(config.services[2].name).toBe('API Gateway');
      expect(config.services[3].name).toBe('Payment Service');

      expect(config.instances).toBeDefined();
      expect(config.instances.primary).toBeDefined();
      expect(config.instances.analytics).toBeDefined();
      expect(config.instances.payments).toBeDefined();
    });

    it('includes all required service properties', () => {
      const config = getDefaultConfig();
      const service = config.services[0];

      expect(service.name).toBeTruthy();
      expect(service.description).toBeTruthy();
      expect(service.timeout).toBeGreaterThan(0);
      expect(Array.isArray(service.expectedStatus)).toBe(true);
      expect(service.headers).toBeDefined();
    });

    it('includes all required instance structure', () => {
      const config = getDefaultConfig();
      const instance = config.instances.primary;

      expect(instance.name).toBeTruthy();
      expect(instance.environments).toBeDefined();
      expect(instance.environments.dev).toBeDefined();
      expect(instance.environments.qa).toBeDefined();
      expect(instance.environments.staging).toBeDefined();
      expect(instance.environments.prod).toBeDefined();

      const environment = instance.environments.dev;
      expect(environment.name).toBeTruthy();
      expect(environment.services).toBeDefined();
      expect(environment.services.Database.url).toBeTruthy();
    });
  });

  describe('loadConfiguration', () => {
    it('loads configuration from config.json when available', async () => {
      const customConfig = {
        app: {
          title: 'Custom Monitor',
          description: 'Custom description',
          refreshInterval: 15000
        },
        services: [
          {
            name: 'Custom Service',
            description: 'A custom service',
            timeout: 3000,
            expectedStatus: [200, 201]
          }
        ],
        instances: {
          custom: {
            name: 'Custom Instance',
            environments: {
              test: {
                name: 'Test Environment',
                services: {
                  'Custom Service': { url: 'https://custom.test.com/health' }
                }
              }
            }
          }
        }
      };

      server.use(
        http.get('./config.json', () => {
          return HttpResponse.json(customConfig);
        })
      );

      const config = await loadConfiguration();

      expect(config.app.title).toBe('Custom Monitor');
      expect(config.services[0].name).toBe('Custom Service');
      expect(config.instances.custom).toBeDefined();
    });

    it('does not merge with defaults when custom config exists', async () => {
      const partialConfig = {
        app: {
          title: 'Partial Custom Monitor'
          // Missing description and refreshInterval
        },
        services: [
          {
            name: 'Custom Service',
            timeout: 3000,
            expectedStatus: [201]
            // Missing other properties
          }
        ]
      };

      server.use(
        http.get('./config.json', () => {
          return HttpResponse.json(partialConfig);
        })
      );

      const config = await loadConfiguration();

      // Custom values should be preserved
      expect(config.app.title).toBe('Partial Custom Monitor');
      expect(config.services[0].name).toBe('Custom Service');
      expect(config.services[0].timeout).toBe(3000);
      expect(config.services[0].expectedStatus).toEqual([201]);

      // Missing values should NOT be filled with defaults - custom config is used as-is
      expect(config.app.description).toBeUndefined();
      expect(config.app.refreshInterval).toBeUndefined();
      expect(config.services).toHaveLength(1);
    });

    it('falls back to default config when config.json is not found', async () => {
      server.use(
        http.get('./config.json', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const config = await loadConfiguration();
      const defaultConfig = getDefaultConfig();

      expect(config).toEqual(defaultConfig);
    });

    it('falls back to default config when config.json is invalid JSON', async () => {
      server.use(
        http.get('./config.json', () => {
          return new HttpResponse('invalid json{', {
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );

      const config = await loadConfiguration();
      const defaultConfig = getDefaultConfig();

      expect(config).toEqual(defaultConfig);
    });

    it('falls back to default config when network error occurs', async () => {
      server.use(
        http.get('./config.json', () => {
          return HttpResponse.error();
        })
      );

      const config = await loadConfiguration();
      const defaultConfig = getDefaultConfig();

      expect(config).toEqual(defaultConfig);
    });
  });
});
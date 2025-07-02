import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StatusMonitor from '../StatusMonitor';

// Mock the store with auto-refresh enabled to test it doesn't crash
vi.mock('../../stores/statusStore', () => ({
  useStatusStore: () => ({
    currentInstance: 'primary',
    autoRefresh: true,
    customRefreshInterval: null,
    config: {
      app: {
        title: 'Test Service Status Monitor',
        description: 'Test monitoring description',
        refreshInterval: 30000
      },
      services: [
        {
          name: 'Test Service',
          description: 'A test service',
          timeout: 5000,
          expectedStatus: [200]
        }
      ],
      instances: {
        primary: {
          name: 'Primary Application',
          environments: {
            dev: {
              name: 'Development',
              services: {
                'Test Service': { url: 'https://test.com/health' }
              }
            }
          }
        }
      }
    },
    setCurrentInstance: vi.fn(),
    toggleAutoRefresh: vi.fn(),
    setRefreshInterval: vi.fn(),
    setConfig: vi.fn()
  })
}));

// Mock the configuration loader
vi.mock('../../utils/config', () => ({
  loadConfiguration: vi.fn().mockResolvedValue({
    app: {
      title: 'Test Service Status Monitor',
      description: 'Test monitoring description',
      refreshInterval: 30000
    },
    services: [],
    instances: {}
  })
}));

// Mock TanStack Query hooks
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: {
        app: {
          title: 'Test Service Status Monitor',
          description: 'Test monitoring description'
        }
      },
      isLoading: false,
      error: null
    })),
    useQueries: vi.fn(() => [
      {
        data: {
          status: 'operational',
          responseTime: 150,
          lastChecked: '10:30:45 AM'
        },
        isLoading: false,
        isFetching: false
      }
    ]),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn()
    }))
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('StatusMonitor Auto-Refresh Functionality', () => {
  it('renders without crashing when auto-refresh is enabled', () => {
    // This test verifies that enabling auto-refresh doesn't break the app
    // The key issue was a reference to undefined 'progress' variable
    expect(() => {
      render(
        <TestWrapper>
          <StatusMonitor />
        </TestWrapper>
      );
    }).not.toThrow();
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StatusMonitor from '../StatusMonitor';

// Mock the store
vi.mock('../../stores/statusStore', () => ({
  useStatusStore: () => ({
    currentInstance: 'primary',
    autoRefresh: false,
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
          uptime: 99.9,
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

describe('StatusMonitor', () => {
  it('renders the application title and description', () => {
    render(
      <TestWrapper>
        <StatusMonitor />
      </TestWrapper>
    );

    expect(screen.getByText('Test Service Status Monitor')).toBeInTheDocument();
    expect(screen.getByText('Test monitoring description')).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(
      <TestWrapper>
        <StatusMonitor />
      </TestWrapper>
    );

    expect(screen.getByText('Primary Application')).toBeInTheDocument();
  });

  it('renders refresh and settings buttons', () => {
    render(
      <TestWrapper>
        <StatusMonitor />
      </TestWrapper>
    );

    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('renders environment grid', () => {
    render(
      <TestWrapper>
        <StatusMonitor />
      </TestWrapper>
    );

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('DEV')).toBeInTheDocument();
  });

  it('applies correct layout classes', () => {
    const { container } = render(
      <TestWrapper>
        <StatusMonitor />
      </TestWrapper>
    );

    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toHaveClass('bg-slate-900', 'text-slate-200');

    const contentContainer = container.querySelector('.max-w-7xl');
    expect(contentContainer).toHaveClass('mx-auto', 'px-8', 'py-8');
  });

  it('displays overall status banner', () => {
    render(
      <TestWrapper>
        <StatusMonitor />
      </TestWrapper>
    );

    // Should find some overall status message
    const statusElements = screen.getAllByText(/services in Primary Application/);
    expect(statusElements.length).toBeGreaterThan(0);
  });
});
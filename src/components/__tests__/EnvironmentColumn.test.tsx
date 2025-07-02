import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnvironmentColumn from '../EnvironmentColumn';
import type { ServiceConfig, InstanceConfig, ServiceStatus } from '../../types';

const mockServices: ServiceConfig[] = [
  {
    name: 'Database',
    description: 'Primary database',
    timeout: 5000,
    expectedStatus: [200]
  },
  {
    name: 'Cache',
    description: 'Redis cache',
    timeout: 3000,
    expectedStatus: [200]
  }
];

const mockInstanceConfig: InstanceConfig = {
  name: 'Test Application',
  environments: {
    dev: {
      name: 'Development',
      services: {
        'Database': { url: 'https://api.dev.test.com/health' },
        'Cache': { url: 'https://cache.dev.test.com/ping' }
      }
    }
  }
};

const mockServiceStatuses: Record<string, ServiceStatus> = {
  'Database': {
    status: 'operational',
    responseTime: 120,
    lastChecked: '10:30:45 AM',
    statusCode: 200
  },
  'Cache': {
    status: 'degraded',
    responseTime: 2500,
    lastChecked: '10:30:46 AM',
    statusCode: 200
  }
};

describe('EnvironmentColumn', () => {
  it('renders environment name and key', () => {
    render(
      <EnvironmentColumn
        instanceKey="test"
        instanceConfig={mockInstanceConfig}
        envKey="dev"
        envConfig={mockInstanceConfig.environments.dev}
        services={mockServices}
        serviceStatuses={mockServiceStatuses}
      />
    );

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('DEV')).toBeInTheDocument();
  });

  it('renders all service status cells', () => {
    render(
      <EnvironmentColumn
        instanceKey="test"
        instanceConfig={mockInstanceConfig}
        envKey="dev"
        envConfig={mockInstanceConfig.environments.dev}
        services={mockServices}
        serviceStatuses={mockServiceStatuses}
      />
    );

    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Cache')).toBeInTheDocument();
    expect(screen.getByText('120ms')).toBeInTheDocument();
    expect(screen.getByText('2500ms')).toBeInTheDocument();
  });

  it('calculates and displays degraded environment status when any service is degraded', () => {
    render(
      <EnvironmentColumn
        instanceKey="test"
        instanceConfig={mockInstanceConfig}
        envKey="dev"
        envConfig={mockInstanceConfig.environments.dev}
        services={mockServices}
        serviceStatuses={mockServiceStatuses}
      />
    );

    expect(screen.getByText('degraded')).toBeInTheDocument();
  });

  it('calculates and displays outage environment status when any service has outage', () => {
    const outageStatuses = {
      ...mockServiceStatuses,
      'Database': {
        ...mockServiceStatuses['Database'],
        status: 'outage' as const
      }
    };

    render(
      <EnvironmentColumn
        instanceKey="test"
        instanceConfig={mockInstanceConfig}
        envKey="dev"
        envConfig={mockInstanceConfig.environments.dev}
        services={mockServices}
        serviceStatuses={outageStatuses}
      />
    );

    expect(screen.getByText('outage')).toBeInTheDocument();
  });

  it('calculates and displays operational environment status when all services are operational', () => {
    const operationalStatuses = {
      'Database': {
        ...mockServiceStatuses['Database'],
        status: 'operational' as const
      },
      'Cache': {
        ...mockServiceStatuses['Cache'],
        status: 'operational' as const
      }
    };

    render(
      <EnvironmentColumn
        instanceKey="test"
        instanceConfig={mockInstanceConfig}
        envKey="dev"
        envConfig={mockInstanceConfig.environments.dev}
        services={mockServices}
        serviceStatuses={operationalStatuses}
      />
    );

    expect(screen.getByText('operational')).toBeInTheDocument();
  });

  it('applies correct status badge styling for degraded state', () => {
    render(
      <EnvironmentColumn
        instanceKey="test"
        instanceConfig={mockInstanceConfig}
        envKey="dev"
        envConfig={mockInstanceConfig.environments.dev}
        services={mockServices}
        serviceStatuses={mockServiceStatuses}
      />
    );

    // Find the status badge by looking for the degraded text and getting its container
    const statusText = screen.getByText('degraded');
    const statusBadge = statusText.closest('div');
    expect(statusBadge).toHaveClass('bg-yellow-900/30', 'text-yellow-400');
  });

  it('applies correct container styling', () => {
    const { container } = render(
      <EnvironmentColumn
        instanceKey="test"
        instanceConfig={mockInstanceConfig}
        envKey="dev"
        envConfig={mockInstanceConfig.environments.dev}
        services={mockServices}
        serviceStatuses={mockServiceStatuses}
      />
    );

    const envContainer = container.firstChild as HTMLElement;
    expect(envContainer).toHaveClass(
      'bg-slate-800/50',
      'border',
      'border-slate-700/50',
      'rounded-xl',
      'p-4',
      'hover:border-slate-600/50',
      'transition-all',
      'duration-300'
    );
  });

  it('handles missing service statuses gracefully', () => {
    render(
      <EnvironmentColumn
        instanceKey="test"
        instanceConfig={mockInstanceConfig}
        envKey="dev"
        envConfig={mockInstanceConfig.environments.dev}
        services={mockServices}
        serviceStatuses={{}}
      />
    );

    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Cache')).toBeInTheDocument();
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });
});
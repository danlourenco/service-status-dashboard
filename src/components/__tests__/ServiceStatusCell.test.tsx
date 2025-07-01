import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServiceStatusCell from '../ServiceStatusCell';
import type { ServiceConfig, ServiceStatus } from '../../types';

const mockService: ServiceConfig = {
  name: 'Test Service',
  description: 'A test service for unit testing',
  timeout: 5000,
  expectedStatus: [200],
  headers: {}
};

const mockStatus: ServiceStatus = {
  status: 'operational',
  responseTime: 150,
  uptime: 99.9,
  lastChecked: '10:30:45 AM',
  statusCode: 200
};

describe('ServiceStatusCell', () => {
  it('renders service name and response time', () => {
    render(
      <ServiceStatusCell
        service={mockService}
        status={mockStatus}
        instance="Test Instance"
        environment="Test Environment"
      />
    );

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('150ms')).toBeInTheDocument();
  });

  it('renders uptime bar with correct width', () => {
    const { container } = render(
      <ServiceStatusCell
        service={mockService}
        status={mockStatus}
        instance="Test Instance"
        environment="Test Environment"
      />
    );

    const uptimeBar = container.querySelector('.h-full.bg-gradient-to-r') as HTMLElement;
    expect(uptimeBar).toHaveStyle({ width: '99.9%' });
  });

  it('shows tooltip on hover with all information', async () => {
    const user = userEvent.setup();
    
    render(
      <ServiceStatusCell
        service={mockService}
        status={mockStatus}
        instance="Test Instance"
        environment="Test Environment"
        url="https://api.test.com/health"
      />
    );

    const cell = screen.getByText('Test Service').closest('div');
    await user.hover(cell!);

    expect(screen.getByText('Test Instance - Test Environment')).toBeInTheDocument();
    expect(screen.getByText('A test service for unit testing')).toBeInTheDocument();
    expect(screen.getByText('Endpoint: https://api.test.com/health')).toBeInTheDocument();
    expect(screen.getByText('Status: operational')).toBeInTheDocument();
    expect(screen.getByText('Response: 150ms')).toBeInTheDocument();
    expect(screen.getByText('Uptime: 99.9%')).toBeInTheDocument();
    expect(screen.getByText('Last checked: 10:30:45 AM')).toBeInTheDocument();
    expect(screen.getByText('HTTP: 200')).toBeInTheDocument();
  });

  it('does not show endpoint URL when not provided', async () => {
    const user = userEvent.setup();
    
    render(
      <ServiceStatusCell
        service={mockService}
        status={mockStatus}
        instance="Test Instance"
        environment="Test Environment"
      />
    );

    const cell = screen.getByText('Test Service').closest('div');
    await user.hover(cell!);

    expect(screen.queryByText(/Endpoint:/)).not.toBeInTheDocument();
  });

  it('shows error message in tooltip when status has error', async () => {
    const user = userEvent.setup();
    const errorStatus: ServiceStatus = {
      ...mockStatus,
      status: 'outage',
      error: 'Connection timeout'
    };

    render(
      <ServiceStatusCell
        service={mockService}
        status={errorStatus}
        instance="Test Instance"
        environment="Test Environment"
      />
    );

    const cell = screen.getByText('Test Service').closest('div');
    await user.hover(cell!);

    expect(screen.getByText('Error: Connection timeout')).toBeInTheDocument();
    expect(screen.getByText('Error: Connection timeout')).toHaveClass('text-red-400');
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(
      <ServiceStatusCell
        service={mockService}
        status={mockStatus}
        instance="Test Instance"
        environment="Test Environment"
      />
    );

    const cell = container.firstChild as HTMLElement;
    expect(cell).toHaveClass(
      'group',
      'relative',
      'p-3',
      'bg-slate-800/30',
      'rounded-lg',
      'border',
      'border-slate-700/30',
      'hover:border-slate-600/50',
      'transition-all',
      'cursor-pointer'
    );
  });
});
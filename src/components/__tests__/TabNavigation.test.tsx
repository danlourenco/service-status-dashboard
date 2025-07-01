import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TabNavigation from '../TabNavigation';

const mockTabs = [
  { id: 'primary', name: 'Primary Application', description: 'Main production app' },
  { id: 'analytics', name: 'Analytics Platform', description: 'Data analytics services' },
  { id: 'payments', name: 'Payment Platform', description: 'Payment processing services' }
];

describe('TabNavigation', () => {
  it('renders all tabs', () => {
    const mockOnTabChange = vi.fn();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="primary"
        onTabChange={mockOnTabChange}
      />
    );

    expect(screen.getByText('Primary Application')).toBeInTheDocument();
    expect(screen.getByText('Analytics Platform')).toBeInTheDocument();
    expect(screen.getByText('Payment Platform')).toBeInTheDocument();
  });

  it('applies active styling to the active tab', () => {
    const mockOnTabChange = vi.fn();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="analytics"
        onTabChange={mockOnTabChange}
      />
    );

    const activeTab = screen.getByText('Analytics Platform');
    expect(activeTab).toHaveClass(
      'px-6',
      'py-3',
      'rounded-md',
      'font-medium',
      'bg-blue-600',
      'text-white',
      'shadow-lg',
      'transition-all'
    );
  });

  it('applies inactive styling to non-active tabs', () => {
    const mockOnTabChange = vi.fn();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="analytics"
        onTabChange={mockOnTabChange}
      />
    );

    const inactiveTab = screen.getByText('Primary Application');
    expect(inactiveTab).toHaveClass(
      'px-6',
      'py-3',
      'rounded-md',
      'font-medium',
      'text-slate-400',
      'hover:text-slate-200',
      'hover:bg-slate-700/50',
      'transition-all'
    );
  });

  it('calls onTabChange when a tab is clicked', async () => {
    const user = userEvent.setup();
    const mockOnTabChange = vi.fn();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="primary"
        onTabChange={mockOnTabChange}
      />
    );

    await user.click(screen.getByText('Analytics Platform'));
    expect(mockOnTabChange).toHaveBeenCalledWith('analytics');
  });

  it('sets title attribute with tab description', () => {
    const mockOnTabChange = vi.fn();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="primary"
        onTabChange={mockOnTabChange}
      />
    );

    const tab = screen.getByText('Primary Application');
    expect(tab).toHaveAttribute('title', 'Main production app');
  });

  it('applies correct container styling', () => {
    const mockOnTabChange = vi.fn();
    const { container } = render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="primary"
        onTabChange={mockOnTabChange}
      />
    );

    const tabContainer = container.firstChild as HTMLElement;
    expect(tabContainer).toHaveClass(
      'flex',
      'bg-slate-800/50',
      'rounded-lg',
      'p-1',
      'border',
      'border-slate-700/50'
    );
  });
});
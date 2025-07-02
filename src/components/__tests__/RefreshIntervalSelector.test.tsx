import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RefreshIntervalSelector from '../RefreshIntervalSelector';

describe('RefreshIntervalSelector', () => {
  it('renders with current interval selected', () => {
    render(
      <RefreshIntervalSelector
        currentInterval={30000}
        onIntervalChange={vi.fn()}
        isEnabled={true}
      />
    );

    expect(screen.getByDisplayValue('30s')).toBeInTheDocument();
  });

  it('calls onIntervalChange when selection changes', async () => {
    const user = userEvent.setup();
    const onIntervalChange = vi.fn();

    render(
      <RefreshIntervalSelector
        currentInterval={30000}
        onIntervalChange={onIntervalChange}
        isEnabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '60000');

    expect(onIntervalChange).toHaveBeenCalledWith(60000);
  });

  it('is disabled when isEnabled is false', () => {
    render(
      <RefreshIntervalSelector
        currentInterval={30000}
        onIntervalChange={vi.fn()}
        isEnabled={false}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <RefreshIntervalSelector
        currentInterval={30000}
        onIntervalChange={vi.fn()}
        isEnabled={true}
      />
    );

    const select = container.querySelector('select');
    expect(select).toHaveClass(
      'px-3',
      'py-1',
      'bg-slate-700',
      'border',
      'border-slate-600',
      'rounded-md',
      'text-slate-200',
      'text-sm'
    );
  });

  it('shows all interval options', () => {
    render(
      <RefreshIntervalSelector
        currentInterval={30000}
        onIntervalChange={vi.fn()}
        isEnabled={true}
      />
    );

    expect(screen.getByText('10s')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
    expect(screen.getByText('1m')).toBeInTheDocument();
    expect(screen.getByText('2m')).toBeInTheDocument();
    expect(screen.getByText('5m')).toBeInTheDocument();
  });
});
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusIndicator from '../StatusIndicator';

describe('StatusIndicator', () => {
  it('renders operational status with green background', () => {
    const { container } = render(<StatusIndicator status="operational" />);
    const indicator = container.firstChild as HTMLElement;
    
    expect(indicator).toHaveClass('bg-green-500');
    expect(indicator).toHaveClass('w-3', 'h-3', 'rounded-full');
  });

  it('renders degraded status with yellow background', () => {
    const { container } = render(<StatusIndicator status="degraded" />);
    const indicator = container.firstChild as HTMLElement;
    
    expect(indicator).toHaveClass('bg-yellow-500');
  });

  it('renders outage status with red background', () => {
    const { container } = render(<StatusIndicator status="outage" />);
    const indicator = container.firstChild as HTMLElement;
    
    expect(indicator).toHaveClass('bg-red-500');
  });

  it('renders unknown status with gray background', () => {
    const { container } = render(<StatusIndicator status="unknown" />);
    const indicator = container.firstChild as HTMLElement;
    
    expect(indicator).toHaveClass('bg-gray-500');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <StatusIndicator status="operational" className="w-6 h-6" />
    );
    const indicator = container.firstChild as HTMLElement;
    
    expect(indicator).toHaveClass('w-6', 'h-6', 'rounded-full', 'bg-green-500');
  });

  it('uses default className when none provided', () => {
    const { container } = render(<StatusIndicator status="operational" />);
    const indicator = container.firstChild as HTMLElement;
    
    expect(indicator).toHaveClass('w-3', 'h-3');
  });
});
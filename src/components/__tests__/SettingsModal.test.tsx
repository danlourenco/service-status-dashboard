import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsModal from '../SettingsModal';

describe('SettingsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    autoRefresh: false,
    refreshInterval: 30000,
    onToggleAutoRefresh: vi.fn(),
    onIntervalChange: vi.fn()
  };

  it('renders when open', () => {
    render(<SettingsModal {...defaultProps} />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Enable automatic refresh')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SettingsModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<SettingsModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close settings');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Done button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<SettingsModal {...defaultProps} onClose={onClose} />);
    
    const doneButton = screen.getByRole('button', { name: 'Done' });
    await user.click(doneButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onToggleAutoRefresh when toggle is clicked', async () => {
    const user = userEvent.setup();
    const onToggleAutoRefresh = vi.fn();
    
    render(<SettingsModal {...defaultProps} onToggleAutoRefresh={onToggleAutoRefresh} />);
    
    const toggle = screen.getByLabelText('Toggle auto-refresh');
    await user.click(toggle);
    
    expect(onToggleAutoRefresh).toHaveBeenCalled();
  });

  it('shows interval options when auto-refresh is enabled', () => {
    render(<SettingsModal {...defaultProps} autoRefresh={true} />);
    
    expect(screen.getByText('Refresh Interval')).toBeInTheDocument();
    expect(screen.getByText('10 seconds')).toBeInTheDocument();
    expect(screen.getByText('30 seconds')).toBeInTheDocument();
    expect(screen.getByText('1 minute')).toBeInTheDocument();
    expect(screen.getByText('2 minutes')).toBeInTheDocument();
    expect(screen.getByText('5 minutes')).toBeInTheDocument();
  });

  it('hides interval options when auto-refresh is disabled', () => {
    render(<SettingsModal {...defaultProps} autoRefresh={false} />);
    
    expect(screen.queryByText('Refresh Interval')).not.toBeInTheDocument();
  });

  it('calls onIntervalChange when interval is selected', async () => {
    const user = userEvent.setup();
    const onIntervalChange = vi.fn();
    
    render(<SettingsModal {...defaultProps} autoRefresh={true} onIntervalChange={onIntervalChange} />);
    
    const oneMinuteOption = screen.getByDisplayValue('60000');
    await user.click(oneMinuteOption);
    
    expect(onIntervalChange).toHaveBeenCalledWith(60000);
  });

  it('shows correct interval as selected', () => {
    render(<SettingsModal {...defaultProps} autoRefresh={true} refreshInterval={60000} />);
    
    const oneMinuteOption = screen.getByDisplayValue('60000');
    expect(oneMinuteOption).toBeChecked();
  });
});
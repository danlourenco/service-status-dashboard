import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRefreshCountdown } from '../useRefreshCountdown';

describe('useRefreshCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial values when disabled', () => {
    const { result } = renderHook(() =>
      useRefreshCountdown({
        isEnabled: false,
        intervalMs: 30000,
        isRefreshing: false
      })
    );

    expect(result.current.timeLeft).toBe(30000);
    expect(result.current.formattedTime).toBe('0:30');
    expect(result.current.progress).toBe(0);
  });

  it('starts countdown when enabled', () => {
    const { result } = renderHook(() =>
      useRefreshCountdown({
        isEnabled: true,
        intervalMs: 30000,
        isRefreshing: false
      })
    );

    // Initially should show full time
    expect(result.current.timeLeft).toBe(30000);
    expect(result.current.formattedTime).toBe('0:30');
    expect(result.current.progress).toBe(0);

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeLeft).toBeLessThan(30000);
    expect(result.current.progress).toBeGreaterThan(0);
  });

  it('resets countdown when refresh starts', () => {
    const { result, rerender } = renderHook(
      ({ isRefreshing }) =>
        useRefreshCountdown({
          isEnabled: true,
          intervalMs: 30000,
          isRefreshing
        }),
      { initialProps: { isRefreshing: false } }
    );

    // Advance time to simulate countdown
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeLeft).toBeLessThan(30000);

    // Start refreshing - should reset
    rerender({ isRefreshing: true });

    expect(result.current.timeLeft).toBe(30000);
    expect(result.current.progress).toBe(0);
  });

  it('formats time correctly', () => {
    const { result } = renderHook(() =>
      useRefreshCountdown({
        isEnabled: true,
        intervalMs: 90000, // 1:30
        isRefreshing: false
      })
    );

    expect(result.current.formattedTime).toBe('1:30');

    act(() => {
      vi.advanceTimersByTime(60000); // Advance 1 minute
    });

    expect(result.current.formattedTime).toBe('0:30');
  });

  it('stops countdown when disabled', () => {
    const { result, rerender } = renderHook(
      ({ isEnabled }) =>
        useRefreshCountdown({
          isEnabled,
          intervalMs: 30000,
          isRefreshing: false
        }),
      { initialProps: { isEnabled: true } }
    );

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const timeAfterCountdown = result.current.timeLeft;
    expect(timeAfterCountdown).toBeLessThan(30000);

    // Disable countdown
    rerender({ isEnabled: false });

    expect(result.current.timeLeft).toBe(30000);
    expect(result.current.progress).toBe(0);
  });
});
import { useState, useEffect, useRef } from 'react';

interface UseRefreshCountdownProps {
  isEnabled: boolean;
  intervalMs: number;
  isRefreshing: boolean;
}

export const useRefreshCountdown = ({ isEnabled, intervalMs, isRefreshing }: UseRefreshCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(intervalMs);
  const lastRefreshRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      setTimeLeft(intervalMs);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Reset countdown when refresh starts
    if (isRefreshing) {
      lastRefreshRef.current = Date.now();
      setTimeLeft(intervalMs);
      return;
    }

    // Start countdown timer
    const startCountdown = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - lastRefreshRef.current;
        const remaining = Math.max(0, intervalMs - elapsed);
        
        setTimeLeft(remaining);

        if (remaining === 0) {
          lastRefreshRef.current = Date.now();
          setTimeLeft(intervalMs);
        }
      }, 100); // Update every 100ms for smooth countdown
    };

    startCountdown();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isEnabled, intervalMs, isRefreshing]);

  // Format time as MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    progress: isEnabled ? ((intervalMs - timeLeft) / intervalMs) * 100 : 0
  };
};
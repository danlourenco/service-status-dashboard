import React from 'react';

interface RefreshCountdownProps {
  timeLeft: number;
  formattedTime: string;
  progress: number;
  isEnabled: boolean;
}

const RefreshCountdown: React.FC<RefreshCountdownProps> = ({ 
  timeLeft, 
  formattedTime, 
  progress, 
  isEnabled 
}) => {
  if (!isEnabled) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Circular Progress */}
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
          {/* Background circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-blue-400"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
      </div>
      
      {/* Countdown Text */}
      <div className="text-sm font-mono text-slate-300">
        {formattedTime}
      </div>
    </div>
  );
};

export default RefreshCountdown;
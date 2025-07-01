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
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
      {/* Circular Progress */}
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
          {/* Background circle */}
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-blue-400"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
      </div>
      
      {/* Countdown Text */}
      <div className="text-sm">
        <div className="text-slate-300 font-medium">Next refresh in</div>
        <div className="text-blue-400 font-mono text-xs">{formattedTime}</div>
      </div>
    </div>
  );
};

export default RefreshCountdown;
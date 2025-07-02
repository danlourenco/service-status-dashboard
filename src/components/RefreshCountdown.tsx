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
    <div className="flex items-center gap-4 px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
      {/* Circular Progress */}
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-slate-700/50"
          />
          {/* Progress circle with glow effect */}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-blue-400 drop-shadow-sm"
            strokeDasharray={`${2 * Math.PI * 16}`}
            strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 0.2s ease-out',
              filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.3))'
            }}
          />
        </svg>
        {/* Center pulse dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Countdown Text and Label */}
      <div className="text-left">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Next refresh</div>
        <div className="text-lg font-mono text-slate-200 font-semibold tabular-nums">
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default RefreshCountdown;
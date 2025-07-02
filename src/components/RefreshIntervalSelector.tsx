import React from 'react';

interface RefreshIntervalSelectorProps {
  currentInterval: number;
  onIntervalChange: (intervalMs: number) => void;
  isEnabled: boolean;
}

const RefreshIntervalSelector: React.FC<RefreshIntervalSelectorProps> = ({
  currentInterval,
  onIntervalChange,
  isEnabled
}) => {
  const intervals = [
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 },
    { label: '2m', value: 120000 },
    { label: '5m', value: 300000 },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Every</span>
      <select
        value={currentInterval}
        onChange={(e) => onIntervalChange(Number(e.target.value))}
        disabled={!isEnabled}
        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {intervals.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RefreshIntervalSelector;
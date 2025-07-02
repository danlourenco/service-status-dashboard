import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoRefresh: boolean;
  refreshInterval: number;
  onToggleAutoRefresh: () => void;
  onIntervalChange: (intervalMs: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  autoRefresh,
  refreshInterval,
  onToggleAutoRefresh,
  onIntervalChange
}) => {
  if (!isOpen) return null;

  const intervals = [
    { label: '10 seconds', value: 10000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '2 minutes', value: 120000 },
    { label: '5 minutes', value: 300000 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-200">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Auto Refresh Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Auto-Refresh</h3>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <span className="text-slate-200">Enable automatic refresh</span>
            <button
              onClick={onToggleAutoRefresh}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                autoRefresh ? 'bg-green-600' : 'bg-slate-600'
              }`}
              aria-label="Toggle auto-refresh"
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  autoRefresh ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Refresh Interval Section */}
        {autoRefresh && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Refresh Interval</h3>
            <div className="space-y-2">
              {intervals.map(({ label, value }) => (
                <label key={value} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="refreshInterval"
                    value={value}
                    checked={refreshInterval === value}
                    onChange={() => onIntervalChange(value)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-slate-200">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
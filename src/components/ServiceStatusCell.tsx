import React, { useState } from 'react';
import StatusIndicator from './StatusIndicator';
import type { ServiceConfig, ServiceStatus } from '../types';

interface ServiceStatusCellProps {
  service: ServiceConfig;
  status: ServiceStatus;
  instance: string;
  environment: string;
  url?: string;
}

const ServiceStatusCell: React.FC<ServiceStatusCellProps> = ({ 
  service, 
  status, 
  instance, 
  environment,
  url 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (status.responseData) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div 
      className="group relative p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIndicator status={status.status} />
          <span className="text-sm font-medium text-slate-300">{service.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{status.responseTime}ms</span>
          {status.responseData && (
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" title="Response data available"></div>
          )}
        </div>
      </div>
      
      {/* Expanded JSON Response */}
      {isExpanded && status.responseData && (
        <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-400">Health Response</span>
            <span className="text-xs text-slate-500">Click to collapse</span>
          </div>
          <pre className="text-xs bg-slate-950/50 p-3 rounded border border-slate-800 overflow-auto text-slate-300">
            {JSON.stringify(status.responseData, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Tooltip on hover - simplified without JSON data */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
        <div><strong>{instance} - {environment}</strong></div>
        <div>{service.description}</div>
        {url && <div>Endpoint: {url}</div>}
        <div>Status: {status.status}</div>
        <div>Response: {status.responseTime}ms</div>
        <div>Last checked: {status.lastChecked}</div>
        {status.statusCode && <div>HTTP: {status.statusCode}</div>}
        {status.error && <div className="text-red-400">Error: {status.error}</div>}
        {status.responseData && (
          <div className="text-blue-400 mt-1">Click to view response data</div>
        )}
      </div>
    </div>
  );
};

export default ServiceStatusCell;
import React from 'react';
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
  return (
    <div className="group relative p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer">
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
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-sm">
        <div><strong>{instance} - {environment}</strong></div>
        <div>{service.description}</div>
        {url && <div>Endpoint: {url}</div>}
        <div>Status: {status.status}</div>
        <div>Response: {status.responseTime}ms</div>
        <div>Last checked: {status.lastChecked}</div>
        {status.statusCode && <div>HTTP: {status.statusCode}</div>}
        {status.error && <div className="text-red-400">Error: {status.error}</div>}
        {status.responseData && (
          <div className="mt-2 pt-2 border-t border-slate-600">
            <div className="text-green-400 font-medium mb-1">📡 Health Response:</div>
            <pre className="text-xs bg-slate-900/50 p-2 rounded border border-slate-700 overflow-auto max-h-32 whitespace-pre-wrap">
              {JSON.stringify(status.responseData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceStatusCell;
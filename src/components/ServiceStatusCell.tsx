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
        <span className="text-xs text-slate-500">{status.responseTime}ms</span>
      </div>
      
      {/* Uptime bar */}
      <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
          style={{ width: `${status.uptime}%` }}
        ></div>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
        <div><strong>{instance} - {environment}</strong></div>
        <div>{service.description}</div>
        {url && <div>Endpoint: {url}</div>}
        <div>Status: {status.status}</div>
        <div>Response: {status.responseTime}ms</div>
        <div>Uptime: {status.uptime}%</div>
        <div>Last checked: {status.lastChecked}</div>
        {status.statusCode && <div>HTTP: {status.statusCode}</div>}
        {status.error && <div className="text-red-400">Error: {status.error}</div>}
      </div>
    </div>
  );
};

export default ServiceStatusCell;
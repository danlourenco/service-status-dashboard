import React from 'react';
import ServiceStatusCell from './ServiceStatusCell';
import StatusIndicator from './StatusIndicator';
import type { ServiceConfig, InstanceConfig, ServiceStatus } from '../types';

interface EnvironmentColumnProps {
  instanceKey: string;
  instanceConfig: InstanceConfig;
  envKey: string;
  envConfig: InstanceConfig['environments'][string];
  services: ServiceConfig[];
  serviceStatuses: Record<string, ServiceStatus>;
}

const EnvironmentColumn: React.FC<EnvironmentColumnProps> = ({ 
  instanceConfig, 
  envKey, 
  envConfig, 
  services, 
  serviceStatuses 
}) => {
  
  const getEnvironmentStatus = () => {
    const statuses = services.map(service => serviceStatuses[service.name]).filter(Boolean);
    if (statuses.length === 0) return 'unknown';
    
    const outages = statuses.filter(s => s.status === 'outage').length;
    const degraded = statuses.filter(s => s.status === 'degraded').length;
    
    if (outages > 0) return 'outage';
    if (degraded > 0) return 'degraded';
    return 'operational';
  };

  const envStatus = getEnvironmentStatus();

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-slate-200">{envConfig.name}</h4>
          <p className="text-xs text-slate-400">{envKey.toUpperCase()}</p>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${
          envStatus === 'operational' 
            ? 'bg-green-900/30 text-green-400'
            : envStatus === 'degraded'
            ? 'bg-yellow-900/30 text-yellow-400'
            : envStatus === 'outage'
            ? 'bg-red-900/30 text-red-400'
            : 'bg-gray-900/30 text-gray-400'
        }`}>
          <StatusIndicator status={envStatus as ServiceStatus['status']} className="w-2 h-2" />
          {envStatus}
        </div>
      </div>
      
      <div className="space-y-2">
        {services.map(service => {
          const status = serviceStatuses[service.name] || {
            status: 'unknown' as const,
            responseTime: 0,
            uptime: 0,
            lastChecked: 'Never'
          };
          
          const serviceUrl = envConfig.services[service.name]?.url;
          
          return (
            <ServiceStatusCell
              key={service.name}
              service={service}
              status={status}
              instance={instanceConfig.name}
              environment={envConfig.name}
              url={serviceUrl}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EnvironmentColumn;
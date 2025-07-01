import React, { useEffect } from 'react';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { useStatusStore } from '../stores/statusStore';
import { loadConfiguration } from '../utils/config';
import { checkService } from '../utils/http';
import { useRefreshCountdown } from '../hooks/useRefreshCountdown';
import TabNavigation from './TabNavigation';
import EnvironmentColumn from './EnvironmentColumn';
import StatusIndicator from './StatusIndicator';
import RefreshCountdown from './RefreshCountdown';
import type { ServiceStatus } from '../types';

const StatusMonitor: React.FC = () => {
  const queryClient = useQueryClient();
  const { 
    currentInstance, 
    autoRefresh, 
    config,
    setCurrentInstance, 
    toggleAutoRefresh,
    setConfig 
  } = useStatusStore();

  // Load configuration
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['config'],
    queryFn: loadConfiguration,
    staleTime: Infinity, // Config doesn't change often
  });

  // Update store when config loads
  useEffect(() => {
    if (configData) {
      setConfig(configData);
    }
  }, [configData, setConfig]);

  // Create query definitions with metadata
  const queryDefinitions = !config ? [] : Object.entries(config.instances[currentInstance]?.environments || {}).flatMap(([envKey, envConfig]) =>
    config.services.map(service => ({
      queryDef: {
        queryKey: ['service-status', currentInstance, envKey, service.name] as const,
        queryFn: () => {
          const serviceUrl = envConfig.services[service.name]?.url;
          if (!serviceUrl) {
            throw new Error(`No URL configured for ${service.name} in ${envKey}`);
          }
          return checkService(service, serviceUrl);
        },
        enabled: !!config && !!envConfig.services[service.name],
        refetchInterval: autoRefresh ? (config.app.refreshInterval || 30000) : undefined,
        staleTime: 10000,
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      metadata: { currentInstance, envKey, serviceName: service.name }
    }))
  );

  // Get service status queries for current instance
  const serviceQueries = useQueries({
    queries: queryDefinitions.map(({ queryDef }) => queryDef),
  });

  const handleInstanceChange = (newInstance: string) => {
    setCurrentInstance(newInstance);
  };

  const handleRefresh = () => {
    // Invalidate all service status queries for current instance
    queryClient.invalidateQueries({
      queryKey: ['service-status', currentInstance],
    });
  };

  const getCurrentInstanceData = () => {
    if (!config || !config.instances[currentInstance]) return [];
    
    const instanceConfig = config.instances[currentInstance];
    
    return Object.entries(instanceConfig.environments).map(([envKey, envConfig]) => {
      const envServiceStatuses: Record<string, ServiceStatus> = {};
      
      // Find matching queries for this environment
      config.services.forEach(service => {
        const queryIndex = queryDefinitions.findIndex(({ metadata }) => 
          metadata.currentInstance === currentInstance && 
          metadata.envKey === envKey && 
          metadata.serviceName === service.name
        );
        
        const queryResult = queryIndex >= 0 ? serviceQueries[queryIndex] : null;
        
        if (queryResult?.data) {
          envServiceStatuses[service.name] = queryResult.data;
        } else {
          envServiceStatuses[service.name] = {
            status: 'unknown',
            responseTime: 0,
            uptime: 0,
            lastChecked: 'Never'
          };
        }
      });

      return {
        envKey,
        envConfig,
        statusKey: `${currentInstance}-${envKey}`,
        serviceStatuses: envServiceStatuses
      };
    });
  };

  const getOverallInstanceStatus = () => {
    const instanceData = getCurrentInstanceData();
    if (instanceData.length === 0) return { status: 'unknown', message: 'No data available' };
    
    let totalOutages = 0;
    let totalDegraded = 0;
    let totalServices = 0;
    
    instanceData.forEach(({ serviceStatuses: envStatuses }) => {
      Object.values(envStatuses).forEach(status => {
        totalServices++;
        if (status.status === 'outage') totalOutages++;
        else if (status.status === 'degraded') totalDegraded++;
      });
    });
    
    if (totalServices === 0) return { status: 'unknown', message: 'Loading...' };
    
    const instanceName = config?.instances[currentInstance]?.name || currentInstance;
    
    if (totalOutages > 0) {
      return { 
        status: 'outage', 
        message: `${totalOutages} of ${totalServices} services in ${instanceName} experiencing outages` 
      };
    } else if (totalDegraded > 0) {
      return { 
        status: 'degraded', 
        message: `${totalDegraded} of ${totalServices} services in ${instanceName} degraded` 
      };
    } else {
      return { status: 'operational', message: `All ${totalServices} services in ${instanceName} operational` };
    }
  };

  // Check if any queries are currently fetching
  const isRefreshing = serviceQueries.some(q => q.isFetching);

  // Countdown for auto-refresh
  const refreshInterval = config?.app.refreshInterval || 30000;
  const countdown = useRefreshCountdown({
    isEnabled: autoRefresh,
    intervalMs: refreshInterval,
    isRefreshing
  });

  if (configLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load configuration</p>
        </div>
      </div>
    );
  }

  const overallStatus = getOverallInstanceStatus();
  const instanceData = getCurrentInstanceData();
  const currentInstanceConfig = config.instances[currentInstance];

  // Prepare tabs for TabNavigation
  const instanceTabs = Object.entries(config.instances).map(([instanceKey, instanceConfig]) => ({
    id: instanceKey,
    name: instanceConfig.name,
    description: `Switch to ${instanceConfig.name}`
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            {config.app.title}
          </h1>
          <p className="text-slate-400">{config.app.description}</p>
        </div>

        {/* Instance Tabs */}
        <div className="flex justify-center mb-8">
          <TabNavigation 
            tabs={instanceTabs}
            activeTab={currentInstance}
            onTabChange={handleInstanceChange}
          />
        </div>

        {/* Current Instance Display */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-300">
            {currentInstanceConfig?.name} Services
          </h2>
        </div>

        {/* Overall Status for Current Instance */}
        <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <StatusIndicator status={overallStatus.status as ServiceStatus['status']} className="w-6 h-6" />
          <span className="font-medium text-lg">{overallStatus.message}</span>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap items-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            Refresh {currentInstanceConfig?.name} Services
          </button>
          <button
            onClick={toggleAutoRefresh}
            className={`px-6 py-3 font-semibold rounded-lg transition-all ${
              autoRefresh
                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/25'
                : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
            }`}
          >
            {autoRefresh ? 'Disable Auto-Refresh' : 'Enable Auto-Refresh'}
          </button>
          <RefreshCountdown
            timeLeft={countdown.timeLeft}
            formattedTime={countdown.formattedTime}
            progress={countdown.progress}
            isEnabled={autoRefresh}
          />
        </div>

        {/* Environment Grid for Current Instance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {instanceData.map(({ envKey, envConfig, serviceStatuses: envServiceStatuses }) => (
            <EnvironmentColumn
              key={envKey}
              instanceKey={currentInstance}
              instanceConfig={currentInstanceConfig}
              envKey={envKey}
              envConfig={envConfig}
              services={config.services}
              serviceStatuses={envServiceStatuses}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusMonitor;
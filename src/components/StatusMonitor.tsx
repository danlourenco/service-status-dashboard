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
import SettingsModal from './SettingsModal';
import type { ServiceStatus } from '../types';

const StatusMonitor: React.FC = () => {
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { 
    currentInstance, 
    autoRefresh, 
    customRefreshInterval,
    config,
    setCurrentInstance, 
    toggleAutoRefresh,
    setRefreshInterval,
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
        refetchInterval: autoRefresh ? (customRefreshInterval || config.app.refreshInterval || 30000) : undefined,
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
  const refreshInterval = customRefreshInterval || config?.app.refreshInterval || 30000;
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
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10 relative">
          <h1 className="text-3xl font-semibold mb-2 text-purple-400 tracking-tight">
            {config.app.title}
          </h1>
          <p className="text-slate-400 text-base">
            {config.app.description}
          </p>
          
          {/* Settings Button - Subtle placement */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-0 right-0 p-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Instance Tabs */}
        <div className="flex justify-center mb-12">
          <TabNavigation 
            tabs={instanceTabs}
            activeTab={currentInstance}
            onTabChange={handleInstanceChange}
          />
        </div>

        {/* Status Header - Single line with everything */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {currentInstanceConfig?.name} Services
            </h2>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${
              overallStatus.status === 'operational' 
                ? 'bg-green-900/30 border-green-600/30 text-green-400' 
                : overallStatus.status === 'degraded'
                ? 'bg-yellow-900/30 border-yellow-600/30 text-yellow-400'
                : 'bg-red-900/30 border-red-600/30 text-red-400'
            }`}>
              <StatusIndicator status={overallStatus.status as ServiceStatus['status']} className="w-1.5 h-1.5" />
              {overallStatus.message}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {autoRefresh && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="relative w-4 h-4">
                  <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 16 16">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      className="text-blue-400"
                      strokeDasharray={`${2 * Math.PI * 6}`}
                      strokeDashoffset={`${2 * Math.PI * 6 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.2s ease-out' }}
                    />
                  </svg>
                </div>
                <span className="font-mono text-xs">{countdown.formattedTime}</span>
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
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

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          autoRefresh={autoRefresh}
          refreshInterval={refreshInterval}
          onToggleAutoRefresh={toggleAutoRefresh}
          onIntervalChange={setRefreshInterval}
        />
      </div>
    </div>
  );
};

export default StatusMonitor;
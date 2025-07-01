import React from 'react';
import type { ServiceStatus } from '../types';

interface StatusIndicatorProps {
  status: ServiceStatus['status'];
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className = "w-3 h-3" }) => {
  const baseClasses = `${className} rounded-full`;
  
  switch (status) {
    case 'operational': 
      return <div className={`${baseClasses} bg-green-500`}></div>;
    case 'degraded': 
      return <div className={`${baseClasses} bg-yellow-500`}></div>;
    case 'outage': 
      return <div className={`${baseClasses} bg-red-500`}></div>;
    default: 
      return <div className={`${baseClasses} bg-gray-500`}></div>;
  }
};

export default StatusIndicator;
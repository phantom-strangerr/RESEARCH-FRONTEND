import React from 'react';
import { Link } from 'react-router-dom';

interface CompactDeviceHealth {
  name: string;
  status: 'online' | 'warning' | 'offline';
}

export const CompactDeviceHealth: React.FC = () => {
  const devices: CompactDeviceHealth[] = [
    { name: 'Feature Extractor', status: 'online' },
    { name: 'Edge ML Device', status: 'online' },
    { name: 'Cloud DL Model', status: 'online' },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      online: 'bg-green-500',
      warning: 'bg-yellow-500',
      offline: 'bg-red-500',
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusText = (status: string) => {
    const text = {
      online: 'text-green-700 dark:text-green-400',
      warning: 'text-yellow-700 dark:text-yellow-400',
      offline: 'text-red-700 dark:text-red-400',
    };
    return text[status as keyof typeof text];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">System Health</h3>
        <Link to="/system-health" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-2">
        {devices.map((device, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`}></div>
              <span className="text-sm text-gray-900 dark:text-white">{device.name}</span>
            </div>
            <span className={`text-xs font-medium uppercase ${getStatusText(device.status)}`}>
              {device.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

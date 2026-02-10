import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  status,
  trend,
  icon,
}) => {
  const statusColors = {
    healthy: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    critical: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    offline: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  };

  const trendIcons = {
    up: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    stable: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    ),
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${statusColors[status]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80 mb-2">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold">
              {value}
            </p>
            {unit && <span className="text-lg font-medium opacity-70">{unit}</span>}
          </div>
        </div>
        {icon && <div className="text-2xl opacity-70">{icon}</div>}
      </div>
      
      {trend && (
        <div className="flex items-center space-x-1 mt-4 text-sm font-medium">
          {trendIcons[trend]}
          <span className="capitalize">{trend}</span>
        </div>
      )}
    </div>
  );
};

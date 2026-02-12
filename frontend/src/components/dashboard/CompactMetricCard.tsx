import React from 'react';

interface CompactMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  icon?: React.ReactNode;
}

export const CompactMetricCard: React.FC<CompactMetricCardProps> = ({
  title,
  value,
  unit,
  status,
  icon,
}) => {
  const statusColors = {
    healthy: 'border-green-500 bg-green-50 dark:bg-green-900/10',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    critical: 'border-red-500 bg-red-50 dark:bg-red-900/10',
    offline: 'border-gray-500 bg-gray-50 dark:bg-gray-900/10',
  };

  return (
    <div className={`rounded-lg border-l-4 bg-white dark:bg-gray-800 p-3 ${statusColors[status]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline space-x-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {unit && <span className="text-sm text-gray-600 dark:text-gray-400">{unit}</span>}
          </div>
        </div>
        {icon && <div className="text-xl opacity-60 ml-2">{icon}</div>}
      </div>
    </div>
  );
};

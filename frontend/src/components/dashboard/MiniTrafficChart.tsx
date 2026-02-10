import React from 'react';
import { Link } from 'react-router-dom';

export const MiniTrafficChart: React.FC = () => {
  const dataPoints = [
    { label: '14:20', normal: 85, attack: 5 },
    { label: '14:21', normal: 78, attack: 12 },
    { label: '14:22', normal: 82, attack: 8 },
    { label: '14:23', normal: 70, attack: 20 },
    { label: '14:24', normal: 88, attack: 3 },
  ];

  const maxValue = 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Network Traffic</h3>
        <Link to="/metrics" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Details
        </Link>
      </div>

      {/* Mini bars */}
      <div className="space-y-2 flex-1">
        {dataPoints.map((point, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-12">{point.label}</span>
            <div className="flex-1 flex h-4 bg-gray-100 dark:bg-gray-900 rounded overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${(point.normal / maxValue) * 100}%` }}
                title={`Normal: ${point.normal}`}
              ></div>
              <div
                className="bg-red-500"
                style={{ width: `${(point.attack / maxValue) * 100}%` }}
                title={`Attack: ${point.attack}`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Normal</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Attack</span>
        </div>
      </div>
    </div>
  );
};

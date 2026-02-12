import React from 'react';
import { CompactMetricCard } from '../components/dashboard/CompactMetricCard';
import { CompactPacketMonitor } from '../components/dashboard/CompactPacketMonitor';
import { MiniTrafficChart } from '../components/dashboard/MiniTrafficChart';
import { MiniAttackTimeline } from '../components/dashboard/MiniAttackTimeline';
import { CompactDeviceHealth } from '../components/dashboard/CompactDeviceHealth';

export const DashboardPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Page Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Security Operations Center</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Real-time monitoring</p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 dark:text-green-400 font-medium">All Systems Operational</span>
        </div>
      </div>

      {/* Key Metrics Row - 2 compact cards, centered with max width */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-6 max-w-2xl w-full">
          <CompactMetricCard
            title="Total Devices"
            value="24"
            status="healthy"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
          />
          
          <CompactMetricCard
            title="Isolated Ports"
            value="3"
            status="warning"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Main Content Grid - 3 columns */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Left Column - Packet Monitor */}
        <div className="col-span-1">
          <CompactPacketMonitor />
        </div>

        {/* Middle Column - Device Health and Traffic Chart */}
        <div className="col-span-1 flex flex-col space-y-4">
          <CompactDeviceHealth />
          <div className="flex-1">
            <MiniTrafficChart />
          </div>
        </div>

        {/* Right Column - Attack Timeline */}
        <div className="col-span-1">
          <MiniAttackTimeline />
        </div>
      </div>
    </div>
  );
};

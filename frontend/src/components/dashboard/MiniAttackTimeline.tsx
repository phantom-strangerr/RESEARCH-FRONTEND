import React from 'react';
import { Link } from 'react-router-dom';

interface MiniTimelineEvent {
  timestamp: string;
  type: 'DOS' | 'Botnet' | 'Replay' | 'MitM';
  action: 'detected' | 'blocked' | 'isolated';
}

export const MiniAttackTimeline: React.FC = () => {
  const events: MiniTimelineEvent[] = [
    { timestamp: '14:23:45', type: 'DOS', action: 'isolated' },
    { timestamp: '14:23:12', type: 'Botnet', action: 'blocked' },
    { timestamp: '14:22:48', type: 'MitM', action: 'detected' },
    { timestamp: '14:21:33', type: 'Replay', action: 'blocked' },
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      DOS: 'text-red-600 dark:text-red-400',
      Botnet: 'text-orange-600 dark:text-orange-400',
      Replay: 'text-purple-600 dark:text-purple-400',
      MitM: 'text-yellow-600 dark:text-yellow-400',
    };
    return colors[type as keyof typeof colors];
  };

  const getActionColor = (action: string) => {
    if (action === 'isolated') return 'text-red-600 dark:text-red-400';
    if (action === 'blocked') return 'text-orange-600 dark:text-orange-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Events</h3>
        <Link to="/forensics" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Timeline
        </Link>
      </div>

      <div className="space-y-4 flex-1">
        {events.map((event, idx) => (
          <div key={idx} className="flex items-center text-xs py-1">
            <span className="font-mono text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">{event.timestamp}</span>
            <span className={`font-semibold w-20 flex-shrink-0 ${getTypeColor(event.type)}`}>{event.type}</span>
            <span className={`capitalize flex-1 ${getActionColor(event.action)}`}>{event.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

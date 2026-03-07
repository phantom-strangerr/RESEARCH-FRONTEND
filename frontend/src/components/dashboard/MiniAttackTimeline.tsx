import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';

interface RecentEvent {
  event_id: string;
  timestamp: string;
  attack_type: string;
  src_ip: string | null;
  ml_result: string;
  dl_detected: boolean;
}

export const MiniAttackTimeline: React.FC = () => {
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const response = await dashboardAPI.getRecentEvents(5);
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recent events:', err);
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      DOS:      'text-red-500 dark:text-red-400',
      Botnet:   'text-orange-500 dark:text-orange-400',
      Replay:   'text-purple-500 dark:text-purple-400',
      Spoofing: 'text-yellow-500 dark:text-yellow-400',
    };
    return colors[type] ?? 'text-gray-500';
  };

  const getMLResultColor = (result: string) => {
    const colors: Record<string, string> = {
      DOS:      'text-red-500 dark:text-red-400',
      Botnet:   'text-orange-500 dark:text-orange-400',
      Replay:   'text-purple-500 dark:text-purple-400',
      Spoofing: 'text-yellow-500 dark:text-yellow-400',
      Benign:   'text-green-500 dark:text-green-400',
    };
    return colors[result] ?? 'text-gray-500';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Events</h3>
        <Link
          to="/alerts"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-400 dark:text-gray-500">Loading events...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-400 dark:text-gray-500">No events detected yet</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400">
                <th className="text-left pb-2 font-medium">Time</th>
                <th className="text-left pb-2 font-medium">Type</th>
                <th className="text-left pb-2 font-medium">Source IP</th>
                <th className="text-left pb-2 font-medium">ML Result</th>
                <th className="text-left pb-2 font-medium">DL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {events.map((event) => (
                <tr key={event.event_id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-2 font-mono text-gray-500 dark:text-gray-400">
                    {formatTime(event.timestamp)}
                  </td>
                  <td className={`py-2 font-bold ${getTypeColor(event.attack_type)}`}>
                    {event.attack_type}
                  </td>
                  <td className="py-2 font-mono text-gray-900 dark:text-gray-300">
                    {event.src_ip ?? '—'}
                  </td>
                  <td className={`py-2 font-medium ${getMLResultColor(event.ml_result)}`}>
                    {event.ml_result}
                  </td>
                  <td className="py-2">
                    {event.dl_detected ? (
                      <span
                        title="Confirmed by Cloud DL model"
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      >
                        DL
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

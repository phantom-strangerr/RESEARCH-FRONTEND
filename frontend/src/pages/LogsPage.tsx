import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { systemLogsAPI } from '../services/api';

interface LogEntry {
  log_id: string;
  timestamp: string;
  log_level: string;
  log_source: string;
  message: string;
  event_id: string | null;
}

export const LogsPage: React.FC = () => {
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      const response = await systemLogsAPI.getLogs();
      setAllLogs(response.data);
      setError(null);
    } catch {
      setError('Failed to load system logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const levels = ['all', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'DEBUG'];

  const filteredLogs = activeLevel === 'all'
    ? allLogs
    : allLogs.filter(log => log.log_level.toUpperCase() === activeLevel);

  const countByLevel = (level: string) =>
    level === 'all' ? allLogs.length : allLogs.filter(l => l.log_level.toUpperCase() === level).length;

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      INFO:     'text-blue-600 dark:text-blue-400',
      WARNING:  'text-yellow-600 dark:text-yellow-400',
      ERROR:    'text-red-600 dark:text-red-400',
      CRITICAL: 'text-red-700 dark:text-red-300',
      DEBUG:    'text-gray-500 dark:text-gray-400',
    };
    return colors[level.toUpperCase()] ?? 'text-gray-600 dark:text-gray-400';
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      INFO:     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      WARNING:  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      ERROR:    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      CRITICAL: 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300',
      DEBUG:    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    };
    return colors[level.toUpperCase()] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">Dashboard</Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 dark:text-white">System Logs</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time system events and process logs</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center overflow-x-auto">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`relative px-6 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                activeLevel === level
                  ? 'text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
              }`}
            >
              <span>{level === 'all' ? 'All Logs' : level}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeLevel === level
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {countByLevel(level)}
              </span>
              {activeLevel === level && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading logs...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button onClick={fetchLogs} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">Retry</button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => (
              <div key={log.log_id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Timestamp */}
                  <div className="flex-shrink-0 w-36">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Level Badge */}
                  <div className="flex-shrink-0">
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${getLevelBadge(log.log_level)}`}>
                      {log.log_level}
                    </span>
                  </div>

                  {/* Source */}
                  <div className="flex-shrink-0 w-40">
                    <span className={`text-sm font-medium ${getLevelColor(log.log_level)}`}>
                      {log.log_source}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{log.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

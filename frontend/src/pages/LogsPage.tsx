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

const PAGE_SIZE = 100;

export const LogsPage: React.FC = () => {
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async (currentOffset = 0, append = false) => {
    try {
      const response = await systemLogsAPI.getLogs(PAGE_SIZE, currentOffset);
      const newLogs: LogEntry[] = response.data;
      setAllLogs(prev => append ? [...prev, ...newLogs] : newLogs);
      setHasMore(newLogs.length === PAGE_SIZE);
      setError(null);
    } catch {
      setError('Failed to load system logs');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLogs(0, false);
    const interval = setInterval(() => fetchLogs(0, false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadMore = async () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    setIsLoadingMore(true);
    await fetchLogs(newOffset, true);
  };

  const sortedLogs = [...allLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading logs...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button onClick={() => fetchLogs(0, false)} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">Retry</button>
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No logs found</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              Showing {sortedLogs.length} logs
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedLogs.map((log) => (
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
            {hasMore && (
              <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

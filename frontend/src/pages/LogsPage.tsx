import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LogEntry {
  id: string;
  timestamp: string;
  category: 'process' | 'system' | 'network' | 'security' | 'ml_model';
  source: string;
  message: string;
}

export const LogsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Hardcoded log data
  const allLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2025-02-07 14:23:45',
      category: 'process',
      source: 'feature_extractor.py',
      message: 'Script execution failed - Connection timeout while reading from network interface eth0',
    },
    {
      id: '2',
      timestamp: '2025-02-07 14:23:40',
      category: 'process',
      source: 'feature_extractor.py',
      message: 'Script restarted successfully - Process recovered after connection timeout',
    },
    {
      id: '3',
      timestamp: '2025-02-07 14:23:35',
      category: 'network',
      source: 'mqtt_client',
      message: 'MQTT connection established to broker at 192.168.1.100:1883',
    },
    {
      id: '4',
      timestamp: '2025-02-07 14:23:30',
      category: 'ml_model',
      source: 'xgboost_classifier',
      message: 'Model loaded successfully - Version 2.1.0, 1000 trees, max_depth=6',
    },
    {
      id: '5',
      timestamp: '2025-02-07 14:23:25',
      category: 'security',
      source: 'port_manager',
      message: 'Port 3 isolated due to DOS attack from 192.168.1.105',
    },
    {
      id: '6',
      timestamp: '2025-02-07 14:23:20',
      category: 'system',
      source: 'system_monitor',
      message: 'CPU usage: 45%, Memory: 62%, Disk: 78%',
    },
    {
      id: '7',
      timestamp: '2025-02-07 14:23:15',
      category: 'network',
      source: 'packet_capture',
      message: 'Captured 1024 packets in last minute - 95% normal, 5% suspicious',
    },
    {
      id: '8',
      timestamp: '2025-02-07 14:23:10',
      category: 'ml_model',
      source: 'inference_engine',
      message: 'Inference completed - 128 packets classified, avg time: 12.5ms',
    },
    {
      id: '9',
      timestamp: '2025-02-07 14:23:05',
      category: 'security',
      source: 'alert_manager',
      message: 'New alert generated - Botnet activity detected from 192.168.1.108',
    },
    {
      id: '10',
      timestamp: '2025-02-07 14:23:00',
      category: 'system',
      source: 'health_checker',
      message: 'System health check passed - All services operational',
    },
  ];

  // Filter logs by category
  const filteredLogs = activeCategory === 'all' 
    ? allLogs 
    : allLogs.filter(log => log.category === activeCategory);

  // Category tabs
  const categories = [
    { id: 'all', name: 'All Logs', count: allLogs.length },
    { id: 'process', name: 'Process', count: allLogs.filter(l => l.category === 'process').length },
    { id: 'system', name: 'System', count: allLogs.filter(l => l.category === 'system').length },
    { id: 'network', name: 'Network', count: allLogs.filter(l => l.category === 'network').length },
    { id: 'security', name: 'Security', count: allLogs.filter(l => l.category === 'security').length },
    { id: 'ml_model', name: 'ML Model', count: allLogs.filter(l => l.category === 'ml_model').length },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      process: 'text-blue-600 dark:text-blue-400',
      system: 'text-green-600 dark:text-green-400',
      network: 'text-purple-600 dark:text-purple-400',
      security: 'text-red-600 dark:text-red-400',
      ml_model: 'text-orange-600 dark:text-orange-400',
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 dark:text-white">System Logs</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Real-time system events and process logs
        </p>
      </div>

      {/* Chrome-style Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                relative px-6 py-3 text-sm font-medium whitespace-nowrap transition-all
                ${activeCategory === category.id
                  ? 'text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }
              `}
            >
              <span>{category.name}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeCategory === category.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {category.count}
              </span>
              {activeCategory === category.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                {/* Timestamp */}
                <div className="flex-shrink-0 w-36">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {log.timestamp}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="flex-shrink-0">
                  <span className={`text-xs font-medium uppercase ${getCategoryColor(log.category)}`}>
                    {log.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Source */}
                <div className="flex-shrink-0 w-40">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {log.source}
                  </span>
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {log.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No logs found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

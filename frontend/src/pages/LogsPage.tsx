import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical' | 'success';
  category: 'process' | 'system' | 'network' | 'security' | 'ml_model';
  source: string;
  message: string;
  details?: string;
  process?: {
    name: string;
    pid?: number;
    status: 'started' | 'running' | 'completed' | 'failed' | 'crashed';
  };
}

export const LogsPage: React.FC = () => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  // Hardcoded comprehensive log data
  const allLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2025-02-07 14:23:45.123',
      level: 'error',
      category: 'process',
      source: 'feature_extractor.py',
      message: 'Script execution failed',
      details: 'Connection timeout while reading from network interface eth0',
      process: { name: 'feature_extractor.py', pid: 1234, status: 'failed' }
    },
    {
      id: '2',
      timestamp: '2025-02-07 14:23:40.890',
      level: 'success',
      category: 'process',
      source: 'feature_extractor.py',
      message: 'Script restarted successfully',
      details: 'Process recovered after connection timeout',
      process: { name: 'feature_extractor.py', pid: 1234, status: 'running' }
    },
    {
      id: '3',
      timestamp: '2025-02-07 14:23:35.456',
      level: 'warning',
      category: 'process',
      source: 'ml_inference.py',
      message: 'High inference latency detected',
      details: 'Average inference time exceeded 20ms threshold (current: 24.5ms)',
      process: { name: 'ml_inference.py', pid: 1235, status: 'running' }
    },
    {
      id: '4',
      timestamp: '2025-02-07 14:23:30.234',
      level: 'info',
      category: 'process',
      source: 'mqtt_publisher.py',
      message: 'MQTT message published successfully',
      details: 'Published 150 messages to topic: edge/packets',
      process: { name: 'mqtt_publisher.py', pid: 1236, status: 'running' }
    },
    {
      id: '5',
      timestamp: '2025-02-07 14:23:25.678',
      level: 'critical',
      category: 'process',
      source: 'port_controller.py',
      message: 'Script crashed unexpectedly',
      details: 'Segmentation fault (core dumped). Exit code: 139',
      process: { name: 'port_controller.py', pid: 1237, status: 'crashed' }
    },
    {
      id: '6',
      timestamp: '2025-02-07 14:23:20.345',
      level: 'success',
      category: 'process',
      source: 'port_controller.py',
      message: 'Script started successfully',
      details: 'Process initialized with PID 1238',
      process: { name: 'port_controller.py', pid: 1238, status: 'started' }
    },
    {
      id: '7',
      timestamp: '2025-02-07 14:23:15.890',
      level: 'error',
      category: 'network',
      source: 'mqtt_client',
      message: 'MQTT connection lost',
      details: 'Connection to broker at mqtt.example.com:1883 timed out'
    },
    {
      id: '8',
      timestamp: '2025-02-07 14:23:10.567',
      level: 'success',
      category: 'network',
      source: 'mqtt_client',
      message: 'MQTT connection established',
      details: 'Connected to broker mqtt.example.com:1883'
    },
    {
      id: '9',
      timestamp: '2025-02-07 14:23:05.234',
      level: 'warning',
      category: 'system',
      source: 'systemd',
      message: 'Service restart limit reached',
      details: 'iot-edge-ml.service: Start request repeated too quickly'
    },
    {
      id: '10',
      timestamp: '2025-02-07 14:23:00.123',
      level: 'info',
      category: 'system',
      source: 'kernel',
      message: 'System resource usage normal',
      details: 'CPU: 45%, Memory: 62%, Disk: 44%'
    },
    {
      id: '11',
      timestamp: '2025-02-07 14:22:55.890',
      level: 'error',
      category: 'security',
      source: 'port_isolation',
      message: 'Port isolation command failed',
      details: 'SSH connection to switch 192.168.1.254 refused'
    },
    {
      id: '12',
      timestamp: '2025-02-07 14:22:50.456',
      level: 'success',
      category: 'security',
      source: 'port_isolation',
      message: 'Port 3 isolated successfully',
      details: 'DOS attack detected from 192.168.1.105, port disabled via err-disable'
    },
    {
      id: '13',
      timestamp: '2025-02-07 14:22:45.234',
      level: 'info',
      category: 'ml_model',
      source: 'onnx_runtime',
      message: 'Model inference completed',
      details: 'Processed 1000 packets in 12.5ms (avg: 12.5ms per prediction)'
    },
    {
      id: '14',
      timestamp: '2025-02-07 14:22:40.678',
      level: 'warning',
      category: 'ml_model',
      source: 'model_validator',
      message: 'Low confidence prediction detected',
      details: 'Prediction confidence 0.45 below threshold 0.75'
    },
    {
      id: '15',
      timestamp: '2025-02-07 14:22:35.345',
      level: 'critical',
      category: 'process',
      source: 'mqtt_publisher.py',
      message: 'Script execution failed - Memory error',
      details: 'MemoryError: Unable to allocate 2.5 GB for packet buffer',
      process: { name: 'mqtt_publisher.py', pid: 1236, status: 'failed' }
    },
    {
      id: '16',
      timestamp: '2025-02-07 14:22:30.123',
      level: 'info',
      category: 'process',
      source: 'feature_extractor.py',
      message: 'Packet capture rate updated',
      details: 'Current capture rate: 125.5 packets/sec',
      process: { name: 'feature_extractor.py', pid: 1234, status: 'running' }
    },
    {
      id: '17',
      timestamp: '2025-02-07 14:22:25.890',
      level: 'success',
      category: 'system',
      source: 'systemd',
      message: 'Service started successfully',
      details: 'mqtt-broker.service: Main process started with PID 987'
    },
    {
      id: '18',
      timestamp: '2025-02-07 14:22:20.567',
      level: 'error',
      category: 'process',
      source: 'ml_inference.py',
      message: 'Model loading failed',
      details: 'FileNotFoundError: Model file not found at /models/xgboost_model.onnx',
      process: { name: 'ml_inference.py', pid: 1235, status: 'failed' }
    },
    {
      id: '19',
      timestamp: '2025-02-07 14:22:15.234',
      level: 'warning',
      category: 'network',
      source: 'network_monitor',
      message: 'High packet loss detected',
      details: 'Packet loss on eth0: 5.2% (threshold: 1%)'
    },
    {
      id: '20',
      timestamp: '2025-02-07 14:22:10.678',
      level: 'info',
      category: 'security',
      source: 'attack_detector',
      message: 'Attack detection completed',
      details: 'Analyzed 500 packets, detected 3 DOS attacks, 2 Botnet attempts'
    },
  ];

  // Filter logs
  const filteredLogs = allLogs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  const getLevelColor = (level: string) => {
    const colors = {
      info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      success: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      error: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      critical: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    };
    return colors[level as keyof typeof colors];
  };

  const getProcessStatusColor = (status: string) => {
    const colors = {
      started: 'text-blue-600 dark:text-blue-400',
      running: 'text-green-600 dark:text-green-400',
      completed: 'text-gray-600 dark:text-gray-400',
      failed: 'text-red-600 dark:text-red-400',
      crashed: 'text-purple-600 dark:text-purple-400',
    };
    return colors[status as keyof typeof colors];
  };

  // Statistics
  const stats = {
    total: filteredLogs.length,
    errors: filteredLogs.filter(l => l.level === 'error' || l.level === 'critical').length,
    warnings: filteredLogs.filter(l => l.level === 'warning').length,
    processFailures: filteredLogs.filter(l => l.process?.status === 'failed' || l.process?.status === 'crashed').length,
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
          Process execution logs, script failures, system events, and security audit trail
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Errors</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.errors}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Warnings</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.warnings}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Process Failures</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.processFailures}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {(filterLevel !== 'all' || filterCategory !== 'all' || searchQuery !== '') && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredLogs.length}</span> of {allLogs.length} logs
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          {/* Log Level Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Log Level
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="process">Process Execution</option>
              <option value="system">System Events</option>
              <option value="network">Network</option>
              <option value="security">Security</option>
              <option value="ml_model">ML Model</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-48">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-300">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded border uppercase ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 capitalize">
                      {log.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-300">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      <div>
                        <p className="font-medium">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                        )}
                        {log.process && (
                          <div className="flex items-center space-x-3 mt-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Process:</span>
                            <span className="font-mono">{log.process.name}</span>
                            {log.process.pid && (
                              <span className="text-gray-500 dark:text-gray-400">PID: {log.process.pid}</span>
                            )}
                            <span className={`font-medium capitalize ${getProcessStatusColor(log.process.status)}`}>
                              [{log.process.status}]
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium mb-2">No logs found</p>
            <p className="text-sm">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

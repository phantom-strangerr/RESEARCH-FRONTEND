import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deviceHealthAPI } from '../services/api';

interface DeviceHealthLog {
  health_id: string;
  timestamp: string;
  cpu_usage_percent: number;
  cpu_temperature: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
}

const edgeSoftware = {
  pythonProcesses: [
    { name: 'feature_extractor.py', status: 'running' as const, pid: 1234 },
    { name: 'ml_inference.py', status: 'running' as const, pid: 1235 },
    { name: 'mqtt_publisher.py', status: 'running' as const, pid: 1236 },
    { name: 'port_controller.py', status: 'running' as const, pid: 1237 },
  ],
  mqttStatus: 'connected' as const,
  services: [
    { name: 'iot-edge-ml.service', status: 'active' as const },
    { name: 'mqtt-broker.service', status: 'active' as const },
    { name: 'network-monitor.service', status: 'active' as const },
  ],
};

const linkHealth = [
  {
    name: 'Feature Extractor ↔ Edge ML',
    mqttStatus: 'connected' as const,
    messageRate: 125.5,
    successRate: 99.8,
    latency: 2.3,
    queueDepth: 12,
    packetLoss: 0.2,
  },
  {
    name: 'Edge ML ↔ Cloud',
    mqttStatus: 'connected' as const,
    messageRate: 45.2,
    successRate: 98.5,
    latency: 45.8,
    queueDepth: 8,
    packetLoss: 1.5,
    cloudReachable: true,
    bandwidth: 2.5,
  },
];

const modelHealth = {
  models: [
    { name: 'XGBoost Classifier', type: 'ML' as const, status: 'online' as const },
    { name: 'Random Forest', type: 'ML' as const, status: 'online' as const },
    { name: 'Decision Tree', type: 'ML' as const, status: 'online' as const },
    { name: 'SVM (Support Vector Machine)', type: 'ML' as const, status: 'online' as const },
    { name: 'Deep Neural Network (DNN)', type: 'DL' as const, status: 'online' as const },
  ],
};

export const SystemHealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edge' | 'links' | 'model'>('edge');
  const [healthData, setHealthData] = useState<DeviceHealthLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const response = await deviceHealthAPI.getLatest();
      setHealthData(response.data);
      setError(null);
    } catch {
      setError('No health data available from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600 dark:text-red-400';
    if (value >= thresholds.warning) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBarColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-red-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const bytesToMB = (bytes: number) => (bytes / 1_000_000).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">Dashboard</Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 dark:text-white">System Health</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Health Monitor</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Comprehensive monitoring of Edge Device, Link Health, and ML Model performance
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {(['edge', 'links', 'model'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'edge' ? 'Edge Device' : tab === 'links' ? 'Link Health' : 'Model Health'}
            </button>
          ))}
        </nav>
      </div>

      {/* Edge Device Tab */}
      {activeTab === 'edge' && (
        <div className="space-y-6">
          {/* Hardware Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hardware Metrics</h2>
              {healthData && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading health data...</p>
            ) : error || !healthData ? (
              <p className="text-sm text-red-500 dark:text-red-400">{error ?? 'No data available'}</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6">
                  {/* CPU Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                      <span className={`text-sm font-bold ${getStatusColor(healthData.cpu_usage_percent, { warning: 70, critical: 85 })}`}>
                        {healthData.cpu_usage_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(healthData.cpu_usage_percent, { warning: 70, critical: 85 })}`} style={{ width: `${healthData.cpu_usage_percent}%` }}></div>
                    </div>
                  </div>

                  {/* CPU Temperature */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Temperature</span>
                      <span className={`text-sm font-bold ${getStatusColor(healthData.cpu_temperature, { warning: 60, critical: 75 })}`}>
                        {healthData.cpu_temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(healthData.cpu_temperature, { warning: 60, critical: 75 })}`} style={{ width: `${(healthData.cpu_temperature / 85) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Critical: &gt;75°C</p>
                  </div>

                  {/* Memory Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                      <span className={`text-sm font-bold ${getStatusColor(healthData.memory_usage_percent, { warning: 70, critical: 85 })}`}>
                        {healthData.memory_usage_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(healthData.memory_usage_percent, { warning: 70, critical: 85 })}`} style={{ width: `${healthData.memory_usage_percent}%` }}></div>
                    </div>
                  </div>

                  {/* Disk Usage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disk Usage</span>
                      <span className={`text-sm font-bold ${getStatusColor(healthData.disk_usage_percent, { warning: 70, critical: 85 })}`}>
                        {healthData.disk_usage_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(healthData.disk_usage_percent, { warning: 70, critical: 85 })}`} style={{ width: `${healthData.disk_usage_percent}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Network Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Network Sent</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{bytesToMB(healthData.network_tx_bytes)} MB</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Network Received</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{bytesToMB(healthData.network_rx_bytes)} MB</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Software Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Software Status</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Python Processes</h3>
                <div className="space-y-2">
                  {edgeSoftware.pythonProcesses.map((process, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${process.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">{process.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">PID: {process.pid}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">System Services</h3>
                <div className="space-y-2">
                  {edgeSoftware.services.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">{service.name}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        service.status === 'active' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                        'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                        {service.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MQTT Client Status</span>
                <span className="flex items-center space-x-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="capitalize">{edgeSoftware.mqttStatus}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Health Tab */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          {linkHealth.map((link, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{link.name}</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">MQTT Connection</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${link.mqttStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-lg font-bold capitalize ${link.mqttStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {link.mqttStatus}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Message Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{link.messageRate.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">msgs/sec</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{link.successRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Latency (RTT)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{link.latency.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ms</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Queue Depth</p>
                  <p className={`text-2xl font-bold ${getStatusColor(link.queueDepth, { warning: 50, critical: 100 })}`}>{link.queueDepth}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">messages</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Packet Loss</p>
                  <p className={`text-2xl font-bold ${getStatusColor(link.packetLoss, { warning: 1, critical: 5 })}`}>{link.packetLoss.toFixed(1)}%</p>
                </div>
                {'cloudReachable' in link && (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cloud Reachability</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${link.cloudReachable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-lg font-bold ${link.cloudReachable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {link.cloudReachable ? 'Reachable' : 'Unreachable'}
                        </span>
                      </div>
                    </div>
                    {'bandwidth' in link && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Bandwidth</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(link.bandwidth as number).toFixed(1)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mbps</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Health Tab */}
      {activeTab === 'model' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">ML/DL Models Status</h2>
            <div className="space-y-4">
              {modelHealth.models.map((model, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${model.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{model.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{model.type === 'ML' ? 'Machine Learning' : 'Deep Learning'}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    model.status === 'online'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  }`}>
                    {model.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Type definitions
interface EdgeDeviceHardware {
  cpuUsage: number;
  cpuFrequency: number;
  cpuTemp: number;
  memoryUsed: number;
  memoryAvailable: number;
  memoryPercent: number;
  diskUsed: number;
  diskTotal: number;
  diskPercent: number;
  diskIO: { read: number; write: number };
  uptime: string;
  networkSent: number;
  networkReceived: number;
  networkErrors: number;
  networkDrops: number;
}

interface EdgeDeviceSoftware {
  pythonProcesses: Array<{ name: string; status: 'running' | 'stopped' | 'error'; pid: number }>;
  mqttStatus: 'connected' | 'disconnected' | 'reconnecting';
  services: Array<{ name: string; status: 'active' | 'inactive' | 'failed' }>;
  lastOperation: string;
}

interface LinkHealth {
  name: string;
  mqttStatus: 'connected' | 'disconnected';
  messageRate: number;
  successRate: number;
  latency: number;
  queueDepth: number;
  lastMessage: string;
  packetLoss: number;
  cloudReachable?: boolean;
  bandwidth?: number;
}

interface ModelHealth {
  models: Array<{
    name: string;
    type: 'ML' | 'DL';
    status: 'online' | 'offline';
  }>;
}

export const SystemHealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edge' | 'links' | 'model'>('edge');

  // Hardcoded data - Edge Device Hardware
  const edgeHardware: EdgeDeviceHardware = {
    cpuUsage: 68.5,
    cpuFrequency: 1500, // MHz
    cpuTemp: 58.3,
    memoryUsed: 6.0, // GB
    memoryAvailable: 2.0, // GB
    memoryPercent: 75.2,
    diskUsed: 28.5, // GB
    diskTotal: 64, // GB
    diskPercent: 44.5,
    diskIO: { read: 12.5, write: 8.3 }, // MB/s
    uptime: '15d 8h 23m',
    networkSent: 125.3, // MB
    networkReceived: 89.7, // MB
    networkErrors: 3,
    networkDrops: 1,
  };

  // Hardcoded data - Edge Device Software
  const edgeSoftware: EdgeDeviceSoftware = {
    pythonProcesses: [
      { name: 'feature_extractor.py', status: 'running', pid: 1234 },
      { name: 'ml_inference.py', status: 'running', pid: 1235 },
      { name: 'mqtt_publisher.py', status: 'running', pid: 1236 },
      { name: 'port_controller.py', status: 'running', pid: 1237 },
    ],
    mqttStatus: 'connected',
    services: [
      { name: 'iot-edge-ml.service', status: 'active' },
      { name: 'mqtt-broker.service', status: 'active' },
      { name: 'network-monitor.service', status: 'active' },
    ],
    lastOperation: '2025-02-07 14:23:45',
  };

  // Hardcoded data - Link Health
  const linkHealth: LinkHealth[] = [
    {
      name: 'Feature Extractor ↔ Edge ML',
      mqttStatus: 'connected',
      messageRate: 125.5, // msgs/sec
      successRate: 99.8,
      latency: 2.3, // ms
      queueDepth: 12,
      lastMessage: '2025-02-07 14:23:45.123',
      packetLoss: 0.2,
    },
    {
      name: 'Edge ML ↔ Cloud',
      mqttStatus: 'connected',
      messageRate: 45.2,
      successRate: 98.5,
      latency: 45.8,
      queueDepth: 8,
      lastMessage: '2025-02-07 14:23:44.890',
      packetLoss: 1.5,
      cloudReachable: true,
      bandwidth: 2.5, // Mbps
    },
  ];

  // Hardcoded data - Model Health
  const modelHealth: ModelHealth = {
    models: [
      { name: 'XGBoost Classifier', type: 'ML', status: 'online' },
      { name: 'Random Forest', type: 'ML', status: 'online' },
      { name: 'Decision Tree', type: 'ML', status: 'online' },
      { name: 'SVM (Support Vector Machine)', type: 'ML', status: 'online' },
      { name: 'Deep Neural Network (DNN)', type: 'DL', status: 'online' },
    ],
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600 dark:text-red-400';
    if (value >= thresholds.warning) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressBarColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-red-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
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
          <button
            onClick={() => setActiveTab('edge')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'edge'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Edge Device
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'links'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Link Health
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'model'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Model Health
          </button>
        </nav>
      </div>

      {/* Edge Device Tab */}
      {activeTab === 'edge' && (
        <div className="space-y-6">
          {/* Hardware Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hardware Metrics</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* CPU Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                  <span className={`text-sm font-bold ${getStatusColor(edgeHardware.cpuUsage, { warning: 70, critical: 85 })}`}>
                    {edgeHardware.cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(edgeHardware.cpuUsage, { warning: 70, critical: 85 })}`}
                    style={{ width: `${edgeHardware.cpuUsage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Frequency: {edgeHardware.cpuFrequency} MHz
                </p>
              </div>

              {/* CPU Temperature */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Temperature</span>
                  <span className={`text-sm font-bold ${getStatusColor(edgeHardware.cpuTemp, { warning: 60, critical: 75 })}`}>
                    {edgeHardware.cpuTemp.toFixed(1)}°C
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(edgeHardware.cpuTemp, { warning: 60, critical: 75 })}`}
                    style={{ width: `${(edgeHardware.cpuTemp / 85) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Critical: &gt;75°C
                </p>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                  <span className={`text-sm font-bold ${getStatusColor(edgeHardware.memoryPercent, { warning: 70, critical: 85 })}`}>
                    {edgeHardware.memoryPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(edgeHardware.memoryPercent, { warning: 70, critical: 85 })}`}
                    style={{ width: `${edgeHardware.memoryPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Used: {edgeHardware.memoryUsed.toFixed(1)} GB / Available: {edgeHardware.memoryAvailable.toFixed(1)} GB
                </p>
              </div>

              {/* Disk Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disk Usage</span>
                  <span className={`text-sm font-bold ${getStatusColor(edgeHardware.diskPercent, { warning: 70, critical: 85 })}`}>
                    {edgeHardware.diskPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(edgeHardware.diskPercent, { warning: 70, critical: 85 })}`}
                    style={{ width: `${edgeHardware.diskPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {edgeHardware.diskUsed.toFixed(1)} GB / {edgeHardware.diskTotal} GB | I/O: R: {edgeHardware.diskIO.read} MB/s W: {edgeHardware.diskIO.write} MB/s
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">System Uptime</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{edgeHardware.uptime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Network Sent/Received</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {edgeHardware.networkSent.toFixed(1)} / {edgeHardware.networkReceived.toFixed(1)} MB
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Network Errors/Drops</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {edgeHardware.networkErrors} / {edgeHardware.networkDrops}
                </p>
              </div>
            </div>
          </div>

          {/* Software Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Software Status</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Python Processes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Python Processes</h3>
                <div className="space-y-2">
                  {edgeSoftware.pythonProcesses.map((process, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          process.status === 'running' ? 'bg-green-500' :
                          process.status === 'stopped' ? 'bg-gray-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">{process.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">PID: {process.pid}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">System Services</h3>
                <div className="space-y-2">
                  {edgeSoftware.services.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">{service.name}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        service.status === 'active' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                        service.status === 'inactive' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400' :
                        'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                        {service.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MQTT Status and Last Operation */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MQTT Client Status</span>
                <span className={`flex items-center space-x-2 text-sm font-medium ${
                  edgeSoftware.mqttStatus === 'connected' ? 'text-green-600 dark:text-green-400' :
                  edgeSoftware.mqttStatus === 'reconnecting' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    edgeSoftware.mqttStatus === 'connected' ? 'bg-green-500' :
                    edgeSoftware.mqttStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="capitalize">{edgeSoftware.mqttStatus}</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Operation</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">{edgeSoftware.lastOperation}</span>
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
                {/* MQTT Status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">MQTT Connection</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      link.mqttStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-lg font-bold capitalize ${
                      link.mqttStatus === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {link.mqttStatus}
                    </span>
                  </div>
                </div>

                {/* Message Rate */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Message Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{link.messageRate.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">msgs/sec</p>
                </div>

                {/* Success Rate */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Success Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor(link.successRate, { warning: 95, critical: 90 })}`}>
                    {link.successRate.toFixed(1)}%
                  </p>
                </div>

                {/* Latency */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Latency (RTT)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{link.latency.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ms</p>
                </div>

                {/* Queue Depth */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Queue Depth</p>
                  <p className={`text-2xl font-bold ${getStatusColor(link.queueDepth, { warning: 50, critical: 100 })}`}>
                    {link.queueDepth}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">messages</p>
                </div>

                {/* Packet Loss */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Packet Loss</p>
                  <p className={`text-2xl font-bold ${getStatusColor(link.packetLoss, { warning: 1, critical: 5 })}`}>
                    {link.packetLoss.toFixed(1)}%
                  </p>
                </div>

                {/* Cloud-specific metrics */}
                {link.cloudReachable !== undefined && (
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

                    {link.bandwidth !== undefined && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Bandwidth Utilization</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{link.bandwidth.toFixed(1)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mbps</p>
                      </div>
                    )}
                  </>
                )}

                {/* Last Message */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg col-span-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Last Message Received</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">{link.lastMessage}</p>
                </div>
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
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      model.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {model.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {model.type === 'ML' ? 'Machine Learning' : 'Deep Learning'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      model.status === 'online' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {model.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

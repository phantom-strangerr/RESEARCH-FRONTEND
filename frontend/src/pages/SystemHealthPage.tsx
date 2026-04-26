import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deviceHealthAPI, dashboardAPI } from '../services/api';

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

interface LinkHealthData {
  total_packets: number;
  normal_packets: number;
  attack_packets: number;
  success_rate: number;
  packet_rate_per_min: number;
  window_minutes: number;
}

interface ModelHealthData {
  total_records: number;
  ml_detections: number;
  dl_detections: number;
  ml_attacks_flagged: number;
  dl_attacks_flagged: number;
}

interface ExtractorHealthData {
  total_features_extracted: number;
  recent_features: number;
  throughput_per_min: number;
  window_minutes: number;
  protocol_counts: Record<string, number>;
  avg_packet_size: number;
  min_packet_size: number;
  max_packet_size: number;
  avg_byte_count: number;
  min_byte_count: number;
  max_byte_count: number;
  avg_processing_latency_ms: number;
  last_seen: string | null;
}

export const SystemHealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edge' | 'links' | 'model' | 'extractor'>('edge');
  const [healthData, setHealthData] = useState<DeviceHealthLog | null>(null);
  const [linkHealth, setLinkHealth] = useState<LinkHealthData | null>(null);
  const [modelHealth, setModelHealth] = useState<ModelHealthData | null>(null);
  const [extractorHealth, setExtractorHealth] = useState<ExtractorHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [hwRes, linkRes, modelRes, extractorRes] = await Promise.allSettled([
        deviceHealthAPI.getLatest(),
        dashboardAPI.getLinkHealth(),
        dashboardAPI.getModelHealth(),
        dashboardAPI.getExtractorHealth(),
      ]);
      if (hwRes.status       === 'fulfilled') setHealthData(hwRes.value.data);
      if (linkRes.status     === 'fulfilled') setLinkHealth(linkRes.value.data);
      if (modelRes.status    === 'fulfilled') setModelHealth(modelRes.value.data);
      if (extractorRes.status === 'fulfilled') setExtractorHealth(extractorRes.value.data);
      setError(null);
    } catch {
      setError('Failed to load health data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
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
        <Link to="/dashboard" className="text-green-400 hover:underline">Dashboard</Link>
        <span className="text-gray-500">/</span>
        <span className="text-slate-900 dark:text-white">System Health</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Health Monitor</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Comprehensive monitoring of Edge Device, Link Health, and ML Model performance
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {(['edge', 'links', 'model', 'extractor'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-green-400 text-green-400'
                  : 'border-transparent text-gray-500 hover:text-slate-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'edge' ? 'Edge Device' : tab === 'links' ? 'Link Health' : tab === 'model' ? 'Model Health' : 'Feature Extractor'}
            </button>
          ))}
        </nav>
      </div>

      {/* Edge Device Tab */}
      {activeTab === 'edge' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hardware Metrics</h2>
              {healthData && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading health data...</p>
            ) : error || !healthData ? (
              <p className="text-sm text-red-500 dark:text-red-400">{error ?? 'No data available'}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">CPU Usage</span>
                      <span className={`text-sm font-bold ${getStatusColor(healthData.cpu_usage_percent, { warning: 70, critical: 85 })}`}>
                        {healthData.cpu_usage_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(healthData.cpu_usage_percent, { warning: 70, critical: 85 })}`} style={{ width: `${healthData.cpu_usage_percent}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">CPU Temperature</span>
                      <span className={`text-sm font-bold ${getStatusColor(healthData.cpu_temperature, { warning: 60, critical: 75 })}`}>
                        {healthData.cpu_temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(healthData.cpu_temperature, { warning: 60, critical: 75 })}`} style={{ width: `${(healthData.cpu_temperature / 85) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Critical: &gt;75°C</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Memory Usage</span>
                      <span className={`text-sm font-bold ${getStatusColor(healthData.memory_usage_percent, { warning: 70, critical: 85 })}`}>
                        {healthData.memory_usage_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(healthData.memory_usage_percent, { warning: 70, critical: 85 })}`} style={{ width: `${healthData.memory_usage_percent}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Disk Usage</span>
                      <span className={`text-sm font-bold ${getStatusColor(healthData.disk_usage_percent, { warning: 70, critical: 85 })}`}>
                        {healthData.disk_usage_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${getBarColor(healthData.disk_usage_percent, { warning: 70, critical: 85 })}`} style={{ width: `${healthData.disk_usage_percent}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Network Sent</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{bytesToMB(healthData.network_tx_bytes)} MB</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Network Received</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{bytesToMB(healthData.network_rx_bytes)} MB</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Link Health Tab */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Traffic Link Health</h2>
              {linkHealth && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Last {linkHealth.window_minutes} minutes
                </span>
              )}
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading link health data...</p>
            ) : !linkHealth ? (
              <p className="text-sm text-red-500 dark:text-red-400">No link health data available</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Total Packets</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{linkHealth.total_packets}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">last {linkHealth.window_minutes} min</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Normal Packets</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{linkHealth.normal_packets}</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Attack Packets</p>
                  <p className={`text-2xl font-bold ${linkHealth.attack_packets > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {linkHealth.attack_packets}
                  </p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Success Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor(100 - linkHealth.success_rate, { warning: 5, critical: 15 })}`}>
                    {linkHealth.success_rate}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">normal traffic</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Packet Rate</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{linkHealth.packet_rate_per_min}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">packets/min</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Link Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model Health Tab */}
      {activeTab === 'model' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">ML/DL Model Detection Stats</h2>

            {isLoading ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading model health data...</p>
            ) : !modelHealth ? (
              <p className="text-sm text-red-500 dark:text-red-400">No model health data available</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Total Records Processed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{modelHealth.total_records}</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">ML Detections</p>
                    <p className="text-2xl font-bold text-green-400">{modelHealth.ml_detections}</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">DL Detections</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{modelHealth.dl_detections}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* ML Model row */}
                  <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${modelHealth.ml_detections > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">ML Models</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Machine Learning — {modelHealth.ml_detections} records processed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        modelHealth.ml_detections > 0
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {modelHealth.ml_detections > 0 ? 'Active' : 'No Data'}
                      </span>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{modelHealth.ml_attacks_flagged} attacks flagged</p>
                    </div>
                  </div>

                  {/* DL Model row */}
                  <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${modelHealth.dl_detections > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">DL Models</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Deep Learning — {modelHealth.dl_detections} records processed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        modelHealth.dl_detections > 0
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {modelHealth.dl_detections > 0 ? 'Active' : 'No Data'}
                      </span>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">{modelHealth.dl_attacks_flagged} attacks flagged</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Feature Extractor Tab */}
      {activeTab === 'extractor' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Feature Extractor Metrics</h2>
              {extractorHealth?.last_seen && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Last updated: {new Date(extractorHealth.last_seen).toLocaleTimeString()}
                </span>
              )}
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading extractor data...</p>
            ) : error || !extractorHealth ? (
              <p className="text-sm text-red-500 dark:text-red-400">{error ?? 'No data available'}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Avg Processing Latency</span>
                      <span className={`text-sm font-bold ${getStatusColor(extractorHealth.avg_processing_latency_ms, { warning: 100, critical: 300 })}`}>
                        {extractorHealth.avg_processing_latency_ms} ms
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getBarColor(extractorHealth.avg_processing_latency_ms, { warning: 100, critical: 300 })}`}
                        style={{ width: `${Math.min((extractorHealth.avg_processing_latency_ms / 300) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Critical: &gt;300ms</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Throughput</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {extractorHealth.throughput_per_min} /min
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min((extractorHealth.throughput_per_min / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Avg Packet Size</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {extractorHealth.avg_packet_size} B
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min((extractorHealth.avg_packet_size / 1500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Avg Byte Count</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {(extractorHealth.avg_byte_count / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${Math.min((extractorHealth.avg_byte_count / 1_500_000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Features Extracted</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{extractorHealth.total_features_extracted.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Recent Features</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {extractorHealth.recent_features.toLocaleString()}
                      <span className="text-xs text-gray-500 font-normal ml-1">/ last {extractorHealth.window_minutes} min</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

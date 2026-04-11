import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';

interface Alert {
  event_id: string;
  timestamp: string;
  attack_type: string;
  severity: string;
  model_name: string;
  processing_latency_ms: number;
  mitigation: string | null;
  src_ip: string | null;
  dst_ip: string | null;
  protocol: string | null;
  byte_count: number | null;
  packet_size: number | null;
  src_mac: string | null;
  dst_mac: string | null;
  ml: boolean | null;
  dl: boolean | null;
}

const PAGE_SIZE = 50;

export const AlertsPage: React.FC = () => {
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchAlerts = async (currentOffset = 0, append = false) => {
    try {
      const response = await dashboardAPI.getAlerts(PAGE_SIZE, currentOffset);
      const newAlerts: Alert[] = response.data;
      setAllAlerts(prev => append ? [...prev, ...newAlerts] : newAlerts);
      setHasMore(newAlerts.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    setIsLoadingMore(true);
    fetchAlerts(newOffset, true);
  };

  useEffect(() => {
    fetchAlerts(0, false);
  }, []);

  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesType = filterType === 'all' || alert.attack_type === filterType;
    return matchesSeverity && matchesType;
  });

  const stats = {
    total: allAlerts.length,
    critical: allAlerts.filter(a => a.severity === 'critical').length,
    high: allAlerts.filter(a => a.severity === 'high').length,
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
      high:     'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700',
      medium:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
      low:      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    };
    return colors[severity] ?? '';
  };

  const getAttackTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Mirai:    'text-pink-600 dark:text-pink-400',
      DOS:      'text-orange-600 dark:text-orange-400',
      Replay:   'text-purple-600 dark:text-purple-400',
      Spoofing: 'text-red-600 dark:text-red-400',
    };
    return colors[type] ?? 'text-gray-600';
  };

  const formatMitigation = (mitigation: string | null) => {
    if (!mitigation) return '—';
    return mitigation.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-green-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-slate-900 dark:text-white">Alerts</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alert Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Security alerts and mitigation controls
        </p>
      </div>

      {isLoading ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading alerts...</p>
        </div>
      ) : error ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button onClick={fetchAlerts} className="mt-3 text-sm text-green-400 hover:underline">
            Retry
          </button>
        </div>
      ) : allAlerts.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No alerts detected yet</p>
          <p className="text-xs text-gray-500 mt-1">Alerts will appear here when attacks are detected</p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.critical}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.high}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300 block mb-2">Severity</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300 block mb-2">Attack Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="Mirai">Mirai</option>
                  <option value="DOS">DOS</option>
                  <option value="Replay">Replay</option>
                  <option value="Spoofing">Spoofing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alerts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alerts List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.event_id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedAlert?.event_id === alert.event_id
                      ? 'border-green-400'
                      : 'border-gray-700 hover:border-green-600'
                  }`}
                >
                  {/* Top row — severity + attack type + mitigation */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded border text-xs font-bold uppercase ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`text-lg font-bold ${getAttackTypeColor(alert.attack_type)}`}>
                        {alert.attack_type} Attack
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium uppercase bg-gray-700 text-slate-700 dark:text-gray-300">
                      {formatMitigation(alert.mitigation)}
                    </span>
                  </div>

                  {/* Middle rows — event details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Event ID</p>
                      <p className="font-mono font-medium text-xs text-slate-900 dark:text-white">{alert.event_id.slice(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Timestamp</p>
                      <p className="font-mono text-xs text-slate-900 dark:text-white">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Source IP</p>
                      <p className="font-mono text-slate-900 dark:text-white">{alert.src_ip ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Model</p>
                      <p className="font-medium text-slate-900 dark:text-white">{alert.model_name}</p>
                    </div>
                  </div>

                  {/* Bottom-left — ML / DL detection labels */}
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-700">
                    {alert.ml && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-900/30 text-green-400 border border-green-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <span>ML Detected</span>
                      </span>
                    )}
                    {alert.dl && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>DL Detected</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No alerts match your filters</p>
                </div>
              )}

              {hasMore && (
                <div className="pt-2 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    {isLoadingMore ? 'Loading...' : `Load More (showing ${allAlerts.length})`}
                  </button>
                </div>
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-1 sticky top-6">
              {selectedAlert ? (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Alert Details</h3>

                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Severity</p>
                      <span className={`px-2 py-1 rounded border text-xs font-bold uppercase ${getSeverityColor(selectedAlert.severity)}`}>
                        {selectedAlert.severity}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Protocol</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedAlert.protocol ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Destination IP</p>
                      <p className="font-mono text-slate-900 dark:text-white">{selectedAlert.dst_ip ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Source MAC</p>
                      <p className="font-mono text-xs text-slate-900 dark:text-white">{selectedAlert.src_mac ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Destination MAC</p>
                      <p className="font-mono text-xs text-slate-900 dark:text-white">{selectedAlert.dst_mac ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Packet Size</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedAlert.packet_size != null ? `${selectedAlert.packet_size}B` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Bytes Transferred</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedAlert.byte_count != null
                          ? `${(selectedAlert.byte_count / 1024).toFixed(2)} KB`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Processing Latency</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedAlert.processing_latency_ms.toFixed(2)} ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Mitigation</p>
                      <p className="font-medium text-slate-900 dark:text-white">{formatMitigation(selectedAlert.mitigation)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Detection Source</p>
                      <div className="flex items-center space-x-2">
                        {selectedAlert.ml && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-900/30 text-green-400 border border-green-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            <span>ML Detected</span>
                          </span>
                        )}
                        {selectedAlert.dl && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>DL Detected</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Select an alert to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { portsAPI } from '../services/api';

interface Port {
  port_id: string;
  port_number: number;
  status: 'active' | 'isolated' | 'disabled' | 'warning';
  device_ip: string | null;
  device_mac: string | null;
  device_name: string | null;
  vlan: number | null;
  speed: string | null;
  isolation_reason: string | null;
  isolated_at: string | null;
  isolated_by: string | null;
  last_activity: string | null;
  bytes_sent: number;
  bytes_received: number;
  errors: number;
  drops: number;
  alert_event_id: string | null;
  updated_at: string | null;
}

export const PortsPage: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [portToLift, setPortToLift] = useState<Port | null>(null);
  const [showIsolateModal, setShowIsolateModal] = useState(false);
  const [isolateReason, setIsolateReason] = useState('');
  const [portToIsolate, setPortToIsolate] = useState<Port | null>(null);
  const [showManualIsolateModal, setShowManualIsolateModal] = useState(false);
  const [manualPortNumber, setManualPortNumber] = useState('');
  const [manualIsolateReason, setManualIsolateReason] = useState('');
  const [highlightedPorts, setHighlightedPorts] = useState<Set<string>>(new Set());

  const fetchPorts = async () => {
    try {
      const response = await portsAPI.getAllPorts();
      setPorts(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch ports:', err);
      setError('Failed to load port data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
    const interval = setInterval(fetchPorts, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredPorts = ports.filter(port => {
    return filterStatus === 'all' || port.status === filterStatus;
  });

  const stats = {
    total: ports.length,
    active: ports.filter(p => p.status === 'active').length,
    isolated: ports.filter(p => p.status === 'isolated').length,
    warning: ports.filter(p => p.status === 'warning').length,
  };

  const handleIsolateClick = (port: Port) => {
    setPortToIsolate(port);
    setShowIsolateModal(true);
  };

  const handleIsolateSubmit = async () => {
    if (!portToIsolate || !isolateReason.trim()) return;
    try {
      await portsAPI.isolatePort(portToIsolate.port_id, {
        reason: isolateReason,
        isolated_by: 'manual',
      });
      setShowIsolateModal(false);
      setPortToIsolate(null);
      setIsolateReason('');
      setHighlightedPorts(prev => new Set(prev).add(portToIsolate.port_id));
      setTimeout(() => {
        setHighlightedPorts(prev => {
          const next = new Set(prev);
          next.delete(portToIsolate.port_id);
          return next;
        });
      }, 3000);
      fetchPorts();
    } catch (err) {
      console.error('Failed to isolate port:', err);
    }
  };

  const handleLiftClick = (port: Port) => {
    setPortToLift(port);
    setShowAuthModal(true);
  };

  const handleAuthSubmit = async () => {
    if (authCode !== '1234' || !portToLift) return;
    try {
      await portsAPI.liftIsolation(portToLift.port_id);
      setShowAuthModal(false);
      setAuthCode('');
      setHighlightedPorts(prev => new Set(prev).add(portToLift.port_id));
      setTimeout(() => {
        setHighlightedPorts(prev => {
          const next = new Set(prev);
          next.delete(portToLift.port_id);
          return next;
        });
      }, 3000);
      setPortToLift(null);
      fetchPorts();
    } catch (err) {
      console.error('Failed to lift isolation:', err);
    }
  };

  const handleManualIsolateSubmit = async () => {
    const portNum = parseInt(manualPortNumber);
    if (!portNum || !manualIsolateReason.trim()) return;
    const targetPort = ports.find(p => p.port_number === portNum);
    if (!targetPort) return;
    try {
      await portsAPI.isolatePort(targetPort.port_id, {
        reason: manualIsolateReason,
        isolated_by: 'manual',
      });
      setShowManualIsolateModal(false);
      setManualPortNumber('');
      setManualIsolateReason('');
      fetchPorts();
    } catch (err) {
      console.error('Failed to manually isolate port:', err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active:   'text-green-500',
      isolated: 'text-red-500',
      disabled: 'text-gray-500',
      warning:  'text-yellow-500',
    };
    return colors[status] ?? 'text-gray-500';
  };

  const getBorderColor = (status: string) => {
    const colors: Record<string, string> = {
      active:   'border-green-500',
      isolated: 'border-red-500',
      disabled: 'border-gray-500',
      warning:  'border-yellow-500',
    };
    return colors[status] ?? 'border-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Port Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor and manage switch ports with isolation controls and authorization
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading port data...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button onClick={fetchPorts} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">Retry</button>
        </div>
      ) : ports.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No switch ports configured</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Port data will appear once the edge device starts reporting</p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Ports</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.active}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Isolated</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.isolated}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Warning</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.warning}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</span>
            {['all', 'active', 'isolated', 'warning'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? `All (${stats.total})` : `${status.charAt(0).toUpperCase() + status.slice(1)} (${stats[status as keyof typeof stats]})`}
              </button>
            ))}
            <div className="flex-1"></div>
            <button
              onClick={() => setShowManualIsolateModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>Manual Isolate</span>
            </button>
          </div>

          {/* Port Cards */}
          <div className="grid grid-cols-3 gap-4">
            {filteredPorts.map(port => (
              <div
                key={port.port_id}
                className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 transition-all ${getBorderColor(port.status)} ${
                  highlightedPorts.has(port.port_id) ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-900' : ''
                }`}
              >
                {/* Port Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${getStatusColor(port.status)}`}>
                      {port.status === 'active' ? '✓' : port.status === 'isolated' ? '⊘' : port.status === 'warning' ? '⚠' : '—'}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Port {port.port_number}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{port.device_name || 'Unknown'}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold uppercase ${getStatusColor(port.status)}`}>
                    {port.status}
                  </span>
                </div>

                {/* Port Details */}
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">IP Address</span>
                    <span className="font-mono text-gray-900 dark:text-white">{port.device_ip || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">MAC Address</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">{port.device_mac || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">VLAN</span>
                    <span className="text-gray-900 dark:text-white">{port.vlan ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Speed</span>
                    <span className="text-gray-900 dark:text-white">{port.speed || '—'}</span>
                  </div>
                </div>

                {/* Isolation Info */}
                {port.status === 'isolated' && port.isolation_reason && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded p-2 mb-3">
                    <p className="text-xs text-red-700 dark:text-red-400">
                      <strong>Isolation Reason:</strong><br />
                      {port.isolation_reason}
                      {port.isolated_at && (
                        <><br />Isolated: {new Date(port.isolated_at).toLocaleString()}</>
                      )}
                    </p>
                  </div>
                )}

                {/* Traffic Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Sent</span>
                    <p className="font-bold text-gray-900 dark:text-white">{port.bytes_sent.toFixed(1)} MB</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Received</span>
                    <p className="font-bold text-gray-900 dark:text-white">{port.bytes_received.toFixed(1)} MB</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Errors</span>
                    <p className="font-bold text-gray-900 dark:text-white">{port.errors}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Drops</span>
                    <p className="font-bold text-gray-900 dark:text-white">{port.drops}</p>
                  </div>
                </div>

                {/* Action Button */}
                {port.status === 'isolated' ? (
                  <button
                    onClick={() => handleLiftClick(port)}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span>Lift Isolation (Auth Required)</span>
                  </button>
                ) : port.status === 'active' ? (
                  <button
                    onClick={() => handleIsolateClick(port)}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span>Isolate Port</span>
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {filteredPorts.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No ports match your filter</p>
            </div>
          )}

          {/* Auth Modal */}
          {showAuthModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Authorization Required</h3>
                  <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    You are about to lift isolation on <span className="font-bold">Port {portToLift?.port_number}</span>.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-4">
                    <p className="text-xs text-yellow-800 dark:text-yellow-400">
                      <strong>Warning:</strong> This device was isolated due to: {portToLift?.isolation_reason}
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Authorization Code:</label>
                  <input
                    type="password"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="Enter code (demo: 1234)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
                  />
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setShowAuthModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                  <button onClick={handleAuthSubmit} className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium">Authorize & Lift</button>
                </div>
              </div>
            </div>
          )}

          {/* Isolate Modal */}
          {showIsolateModal && portToIsolate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Isolate Port</h3>
                  <button onClick={() => { setShowIsolateModal(false); setPortToIsolate(null); setIsolateReason(''); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    You are about to isolate <span className="font-bold">Port {portToIsolate.port_number}</span>
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
                    <p className="text-xs text-blue-800 dark:text-blue-400">
                      <strong>Device:</strong> {portToIsolate.device_name || 'Unknown'} ({portToIsolate.device_ip})
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Isolation: *</label>
                  <textarea
                    value={isolateReason}
                    onChange={(e) => setIsolateReason(e.target.value)}
                    placeholder="e.g., Suspicious traffic detected..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => { setShowIsolateModal(false); setPortToIsolate(null); setIsolateReason(''); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                  <button onClick={handleIsolateSubmit} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Isolate Port</button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Isolate Modal */}
          {showManualIsolateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Port Isolation</h3>
                  <button onClick={() => { setShowManualIsolateModal(false); setManualPortNumber(''); setManualIsolateReason(''); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-6 space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enter the port number you want to isolate manually</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Port Number: *</label>
                    <input type="number" value={manualPortNumber} onChange={(e) => setManualPortNumber(e.target.value)} placeholder="e.g., 1, 2, 3..." min="1" max="48" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Isolation: *</label>
                    <textarea value={manualIsolateReason} onChange={(e) => setManualIsolateReason(e.target.value)} placeholder="e.g., Security threat detected..." rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none" />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => { setShowManualIsolateModal(false); setManualPortNumber(''); setManualIsolateReason(''); }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                  <button onClick={handleManualIsolateSubmit} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Isolate Port</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
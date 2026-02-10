import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Alert {
  id: string;
  timestamp: string;
  attackType: 'DOS' | 'Botnet' | 'Replay' | 'MitM';
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceIP: string;
  sourceMAC: string;
  destIP: string;
  switchPort: number;
  protocol: string;
  confidence: number;
  edgeDecision: 'isolated' | 'flagged' | 'passed';
  cloudValidation: 'confirmed' | 'rejected' | 'pending';
  mitigationStatus: 'port_disabled' | 'mac_blocked' | 'none';
  status: 'active' | 'resolved' | 'false_positive';
  featureImportance: Array<{ feature: string; importance: number }>;
  packetCount?: number;
  byteCount?: number;
  duration?: number;
}

export const AlertsPage: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Hardcoded alerts data
  const allAlerts: Alert[] = [
    {
      id: 'ALT-001',
      timestamp: '2025-02-07 14:23:45.123',
      attackType: 'DOS',
      severity: 'critical',
      sourceIP: '192.168.1.105',
      sourceMAC: 'AA:BB:CC:DD:EE:FF',
      destIP: '192.168.1.1',
      switchPort: 3,
      protocol: 'TCP',
      confidence: 0.95,
      edgeDecision: 'isolated',
      cloudValidation: 'confirmed',
      mitigationStatus: 'port_disabled',
      status: 'active',
      packetCount: 15234,
      byteCount: 22850100,
      duration: 45,
      featureImportance: [
        { feature: 'Packet Rate', importance: 0.35 },
        { feature: 'Byte Count', importance: 0.28 },
        { feature: 'Flow Duration', importance: 0.22 },
        { feature: 'Protocol Flags', importance: 0.15 },
      ],
    },
    {
      id: 'ALT-002',
      timestamp: '2025-02-07 14:22:30.456',
      attackType: 'Botnet',
      severity: 'high',
      sourceIP: '192.168.1.108',
      sourceMAC: 'FF:EE:DD:CC:BB:AA',
      destIP: '192.168.1.1',
      switchPort: 5,
      protocol: 'UDP',
      confidence: 0.88,
      edgeDecision: 'isolated',
      cloudValidation: 'confirmed',
      mitigationStatus: 'port_disabled',
      status: 'active',
      packetCount: 8543,
      byteCount: 10251600,
      duration: 120,
      featureImportance: [
        { feature: 'C&C Pattern', importance: 0.42 },
        { feature: 'Beacon Interval', importance: 0.31 },
        { feature: 'Payload Size', importance: 0.18 },
        { feature: 'Port Scanning', importance: 0.09 },
      ],
    },
    {
      id: 'ALT-003',
      timestamp: '2025-02-07 14:21:15.789',
      attackType: 'MitM',
      severity: 'high',
      sourceIP: '192.168.1.110',
      sourceMAC: 'AB:CD:EF:12:34:56',
      destIP: '192.168.1.50',
      switchPort: 8,
      protocol: 'TCP',
      confidence: 0.91,
      edgeDecision: 'flagged',
      cloudValidation: 'confirmed',
      mitigationStatus: 'mac_blocked',
      status: 'active',
      packetCount: 3421,
      byteCount: 5131500,
      duration: 180,
      featureImportance: [
        { feature: 'ARP Anomaly', importance: 0.38 },
        { feature: 'MAC Spoofing', importance: 0.33 },
        { feature: 'Duplicate Packets', importance: 0.19 },
        { feature: 'Certificate Mismatch', importance: 0.10 },
      ],
    },
    {
      id: 'ALT-004',
      timestamp: '2025-02-07 14:20:00.234',
      attackType: 'Replay',
      severity: 'medium',
      sourceIP: '192.168.1.107',
      sourceMAC: 'DE:AD:BE:EF:CA:FE',
      destIP: '192.168.1.1',
      switchPort: 4,
      protocol: 'TCP',
      confidence: 0.86,
      edgeDecision: 'flagged',
      cloudValidation: 'pending',
      mitigationStatus: 'port_disabled',
      status: 'active',
      packetCount: 2145,
      byteCount: 3217500,
      duration: 90,
      featureImportance: [
        { feature: 'Duplicate Packets', importance: 0.40 },
        { feature: 'Replay Window', importance: 0.32 },
        { feature: 'Packet Hash', importance: 0.20 },
        { feature: 'Sequence Number', importance: 0.08 },
      ],
    },
    {
      id: 'ALT-005',
      timestamp: '2025-02-07 14:18:45.567',
      attackType: 'DOS',
      severity: 'critical',
      sourceIP: '192.168.1.112',
      sourceMAC: 'C0:FF:EE:BA:BE:CA',
      destIP: '192.168.1.5',
      switchPort: 9,
      protocol: 'UDP',
      confidence: 0.92,
      edgeDecision: 'isolated',
      cloudValidation: 'confirmed',
      mitigationStatus: 'port_disabled',
      status: 'resolved',
      packetCount: 18456,
      byteCount: 27684000,
      duration: 60,
      featureImportance: [
        { feature: 'Packet Rate', importance: 0.38 },
        { feature: 'Protocol Type', importance: 0.27 },
        { feature: 'Byte Count', importance: 0.24 },
        { feature: 'Flow Duration', importance: 0.11 },
      ],
    },
    {
      id: 'ALT-006',
      timestamp: '2025-02-07 14:17:30.890',
      attackType: 'Botnet',
      severity: 'high',
      sourceIP: '192.168.1.115',
      sourceMAC: 'FA:CE:B0:0C:12:34',
      destIP: '192.168.1.60',
      switchPort: 10,
      protocol: 'TCP',
      confidence: 0.83,
      edgeDecision: 'flagged',
      cloudValidation: 'rejected',
      mitigationStatus: 'none',
      status: 'false_positive',
      packetCount: 1234,
      byteCount: 1851000,
      duration: 30,
      featureImportance: [
        { feature: 'C&C Pattern', importance: 0.35 },
        { feature: 'Beacon Interval', importance: 0.28 },
        { feature: 'Connection Count', importance: 0.22 },
        { feature: 'Payload Pattern', importance: 0.15 },
      ],
    },
  ];

  // Filter alerts
  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesType = filterType === 'all' || alert.attackType === filterType;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchesSeverity && matchesType && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      high: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      low: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };
    return colors[severity as keyof typeof colors];
  };

  const getAttackTypeColor = (type: string) => {
    const colors = {
      DOS: 'text-red-600 dark:text-red-400',
      Botnet: 'text-orange-600 dark:text-orange-400',
      Replay: 'text-purple-600 dark:text-purple-400',
      MitM: 'text-yellow-600 dark:text-yellow-400',
    };
    return colors[type as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      resolved: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      false_positive: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
    };
    return colors[status as keyof typeof colors];
  };

  // Statistics
  const stats = {
    total: filteredAlerts.length,
    critical: filteredAlerts.filter(a => a.severity === 'critical').length,
    active: filteredAlerts.filter(a => a.status === 'active').length,
    avgConfidence: filteredAlerts.length > 0 
      ? (filteredAlerts.reduce((sum, a) => sum + a.confidence, 0) / filteredAlerts.length * 100).toFixed(1)
      : '0',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 dark:text-white">Alerts</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Security alerts with ML confidence scores, model explainability, and mitigation controls
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Alerts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Confidence</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.avgConfidence}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Attack Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="DOS">DOS</option>
              <option value="Botnet">Botnet</option>
              <option value="Replay">Replay</option>
              <option value="MitM">MitM</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="col-span-2 space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selectedAlert?.id === alert.id ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded border text-xs font-bold uppercase ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className={`text-lg font-bold ${getAttackTypeColor(alert.attackType)}`}>
                    {alert.attackType} Attack
                  </span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getStatusColor(alert.status)}`}>
                  {alert.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Alert ID</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">{alert.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Timestamp</p>
                  <p className="font-mono text-xs text-gray-900 dark:text-white">{alert.timestamp}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Source IP</p>
                  <p className="font-mono text-gray-900 dark:text-white">{alert.sourceIP}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Switch Port</p>
                  <p className="font-medium text-gray-900 dark:text-white">Port {alert.switchPort}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Confidence: </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{(alert.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Edge: </span>
                    <span className="font-medium capitalize text-gray-900 dark:text-white">{alert.edgeDecision}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Cloud: </span>
                    <span className="font-medium capitalize text-gray-900 dark:text-white">{alert.cloudValidation}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No alerts match your filters</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="col-span-1 sticky top-6">
          {selectedAlert ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alert Details</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Protocol</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAlert.protocol}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Packets</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAlert.packetCount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Bytes</p>
                  <p className="font-medium text-gray-900 dark:text-white">{(selectedAlert.byteCount! / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ML Confidence</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedAlert.confidence * 100}%` }}></div>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{(selectedAlert.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Feature Importance</h4>
                <div className="space-y-2">
                  {selectedAlert.featureImportance.map((f, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{f.feature}</span>
                        <span className="font-medium">{(f.importance * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${f.importance * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedAlert.status === 'active' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                    Mark Resolved
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">
                    False Positive
                  </button>
                  {selectedAlert.mitigationStatus !== 'none' && (
                    <button className="w-full px-4 py-2 border-2 border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium">
                      Lift Isolation
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select an alert to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

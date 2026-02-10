import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface PacketData {
  id: string;
  timestamp: string;
  sourceIP: string;
  sourceMAC: string;
  destIP: string;
  destPort: number;
  switchPort: number;
  protocol: string;
  packetSize: number;
  classification: 'Normal' | 'DOS' | 'Botnet' | 'Replay' | 'MitM';
  confidence: number;
  edgeDecision: 'isolated' | 'flagged' | 'passed';
  mitigationStatus: 'port_disabled' | 'mac_blocked' | 'none';
}

export const LivePacketsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchIP, setSearchIP] = useState('');

  // Hardcoded packet data - more comprehensive
  const allPackets: PacketData[] = [
    { 
      id: '1', 
      timestamp: '2025-02-07 14:23:45.123', 
      sourceIP: '192.168.1.105', 
      sourceMAC: 'AA:BB:CC:DD:EE:FF',
      destIP: '192.168.1.1', 
      destPort: 80,
      switchPort: 3, 
      protocol: 'TCP', 
      packetSize: 1500,
      classification: 'DOS', 
      confidence: 0.95,
      edgeDecision: 'isolated',
      mitigationStatus: 'port_disabled'
    },
    { 
      id: '2', 
      timestamp: '2025-02-07 14:23:45.089', 
      sourceIP: '192.168.1.102', 
      sourceMAC: '11:22:33:44:55:66',
      destIP: '192.168.1.50', 
      destPort: 443,
      switchPort: 7, 
      protocol: 'UDP', 
      packetSize: 856,
      classification: 'Normal', 
      confidence: 0.99,
      edgeDecision: 'passed',
      mitigationStatus: 'none'
    },
    { 
      id: '3', 
      timestamp: '2025-02-07 14:23:44.967', 
      sourceIP: '192.168.1.108', 
      sourceMAC: 'FF:EE:DD:CC:BB:AA',
      destIP: '192.168.1.1', 
      destPort: 8080,
      switchPort: 5, 
      protocol: 'TCP', 
      packetSize: 1200,
      classification: 'Botnet', 
      confidence: 0.88,
      edgeDecision: 'isolated',
      mitigationStatus: 'port_disabled'
    },
    { 
      id: '4', 
      timestamp: '2025-02-07 14:23:44.856', 
      sourceIP: '192.168.1.103', 
      sourceMAC: '12:34:56:78:9A:BC',
      destIP: '192.168.1.20', 
      destPort: 22,
      switchPort: 2, 
      protocol: 'HTTP', 
      packetSize: 642,
      classification: 'Normal', 
      confidence: 0.97,
      edgeDecision: 'passed',
      mitigationStatus: 'none'
    },
    { 
      id: '5', 
      timestamp: '2025-02-07 14:23:44.734', 
      sourceIP: '192.168.1.110', 
      sourceMAC: 'AB:CD:EF:12:34:56',
      destIP: '192.168.1.1', 
      destPort: 443,
      switchPort: 8, 
      protocol: 'TCP', 
      packetSize: 1350,
      classification: 'MitM', 
      confidence: 0.91,
      edgeDecision: 'flagged',
      mitigationStatus: 'mac_blocked'
    },
    { 
      id: '6', 
      timestamp: '2025-02-07 14:23:44.623', 
      sourceIP: '192.168.1.101', 
      sourceMAC: '98:76:54:32:10:FE',
      destIP: '192.168.1.30', 
      destPort: 3306,
      switchPort: 1, 
      protocol: 'UDP', 
      packetSize: 512,
      classification: 'Normal', 
      confidence: 0.98,
      edgeDecision: 'passed',
      mitigationStatus: 'none'
    },
    { 
      id: '7', 
      timestamp: '2025-02-07 14:23:44.512', 
      sourceIP: '192.168.1.107', 
      sourceMAC: 'DE:AD:BE:EF:CA:FE',
      destIP: '192.168.1.1', 
      destPort: 80,
      switchPort: 4, 
      protocol: 'TCP', 
      packetSize: 1024,
      classification: 'Replay', 
      confidence: 0.86,
      edgeDecision: 'flagged',
      mitigationStatus: 'port_disabled'
    },
    { 
      id: '8', 
      timestamp: '2025-02-07 14:23:44.401', 
      sourceIP: '192.168.1.104', 
      sourceMAC: 'BA:DC:0F:FE:EB:AD',
      destIP: '192.168.1.40', 
      destPort: 8443,
      switchPort: 6, 
      protocol: 'ICMP', 
      packetSize: 128,
      classification: 'Normal', 
      confidence: 0.99,
      edgeDecision: 'passed',
      mitigationStatus: 'none'
    },
    { 
      id: '9', 
      timestamp: '2025-02-07 14:23:44.289', 
      sourceIP: '192.168.1.112', 
      sourceMAC: 'C0:FF:EE:BA:BE:CA',
      destIP: '192.168.1.5', 
      destPort: 53,
      switchPort: 9, 
      protocol: 'UDP', 
      packetSize: 256,
      classification: 'DOS', 
      confidence: 0.92,
      edgeDecision: 'isolated',
      mitigationStatus: 'port_disabled'
    },
    { 
      id: '10', 
      timestamp: '2025-02-07 14:23:44.178', 
      sourceIP: '192.168.1.115', 
      sourceMAC: 'FA:CE:B0:0K:12:34',
      destIP: '192.168.1.60', 
      destPort: 3389,
      switchPort: 10, 
      protocol: 'TCP', 
      packetSize: 1450,
      classification: 'Botnet', 
      confidence: 0.83,
      edgeDecision: 'flagged',
      mitigationStatus: 'mac_blocked'
    },
  ];

  // Filter packets
  const filteredPackets = allPackets.filter(packet => {
    const matchesType = filterType === 'all' || packet.classification === filterType;
    const searchLower = searchIP.toLowerCase().trim();
    const matchesSearch = searchLower === '' || 
      packet.sourceIP.toLowerCase().includes(searchLower) || 
      packet.destIP.toLowerCase().includes(searchLower) ||
      packet.sourceMAC.toLowerCase().includes(searchLower);
    return matchesType && matchesSearch;
  });

  const getClassificationColor = (classification: string) => {
    const colors = {
      Normal: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      DOS: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      Botnet: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
      Replay: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
      MitM: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    };
    return colors[classification as keyof typeof colors];
  };

  const getDecisionColor = (decision: string) => {
    const colors = {
      isolated: 'text-red-600 dark:text-red-400',
      flagged: 'text-yellow-600 dark:text-yellow-400',
      passed: 'text-green-600 dark:text-green-400',
    };
    return colors[decision as keyof typeof colors];
  };

  // Statistics
  const stats = {
    total: filteredPackets.length,
    attacks: filteredPackets.filter(p => p.classification !== 'Normal').length,
    isolated: filteredPackets.filter(p => p.edgeDecision === 'isolated').length,
    normal: filteredPackets.filter(p => p.classification === 'Normal').length,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 dark:text-white">Live Packets</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Packet Monitor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time network traffic analysis and packet classification
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">LIVE</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Packets</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Normal</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.normal}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Attacks Detected</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.attacks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Isolated</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.isolated}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filterType !== 'all' || searchIP !== '') && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredPackets.length}</span> of {allPackets.length} packets
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Filter by Type
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('Normal')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'Normal'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setFilterType('DOS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'DOS'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                DOS
              </button>
              <button
                onClick={() => setFilterType('Botnet')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'Botnet'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Botnet
              </button>
              <button
                onClick={() => setFilterType('Replay')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'Replay'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Replay
              </button>
              <button
                onClick={() => setFilterType('MitM')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'MitM'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                MitM
              </button>
            </div>
          </div>

          <div className="w-64">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Search by IP or MAC
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="192.168.1.x or AA:BB:CC..."
                value={searchIP}
                onChange={(e) => setSearchIP(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchIP && (
                <button
                  onClick={() => setSearchIP('')}
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

      {/* Packets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source MAC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dest IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Port
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Protocol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Classification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Decision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mitigation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPackets.map((packet) => (
                <tr key={packet.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-300">
                    {packet.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-300">
                    {packet.sourceIP}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-400">
                    {packet.sourceMAC}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-300">
                    {packet.destIP}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {packet.switchPort} → {packet.destPort}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {packet.protocol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {packet.packetSize}B
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClassificationColor(packet.classification)}`}>
                      {packet.classification}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {(packet.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium capitalize ${getDecisionColor(packet.edgeDecision)}`}>
                      {packet.edgeDecision}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                    {packet.mitigationStatus.replace('_', ' ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPackets.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No packets match your filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

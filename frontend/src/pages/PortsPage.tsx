import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Port {
  id: string;
  portNumber: number;
  status: 'active' | 'isolated' | 'disabled' | 'warning';
  deviceIP: string;
  deviceMAC: string;
  deviceName?: string;
  vlan: number;
  speed: '10M' | '100M' | '1G' | '10G';
  isolationReason?: string;
  isolatedAt?: string;
  isolatedBy: 'edge_ml' | 'cloud' | 'manual';
  lastActivity: string;
  trafficStats: {
    sent: number; // MB
    received: number; // MB
    errors: number;
    drops: number;
  };
  associatedAlert?: {
    alertId: string;
    attackType: 'DOS' | 'Botnet' | 'Replay' | 'MitM';
  };
}

export const PortsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [portToLift, setPortToLift] = useState<Port | null>(null);
  const [portToIsolate, setPortToIsolate] = useState<Port | null>(null);
  const [showIsolateModal, setShowIsolateModal] = useState(false);
  const [isolateReason, setIsolateReason] = useState('');
  const [highlightedPorts, setHighlightedPorts] = useState<Set<string>>(new Set());
  
  // Manual isolation states
  const [showManualIsolateModal, setShowManualIsolateModal] = useState(false);
  const [manualPortNumber, setManualPortNumber] = useState('');
  const [manualIsolateReason, setManualIsolateReason] = useState('');

  // Hardcoded ports data - now stateful
  const [ports, setPorts] = useState<Port[]>([
    {
      id: 'PORT-001',
      portNumber: 1,
      status: 'active',
      deviceIP: '192.168.1.101',
      deviceMAC: '98:76:54:32:10:FE',
      deviceName: 'Workstation-01',
      vlan: 10,
      speed: '1G',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:23:50',
      trafficStats: {
        sent: 1250.5,
        received: 890.2,
        errors: 0,
        drops: 0,
      },
    },
    {
      id: 'PORT-002',
      portNumber: 2,
      status: 'active',
      deviceIP: '192.168.1.103',
      deviceMAC: '12:34:56:78:9A:BC',
      deviceName: 'Server-DB',
      vlan: 20,
      speed: '10G',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:23:48',
      trafficStats: {
        sent: 5680.3,
        received: 4321.7,
        errors: 2,
        drops: 0,
      },
    },
    {
      id: 'PORT-003',
      portNumber: 3,
      status: 'isolated',
      deviceIP: '192.168.1.105',
      deviceMAC: 'AA:BB:CC:DD:EE:FF',
      deviceName: 'Unknown-Device',
      vlan: 10,
      speed: '1G',
      isolationReason: 'DOS Attack Detected - High packet rate (15,234 pkts/sec)',
      isolatedAt: '2025-02-07 14:23:45',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:23:45',
      trafficStats: {
        sent: 22850.1,
        received: 245.3,
        errors: 125,
        drops: 89,
      },
      associatedAlert: {
        alertId: 'ALT-001',
        attackType: 'DOS',
      },
    },
    {
      id: 'PORT-004',
      portNumber: 4,
      status: 'isolated',
      deviceIP: '192.168.1.107',
      deviceMAC: 'DE:AD:BE:EF:CA:FE',
      deviceName: 'IoT-Sensor-04',
      vlan: 30,
      speed: '100M',
      isolationReason: 'Replay Attack Detected - Duplicate packet signatures',
      isolatedAt: '2025-02-07 14:20:00',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:20:00',
      trafficStats: {
        sent: 3.2,
        received: 2.1,
        errors: 45,
        drops: 23,
      },
      associatedAlert: {
        alertId: 'ALT-004',
        attackType: 'Replay',
      },
    },
    {
      id: 'PORT-005',
      portNumber: 5,
      status: 'isolated',
      deviceIP: '192.168.1.108',
      deviceMAC: 'FF:EE:DD:CC:BB:AA',
      deviceName: 'Camera-05',
      vlan: 30,
      speed: '100M',
      isolationReason: 'Botnet Activity - C&C communication pattern detected',
      isolatedAt: '2025-02-07 14:22:30',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:22:30',
      trafficStats: {
        sent: 10.3,
        received: 8.5,
        errors: 67,
        drops: 34,
      },
      associatedAlert: {
        alertId: 'ALT-002',
        attackType: 'Botnet',
      },
    },
    {
      id: 'PORT-006',
      portNumber: 6,
      status: 'active',
      deviceIP: '192.168.1.104',
      deviceMAC: 'BA:DC:0F:FE:EB:AD',
      deviceName: 'Printer-Lab',
      vlan: 10,
      speed: '100M',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:23:30',
      trafficStats: {
        sent: 45.2,
        received: 12.8,
        errors: 0,
        drops: 0,
      },
    },
    {
      id: 'PORT-007',
      portNumber: 7,
      status: 'active',
      deviceIP: '192.168.1.102',
      deviceMAC: '11:22:33:44:55:66',
      deviceName: 'Laptop-Admin',
      vlan: 10,
      speed: '1G',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:23:49',
      trafficStats: {
        sent: 678.9,
        received: 432.1,
        errors: 0,
        drops: 0,
      },
    },
    {
      id: 'PORT-008',
      portNumber: 8,
      status: 'isolated',
      deviceIP: '192.168.1.110',
      deviceMAC: 'AB:CD:EF:12:34:56',
      deviceName: 'Unknown-Device',
      vlan: 10,
      speed: '1G',
      isolationReason: 'Man-in-the-Middle Attack - ARP spoofing detected',
      isolatedAt: '2025-02-07 14:21:15',
      isolatedBy: 'cloud',
      lastActivity: '2025-02-07 14:21:15',
      trafficStats: {
        sent: 5.1,
        received: 4.3,
        errors: 89,
        drops: 45,
      },
      associatedAlert: {
        alertId: 'ALT-003',
        attackType: 'MitM',
      },
    },
    {
      id: 'PORT-009',
      portNumber: 9,
      status: 'disabled',
      deviceIP: '192.168.1.112',
      deviceMAC: 'C0:FF:EE:BA:BE:CA',
      deviceName: 'IoT-Sensor-09',
      vlan: 30,
      speed: '100M',
      isolationReason: 'Manually disabled for maintenance',
      isolatedAt: '2025-02-07 12:00:00',
      isolatedBy: 'manual',
      lastActivity: '2025-02-07 12:00:00',
      trafficStats: {
        sent: 0,
        received: 0,
        errors: 0,
        drops: 0,
      },
    },
    {
      id: 'PORT-010',
      portNumber: 10,
      status: 'active',
      deviceIP: '192.168.1.115',
      deviceMAC: 'FA:CE:B0:0C:12:34',
      deviceName: 'Access-Point-02',
      vlan: 40,
      speed: '1G',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:23:52',
      trafficStats: {
        sent: 3245.6,
        received: 2890.4,
        errors: 5,
        drops: 2,
      },
    },
    {
      id: 'PORT-011',
      portNumber: 11,
      status: 'warning',
      deviceIP: '192.168.1.120',
      deviceMAC: 'DD:EE:AA:DD:BB:EE',
      deviceName: 'Workstation-11',
      vlan: 10,
      speed: '1G',
      isolationReason: 'High error rate detected',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:23:35',
      trafficStats: {
        sent: 456.2,
        received: 234.8,
        errors: 156,
        drops: 45,
      },
    },
    {
      id: 'PORT-012',
      portNumber: 12,
      status: 'active',
      deviceIP: '192.168.1.125',
      deviceMAC: 'EE:FF:AA:BB:CC:DD',
      deviceName: 'Camera-12',
      vlan: 30,
      speed: '100M',
      isolatedBy: 'edge_ml',
      lastActivity: '2025-02-07 14:23:47',
      trafficStats: {
        sent: 89.5,
        received: 12.3,
        errors: 0,
        drops: 0,
      },
    },
  ]);

  // Isolate port function
  const handleIsolatePort = (port: Port) => {
    setPortToIsolate(port);
    setShowIsolateModal(true);
    setIsolateReason('');
  };

  const handleIsolateSubmit = () => {
    if (!portToIsolate || !isolateReason.trim()) {
      alert('Please provide a reason for isolation');
      return;
    }

    setPorts(ports.map(p =>
      p.id === portToIsolate.id
        ? {
            ...p,
            status: 'isolated' as const,
            isolationReason: isolateReason,
            isolatedAt: new Date().toISOString(),
            isolatedBy: 'manual' as const,
          }
        : p
    ));

    // Add highlight effect for 15 seconds
    setHighlightedPorts(prev => new Set(prev).add(portToIsolate.id));
    setTimeout(() => {
      setHighlightedPorts(prev => {
        const newSet = new Set(prev);
        newSet.delete(portToIsolate.id);
        return newSet;
      });
    }, 15000); // 15 seconds

    setShowIsolateModal(false);
    setPortToIsolate(null);
    setIsolateReason('');
    console.log(`Port ${portToIsolate.portNumber} isolated manually: ${isolateReason}`);
  };

  // Manual isolation handler
  const handleManualIsolateSubmit = () => {
    const portNum = parseInt(manualPortNumber);
    
    if (!manualPortNumber || isNaN(portNum)) {
      alert('Please enter a valid port number');
      return;
    }

    if (!manualIsolateReason.trim()) {
      alert('Please provide a reason for isolation');
      return;
    }

    // Find the port
    const port = ports.find(p => p.portNumber === portNum);

    if (!port) {
      alert(`Port ${portNum} not found`);
      return;
    }

    if (port.status === 'isolated') {
      alert(`Port ${portNum} is already isolated`);
      return;
    }

    // Update port to isolated
    setPorts(ports.map(p =>
      p.portNumber === portNum
        ? {
            ...p,
            status: 'isolated' as const,
            isolationReason: manualIsolateReason,
            isolatedAt: new Date().toISOString(),
            isolatedBy: 'manual' as const,
          }
        : p
    ));

    // Add highlight effect for 15 seconds
    setHighlightedPorts(prev => new Set(prev).add(port.id));
    setTimeout(() => {
      setHighlightedPorts(prev => {
        const newSet = new Set(prev);
        newSet.delete(port.id);
        return newSet;
      });
    }, 15000);

    setShowManualIsolateModal(false);
    setManualPortNumber('');
    setManualIsolateReason('');
    console.log(`Port ${portNum} isolated manually: ${manualIsolateReason}`);
  };

  // Filter ports
  const filteredPorts = ports.filter(port => {
    if (filterStatus === 'all') return true;
    return port.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-500',
      isolated: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-500',
      disabled: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-500',
      warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-500',
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    if (status === 'active') {
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (status === 'isolated') {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      );
    } else if (status === 'warning') {
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
  };

  const handleLiftIsolation = (port: Port) => {
    setPortToLift(port);
    setShowAuthModal(true);
    setAuthCode('');
  };

  const handleAuthSubmit = () => {
    // Simulated authorization check
    if (authCode === '1234') {
      if (!portToLift) return;
      
      // Update the port status to active and remove isolation info
      setPorts(ports.map(p =>
        p.id === portToLift.id
          ? {
              ...p,
              status: 'active' as const,
              isolationReason: undefined,
              isolatedAt: undefined,
              isolatedBy: 'edge_ml' as const,
            }
          : p
      ));
      
      console.log('Lifting isolation for port:', portToLift.portNumber);
      alert(`Successfully lifted isolation on Port ${portToLift.portNumber}`);
      setShowAuthModal(false);
      setPortToLift(null);
      setAuthCode('');
    } else {
      alert('Invalid authorization code');
    }
  };

  // Statistics
  const stats = {
    total: ports.length,
    active: ports.filter(p => p.status === 'active').length,
    isolated: ports.filter(p => p.status === 'isolated').length,
    warning: ports.filter(p => p.status === 'warning').length,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-900 dark:text-white">Port Management</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Port Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor and manage switch ports with isolation controls and authorization
        </p>
      </div>

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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</label>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All ({ports.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus('isolated')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'isolated'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Isolated ({stats.isolated})
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Warning ({stats.warning})
            </button>
          </div>

          {/* Manual Isolate Button - COMMENTED OUT - To enable, uncomment the button below */}
        </div>
      </div>

      {/* Ports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPorts.map((port) => (
          <div
            key={port.id}
            className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
              selectedPort?.id === port.id ? 'border-blue-500' : `border-l-4 ${getStatusColor(port.status).split(' ').find(c => c.includes('border'))}`
            } ${
              highlightedPorts.has(port.id) 
                ? 'animate-pulse ring-4 ring-red-500 ring-opacity-50 shadow-2xl shadow-red-500/50' 
                : ''
            }`}
            onClick={() => setSelectedPort(port)}
          >
            {/* Port Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(port.status)}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Port {port.portNumber}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{port.deviceName || 'Unknown Device'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(port.status)}`}>
                {port.status}
              </span>
            </div>

            {/* Device Info */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">IP Address</span>
                <span className="font-mono text-gray-900 dark:text-white">{port.deviceIP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">MAC Address</span>
                <span className="font-mono text-xs text-gray-900 dark:text-white">{port.deviceMAC}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">VLAN</span>
                <span className="font-medium text-gray-900 dark:text-white">{port.vlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Speed</span>
                <span className="font-medium text-gray-900 dark:text-white">{port.speed}</span>
              </div>
            </div>

            {/* Isolation Info */}
            {(port.status === 'isolated' || port.status === 'warning') && port.isolationReason && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Isolation Reason:</p>
                <p className="text-xs text-red-600 dark:text-red-400">{port.isolationReason}</p>
                {port.isolatedAt && (
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                    Isolated: {port.isolatedAt}
                  </p>
                )}
              </div>
            )}

            {/* Associated Alert */}
            {port.associatedAlert && (
              <div className="mb-4 p-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded">
                <div className="flex items-center text-xs">
                  <span className="font-medium text-orange-700 dark:text-orange-400">
                    Alert: {port.associatedAlert.attackType}
                  </span>
                </div>
              </div>
            )}

            {/* Traffic Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Sent</p>
                <p className="font-medium text-gray-900 dark:text-white">{port.trafficStats.sent.toFixed(1)} MB</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Received</p>
                <p className="font-medium text-gray-900 dark:text-white">{port.trafficStats.received.toFixed(1)} MB</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Errors</p>
                <p className="font-medium text-gray-900 dark:text-white">{port.trafficStats.errors}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Drops</p>
                <p className="font-medium text-gray-900 dark:text-white">{port.trafficStats.drops}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {port.status === 'isolated' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLiftIsolation(port);
                }}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span>Lift Isolation (Auth Required)</span>
              </button>
            ) : (port.status === 'active' || port.status === 'warning') ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleIsolatePort(port);
                }}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
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

      {/* Authorization Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Authorization Required</h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You are about to lift isolation on <span className="font-bold">Port {portToLift?.portNumber}</span>.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-4">
                <p className="text-xs text-yellow-800 dark:text-yellow-400">
                  <strong>Warning:</strong> This device was isolated due to: {portToLift?.isolationReason}
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Authorization Code:
              </label>
              <input
                type="password"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Enter code (demo: 1234)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAuthSubmit()}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthSubmit}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Authorize & Lift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Isolate Port Modal */}
      {showIsolateModal && portToIsolate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Isolate Port</h3>
              <button
                onClick={() => {
                  setShowIsolateModal(false);
                  setPortToIsolate(null);
                  setIsolateReason('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You are about to isolate <span className="font-bold">Port {portToIsolate.portNumber}</span>
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
                <p className="text-xs text-blue-800 dark:text-blue-400">
                  <strong>Device:</strong> {portToIsolate.deviceName || 'Unknown'} ({portToIsolate.deviceIP})
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Isolation: *
              </label>
              <textarea
                value={isolateReason}
                onChange={(e) => setIsolateReason(e.target.value)}
                placeholder="e.g., Suspicious traffic detected, Manual security check, etc."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowIsolateModal(false);
                  setPortToIsolate(null);
                  setIsolateReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleIsolateSubmit}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Isolate Port
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Isolate Port Modal */}
      {showManualIsolateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manual Port Isolation</h3>
              <button
                onClick={() => {
                  setShowManualIsolateModal(false);
                  setManualPortNumber('');
                  setManualIsolateReason('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the port number you want to isolate manually
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Port Number: *
                </label>
                <input
                  type="number"
                  value={manualPortNumber}
                  onChange={(e) => setManualPortNumber(e.target.value)}
                  placeholder="e.g., 1, 2, 3..."
                  min="1"
                  max="48"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Isolation: *
                </label>
                <textarea
                  value={manualIsolateReason}
                  onChange={(e) => setManualIsolateReason(e.target.value)}
                  placeholder="e.g., Security threat detected, Manual maintenance, etc."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowManualIsolateModal(false);
                  setManualPortNumber('');
                  setManualIsolateReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualIsolateSubmit}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Isolate Port
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';

interface RecentPacket {
  timestamp: string;
  src_ip: string;
  classification: string;
}

export const CompactPacketMonitor: React.FC = () => {
  const [packets, setPackets] = useState<RecentPacket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackets = async () => {
    try {
      const response = await dashboardAPI.getRecentPackets(5);
      setPackets(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recent packets:', err);
      setError('Failed to load packets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackets();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchPackets, 10000);
    return () => clearInterval(interval);
  }, []);

  const getClassificationColor = (classification: string) => {
    const colors: Record<string, string> = {
      Normal:   'text-green-500 dark:text-green-400',
      DOS:      'text-red-500 dark:text-red-400',
      Botnet:   'text-orange-500 dark:text-orange-400',
      Replay:   'text-purple-500 dark:text-purple-400',
      Spoofing: 'text-yellow-500 dark:text-yellow-400',
    };
    return colors[classification] ?? 'text-gray-500';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Packet Monitoring</h3>
        </div>
        <Link
          to="/live-packets"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-400 dark:text-gray-500">Loading packets...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : packets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xs text-gray-400 dark:text-gray-500">No packets captured yet</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400">
                <th className="text-left pb-2 font-medium">Time</th>
                <th className="text-left pb-2 font-medium">Source IP</th>
                <th className="text-left pb-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {packets.map((packet, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-2 font-mono text-gray-500 dark:text-gray-400">
                    {formatTime(packet.timestamp)}
                  </td>
                  <td className="py-2 font-mono text-gray-900 dark:text-gray-300">
                    {packet.src_ip}
                  </td>
                  <td className={`py-2 font-medium ${getClassificationColor(packet.classification)}`}>
                    {packet.classification}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
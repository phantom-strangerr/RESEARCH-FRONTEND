import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { packetsAPI } from '../services/api';

interface PacketData {
  feature_id: string;
  timestamp: string;
  src_ip: string;
  dst_ip: string;
  packet_size: number;
  classification: string;
}

const PAGE_SIZE = 100;

export const LivePacketsPage: React.FC = () => {
  const [allPackets, setAllPackets] = useState<PacketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchIP, setSearchIP] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPackets = async (currentOffset = 0, append = false) => {
    try {
      const response = await packetsAPI.getAllPackets(PAGE_SIZE, currentOffset);
      const newPackets: PacketData[] = response.data;
      setAllPackets(prev => append ? [...prev, ...newPackets] : newPackets);
      setHasMore(newPackets.length > 0 && currentOffset === 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch packets:', err);
      setError('Failed to load packets');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPackets(0, false);
    const interval = setInterval(() => fetchPackets(0, false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadMore = async () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    setIsLoadingMore(true);
    await fetchPackets(newOffset, true);
  };

  // Search, filter, and sort logic
  const filteredPackets = allPackets.filter(packet => {
    // Type filter
    const matchesType = filterType === 'all' || packet.classification === filterType;
    const searchTerm = searchIP.trim().toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      packet.src_ip.toLowerCase().includes(searchTerm) ||
      packet.dst_ip.toLowerCase().includes(searchTerm);
    return matchesType && matchesSearch;
  }).sort((a, b) => {
    const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return sortOrder === 'desc' ? -diff : diff;
  });

  const getClassificationColor = (classification: string) => {
    const colors: Record<string, string> = {
      Normal: 'bg-green-900/30 text-green-400',
      Mirai:    'bg-pink-900/20 text-pink-400',
      DOS:      'bg-orange-900/20 text-orange-400',
      Replay:   'bg-purple-900/20 text-purple-400',
      Spoofing: 'bg-red-900/20 text-red-400',
    };
    return colors[classification] ?? 'bg-gray-700 text-slate-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/dashboard" className="text-green-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-slate-900 dark:text-white">Packet Monitor</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Packet Monitor</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time network traffic analysis and packet classification
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">ACTIVE</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Filters</h3>
          {(filterType !== 'all' || searchIP.trim() !== '') && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-green-400">{filteredPackets.length}</span> of {allPackets.length} packets
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-4">
          {/* Type filter buttons */}
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300 block mb-2">
              Filter by Type
            </label>
            <div className="flex space-x-2">
              {(['all', 'Normal', 'Mirai', 'DOS', 'Replay', 'Spoofing'] as const).map((type) => {
                const activeColors: Record<string, string> = {
                  all:      'bg-green-500 text-slate-900 dark:text-white',
                  Normal:   'bg-green-600 text-slate-900 dark:text-white',
                  Mirai:    'bg-pink-600 text-slate-900 dark:text-white',
                  DOS:      'bg-orange-600 text-slate-900 dark:text-white',
                  Replay:   'bg-purple-600 text-slate-900 dark:text-white',
                  Spoofing: 'bg-red-600 text-slate-900 dark:text-white',
                };
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === type
                        ? activeColors[type]
                        : 'bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search by IP */}
          <div className="w-full sm:w-64">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-300 block mb-2">
              Search by IP
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 192.168.1.105"
                value={searchIP}
                onChange={(e) => setSearchIP(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-600 bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchIP && (
                <button
                  onClick={() => setSearchIP('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
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
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading packets...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={() => fetchPackets(0, false)}
              className="mt-3 text-sm text-green-400 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : filteredPackets.length === 0 ? (
          <div className="p-12 text-center">
            {allPackets.length === 0 ? (
              <>
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No packets captured yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Packets will appear here once network traffic is detected</p>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400">No packets match your search</p>
                <button
                  onClick={() => { setFilterType('all'); setSearchIP(''); }}
                  className="mt-3 text-sm text-green-400 hover:underline"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
                      className="flex items-center space-x-1 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
                      title={sortOrder === 'desc' ? 'Newest first — click for oldest first' : 'Oldest first — click for newest first'}
                    >
                      <span>Timestamp</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sortOrder === 'desc' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m10 4l-4-4m0 0l-4 4m4-4v12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5m10-8l-4 4m0 0l-4-4m4 4V4" />
                        )}
                      </svg>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Source IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Dest IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPackets.map((packet) => (
                  <tr key={packet.feature_id} className="hover:bg-green-900/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-400">
                      {new Date(packet.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700 dark:text-gray-300">
                      {packet.src_ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700 dark:text-gray-300">
                      {packet.dst_ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClassificationColor(packet.classification)}`}>
                        {packet.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-4 text-center border-t border-gray-700">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-lg text-sm font-medium transition-all"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};
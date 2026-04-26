import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { MiniTrafficChart } from '../components/dashboard/MiniTrafficChart';
import { MiniAttackTimeline } from '../components/dashboard/MiniAttackTimeline';
import { CompactDeviceHealth } from '../components/dashboard/CompactDeviceHealth';
import { CompactPacketMonitor } from '../components/dashboard/CompactPacketMonitor';
import { dashboardAPI } from '../services/api'; // backend connections commented out in api.ts — returns dummy data

ChartJS.register(ArcElement, Tooltip);

interface Stats              { total_devices: number; isolated_ports: number; }
interface LinkHealth         { total_packets: number; normal_packets: number; attack_packets: number; success_rate: number; packet_rate_per_min: number; window_minutes: number; }
interface AttackDistribution { total: number; counts: Record<string, number>; }

export const DashboardPage: React.FC = () => {
  const [stats,      setStats]      = useState<Stats             | null>(null);
  const [linkHealth, setLinkHealth] = useState<LinkHealth         | null>(null);
  const [attackDist, setAttackDist] = useState<AttackDistribution | null>(null);

  const fetchAll = async () => {
    const [statsRes, linkRes, attackDistRes] = await Promise.allSettled([
      dashboardAPI.getStats(),
      dashboardAPI.getLinkHealth(),
      dashboardAPI.getAttackDistribution(),
    ]);
    if (statsRes.status      === 'fulfilled') setStats(statsRes.value.data);
    if (linkRes.status       === 'fulfilled') setLinkHealth(linkRes.value.data);
    if (attackDistRes.status === 'fulfilled') setAttackDist(attackDistRes.value.data);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Attack type counts from backend distribution endpoint ─────────────────
  const attackCounts = attackDist?.counts ?? {};
  const totalEvents  = attackDist?.total ?? 0;

  const ATTACK_TYPES = [
    { label: 'Mirai',    color: '#ec4899' },
    { label: 'DOS',      color: '#f97316' },
    { label: 'Replay',   color: '#a855f7' },
    { label: 'Spoofing', color: '#ef4444' },
  ];

  const donutData = {
    labels: ATTACK_TYPES.map(a => a.label),
    datasets: [{
      data: ATTACK_TYPES.map(a => attackCounts[a.label] || 0),
      backgroundColor: ATTACK_TYPES.map(a => a.color),
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    cutout: '72%',
  } as const;

  return (
    <div className="flex flex-col space-y-4 lg:h-full lg:overflow-hidden">

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:flex-shrink-0">
        {/* Total Devices */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-l-4 border-green-400 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Devices</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total_devices ?? '—'}</p>
          </div>
          <svg className="w-8 h-8 text-green-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>

        {/* Isolated Ports */}
        <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-l-4 p-3 flex items-center justify-between ${
          stats && stats.isolated_ports > 0 ? 'border-red-500' : 'border-green-500'
        }`}>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Isolated Ports</p>
            <p className={`text-2xl font-bold ${
              stats && stats.isolated_ports > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>{stats?.isolated_ports ?? '—'}</p>
          </div>
          <svg className="w-8 h-8 text-red-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        {/* Active Threats */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-l-4 border-orange-500 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Threat Events</p>
            <p className="text-2xl font-bold text-orange-500 dark:text-orange-400">{totalEvents || '—'}</p>
          </div>
          <svg className="w-8 h-8 text-orange-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Link Success Rate */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-l-4 border-green-500 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Normal Traffic</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {linkHealth ? `${linkHealth.success_rate}%` : '—'}
            </p>
          </div>
          <svg className="w-8 h-8 text-green-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>

      {/* ── Main Content Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:flex-1 lg:min-h-0">

        {/* Recent Events — spans 2 cols on lg */}
        <div className="lg:col-span-2 lg:min-h-0">
          <MiniAttackTimeline />
        </div>

        {/* Right panel — stacked cards */}
        <div className="lg:col-span-1 flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto">

          {/* Attack Distribution Donut */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Attack Distribution</h3>
              <Link to="/alerts" className="text-xs text-green-400 hover:underline">View All</Link>
            </div>
            <div className="flex items-center gap-4">
              {/* Donut */}
              <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
                <Doughnut data={donutData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{totalEvents}</p>
                  <p className="text-[10px] text-gray-500">events</p>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-1.5">
                {ATTACK_TYPES.map(({ label, color }) => {
                  const count = attackCounts[label] || 0;
                  const pct   = totalEvents ? Math.round((count / totalEvents) * 100) : 0;
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{count}</span>
                        <span className="text-[10px] text-gray-500 w-7 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Link Health */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Link Health</h3>
              <Link to="/system-health" className="text-xs text-green-400 hover:underline">Details</Link>
            </div>
            {linkHealth ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Packets</p>
                  <p className="font-bold text-slate-900 dark:text-white">{linkHealth.total_packets.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Packet Rate</p>
                  <p className="font-bold text-slate-900 dark:text-white">{linkHealth.packet_rate_per_min}/min</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Normal</p>
                  <p className="font-bold text-green-600 dark:text-green-400">{linkHealth.normal_packets.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Attack</p>
                  <p className="font-bold text-red-500 dark:text-red-400">{linkHealth.attack_packets}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Normal traffic ratio</p>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${linkHealth.success_rate}%` }} />
                  </div>
                  <p className="text-right text-[10px] text-green-400 mt-0.5">{linkHealth.success_rate}%</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400">Loading...</p>
            )}
          </div>

          {/* Device Health */}
          <div className="flex-shrink-0">
            <CompactDeviceHealth />
          </div>

          {/* Recent Packets */}
          <div className="flex-shrink-0 h-48">
            <CompactPacketMonitor />
          </div>

        </div>
      </div>

      {/* ── Bottom Row: Traffic Chart ───────────────────────────────────────── */}
      <div className="flex-shrink-0 h-64">
        <MiniTrafficChart />
      </div>

    </div>
  );
};

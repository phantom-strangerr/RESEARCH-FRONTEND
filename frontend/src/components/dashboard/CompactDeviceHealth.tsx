import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deviceHealthAPI, dashboardAPI } from '../../services/api';

type Status = 'online' | 'warning' | 'offline';

interface DeviceRow {
  name: string;
  status: Status;
  detail: string;
}

const statusColor = { online: 'bg-green-500', warning: 'bg-yellow-500', offline: 'bg-red-500' };
const statusText  = { online: 'text-green-700 dark:text-green-400', warning: 'text-yellow-700 dark:text-yellow-400', offline: 'text-red-700 dark:text-red-400' };

export const CompactDeviceHealth: React.FC = () => {
  const [rows, setRows] = useState<DeviceRow[]>([]);

  const fetchData = async () => {
    const [hwRes, modelRes] = await Promise.allSettled([
      deviceHealthAPI.getLatest(),
      dashboardAPI.getModelHealth(),
    ]);

    const newRows: DeviceRow[] = [];

    // Edge Device row — derived from CPU usage
    if (hwRes.status === 'fulfilled') {
      const hw = hwRes.value.data;
      const cpu = hw.cpu_usage_percent;
      const edgeStatus: Status = cpu >= 85 ? 'warning' : 'online';
      newRows.push({ name: 'Edge Device', status: edgeStatus, detail: `CPU ${cpu.toFixed(0)}%` });
    } else {
      newRows.push({ name: 'Edge Device', status: 'offline', detail: 'No data' });
    }

    // ML / DL model rows — derived from detection counts
    if (modelRes.status === 'fulfilled') {
      const m = modelRes.value.data;
      const mlStatus: Status = m.ml_detections > 0 ? 'online' : 'offline';
      const dlStatus: Status = m.dl_detections > 0 ? 'online' : 'offline';
      newRows.push({ name: 'ML Models', status: mlStatus, detail: `${m.ml_detections} records` });
      newRows.push({ name: 'DL Models', status: dlStatus, detail: `${m.dl_detections} records` });
    } else {
      newRows.push({ name: 'ML Models', status: 'offline', detail: 'No data' });
      newRows.push({ name: 'DL Models', status: 'offline', detail: 'No data' });
    }

    setRows(newRows);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">System Health</h3>
        <Link to="/system-health" className="text-xs text-green-400 hover:underline">
          View All
        </Link>
      </div>

      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">Loading...</p>
        ) : (
          rows.map((row, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${statusColor[row.status]}`}></div>
                <span className="text-sm text-slate-900 dark:text-white">{row.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">{row.detail}</span>
                <span className={`text-xs font-medium uppercase ${statusText[row.status]}`}>
                  {row.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';

interface TrafficPoint {
  time: string;
  normal: number;
  attack: number;
}

export const MiniTrafficChart: React.FC = () => {
  const [dataPoints, setDataPoints] = useState<TrafficPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await dashboardAPI.getTrafficTimeline(10);
      setDataPoints(res.data);
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxValue = dataPoints.length
    ? Math.max(...dataPoints.map((p) => p.normal + p.attack), 1)
    : 1;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Network Traffic</h3>
        <Link to="/metrics" className="text-xs text-green-400 hover:underline">
          Details
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">Loading...</div>
      ) : dataPoints.every((p) => p.normal === 0 && p.attack === 0) ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">No traffic data</div>
      ) : (
        <div className="space-y-2 flex-1">
          {dataPoints.map((point, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400 w-12">{point.time}</span>
              <div className="flex-1 flex h-4 bg-gray-900 rounded overflow-hidden">
                <div
                  className="bg-green-500"
                  style={{ width: `${(point.normal / maxValue) * 100}%` }}
                  title={`Normal: ${point.normal}`}
                ></div>
                <div
                  className="bg-red-500"
                  style={{ width: `${(point.attack / maxValue) * 100}%` }}
                  title={`Attack: ${point.attack}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-700 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Normal</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-gray-600 dark:text-gray-400">Attack</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

interface CompactPacketData {
  timestamp: string;
  sourceIP: string;
  switchPort: number;
  classification: 'Normal' | 'DOS' | 'Botnet' | 'Replay' | 'Spoofing';
  isIsolated: boolean;
}

export const CompactPacketMonitor: React.FC = () => {
  const [packets, setPackets] = React.useState<CompactPacketData[]>([
    { timestamp: '14:23:45', sourceIP: '192.168.1.105', switchPort: 3, classification: 'DOS', isIsolated: true },
    { timestamp: '14:23:45', sourceIP: '192.168.1.102', switchPort: 7, classification: 'Normal', isIsolated: false },
    { timestamp: '14:23:44', sourceIP: '192.168.1.108', switchPort: 5, classification: 'Botnet', isIsolated: true },
    { timestamp: '14:23:44', sourceIP: '192.168.1.110', switchPort: 8, classification: 'Spoofing', isIsolated: true },
    { timestamp: '14:23:44', sourceIP: '192.168.1.107', switchPort: 4, classification: 'Replay', isIsolated: true },
  ]);

  const handleIsolate = (index: number) => {
    const packet = packets[index];
    if (window.confirm(`Isolate port ${packet.switchPort} (${packet.sourceIP})?`)) {
      const updatedPackets = [...packets];
      updatedPackets[index].isIsolated = true;
      setPackets(updatedPackets);
      // In production, this would call your API to actually isolate the port
      console.log(`Port ${packet.switchPort} isolated`);
    }
  };

  const getClassificationColor = (classification: string) => {
    const colors = {
      Normal: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      DOS: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      Botnet: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
      Replay: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
      Spoofing: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    };
    return colors[classification as keyof typeof colors];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Packet Monitor</h3>
        </div>
        <Link to="/packets" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </Link>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Time</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Source IP</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {packets.map((packet, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-2 font-mono text-gray-900 dark:text-gray-300">{packet.timestamp}</td>
                <td className="px-4 py-2 font-mono text-gray-900 dark:text-gray-300">{packet.sourceIP}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getClassificationColor(packet.classification)}`}>
                    {packet.classification}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

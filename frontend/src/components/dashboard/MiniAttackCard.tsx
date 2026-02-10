import React from 'react';
import { Link } from 'react-router-dom';

interface MiniAttackCardProps {
  type: 'DOS' | 'Botnet' | 'Replay' | 'MitM';
  activeCount: number;
  blocked: number;
}

export const MiniAttackCard: React.FC<MiniAttackCardProps> = ({ type, activeCount, blocked }) => {
  const attackColors = {
    DOS: 'border-red-500 text-red-700 dark:text-red-400',
    Botnet: 'border-orange-500 text-orange-700 dark:text-orange-400',
    Replay: 'border-purple-500 text-purple-700 dark:text-purple-400',
    MitM: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
  };

  return (
    <Link 
      to="/alerts" 
      className={`block bg-white dark:bg-gray-800 rounded-lg border-l-4 p-3 hover:shadow-md transition-all ${attackColors[type]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">{type}</h3>
      </div>
    </Link>
  );
};

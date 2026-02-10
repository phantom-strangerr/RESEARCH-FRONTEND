import React from 'react';
import { Link } from 'react-router-dom';

export const DevicesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-sm text-gray-900 dark:text-white">Devices</span>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Detailed device health monitoring, port management, and manual override controls
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <p className="text-lg font-medium mb-2">Full device management interface will be here</p>
          <p className="text-sm">Includes: CPU/Memory details, Port visualization, Manual overrides</p>
        </div>
      </div>
    </div>
  );
};

export const AlertsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-sm text-gray-900 dark:text-white">Alerts</span>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Alert details, confidence scores, model explainability, and false positive controls
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-medium mb-2">Full alert management interface will be here</p>
          <p className="text-sm">Includes: Alert filtering, ML confidence, Feature importance</p>
        </div>
      </div>
    </div>
  );
};

export const MetricsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-sm text-gray-900 dark:text-white">Metrics</span>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Metrics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Detailed CPU, memory, network usage, packet classification, and inference latency
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium mb-2">Full metrics visualization will be here</p>
          <p className="text-sm">Includes: Time-series charts, Time-range selector, Performance metrics</p>
        </div>
      </div>
    </div>
  );
};

export const LogsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-sm text-gray-900 dark:text-white">Logs</span>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Logs</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Comprehensive log viewer with filtering, search, and pagination
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">Full log viewer will be here</p>
          <p className="text-sm">Includes: Log filtering, Severity levels, Audit trails</p>
        </div>
      </div>
    </div>
  );
};

export const ForensicsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-sm text-gray-900 dark:text-white">Forensics</span>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attack Forensics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Detailed attack timeline and forensic analysis tools
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium mb-2">Full forensic timeline will be here</p>
          <p className="text-sm">Includes: Detailed event timeline, Attack patterns, Investigation tools</p>
        </div>
      </div>
    </div>
  );
};

"use client";

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('debug');

  const fetchData = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/${endpoint}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `Error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab === 'debug' ? 'debug/tables' : activeTab);
  }, [activeTab]);

  const endpoints = [
    { id: 'debug', label: 'Debug Tables' },
    { id: 'cabinets', label: 'Cabinets' },
    { id: 'drawers', label: 'Drawers' },
    { id: 'items', label: 'Items' },
    { id: 'users', label: 'Users' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'activity-logs', label: 'Activity Logs' },
    { id: 'weightlogs', label: 'Weight Logs' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Route Testing</h1>

        {/* Tabs for different endpoints */}
        <div className="flex flex-wrap mb-6 gap-2">
          {endpoints.map((endpoint) => (
            <button
              key={endpoint.id}
              onClick={() => setActiveTab(endpoint.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === endpoint.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {endpoint.label}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <div className="mb-6">
          <button
            onClick={() => fetchData(activeTab === 'debug' ? 'debug/tables' : activeTab)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Status display */}
        <div className="mb-6">
          <p className="text-slate-400">
            Endpoint: <span className="text-cyan-500">/api/{activeTab === 'debug' ? 'debug/tables' : activeTab}</span>
          </p>
          <p className="text-slate-400">
            Status: {loading ? (
              <span className="text-yellow-500">Loading...</span>
            ) : error ? (
              <span className="text-red-500">Error</span>
            ) : (
              <span className="text-green-500">Success</span>
            )}
          </p>
        </div>

        {/* Content area */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <h3 className="text-red-500 font-semibold mb-2">Error</h3>
              <p className="text-red-300">{error}</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-sm text-slate-300 max-h-[60vh] overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
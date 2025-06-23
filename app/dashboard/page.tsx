"use client"

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Scale, TrendingUp, Menu, Bell, Settings, Search, LogOut, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

// Type definitions
interface User {
  id: string;
  username?: string;
  full_name?: string;
  email: string;
}

interface Drawer {
  id: number;
  cabinetId: string;
  drawerNumber: number;
  itemType: string;
  expectedWeight: number;
  actualWeight: number;
  quantity: number;
  unitWeight: number;
  lastUpdated: string;
  status: 'good' | 'low' | 'critical';
  location?: string;
  nfcTag?: string;
  qrCode?: string;
  hasAlerts?: boolean;
}

interface Cabinet {
  id: string;
  name: string;
  location: string;
  drawerCount: number;
  slotsWide?: number;
  slotsTall?: number;
  activeDrawers?: number;
  alertCount?: number;
}

interface Stats {
  totalDrawers: number;
  activeDrawers: number;
  lowStock: number;
  criticalStock: number;
  weightDiscrepancies: number;
}

interface ChartData {
  timestamp: string;
  date: string;
  totalWeight: number;
  expectedWeight: number;
  discrepancy: number;
  lowStockCount: number;
  criticalStockCount: number;
}

interface ActivityLog {
  id: string;
  drawerId: number;
  action: 'refill' | 'weight_check' | 'calibration' | 'alert';
  timestamp: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
  userName?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// API service configuration - UPDATED FOR YOUR PORT
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const apiService = {
  // Generate a demo auth token for testing
  ensureAuthToken(): string {
    let token = localStorage.getItem('authToken');
    if (!token) {
      token = 'demo_token_' + Date.now();
      localStorage.setItem('authToken', token);
      console.log('Generated demo auth token:', token);
    }
    return token;
  },

  // Get auth headers
  getHeaders(): HeadersInit {
    const token = this.ensureAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  },

  // Handle API responses
  async handleResponse<T>(response: Response): Promise<T> {
    console.log(`API Response: ${response.status} ${response.statusText} for ${response.url}`);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    
    if (result.success === false) {
      throw new Error(result.error || 'API request failed');
    }
    
    return result.data;
  },

  // Fetch dashboard statistics
  async fetchStats(): Promise<Stats> {
    console.log('Fetching stats from:', `${API_BASE_URL}/api/stats`);
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Stats>(response);
  },

  // Fetch all drawers
  async fetchDrawers(): Promise<Drawer[]> {
    console.log('Fetching drawers from:', `${API_BASE_URL}/api/drawers`);
    const response = await fetch(`${API_BASE_URL}/api/drawers`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Drawer[]>(response);
  },

  // Fetch all cabinets
  async fetchCabinets(): Promise<Cabinet[]> {
    console.log('Fetching cabinets from:', `${API_BASE_URL}/api/cabinets`);
    const response = await fetch(`${API_BASE_URL}/api/cabinets`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<Cabinet[]>(response);
  },

  // Fetch activity log
  async fetchActivityLog(limit: number = 10): Promise<ActivityLog[]> {
    console.log('Fetching activity from:', `${API_BASE_URL}/api/activity?limit=${limit}`);
    const response = await fetch(`${API_BASE_URL}/api/activity?limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ActivityLog[]>(response);
  },

  // Fetch chart data
  async fetchChartData(timeRange: string = '24h'): Promise<ChartData[]> {
    console.log('Fetching chart data from:', `${API_BASE_URL}/api/analytics/chart?range=${timeRange}`);
    const response = await fetch(`${API_BASE_URL}/api/analytics/chart?range=${timeRange}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<ChartData[]>(response);
  },

  // Test API connection
  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (response.ok) {
        return { status: 'connected', message: 'API is working' };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }
};

// Header Component
const SiteHeader: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => (
  <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
    <div className="flex h-14 items-center px-4 max-w-full">
      <div className="mr-4 flex items-center">
        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex size-6 items-center justify-center rounded-md mr-2">
          <Scale className="h-4 w-4" />
        </div>
        <span className="font-bold text-white">Ordobin</span>
      </div>
      <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div className="w-full flex-1 md:w-auto md:flex-none">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search drawers..."
              className="w-full rounded-lg bg-gray-800/80 border border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 backdrop-blur-sm pl-8 h-9 px-3 py-1 text-sm ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            />
          </div>
        </div>
        <nav className="flex items-center space-x-2">
          <span className="text-sm text-gray-300 hidden md:block">
            Welcome, {user?.username || user?.full_name || 'User'}
          </span>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:bg-gray-800 hover:text-gray-200 h-9 w-9 text-gray-400">
            <Bell className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:bg-gray-800 hover:text-gray-200 h-9 w-9 text-gray-400">
            <Settings className="h-4 w-4" />
          </button>
          <button 
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:bg-red-800 hover:text-red-200 h-9 w-9 text-gray-400 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  </header>
);

// Sidebar Component
const AppSidebar: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => (
  <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-700 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-gray-700 px-4 lg:px-6">
        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white flex size-6 items-center justify-center rounded-md mr-2">
          <Scale className="h-4 w-4" />
        </div>
        <span className="font-semibold text-white">Inventory Control</span>
        <button
          onClick={onToggle}
          className="ml-auto lg:hidden p-1 rounded-md hover:bg-gray-800 text-gray-400"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-400 px-2">Overview</div>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-gray-800 text-white border border-purple-500/20">
            <Package className="h-4 w-4" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Scale className="h-4 w-4" />
            Drawers
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </a>
        </div>
        <div className="pt-4 space-y-2">
          <div className="text-sm font-medium text-gray-400 px-2">Management</div>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            Cabinets
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            Items
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            Reports
          </a>
        </div>
      </nav>
    </div>
  </div>
);

// Stats Cards Component
const SectionCards: React.FC<{ 
  stats: Stats | null; 
  isLoading: boolean; 
  error: string | null;
  onRetry: () => void;
}> = ({ stats, isLoading, error, onRetry }) => {
  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border border-red-700 bg-red-900/20 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-300">Error Loading Statistics</h3>
              <p className="text-xs text-red-400 mt-1">{error}</p>
              <p className="text-xs text-gray-500 mt-2">
                Check your API endpoint: {API_BASE_URL}/api/stats
              </p>
            </div>
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex-shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-600 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Success state
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      <div className="rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-purple-500/10 p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-200">Total Drawers</h3>
          <Package className="h-4 w-4 text-gray-400" />
        </div>
        <div className="text-2xl font-bold text-white">{stats?.totalDrawers || 0}</div>
        <p className="text-xs text-gray-400">
          {stats?.activeDrawers || 0} active
        </p>
      </div>
      
      <div className="rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-yellow-500/10 p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-200">Low Stock</h3>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="text-2xl font-bold text-yellow-500">{stats?.lowStock || 0}</div>
        <p className="text-xs text-gray-400">
          Needs attention
        </p>
      </div>
      
      <div className="rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-red-500/10 p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-200">Critical Stock</h3>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
        <div className="text-2xl font-bold text-red-500">{stats?.criticalStock || 0}</div>
        <p className="text-xs text-gray-400">
          Immediate refill
        </p>
      </div>
      
      <div className="rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-orange-500/10 p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-gray-200">Weight Issues</h3>
          <Scale className="h-4 w-4 text-orange-500" />
        </div>
        <div className="text-2xl font-bold text-orange-500">{stats?.weightDiscrepancies || 0}</div>
        <p className="text-xs text-gray-400">
          Check calibration
        </p>
      </div>
    </div>
  );
};

// Interactive Chart Component - Part 1
const ChartAreaInteractive: React.FC<{ 
  chartData: ChartData[]; 
  isLoading: boolean; 
  error: string | null;
  onTimeRangeChange: (range: string) => void;
  onRetry: () => void;
  currentRange: string;
}> = ({ chartData, isLoading, error, onTimeRangeChange, onRetry, currentRange }) => {
  const [chartType, setChartType] = useState<'weight' | 'stock' | 'discrepancy'>('weight');

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const chartTypes = [
    { value: 'weight', label: 'Weight Tracking', icon: Scale },
    { value: 'stock', label: 'Stock Levels', icon: Package },
    { value: 'discrepancy', label: 'Discrepancies', icon: AlertTriangle }
  ];

  const formatTooltipValue = (value: number, name: string) => {
    if (name.includes('Weight') || name.includes('weight')) {
      return [`${value}g`, name];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    if (currentRange === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (currentRange === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-700 bg-red-900/20 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-300">Error Loading Chart Data</h3>
            <p className="text-xs text-red-400 mt-1">{error}</p>
            <p className="text-xs text-gray-500 mt-2">
              Endpoint: {API_BASE_URL}/api/analytics/chart?range={currentRange}
            </p>
          </div>
          <button
            onClick={onRetry}
            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex-shrink-0"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-purple-500/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Inventory Analytics</h3>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-32"></div>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading chart data for {currentRange}...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-purple-500/10 p-6">
      {/* Chart Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-white">Inventory Analytics</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Chart Type Selector */}
          <div className="flex rounded-lg border border-gray-600 bg-gray-700/50 p-1">
            {chartTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    chartType === type.value
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Time Range Selector */}
          <div className="flex rounded-lg border border-gray-600 bg-gray-700/50 p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => onTimeRangeChange(range.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  currentRange === range.value
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-80">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No data available for {currentRange}</p>
            </div>
          </div>
        ) : (
          <>
            {chartType === 'weight' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="totalWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="expectedWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxisLabel}
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalWeight"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#totalWeight)"
                    name="Actual Weight"
                  />
                  <Area
                    type="monotone"
                    dataKey="expectedWeight"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expectedWeight)"
                    name="Expected Weight"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {chartType === 'stock' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxisLabel}
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="lowStockCount" fill="#f59e0b" name="Low Stock Items" />
                  <Bar dataKey="criticalStockCount" fill="#ef4444" name="Critical Stock Items" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === 'discrepancy' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxisLabel}
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="discrepancy"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    name="Weight Discrepancy"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component with Real API Integration
export default function OrdobinDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [currentTimeRange, setCurrentTimeRange] = useState<string>('24h');
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // Check authentication and load user
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        console.warn('No auth token found - creating demo user');
        // For demo purposes, create a default user
        const defaultUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@ordobin.com'
        };
        setUser(defaultUser);
        localStorage.setItem('user', JSON.stringify(defaultUser));
        return;
      }
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('Error parsing user data:', e);
          // Create default user on error
          const defaultUser: User = {
            id: '1',
            username: 'admin',
            email: 'admin@ordobin.com'
          };
          setUser(defaultUser);
          localStorage.setItem('user', JSON.stringify(defaultUser));
        }
      } else {
        // Create a default user if none exists
        const defaultUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@ordobin.com'
        };
        setUser(defaultUser);
        localStorage.setItem('user', JSON.stringify(defaultUser));
      }
    };

    checkAuth();
  }, []);

  // Fetch dashboard data from API
  const fetchDashboardData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dashboard data from API...');
      
      // Fetch all data in parallel
      const [statsResponse, drawersResponse, cabinetsResponse] = await Promise.allSettled([
        apiService.fetchStats(),
        apiService.fetchDrawers(),
        apiService.fetchCabinets()
      ]);
      
      // Handle stats
      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value);
        console.log('Stats loaded successfully:', statsResponse.value);
      } else {
        console.error('Failed to fetch stats:', statsResponse.reason);
        throw new Error(`Stats API error: ${statsResponse.reason.message}`);
      }
      
      // Handle drawers
      if (drawersResponse.status === 'fulfilled') {
        setDrawers(drawersResponse.value);
        console.log('Drawers loaded successfully:', drawersResponse.value.length, 'items');
      } else {
        console.error('Failed to fetch drawers:', drawersResponse.reason);
      }
      
      // Handle cabinets
      if (cabinetsResponse.status === 'fulfilled') {
        setCabinets(cabinetsResponse.value);
        console.log('Cabinets loaded successfully:', cabinetsResponse.value.length, 'items');
      } else {
        console.error('Failed to fetch cabinets:', cabinetsResponse.reason);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chart data from API
  const fetchChartData = async (timeRange: string): Promise<void> => {
    setChartLoading(true);
    setChartError(null);
    
    try {
      console.log(`Fetching chart data for ${timeRange}...`);
      const data = await apiService.fetchChartData(timeRange);
      setChartData(data);
      console.log('Chart data loaded successfully:', data.length, 'data points');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data';
      setChartError(errorMessage);
      console.error('Chart data fetch error:', err);
    } finally {
      setChartLoading(false);
    }
  };

  // Load data when user is available
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchChartData(currentTimeRange);
    }
  }, [user]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing data...');
      fetchDashboardData();
      fetchChartData(currentTimeRange);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, currentTimeRange]);

  // Handle time range change
  const handleTimeRangeChange = (range: string): void => {
    console.log(`Changing time range to: ${range}`);
    setCurrentTimeRange(range);
    fetchChartData(range);
  };

  // Handle logout
  const handleLogout = (): void => {
    console.log('Logging out...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // In a real app, redirect to login page
    // For demo purposes, show alert
    alert('Logged out - In a real app, this would redirect to login page');
    
    // Reset state
    setUser(null);
    setStats(null);
    setDrawers([]);
    setCabinets([]);
    setChartData([]);
  };

  // Retry handlers
  const handleRetryStats = (): void => {
    console.log('Retrying dashboard data fetch...');
    fetchDashboardData();
  };

  const handleRetryChart = (): void => {
    console.log('Retrying chart data fetch...');
    fetchChartData(currentTimeRange);
  };

  // Show loading screen if user is not loaded
  if (!user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Initializing dashboard...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 lg:ml-0 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 min-h-screen">
        <SiteHeader user={user} onLogout={handleLogout} />
        
        {/* Mobile menu button */}
        <div className="lg:hidden p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:bg-gray-800 hover:text-gray-200 h-9 w-9 text-gray-400"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <main className="flex-1">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* API Connection Status */}
            <div className="px-4 lg:px-6">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${error || chartError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-xs text-gray-400">
                      API Status: {error || chartError ? 'Error' : 'Connected'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {API_BASE_URL}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <SectionCards 
              stats={stats} 
              isLoading={isLoading} 
              error={error}
              onRetry={handleRetryStats}
            />
            
            {/* Chart Section */}
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive 
                chartData={chartData}
                isLoading={chartLoading}
                error={chartError}
                onTimeRangeChange={handleTimeRangeChange}
                onRetry={handleRetryChart}
                currentRange={currentTimeRange}
              />
            </div>
            {/* Drawer Status Section */}
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-purple-500/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Drawer Status</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Endpoint: /api/drawers</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading drawer data from API...
                    </div>
                  ) : error ? (
                    <div className="space-y-2">
                      <p className="text-red-400">API Error: Failed to load drawer data</p>
                      <p className="text-xs text-gray-500">Make sure your backend is running on {API_BASE_URL}</p>
                      <button
                        onClick={handleRetryStats}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                      >
                        Retry API Call
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>Found {drawers.length} drawers across {cabinets.length} cabinets from API.</p>
                      {drawers.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                          {drawers.slice(0, 6).map((drawer) => (
                            <div key={drawer.id} className="bg-gray-700/50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">
                                  {drawer.cabinetId}-{drawer.drawerNumber.toString().padStart(2, '0')}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  drawer.status === 'good' ? 'bg-green-500/20 text-green-400' :
                                  drawer.status === 'low' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {drawer.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{drawer.itemType}</p>
                              <p className="text-xs text-gray-500">
                                {drawer.actualWeight}g / {drawer.expectedWeight}g
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-green-400 mt-2">
                        ✅ Live API integration active
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
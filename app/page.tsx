"use client";

import { useState, useEffect } from 'react';
import { 
  Package, 
  Settings, 
  BarChart3, 
  Grid, 
  List,
  Plus,
  Search,
  AlertTriangle,
  Wifi,
  QrCode,
  Users,
  Activity,
  Loader2 
} from 'lucide-react';

// Import types
interface Cabinet {
  id: string;
  label: string;
  location: string;
  slots_wide: number;
  slots_tall: number;
}

interface Drawer {
  id: string;
  label: string;
  cabinet_id: string;
  item_id: string;
  quantity: number;
  slot_x: number;
  slot_y: number;
  nfc_tag?: boolean;
  qr_code?: boolean;
}

interface Item {
  id: string;
  name: string;
  type: string;
  unit_weight: number;
  description: string;
}

interface User {
  id: string;
  full_name: string;
  is_active: boolean;
}

interface Alert {
  id: string;
  alert_type: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  resolved: boolean;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  drawer_id?: string;
}

interface ErrorState {
  cabinets: string | null;
  drawers: string | null;
  items: string | null;
  users: string | null;
  alerts: string | null;
  activityLogs: string | null;
}

interface NavigationItem {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
}

// API client functions
const api = {
  async fetchCabinets(): Promise<Cabinet[]> {
    const response = await fetch('/api/cabinets');
    if (!response.ok) throw new Error('Failed to fetch cabinets');
    return response.json();
  },
  async fetchDrawers(): Promise<Drawer[]> {
    const response = await fetch('/api/drawers');
    if (!response.ok) throw new Error('Failed to fetch drawers');
    return response.json();
  },
  async fetchItems(): Promise<Item[]> {
    const response = await fetch('/api/items');
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  },
  async fetchUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  async fetchAlerts(): Promise<Alert[]> {
    const response = await fetch('/api/alerts');
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },
  async fetchActivityLogs(): Promise<ActivityLog[]> {
    const response = await fetch('/api/activity-logs');
    if (!response.ok) throw new Error('Failed to fetch activity logs');
    return response.json();
  }
};

// UI Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-40">
    <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
    <p className="text-red-200">{message}</p>
    <button 
      className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 transition-colors rounded-md text-white"
      onClick={() => window.location.reload()}
    >
      Retry
    </button>
  </div>
);

// Main Ordobin component
export default function OrdobinPage() {
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for data
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    cabinets: false,
    drawers: false,
    items: false,
    users: false,
    alerts: false,
    activityLogs: false
  });
  
  // Error states with proper typing
  const [errors, setErrors] = useState<ErrorState>({
    cabinets: null,
    drawers: null,
    items: null,
    users: null,
    alerts: null,
    activityLogs: null
  });

  // Helper function for error handling
  const handleApiError = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch cabinets
      setLoading(prev => ({ ...prev, cabinets: true }));
      try {
        const cabinetsData = await api.fetchCabinets();
        setCabinets(cabinetsData);
      } catch (error) {
        setErrors(prev => ({ ...prev, cabinets: handleApiError(error) }));
      } finally {
        setLoading(prev => ({ ...prev, cabinets: false }));
      }
      
      // Fetch drawers
      setLoading(prev => ({ ...prev, drawers: true }));
      try {
        const drawersData = await api.fetchDrawers();
        setDrawers(drawersData);
      } catch (error) {
        setErrors(prev => ({ ...prev, drawers: handleApiError(error) }));
      } finally {
        setLoading(prev => ({ ...prev, drawers: false }));
      }
      
      // Fetch items
      setLoading(prev => ({ ...prev, items: true }));
      try {
        const itemsData = await api.fetchItems();
        setItems(itemsData);
      } catch (error) {
        setErrors(prev => ({ ...prev, items: handleApiError(error) }));
      } finally {
        setLoading(prev => ({ ...prev, items: false }));
      }
      
      // Fetch users
      setLoading(prev => ({ ...prev, users: true }));
      try {
        const usersData = await api.fetchUsers();
        setUsers(usersData);
      } catch (error) {
        setErrors(prev => ({ ...prev, users: handleApiError(error) }));
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
      
      // Fetch alerts
      setLoading(prev => ({ ...prev, alerts: true }));
      try {
        const alertsData = await api.fetchAlerts();
        setAlerts(alertsData);
      } catch (error) {
        setErrors(prev => ({ ...prev, alerts: handleApiError(error) }));
      } finally {
        setLoading(prev => ({ ...prev, alerts: false }));
      }
      
      // Fetch activity logs
      setLoading(prev => ({ ...prev, activityLogs: true }));
      try {
        const logsData = await api.fetchActivityLogs();
        setActivityLogs(logsData);
      } catch (error) {
        setErrors(prev => ({ ...prev, activityLogs: handleApiError(error) }));
      } finally {
        setLoading(prev => ({ ...prev, activityLogs: false }));
      }
    };
    
    fetchData();
  }, []);

  // Helper functions
  const getItemName = (itemId: string): string => items.find(item => item.id === itemId)?.name || 'Unknown Item';
  const getCabinetName = (cabinetId: string): string => cabinets.find(cabinet => cabinet.id === cabinetId)?.label || 'Unknown Cabinet';
  const getUserName = (userId: string): string => users.find(user => user.id === userId)?.full_name || 'Unknown User';

  // Dashboard component
  const Dashboard = () => {
    // Check if any data is loading
    const isLoading = Object.values(loading).some(Boolean);
    
    // Check if there are any errors
    const hasError = Object.values(errors).some(Boolean);
    
    if (isLoading) return <LoadingSpinner />;
    
    if (hasError) {
      const errorMessage = Object.values(errors).find(Boolean);
      return <ErrorDisplay message={errorMessage || 'An error occurred'} />;
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Total Items</p>
                <p className="text-2xl font-bold text-white">{drawers.reduce((sum, drawer) => sum + (drawer.quantity || 0), 0)}</p>
              </div>
              <Package className="h-8 w-8 text-cyan-500" />
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Active Cabinets</p>
                <p className="text-2xl font-bold text-white">{cabinets.length}</p>
              </div>
              <Grid className="h-8 w-8 text-cyan-500" />
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-white">{alerts.filter(alert => alert.alert_type === 'LOW_STOCK' && !alert.resolved).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-cyan-500" />
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Active Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(user => user.is_active).length}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No alerts at this time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-center space-x-3 p-3 bg-red-900/20 rounded-lg border border-red-800">
                    <AlertTriangle className={`h-5 w-5 ${alert.severity === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{alert.message}</p>
                      <p className="text-xs text-slate-400">{alert.alert_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            {activityLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                    <Activity className="h-5 w-5 text-cyan-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {getUserName(log.user_id)} - {log.action.replace('_', ' ').toLowerCase()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {log.drawer_id && `Drawer: ${drawers.find(d => d.id === log.drawer_id)?.label}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // CabinetsView component
  const CabinetsView = () => {
    if (loading.cabinets) return <LoadingSpinner />;
    if (errors.cabinets) return <ErrorDisplay message={errors.cabinets} />;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Cabinets</h2>
          <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-cyan-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Cabinet</span>
          </button>
        </div>

        {cabinets.length === 0 ? (
          <div className="bg-slate-800 p-12 rounded-lg shadow-sm border border-slate-700 text-center">
            <Grid className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No cabinets configured</h3>
            <p className="text-slate-400 mb-6">Get started by adding your first cabinet to organize your inventory.</p>
            <button className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-cyan-700 transition-colors mx-auto">
              <Plus className="h-4 w-4" />
              <span>Add Your First Cabinet</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cabinets.map(cabinet => {
              const cabinetDrawers = drawers.filter(drawer => drawer.cabinet_id === cabinet.id);
              return (
                <div key={cabinet.id} className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{cabinet.label}</h3>
                    <Grid className="h-6 w-6 text-cyan-500" />
                  </div>
                  <p className="text-sm text-slate-400 mb-2">Location: {cabinet.location}</p>
                  <p className="text-sm text-slate-400 mb-4">
                    Grid: {cabinet.slots_wide} × {cabinet.slots_tall} ({cabinet.slots_wide * cabinet.slots_tall} slots)
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Occupied Slots:</span>
                      <span className="text-white">{cabinetDrawers.length}/{cabinet.slots_wide * cabinet.slots_tall}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full" 
                        style={{ width: `${(cabinetDrawers.length / (cabinet.slots_wide * cabinet.slots_tall)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // DrawersView component
  const DrawersView = () => {
    if (loading.drawers || loading.cabinets || loading.items) return <LoadingSpinner />;
    if (errors.drawers || errors.cabinets || errors.items) {
      const error = errors.drawers || errors.cabinets || errors.items;
      return <ErrorDisplay message={error || 'An error occurred'} />;
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Drawers</h2>
          <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-cyan-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Drawer</span>
          </button>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-sm border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search drawers..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {drawers.length === 0 ? (
            <div className="p-12 text-center">
              <List className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No drawers configured</h3>
              <p className="text-slate-400">Add drawers to your cabinets to start organizing your items.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Drawer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Cabinet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Tags</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {drawers
                    .filter(drawer => 
                      drawer.label?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      getItemName(drawer.item_id).toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(drawer => (
                    <tr key={drawer.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{drawer.label}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{getCabinetName(drawer.cabinet_id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{getItemName(drawer.item_id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{drawer.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">({drawer.slot_x}, {drawer.slot_y})</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {drawer.nfc_tag && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-900 text-cyan-300">
                              <Wifi className="h-3 w-3 mr-1" />
                              NFC
                            </span>
                          )}
                          {drawer.qr_code && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-900 text-emerald-300">
                              <QrCode className="h-3 w-3 mr-1" />
                              QR
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ItemsView component
  const ItemsView = () => {
    if (loading.items || loading.drawers) return <LoadingSpinner />;
    if (errors.items || errors.drawers) {
      const error = errors.items || errors.drawers;
      return <ErrorDisplay message={error || 'An error occurred'} />;
    }
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Items</h2>
          <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-cyan-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-slate-800 p-12 rounded-lg shadow-sm border border-slate-700 text-center">
            <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No items in inventory</h3>
            <p className="text-slate-400 mb-6">Start by adding items to track in your inventory system.</p>
            <button className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-cyan-700 transition-colors mx-auto">
              <Plus className="h-4 w-4" />
              <span>Add Your First Item</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              const itemDrawers = drawers.filter(drawer => drawer.item_id === item.id);
              const totalQuantity = itemDrawers.reduce((sum, drawer) => sum + (drawer.quantity || 0), 0);
              
              return (
                <div key={item.id} className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <Package className="h-6 w-6 text-cyan-500" />
                  </div>
                  <p className="text-sm text-slate-400 mb-2">Type: {item.type}</p>
                  <p className="text-sm text-slate-400 mb-2">Unit Weight: {item.unit_weight}g</p>
                  <p className="text-sm text-slate-400 mb-4">{item.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Quantity:</span>
                      <span className="font-medium text-white">{totalQuantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Locations:</span>
                      <span className="font-medium text-white">{itemDrawers.length}</span>
                    </div>
                    {item.unit_weight && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Weight:</span>
                        <span className="font-medium text-white">{(totalQuantity * item.unit_weight).toFixed(1)}g</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const navigation: NavigationItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'cabinets', name: 'Cabinets', icon: Grid },
    { id: 'drawers', name: 'Drawers', icon: List },
    { id: 'items', name: 'Items', icon: Package }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-cyan-500" />
              <h1 className="text-2xl font-bold text-white">Ordobin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-slate-900 shadow-sm h-screen sticky top-0 border-r border-slate-800">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeView === item.id
                          ? 'bg-cyan-900/50 text-cyan-300 border-r-2 border-cyan-500'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'cabinets' && <CabinetsView />}
            {activeView === 'drawers' && <DrawersView />}
            {activeView === 'items' && <ItemsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

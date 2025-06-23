import { Cabinet, Drawer, Item, User, Alert, ActivityLog } from './types';

export const api = {
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

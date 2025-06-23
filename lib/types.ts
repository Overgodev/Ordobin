export interface Cabinet {
  id: string;
  label: string;
  location: string;
  slots_wide: number;
  slots_tall: number;
}

export interface Drawer {
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

export interface Item {
  id: string;
  name: string;
  type: string;
  unit_weight: number;
  description: string;
}

export interface User {
  id: string;
  full_name: string;
  is_active: boolean;
}

export interface Alert {
  id: string;
  alert_type: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  resolved: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  drawer_id?: string;
}

export interface ErrorState {
  cabinets: string | null;
  drawers: string | null;
  items: string | null;
  users: string | null;
  alerts: string | null;
  activityLogs: string | null;
}

export interface CreateUserData {
  username: string;
  email: string;
  full_name?: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
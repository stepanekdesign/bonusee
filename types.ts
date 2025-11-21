
export enum Timeframe {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  Yearly = 'Yearly',
  NoLimit = 'No Limit'
}

export enum CategoryType {
  Finance = 'Finance',
  Groceries = 'Groceries',
  Restaurants = 'Restaurants',
  Travel = 'Travel',
  Health = 'Health',
  Shopping = 'Shopping',
  Other = 'Other'
}

export interface Category {
  id: CategoryType;
  name: string;
  icon: string; // Lucide icon name
  color: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  currentCount: number;
  targetCount: number;
  timeframe: Timeframe;
  category: CategoryType;
  imageUrl?: string; // Base64 or URL
  link?: string;
  isRecurring: boolean;
  isArchived: boolean;
  createdAt: number;
  lastUpdated: number;
  userId?: string; // Optional for backward compatibility/guest mode
}

export type Language = 'en' | 'cs';

export interface NotificationSettings {
  dailyReminder: boolean;
  inactivityAlert: boolean; // Notify if not updated in X days
  weeklyReport: boolean;
  marketing: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPremium: boolean; // For future billing logic
}

export interface AppSettings {
  language: Language;
  notifications: NotificationSettings;
}

export type ViewState = 'HOME' | 'ADD' | 'DISCOVER' | 'ARCHIVE' | 'DETAILS' | 'MORE' | 'UPGRADE';
export type SettingsTab = 'GENERAL' | 'NOTIFICATIONS' | 'PRIVACY' | 'HELP' | null;

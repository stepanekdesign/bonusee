import { Category, CategoryType, Goal, Timeframe } from './types';

export const CATEGORIES: Category[] = [
  { id: CategoryType.Finance, name: 'Finance', icon: 'CreditCard', color: 'from-emerald-400 to-cyan-400' },
  { id: CategoryType.Groceries, name: 'Groceries', icon: 'ShoppingBasket', color: 'from-orange-400 to-amber-400' },
  { id: CategoryType.Restaurants, name: 'Dining', icon: 'Utensils', color: 'from-red-400 to-pink-400' },
  { id: CategoryType.Travel, name: 'Travel', icon: 'Plane', color: 'from-blue-400 to-indigo-400' },
  { id: CategoryType.Health, name: 'Health', icon: 'Activity', color: 'from-rose-400 to-purple-400' },
  { id: CategoryType.Shopping, name: 'Shopping', icon: 'ShoppingBag', color: 'from-violet-400 to-fuchsia-400' },
  { id: CategoryType.Other, name: 'Other', icon: 'Sparkles', color: 'from-slate-400 to-zinc-400' },
];

export const MOCK_GOAL: Goal = {
  id: 'moneta-sample',
  title: 'MONETA Savings 2.9%',
  description: 'Make 5 card payments monthly to boost interest rate.',
  currentCount: 2,
  targetCount: 5,
  timeframe: Timeframe.Monthly,
  category: CategoryType.Finance,
  isRecurring: true,
  isArchived: false,
  createdAt: Date.now(),
  lastUpdated: Date.now(),
  imageUrl: 'https://picsum.photos/400/400?grayscale' // Placeholder
};

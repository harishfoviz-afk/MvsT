/**
 * TotLogix Monetization & Pass Storage Engine
 * 
 * Manages active passes, time-bound expiry, theme access gating,
 * 3-page free teaser rules, and dummy Razorpay transaction records.
 */

import { BookTheme } from '../../types/book';

export type PassTier =
  | 'free'
  | 'weekend'
  | 'holiday'
  | 'summer'
  | 'annual'
  | 'phygital_bundle'
  | 'sunday_print_club';

export interface PassPlan {
  id: PassTier;
  name: string;
  priceInr: number;
  originalPriceInr?: number;
  durationHours: number; // 0 = permanent or subscription
  durationLabel: string;
  tagline: string;
  badge?: string;
  features: string[];
}

export interface TransactionRecord {
  id: string;
  orderId: string;
  paymentId: string;
  tier: PassTier;
  tierName: string;
  amountInr: number;
  timestamp: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  status: 'SUCCESS' | 'FAILED';
}

export interface PassState {
  activeTier: PassTier;
  activePassName: string;
  activatedAt: number | null;
  expiresAt: number | null; // null = indefinite or free
  purchasedPacks: string[]; // unlocked theme IDs or pack IDs
  totalSpentInr: number;
}

const PASS_STORAGE_KEY = 'totlogix_active_pass_v1';
const TX_STORAGE_KEY = 'totlogix_transactions_v1';

export const PASS_PLANS: PassPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    priceInr: 0,
    durationHours: 0,
    durationLabel: 'Lifetime Access',
    tagline: 'Get started with zero commitment',
    features: [
      '1 Full Activity Theme (Animals)',
      'Ages 4-6 Junior Scout Calibration',
      'Interactive Puzzles & Audio Fanfares',
      '3-Challenge Teaser on all other themes',
    ],
  },
  {
    id: 'weekend',
    name: 'Weekend Warrior Pass',
    priceInr: 49,
    originalPriceInr: 79,
    durationHours: 48,
    durationLabel: '48 Hours All-Access',
    tagline: 'Ideal for weekend travel, restaurants & car trips',
    badge: '⚡ Most Popular for Outings',
    features: [
      '48-Hour Full Access to All 6 Themes',
      'All Age Tiers (4-6, 7-9, 10+)',
      'Unlimited Puzzle Solving & Stars',
      'Printable Completion Certificate',
    ],
  },
  {
    id: 'holiday',
    name: 'Holiday Break Pass',
    priceInr: 149,
    originalPriceInr: 199,
    durationHours: 14 * 24, // 14 days
    durationLabel: '14 Days All-Access',
    tagline: 'Designed for Diwali, Dussehra, & school breaks',
    badge: '🎉 Vacation Favorite',
    features: [
      '14 Days Unlimited Access across all themes',
      'All Age Calibrations & Sudoku Sizes',
      'Full Stamp Passport Collection',
      'Zero Ads & 100% Screen-Positive',
    ],
  },
  {
    id: 'summer',
    name: 'Summer Explorer Pass',
    priceInr: 399,
    originalPriceInr: 499,
    durationHours: 60 * 24, // 60 days
    durationLabel: '60 Days All-Access',
    tagline: 'Zero-guilt cognitive growth during summer holidays',
    badge: '☀️ Best for Holidays',
    features: [
      'Full 60 Days of Summer Vacation Play',
      'Daily Cognitive Routine & Challenges',
      'Sibling Friendly Play on Any Tablet',
      'Priority Access to New Book Releases',
    ],
  },
  {
    id: 'annual',
    name: 'TotLogix All-Access Pass',
    priceInr: 799,
    originalPriceInr: 999,
    durationHours: 365 * 24, // 365 days
    durationLabel: '1 Year Full Access',
    tagline: 'Just ₹2.20/day — Complete brain gym for growing minds',
    badge: '🏆 Best Value • Up to 2 Kids',
    features: [
      '365 Days Unlimited Access to All Current & Future Themes',
      'Supports 2 Sibling Profiles simultaneously',
      'All Puzzle Tiers: Junior, Explorer & Mastermind',
      'Downloadable High-Res Diplomas & Printables',
    ],
  },
  {
    id: 'phygital_bundle',
    name: 'Phygital Explorer Bundle',
    priceInr: 149,
    originalPriceInr: 199,
    durationHours: 30 * 24,
    durationLabel: '30 Days Digital + PDF',
    tagline: 'Screen time on the go + 25-page paper workbook for the desk',
    badge: '📦 Screen + Paper Bundle',
    features: [
      '30-Day Digital Unlock for chosen theme',
      'Instant 25-Page Vector Printable PDF via WhatsApp',
      'Bridges digital interactivity with handwriting/pencil practice',
      '300 DPI razor-sharp print-at-home layout',
    ],
  },
  {
    id: 'sunday_print_club',
    name: 'Sunday Print Club',
    priceInr: 199,
    originalPriceInr: 299,
    durationHours: 30 * 24,
    durationLabel: 'Monthly Membership',
    tagline: 'Fresh 25-page curated workbook sent to WhatsApp every Sunday at 8 AM',
    badge: '☕ Sunday Morning Routine',
    features: [
      '4 Fresh Vector Workbooks every month',
      'Direct WhatsApp PDF delivery every Sunday morning',
      'Saves hours hunting worksheets online',
      'Cancel or pause anytime with 1 tap',
    ],
  },
];

export function getDefaultPassState(): PassState {
  return {
    activeTier: 'free',
    activePassName: 'Free Starter',
    activatedAt: null,
    expiresAt: null,
    purchasedPacks: ['animals'],
    totalSpentInr: 0,
  };
}

export function loadPassState(): PassState {
  if (typeof window === 'undefined') return getDefaultPassState();
  try {
    const raw = localStorage.getItem(PASS_STORAGE_KEY);
    if (!raw) return getDefaultPassState();
    const state: PassState = JSON.parse(raw);

    // Verify expiry
    if (state.expiresAt && Date.now() > state.expiresAt) {
      // Pass has expired; revert to free tier gracefully
      const expiredState: PassState = {
        ...state,
        activeTier: 'free',
        activePassName: 'Free Starter (Pass Expired)',
        expiresAt: null,
      };
      savePassState(expiredState);
      return expiredState;
    }

    return state;
  } catch (e) {
    console.error('Error loading pass state:', e);
    return getDefaultPassState();
  }
}

export function savePassState(state: PassState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PASS_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving pass state:', e);
  }
}

export function activatePass(
  tier: PassTier,
  paymentMethod: TransactionRecord['paymentMethod'] = 'UPI',
  customOrderId?: string
): { passState: PassState; transaction: TransactionRecord } {
  const plan = PASS_PLANS.find((p) => p.id === tier) || PASS_PLANS[0];
  const now = Date.now();
  const expiresAt = plan.durationHours > 0 ? now + plan.durationHours * 60 * 60 * 1000 : null;

  const current = loadPassState();
  const updatedPass: PassState = {
    ...current,
    activeTier: tier,
    activePassName: plan.name,
    activatedAt: now,
    expiresAt,
    purchasedPacks: tier === 'free' ? ['animals'] : ['animals', 'space', 'dinosaurs', 'fantasy', 'underwater', 'jungle'],
    totalSpentInr: current.totalSpentInr + plan.priceInr,
  };

  savePassState(updatedPass);

  const tx: TransactionRecord = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    orderId: customOrderId || `order_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    paymentId: `pay_${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
    tier,
    tierName: plan.name,
    amountInr: plan.priceInr,
    timestamp: now,
    paymentMethod,
    status: 'SUCCESS',
  };

  logTransaction(tx);
  return { passState: updatedPass, transaction: tx };
}

export function logTransaction(tx: TransactionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(TX_STORAGE_KEY);
    const list: TransactionRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(tx);
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error('Error logging transaction:', e);
  }
}

export function getTransactionHistory(): TransactionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isThemeUnlocked(theme: BookTheme, passState?: PassState): boolean {
  if (theme === 'animals') return true;
  const state = passState || loadPassState();
  if (state.activeTier !== 'free') return true;
  return state.purchasedPacks.includes(theme);
}

/**
 * 3-Page Free Teaser Rule
 */
export function canAccessChallenge(
  theme: BookTheme,
  challengeNumber: number,
  passState?: PassState
): { allowed: boolean; isTeaser: boolean; reason?: string } {
  if (isThemeUnlocked(theme, passState)) {
    return { allowed: true, isTeaser: false };
  }

  if (challengeNumber <= 3) {
    return { allowed: true, isTeaser: true, reason: `Free Teaser: Challenge ${challengeNumber} of 3` };
  }

  return {
    allowed: false,
    isTeaser: false,
    reason: `Locked Theme: Challenge 4+ requires a TotLogix Pass`,
  };
}

/**
 * Format remaining pass duration in hours and minutes
 */
export function formatRemainingPassTime(expiresAt: number | null): string {
  if (!expiresAt) return '';
  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) return 'Expired';

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);

  if (days >= 2) {
    return `${days} days left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

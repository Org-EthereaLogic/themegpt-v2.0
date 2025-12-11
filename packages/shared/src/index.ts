export const BRAND = {
  cream: '#FAF6F0',
  chocolate: '#4B2E1E',
  teal: '#7ECEC5',
  peach: '#F4A988',
  yellow: '#FAD000',
} as const;

export const MSG_GET_TOKENS = 'MSG_GET_TOKENS';
export const STORAGE_TOKEN_ENABLED = 'tokenCounterEnabled';

export interface TokenStats {
  user: number;
  assistant: number;
  total: number;
  lastUpdated: number;
}

export interface Theme {
  id: string;
  name: string;
  category: 'christmas' | 'core' | 'premium';
  colors: {
    '--cgpt-bg': string;
    '--cgpt-surface': string;
    '--cgpt-text': string;
    '--cgpt-text-muted': string;
    '--cgpt-border': string;
    '--cgpt-accent': string;
  };
  isPremium: boolean;
}

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'cozy-cabin-christmas',
    name: 'Cozy Cabin Christmas',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#140E0A',
      '--cgpt-surface': '#1E1410',
      '--cgpt-text': '#F9FAFB',
      '--cgpt-text-muted': '#E5E7EB',
      '--cgpt-border': '#4B2E23',
      '--cgpt-accent': '#D97757',
    },
    isPremium: false,
  },
  {
    id: 'frosted-windowpane',
    name: 'Frosted Windowpane',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#F5F7FB',
      '--cgpt-surface': '#FFFFFF',
      '--cgpt-text': '#0F172A',
      '--cgpt-text-muted': '#4B5563',
      '--cgpt-border': '#D1D5DB',
      '--cgpt-accent': '#3B82F6',
    },
    isPremium: false,
  },
  {
    id: 'midnight-evergreen',
    name: 'Midnight Evergreen',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#020817',
      '--cgpt-surface': '#07120E',
      '--cgpt-text': '#F9FAFB',
      '--cgpt-text-muted': '#E5E7EB',
      '--cgpt-border': '#14532D',
      '--cgpt-accent': '#22C55E',
    },
    isPremium: false,
  },
  {
    id: 'candy-cane-chat',
    name: 'Candy Cane Chat',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#FDF2F2',
      '--cgpt-surface': '#FFFFFF',
      '--cgpt-text': '#111827',
      '--cgpt-text-muted': '#4B5563',
      '--cgpt-border': '#FECACA',
      '--cgpt-accent': '#DC2626',
    },
    isPremium: true,
  },
  {
    id: 'silent-night-starfield',
    name: 'Silent Night (Starfield)',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#020617',
      '--cgpt-surface': '#02081C',
      '--cgpt-text': '#F9FAFB',
      '--cgpt-text-muted': '#CBD5F5',
      '--cgpt-border': '#1D4ED8',
      '--cgpt-accent': '#38BDF8',
    },
    isPremium: true,
  },
  {
    id: 'minimal-advent',
    name: 'Minimal Advent',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#0B0712',
      '--cgpt-surface': '#141021',
      '--cgpt-text': '#F9FAFB',
      '--cgpt-text-muted': '#E5E7EB',
      '--cgpt-border': '#4C1D95',
      '--cgpt-accent': '#7C3AED',
    },
    isPremium: true,
  },
  {
    id: 'red',
    name: 'Red',
    category: 'core',
    colors: {
      '--cgpt-bg': '#FFFFFF',
      '--cgpt-surface': '#F3F3F3',
      '--cgpt-text': '#111827',
      '--cgpt-text-muted': '#4B5563',
      '--cgpt-border': '#E5E7EB',
      '--cgpt-accent': '#EF4444',
    },
    isPremium: false,
  },
  {
    id: 'synth-wave',
    name: 'Synth Wave',
    category: 'core',
    colors: {
      '--cgpt-bg': '#262335',
      '--cgpt-surface': '#2E2943',
      '--cgpt-text': '#F9FAFB',
      '--cgpt-text-muted': '#C7D2FE',
      '--cgpt-border': '#433162',
      '--cgpt-accent': '#FF6AC1',
    },
    isPremium: true,
  },
  {
    id: 'tomorrow-night-blue',
    name: 'Tomorrow Night Blue',
    category: 'core',
    colors: {
      '--cgpt-bg': '#002451',
      '--cgpt-surface': '#001C40',
      '--cgpt-text': '#E0F2FF',
      '--cgpt-text-muted': '#BFDBFE',
      '--cgpt-border': '#003566',
      '--cgpt-accent': '#4FC3F7',
    },
    isPremium: true,
  },
  {
    id: 'shades-of-purple',
    name: 'Shades of Purple',
    category: 'core',
    colors: {
      '--cgpt-bg': '#2D2B56',
      '--cgpt-surface': '#222244',
      '--cgpt-text': '#FFFFFF',
      '--cgpt-text-muted': '#C7D2FE',
      '--cgpt-border': '#3F3C78',
      '--cgpt-accent': '#FAD000',
    },
    isPremium: true,
  },
  {
    id: 'dark-forest',
    name: 'Dark Forest',
    category: 'core',
    colors: {
      '--cgpt-bg': '#101917',
      '--cgpt-surface': '#131F1D',
      '--cgpt-text': '#E5F5F0',
      '--cgpt-text-muted': '#94A3B8',
      '--cgpt-border': '#1F2933',
      '--cgpt-accent': '#22C55E',
    },
    isPremium: false,
  },
  {
    id: 'chocolate-caramel',
    name: 'Chocolate Caramel',
    category: 'core',
    colors: {
      '--cgpt-bg': '#221A0F',
      '--cgpt-surface': '#362712',
      '--cgpt-text': '#FDEFD9',
      '--cgpt-text-muted': '#D1B59A',
      '--cgpt-border': '#4A3419',
      '--cgpt-accent': '#FBBF77',
    },
    isPremium: false,
  },
];

// --- License & Payments ---

export type LicenseType = 'subscription' | 'lifetime';

export interface LicenseEntitlement {
  active: boolean;
  type: LicenseType;
  /**
   * For subscription: Number of slots available (e.g. 3)
   * For lifetime: Usually undefined or 0 (specific themes are in permanentlyUnlocked)
   */
  maxSlots: number;
  /**
   * IDs of themes permanently unlocked (Lifetime purchase)
   */
  permanentlyUnlocked: string[];
  /**
   * IDs of themes currently "active" in the flexible slots (Subscription)
   * User can swap these out up to maxSlots.
   */
  activeSlotThemes: string[];
}

export interface VerifyResponse {
  valid: boolean;
  entitlement?: LicenseEntitlement;
  message?: string;
}

const globalLocation =
  typeof globalThis !== 'undefined'
    ? (globalThis as { location?: { hostname?: string } }).location
    : undefined;

const isLocalHost = !!globalLocation && globalLocation.hostname === 'localhost';
export const API_BASE_URL = isLocalHost ? 'http://localhost:3000' : 'https://themegpt.ai';

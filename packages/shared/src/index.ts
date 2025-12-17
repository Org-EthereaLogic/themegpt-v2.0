export const BRAND = {
  cream: '#FAF6F0',
  chocolate: '#4B2E1E',
  teal: '#7ECEC5',
  peach: '#F4A988',
  yellow: '#FAD000',
} as const;

export const MSG_GET_TOKENS = "GET_TOKENS";
export const MSG_TOKEN_UPDATE = "TOKEN_UPDATE";
export const STORAGE_TOKEN_ENABLED = "token_counter_enabled";

export interface TokenStats {
  user: number;
  assistant: number;
  total: number;
  lastUpdated: number;
}

export type PatternType = 'dots' | 'grid' | 'snowflakes' | 'stars' | 'noise';

export interface ThemePattern {
  type: PatternType;
  opacity: number; // 0.01-0.15 for subtlety
  color?: string;  // Optional override, defaults to accent color
  size?: number;   // Pattern scale factor, defaults to 1
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
  pattern?: ThemePattern;
  noiseOverlay?: boolean; // Subtle texture overlay for tactile quality
  glowOverlay?: boolean;  // Ambient radial glow from accent color
}

export const DEFAULT_THEMES: Theme[] = [
  // =============================================
  // FREE THEMES (Classic IDE themes from v1.0)
  // =============================================
  {
    id: 'vscode-dark-plus',
    name: 'VS Code Dark+',
    category: 'core',
    colors: {
      '--cgpt-bg': '#1E1E1E',
      '--cgpt-surface': '#252526',
      '--cgpt-text': '#D4D4D4',
      '--cgpt-text-muted': '#808080',
      '--cgpt-border': '#3C3C3C',
      '--cgpt-accent': '#569CD6',
    },
    isPremium: false,
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    category: 'core',
    colors: {
      '--cgpt-bg': '#002B36',
      '--cgpt-surface': '#073642',
      '--cgpt-text': '#839496',
      '--cgpt-text-muted': '#657B83',
      '--cgpt-border': '#094959',
      '--cgpt-accent': '#2AA198',
    },
    isPremium: false,
  },
  {
    id: 'dracula',
    name: 'Dracula',
    category: 'core',
    colors: {
      '--cgpt-bg': '#282A36',
      '--cgpt-surface': '#343746',
      '--cgpt-text': '#F8F8F2',
      '--cgpt-text-muted': '#6272A4',
      '--cgpt-border': '#44475A',
      '--cgpt-accent': '#BD93F9',
    },
    isPremium: false,
  },
  {
    id: 'monokai-pro',
    name: 'Monokai Pro',
    category: 'core',
    colors: {
      '--cgpt-bg': '#2D2A2E',
      '--cgpt-surface': '#403E41',
      '--cgpt-text': '#FCFCFA',
      '--cgpt-text-muted': '#939293',
      '--cgpt-border': '#49474A',
      '--cgpt-accent': '#FFD866',
    },
    isPremium: false,
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    category: 'core',
    colors: {
      '--cgpt-bg': '#282C34',
      '--cgpt-surface': '#21252B',
      '--cgpt-text': '#ABB2BF',
      '--cgpt-text-muted': '#5C6370',
      '--cgpt-border': '#3E4451',
      '--cgpt-accent': '#61AFEF',
    },
    isPremium: false,
  },

  // =============================================
  // PREMIUM THEMES - Christmas Collection
  // =============================================
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
    isPremium: true,
    noiseOverlay: true,
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
    isPremium: true,
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
    isPremium: true,
    noiseOverlay: true,
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
    glowOverlay: true,
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
    noiseOverlay: true,
  },

  // =============================================
  // PREMIUM THEMES - Christmas Pattern Collection
  // =============================================
  {
    id: 'snowfall-serenity',
    name: 'Snowfall Serenity',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#0F172A',
      '--cgpt-surface': '#1E293B',
      '--cgpt-text': '#F1F5F9',
      '--cgpt-text-muted': '#94A3B8',
      '--cgpt-border': '#334155',
      '--cgpt-accent': '#38BDF8',
    },
    isPremium: true,
    pattern: {
      type: 'snowflakes',
      opacity: 0.08,
      color: '#FFFFFF',
      size: 1.2,
    },
  },
  {
    id: 'holiday-plaid',
    name: 'Holiday Plaid',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#0D1F12',
      '--cgpt-surface': '#14291A',
      '--cgpt-text': '#E8F5E9',
      '--cgpt-text-muted': '#A5D6A7',
      '--cgpt-border': '#1B5E20',
      '--cgpt-accent': '#EF5350',
    },
    isPremium: true,
    pattern: {
      type: 'grid',
      opacity: 0.06,
      color: '#2E7D32',
      size: 1.5,
    },
  },
  {
    id: 'gingerbread-warmth',
    name: 'Gingerbread Warmth',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#1C120D',
      '--cgpt-surface': '#2A1B14',
      '--cgpt-text': '#FFF8E1',
      '--cgpt-text-muted': '#D7CCC8',
      '--cgpt-border': '#4E342E',
      '--cgpt-accent': '#FF8A65',
    },
    isPremium: true,
    pattern: {
      type: 'dots',
      opacity: 0.05,
      color: '#A1887F',
      size: 1,
    },
  },
  {
    id: 'winter-wonderland',
    name: 'Winter Wonderland',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#E3F2FD',
      '--cgpt-surface': '#FFFFFF',
      '--cgpt-text': '#0D47A1',
      '--cgpt-text-muted': '#5472D3',
      '--cgpt-border': '#BBDEFB',
      '--cgpt-accent': '#1976D2',
    },
    isPremium: true,
    pattern: {
      type: 'snowflakes',
      opacity: 0.12,
      color: '#90CAF9',
      size: 1,
    },
  },
  {
    id: 'starry-christmas-eve',
    name: 'Starry Christmas Eve',
    category: 'christmas',
    colors: {
      '--cgpt-bg': '#0A0A1A',
      '--cgpt-surface': '#12122A',
      '--cgpt-text': '#FAFAFA',
      '--cgpt-text-muted': '#B8B8D1',
      '--cgpt-border': '#2A2A4A',
      '--cgpt-accent': '#FFD700',
    },
    isPremium: true,
    pattern: {
      type: 'stars',
      opacity: 0.15,
      color: '#FFD700',
      size: 1,
    },
  },

  // =============================================
  // PREMIUM THEMES - Core Collection
  // =============================================
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
    glowOverlay: true,
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
    glowOverlay: true,
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
    isPremium: true,
    noiseOverlay: true,
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
    isPremium: true,
    noiseOverlay: true,
  },

  // =============================================
  // FREE THEMES - Vibrant Collection
  // =============================================
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    category: 'core',
    colors: {
      '--cgpt-bg': '#0A1628',
      '--cgpt-surface': '#0F2137',
      '--cgpt-text': '#E0F7FA',
      '--cgpt-text-muted': '#80DEEA',
      '--cgpt-border': '#164E63',
      '--cgpt-accent': '#00E5CC',
    },
    isPremium: false,
  },
  {
    id: 'sunset-blaze',
    name: 'Sunset Blaze',
    category: 'core',
    colors: {
      '--cgpt-bg': '#1A0A14',
      '--cgpt-surface': '#2D1220',
      '--cgpt-text': '#FFF5F0',
      '--cgpt-text-muted': '#FFAB91',
      '--cgpt-border': '#4A1A2E',
      '--cgpt-accent': '#FF6B4A',
    },
    isPremium: false,
  },
  {
    id: 'electric-dreams',
    name: 'Electric Dreams',
    category: 'core',
    colors: {
      '--cgpt-bg': '#0D0221',
      '--cgpt-surface': '#150634',
      '--cgpt-text': '#F5E6FF',
      '--cgpt-text-muted': '#D4AAFF',
      '--cgpt-border': '#3D1A6D',
      '--cgpt-accent': '#FF2E97',
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
export const API_BASE_URL = isLocalHost ? 'http://localhost:3000' : 'https://theme-gpt-web-dufb63uofq-uc.a.run.app';

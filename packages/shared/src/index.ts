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

export type PatternType = 'dots' | 'grid' | 'snowflakes' | 'stars' | 'noise' | 'giftwrap' | 'christmastrees' | 'peppermints' | 'christmaswrap';

export interface ThemePattern {
  type: PatternType;
  opacity: number; // 0.01-0.15 for subtlety
  color?: string;  // Optional override, defaults to accent color
  size?: number;   // Pattern scale factor, defaults to 1
}

// Premium visual effect configurations
export interface AnimatedSnowfall {
  enabled: boolean;
  density: 'light' | 'medium' | 'heavy';
  speed: 'slow' | 'medium' | 'fast';
  snowColor?: string; // Optional color for light backgrounds (default: white)
  style?: 'gentle' | 'shaking' | 'gradient'; // Animation style (default: gentle)
}

export interface TwinklingStars {
  enabled: boolean;
  count: 'sparse' | 'medium' | 'dense';
  includeShootingStars?: boolean;
  starColor?: string;        // Override accent color (default: accent, recommend '#FFFFFF')
  animationDuration?: number; // Base twinkle duration in seconds (default: 3)
}

export interface TreeSilhouettes {
  enabled: boolean;
  style: 'pine' | 'bare' | 'mixed' | 'christmas'; // 'christmas' = decorated with ornaments
  density: 'few' | 'moderate' | 'forest';
  withOrnaments?: boolean; // Add twinkling lights to trees
}

export interface AuroraGradient {
  enabled: boolean;
  palette?: 'arctic' | 'northern' | 'cosmic' | 'custom'; // Color scheme presets
  speed?: 'slow' | 'medium' | 'fast'; // Animation speed
  intensity?: 'subtle' | 'medium' | 'vivid'; // Blob opacity/vibrancy
  customColors?: string[]; // Custom RGB values for blobs (if palette is 'custom')
}

export interface AmbientEffects {
  fogRising?: boolean;
  firefliesOrParticles?: boolean;
  auroraWaves?: boolean;
  neonGrid?: boolean;
  candleGlow?: boolean; // Warm ambient glow for minimalist themes
}

export interface SeasonalDecorations {
  candlesticks?: boolean;
  ornaments?: boolean;
  candyCaneFrame?: boolean;
  frostEdge?: boolean;
  sparkleOverlay?: boolean; // Subtle festive sparkles
  sparkleColor?: string;    // Color for sparkles (default: white, use red for light backgrounds)
  frostedGlass?: boolean;   // Full frosted window pane effect with blur and ice crystals
  ribbonBow?: boolean;      // Vertical ribbon with bow at sidebar edge
  ribbonColor?: string;     // Color for ribbon (default: white)
}

export interface ForestBackground {
  enabled: boolean;
  opacity?: number; // Default: 0.3
}

export interface DarkVeilConfig {
  enabled: boolean;
  hueShift?: number;    // Hue rotation in degrees (default: 120 for green/teal aurora)
  noise?: number;       // Noise intensity (default: 0.08)
  scan?: number;        // Scan line intensity (default: 0.15)
  scanFreq?: number;    // Scan line frequency (default: 3.0)
  warp?: number;        // Warp effect intensity (default: 0.2)
}

export interface ThemeEffects {
  darkVeil?: DarkVeilConfig;
  animatedSnowfall?: AnimatedSnowfall;
  twinklingStars?: TwinklingStars;
  treeSilhouettes?: TreeSilhouettes;
  forestBackground?: ForestBackground;
  auroraGradient?: AuroraGradient;
  ambientEffects?: AmbientEffects;
  seasonalDecorations?: SeasonalDecorations;
}

export interface Theme {
  id: string;
  name: string;
  category: 'christmas' | 'core' | 'premium' | 'free';
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
  effects?: ThemeEffects; // Premium animated visual effects
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
    noiseOverlay: true,
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
    noiseOverlay: true,
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
    glowOverlay: true,
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
    noiseOverlay: true,
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    category: 'core',
    colors: {
      '--cgpt-bg': '#000000',
      '--cgpt-surface': '#1A1A1A',
      '--cgpt-text': '#FFFFFF',
      '--cgpt-text-muted': '#CCCCCC',
      '--cgpt-border': '#FFFFFF',
      '--cgpt-accent': '#FFD700',
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
    glowOverlay: true,
  },
  // =============================================
  // PREMIUM THEMES - Animated Effects Collection
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
    isPremium: true,
    effects: {
      auroraGradient: {
        enabled: true,
        palette: 'northern',
        speed: 'slow',
        intensity: 'medium'
      }
    },
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
    isPremium: true,
    glowOverlay: true,
    effects: {
      auroraGradient: {
        enabled: true,
        palette: 'custom',
        speed: 'slow',
        intensity: 'subtle',
        customColors: ['255, 107, 74', '255, 152, 67', '255, 87, 51', '255, 171, 145', '230, 74, 25'],
      },
    },
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
    isPremium: true,
    glowOverlay: true,
    effects: {
      auroraGradient: {
        enabled: true,
        palette: 'cosmic',
        speed: 'slow',
        intensity: 'subtle',
      },
    },
  },

  // =============================================
  // PREMIUM THEMES - Christmas Collection
  // =============================================
  {
    id: 'woodland-retreat',
    name: 'Woodland Retreat',
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
    effects: {
      "forestBackground": {
        "enabled": true,
        "opacity": 0.5
      },
      "animatedSnowfall": {
        "enabled": true,
        "density": "light",
        "speed": "slow",
        "style": "gentle"
      }
    },
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
    effects: {
      "animatedSnowfall": {
        "enabled": true,
        "density": "medium",
        "speed": "slow",
        "snowColor": "#B8D4E8",
        "style": "shaking"
      },
      "seasonalDecorations": {
        "frostedGlass": true
      }
    },
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
    effects: {
      "twinklingStars": {
        "enabled": true,
        "count": "dense",
        "includeShootingStars": true,
        "starColor": "#FFFFFF",
        "animationDuration": 8
      },
      "ambientEffects": {
        "auroraWaves": true
      }
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
    effects: {
      "ambientEffects": {
        "neonGrid": true
      }
    },
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

// CSS Generators (R1-R3: Consolidated module)
export {
  BASE_OVERLAY_CSS,
  KEYFRAMES_CSS,
  Z_INDEX,
  AURORA_PALETTES,
  generatePatternCSS,
  generateNoiseOverlayCSS,
  generateGlowOverlayCSS,
  generateEffectsCSS,
} from './css/generators';

// packages/shared/src/index.ts

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ThemeId = string;

export interface ThemeColors {
    "--cgpt-bg": string;
    "--cgpt-text": string;
    "--cgpt-surface": string;
    "--cgpt-border": string;
    "--cgpt-accent": string;
}

export interface Theme {
    id: ThemeId;
    name: string;
    isPremium: boolean;
    colors: ThemeColors;
}

export interface BootstrapResponse {
    clientToken: string;
    themes: Theme[];
}

// ============================================
// BRAND CONSTANTS
// Sourced from your Brand Kit
// ============================================

export const BRAND = {
    cream: "#FAF6F0",
    chocolate: "#4B2E1E",
    peach: "#F4A988",
    teal: "#7ECEC5",
    yellow: "#F5E6B8",
    lightTeal: "#8DD4CB",
} as const;

export type BrandColor = (typeof BRAND)[keyof typeof BRAND];

// ============================================
// DEFAULT THEMES
// Available immediately without API calls
// ============================================

export const DEFAULT_THEMES: Theme[] = [
    {
        id: "system",
        name: "System Default",
        isPremium: false,
        colors: {
            "--cgpt-bg": "inherit",
            "--cgpt-text": "inherit",
            "--cgpt-surface": "inherit",
            "--cgpt-border": "inherit",
            "--cgpt-accent": "inherit",
        },
    },
    {
        id: "midnight-blue",
        name: "Midnight Blue",
        isPremium: false,
        colors: {
            "--cgpt-bg": "#0f172a",
            "--cgpt-text": "#f8fafc",
            "--cgpt-surface": "#1e293b",
            "--cgpt-border": "#334155",
            "--cgpt-accent": "#38bdf8",
        },
    },
    {
        id: "chocolate-coffee",
        name: "Chocolate Coffee",
        isPremium: false,
        colors: {
            "--cgpt-bg": "#2b1d16",
            "--cgpt-text": "#f5e6b8",
            "--cgpt-surface": BRAND.chocolate,
            "--cgpt-border": "#6d4c41",
            "--cgpt-accent": BRAND.peach,
        },
    },
];

import { describe, expect, it } from 'vitest';

import { BRAND, DEFAULT_THEMES, type Theme } from './index';

describe('BRAND colors', () => {
  it('has all required brand colors', () => {
    expect(BRAND.cream).toBe('#FAF6F0');
    expect(BRAND.chocolate).toBe('#4B2E1E');
    expect(BRAND.teal).toBe('#7ECEC5');
    expect(BRAND.peach).toBe('#F4A988');
    expect(BRAND.yellow).toBe('#FAD000');
  });

  it('has exactly 5 colors', () => {
    expect(Object.keys(BRAND)).toHaveLength(5);
  });

  it('has valid hex color format for all colors', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    Object.values(BRAND).forEach((color: string) => {
      expect(color).toMatch(hexPattern);
    });
  });
});

describe('DEFAULT_THEMES', () => {
  it('has at least one theme', () => {
    expect(DEFAULT_THEMES.length).toBeGreaterThan(0);
  });

  it('each theme has required properties', () => {
    DEFAULT_THEMES.forEach((theme) => {
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('category');
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('isPremium');
    });
  });

  it('each theme has valid category', () => {
    const validCategories = ['christmas', 'core'];
    DEFAULT_THEMES.forEach((theme) => {
      expect(validCategories).toContain(theme.category);
    });
  });

  it('each theme has all required CSS custom properties', () => {
    const requiredProperties = [
      '--cgpt-bg',
      '--cgpt-surface',
      '--cgpt-text',
      '--cgpt-text-muted',
      '--cgpt-border',
      '--cgpt-accent',
    ];

    DEFAULT_THEMES.forEach((theme) => {
      requiredProperties.forEach((prop) => {
        expect(theme.colors).toHaveProperty(prop);
      });
    });
  });

  it('all theme IDs are unique', () => {
    const ids = DEFAULT_THEMES.map((theme) => theme.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all color values are valid hex colors', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    DEFAULT_THEMES.forEach((theme) => {
      Object.values(theme.colors).forEach((color: string) => {
        expect(color).toMatch(hexPattern);
      });
    });
  });
});

describe('Theme type', () => {
  it('can be used to type a theme object', () => {
    const testTheme: Theme = {
      id: 'test-theme',
      name: 'Test Theme',
      category: 'core',
      colors: {
        '--cgpt-bg': '#000000',
        '--cgpt-surface': '#111111',
        '--cgpt-text': '#FFFFFF',
        '--cgpt-text-muted': '#CCCCCC',
        '--cgpt-border': '#333333',
        '--cgpt-accent': '#FF0000',
      },
      isPremium: false,
    };

    expect(testTheme.id).toBe('test-theme');
    expect(testTheme.category).toBe('core');
  });
});

describe('Free themes (v1.0 classic IDE themes)', () => {
  const freeThemes = DEFAULT_THEMES.filter((t) => !t.isPremium);
  const expectedFreeThemeIds = [
    'vscode-dark-plus',
    'solarized-dark',
    'dracula',
    'monokai-pro',
    'one-dark',
  ];

  it('has exactly 5 free themes', () => {
    expect(freeThemes).toHaveLength(5);
  });

  it('includes all classic IDE themes from v1.0', () => {
    const freeThemeIds = freeThemes.map((t) => t.id);
    expectedFreeThemeIds.forEach((id) => {
      expect(freeThemeIds).toContain(id);
    });
  });

  it('free themes are not marked as premium', () => {
    expectedFreeThemeIds.forEach((id) => {
      const theme = DEFAULT_THEMES.find((t) => t.id === id);
      expect(theme).toBeDefined();
      expect(theme?.isPremium).toBe(false);
    });
  });
});

describe('Premium themes', () => {
  const premiumThemes = DEFAULT_THEMES.filter((t) => t.isPremium);

  it('has premium themes available', () => {
    expect(premiumThemes.length).toBeGreaterThan(0);
  });

  it('all premium themes are marked as isPremium: true', () => {
    premiumThemes.forEach((theme) => {
      expect(theme.isPremium).toBe(true);
    });
  });

  it('christmas themes are premium', () => {
    const christmasThemes = DEFAULT_THEMES.filter((t) => t.category === 'christmas');
    christmasThemes.forEach((theme) => {
      expect(theme.isPremium).toBe(true);
    });
  });
});

describe('Frozen theme', () => {
  const frozenTheme = DEFAULT_THEMES.find((t) => t.id === 'frozen');

  it('exists in DEFAULT_THEMES', () => {
    expect(frozenTheme).toBeDefined();
  });

  it('has correct basic properties', () => {
    expect(frozenTheme?.id).toBe('frozen');
    expect(frozenTheme?.name).toBe('Frozen');
    expect(frozenTheme?.category).toBe('christmas');
    expect(frozenTheme?.isPremium).toBe(true);
  });

  it('has correct color palette', () => {
    expect(frozenTheme?.colors['--cgpt-bg']).toBe('#000428');
    expect(frozenTheme?.colors['--cgpt-surface']).toBe('#081830');
    expect(frozenTheme?.colors['--cgpt-text']).toBe('#E2E8F0');
    expect(frozenTheme?.colors['--cgpt-text-muted']).toBe('#94A3B8');
    expect(frozenTheme?.colors['--cgpt-border']).toBe('#1E3A8A');
    expect(frozenTheme?.colors['--cgpt-accent']).toBe('#4FC3F7');
  });

  it('has glowOverlay enabled', () => {
    expect(frozenTheme?.glowOverlay).toBe(true);
  });

  it('has animatedSnowfall effect configured', () => {
    expect(frozenTheme?.effects?.animatedSnowfall).toBeDefined();
    expect(frozenTheme?.effects?.animatedSnowfall?.enabled).toBe(true);
    expect(frozenTheme?.effects?.animatedSnowfall?.density).toBe('medium');
    expect(frozenTheme?.effects?.animatedSnowfall?.speed).toBe('slow');
    expect(frozenTheme?.effects?.animatedSnowfall?.style).toBe('gentle');
  });

  it('has frostEdge decoration enabled', () => {
    expect(frozenTheme?.effects?.seasonalDecorations?.frostEdge).toBe(true);
  });

  it('meets WCAG AA contrast requirements', () => {
    // Helper function to calculate luminance
    function getLuminance(hex: string): number {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;

      const rsRGB = r / 255;
      const gsRGB = g / 255;
      const bsRGB = b / 255;

      const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
      const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
      const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

      return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
    }

    // Helper function to calculate contrast ratio
    function getContrastRatio(hex1: string, hex2: string): number {
      const lum1 = getLuminance(hex1);
      const lum2 = getLuminance(hex2);
      const lighter = Math.max(lum1, lum2);
      const darker = Math.min(lum1, lum2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const colors = frozenTheme!.colors;

    // Text on background (normal text requires 4.5:1)
    const textOnBg = getContrastRatio(colors['--cgpt-text'], colors['--cgpt-bg']);
    expect(textOnBg).toBeGreaterThanOrEqual(4.5);

    // Text on surface (normal text requires 4.5:1)
    const textOnSurface = getContrastRatio(colors['--cgpt-text'], colors['--cgpt-surface']);
    expect(textOnSurface).toBeGreaterThanOrEqual(4.5);

    // Muted text on background (normal text requires 4.5:1)
    const mutedOnBg = getContrastRatio(colors['--cgpt-text-muted'], colors['--cgpt-bg']);
    expect(mutedOnBg).toBeGreaterThanOrEqual(4.5);

    // Accent on background (normal text requires 4.5:1)
    const accentOnBg = getContrastRatio(colors['--cgpt-accent'], colors['--cgpt-bg']);
    expect(accentOnBg).toBeGreaterThanOrEqual(4.5);
  });
});

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

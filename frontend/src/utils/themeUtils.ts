import { TerminalTheme, DashboardTheme, TERMINAL_THEMES, DASHBOARD_THEMES } from '@/types/terminal';

/**
 * Utility functions for theme management
 */

export const getTerminalThemeKey = (theme: TerminalTheme): keyof typeof TERMINAL_THEMES => {
  // Find theme by comparing properties instead of object reference
  const foundKey = Object.keys(TERMINAL_THEMES).find(key => {
    const t = TERMINAL_THEMES[key as keyof typeof TERMINAL_THEMES];
    return t.backgroundColor === theme.backgroundColor && 
           t.textColor === theme.textColor &&
           t.cursorColor === theme.cursorColor;
  }) as keyof typeof TERMINAL_THEMES;
  return foundKey || 'classic';
};

export const getDashboardThemeKey = (theme: DashboardTheme): keyof typeof DASHBOARD_THEMES => {
  // Find theme by comparing properties instead of object reference
  const foundKey = Object.keys(DASHBOARD_THEMES).find(key => {
    const t = DASHBOARD_THEMES[key as keyof typeof DASHBOARD_THEMES];
    return t.backgroundColor === theme.backgroundColor && 
           t.textColor === theme.textColor &&
           t.borderColor === theme.borderColor;
  }) as keyof typeof DASHBOARD_THEMES;
  return foundKey || 'classic';
};

export const capitalizeThemeName = (themeName: string): string => {
  return themeName.charAt(0).toUpperCase() + themeName.slice(1);
};

export const THEME_DESCRIPTIONS: Record<string, string> = {
  classic: 'Classic green on black terminal aesthetic',
  amber: 'Warm amber text on dark background',
  white: 'High contrast white on black',
  highContrast: 'Maximum contrast for accessibility',
} as const;
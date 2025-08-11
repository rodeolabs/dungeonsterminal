// Terminal-specific types for the D&D interface

export interface TerminalTheme {
  backgroundColor: string;
  textColor: string;
  cursorColor: string;
  fontFamily: string;
  fontSize: number;
  accentColor?: string;
  errorColor?: string;
  successColor?: string;
}

export interface TerminalOutput {
  id: string;
  text: string;
  type: OutputType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type OutputType = 
  | 'narrative' 
  | 'dialogue' 
  | 'system' 
  | 'error' 
  | 'success' 
  | 'combat' 
  | 'description'
  | 'help';

export interface TerminalCommand {
  input: string;
  timestamp: Date;
  response?: TerminalOutput[];
}

export interface TerminalHistory {
  commands: TerminalCommand[];
  currentIndex: number;
}

export interface TerminalSettings {
  theme: TerminalTheme;
  fontSize: number;
  maxHistorySize: number;
  autoScroll: boolean;
  showTimestamps: boolean;
  enableSounds: boolean;
}

export interface DashboardLayout {
  sections: DashboardSection[];
  position: 'left' | 'right' | 'bottom';
  width: number;
  collapsible: boolean;
}

export interface DashboardSection {
  id: string;
  title: string;
  type: 'character' | 'inventory' | 'spells' | 'conditions' | 'quest' | 'location';
  visible: boolean;
  order: number;
}

export interface DashboardTheme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  headerColor: string;
}

export interface DashboardUpdate {
  type: 'hitPoints' | 'spellSlots' | 'inventory' | 'conditions' | 'location';
  data: any;
  animation?: 'highlight' | 'flash' | 'fade';
}

export interface UserPreferences {
  terminal: TerminalSettings;
  dashboard: {
    layout: DashboardLayout;
    theme: DashboardTheme;
  };
  accessibility: {
    highContrast: boolean;
    screenReaderMode: boolean;
    reducedMotion: boolean;
  };
}

// Predefined themes
export const TERMINAL_THEMES = {
  classic: {
    backgroundColor: '#000000',
    textColor: '#00ff00',
    cursorColor: '#00ff00',
    fontFamily: 'Monaco, "Lucida Console", monospace',
    fontSize: 14,
    accentColor: '#00aa00',
    errorColor: '#ff4444',
    successColor: '#44ff44',
  },
  amber: {
    backgroundColor: '#1a1a0e',
    textColor: '#ffb000',
    cursorColor: '#ffb000',
    fontFamily: 'Monaco, "Lucida Console", monospace',
    fontSize: 14,
    accentColor: '#cc8800',
    errorColor: '#ff6644',
    successColor: '#88ff44',
  },
  white: {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    cursorColor: '#ffffff',
    fontFamily: 'Monaco, "Lucida Console", monospace',
    fontSize: 14,
    accentColor: '#cccccc',
    errorColor: '#ff6666',
    successColor: '#66ff66',
  },
  highContrast: {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    cursorColor: '#ffff00',
    fontFamily: 'Monaco, "Lucida Console", monospace',
    fontSize: 16,
    accentColor: '#ffff00',
    errorColor: '#ff0000',
    successColor: '#00ff00',
  },
};

export const DASHBOARD_THEMES = {
  classic: {
    backgroundColor: '#001100',
    textColor: '#00ff00',
    borderColor: '#004400',
    accentColor: '#00aa00',
    headerColor: '#003300',
  },
  amber: {
    backgroundColor: '#1a1a0e',
    textColor: '#ffb000',
    borderColor: '#443300',
    accentColor: '#cc8800',
    headerColor: '#332200',
  },
  white: {
    backgroundColor: '#111111',
    textColor: '#ffffff',
    borderColor: '#444444',
    accentColor: '#cccccc',
    headerColor: '#222222',
  },
  highContrast: {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    borderColor: '#ffffff',
    accentColor: '#ffff00',
    headerColor: '#333333',
  },
};
// Type-safe theme keys
export type TerminalThemeKey = keyof typeof TERMINAL_THEMES;
export type DashboardThemeKey = keyof typeof DASHBOARD_THEMES;

// Utility type for theme validation
export type ThemeValidation<T> = {
  isValid: boolean;
  theme?: T;
  error?: string;
};
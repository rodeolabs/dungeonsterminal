import React, { useState } from 'react';
import { TerminalTheme, DashboardTheme, TERMINAL_THEMES, DASHBOARD_THEMES } from '@/types/terminal';
import { X, Palette, Monitor, Eye } from 'lucide-react';
import './ThemeSelector.css';

interface ThemeSelectorProps {
  currentTerminalTheme: TerminalTheme;
  currentDashboardTheme: DashboardTheme;
  onThemeChange: (terminalTheme: TerminalTheme, dashboardTheme: DashboardTheme) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTerminalTheme,
  currentDashboardTheme,
  onThemeChange,
  onClose,
}) => {
  const [selectedTerminalTheme, setSelectedTerminalTheme] = useState(
    Object.keys(TERMINAL_THEMES).find(key => {
      const theme = TERMINAL_THEMES[key as keyof typeof TERMINAL_THEMES];
      return theme.backgroundColor === currentTerminalTheme.backgroundColor &&
             theme.textColor === currentTerminalTheme.textColor;
    }) || 'classic'
  );
  
  const [selectedDashboardTheme, setSelectedDashboardTheme] = useState(
    Object.keys(DASHBOARD_THEMES).find(key => {
      const theme = DASHBOARD_THEMES[key as keyof typeof DASHBOARD_THEMES];
      return theme.backgroundColor === currentDashboardTheme.backgroundColor &&
             theme.textColor === currentDashboardTheme.textColor;
    }) || 'classic'
  );

  const [previewMode, setPreviewMode] = useState(false);

  const handleApply = () => {
    onThemeChange(
      TERMINAL_THEMES[selectedTerminalTheme as keyof typeof TERMINAL_THEMES],
      DASHBOARD_THEMES[selectedDashboardTheme as keyof typeof DASHBOARD_THEMES]
    );
    onClose();
  };

  const handlePreview = () => {
    if (previewMode) {
      onThemeChange(currentTerminalTheme, currentDashboardTheme);
    } else {
      onThemeChange(
        TERMINAL_THEMES[selectedTerminalTheme as keyof typeof TERMINAL_THEMES],
        DASHBOARD_THEMES[selectedDashboardTheme as keyof typeof DASHBOARD_THEMES]
      );
    }
    setPreviewMode(!previewMode);
  };

  const themeDescriptions = {
    classic: 'Classic green on black terminal aesthetic',
    amber: 'Warm amber text on dark background',
    white: 'High contrast white on black',
    highContrast: 'Maximum contrast for accessibility',
  };

  return (
    <div className="theme-selector-overlay">
      <div className="theme-selector-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Palette className="title-icon" />
            <h2>Theme Settings</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="modal-content">
          <div className="theme-section">
            <div className="section-header">
              <Monitor className="section-icon" />
              <h3>Terminal Theme</h3>
            </div>
            
            <div className="theme-grid">
              {Object.entries(TERMINAL_THEMES).map(([key, theme]) => (
                <div
                  key={key}
                  className={`theme-option ${selectedTerminalTheme === key ? 'selected' : ''}`}
                  onClick={() => setSelectedTerminalTheme(key)}
                >
                  <div 
                    className="theme-preview terminal-preview"
                    style={{
                      backgroundColor: theme.backgroundColor,
                      color: theme.textColor,
                      fontFamily: theme.fontFamily,
                    }}
                  >
                    <div className="preview-line">
                      <span style={{ color: theme.accentColor }}>{'> '}</span>
                      I look around
                    </div>
                    <div className="preview-line">
                      You see a dimly lit chamber...
                    </div>
                    <div 
                      className="preview-cursor"
                      style={{ backgroundColor: theme.cursorColor }}
                    />
                  </div>
                  
                  <div className="theme-info">
                    <div className="theme-name">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                    <div className="theme-description">{themeDescriptions[key as keyof typeof themeDescriptions]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-section">
            <div className="section-header">
              <Eye className="section-icon" />
              <h3>Dashboard Theme</h3>
            </div>
            
            <div className="theme-grid">
              {Object.entries(DASHBOARD_THEMES).map(([key, theme]) => (
                <div
                  key={key}
                  className={`theme-option ${selectedDashboardTheme === key ? 'selected' : ''}`}
                  onClick={() => setSelectedDashboardTheme(key)}
                >
                  <div 
                    className="theme-preview dashboard-preview"
                    style={{
                      backgroundColor: theme.backgroundColor,
                      color: theme.textColor,
                      borderColor: theme.borderColor,
                    }}
                  >
                    <div 
                      className="preview-header"
                      style={{ backgroundColor: theme.headerColor }}
                    >
                      Character
                    </div>
                    <div className="preview-content">
                      <div className="preview-stat">HP: 25/30</div>
                      <div 
                        className="preview-bar"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                  </div>
                  
                  <div className="theme-info">
                    <div className="theme-name">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                    <div className="theme-description">{themeDescriptions[key as keyof typeof themeDescriptions]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="theme-section">
            <div className="section-header">
              <h3>Accessibility Options</h3>
            </div>
            
            <div className="accessibility-options">
              <label className="option-label">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTerminalTheme('highContrast');
                      setSelectedDashboardTheme('highContrast');
                    }
                  }}
                />
                High Contrast Mode
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="preview-button"
            onClick={handlePreview}
          >
            {previewMode ? 'Stop Preview' : 'Preview'}
          </button>
          
          <div className="action-buttons">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="apply-button" onClick={handleApply}>
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
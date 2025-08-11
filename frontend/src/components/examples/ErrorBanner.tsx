import React from 'react';

interface ErrorBannerProps {
  error: string | null;
  onClear: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onClear }) => {
  if (!error) return null;

  return (
    <div className="error-banner" role="alert" aria-live="polite">
      <span className="error-message">❌ {error}</span>
      <button 
        onClick={onClear} 
        className="error-dismiss"
        aria-label="Dismiss error"
      >
        Dismiss
      </button>
    </div>
  );
};
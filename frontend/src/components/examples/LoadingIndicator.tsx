import React from 'react';

interface LoadingIndicatorProps {
  loadingStates: Record<string, boolean>;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ loadingStates }) => {
  const activeOperations = Object.entries(loadingStates)
    .filter(([_, isLoading]) => isLoading)
    .map(([operation]) => operation);

  if (activeOperations.length === 0) return null;

  return (
    <div className="loading-states" role="status" aria-live="polite">
      {activeOperations.map(operation => (
        <div key={operation} className="loading-item">
          <span className="loading-spinner">🔄</span>
          <span className="loading-text">{operation}...</span>
        </div>
      ))}
    </div>
  );
};
import React from 'react';

interface ConnectionStatusProps {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  onReconnect: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  onReconnect,
}) => {
  const statusConfig = {
    connecting: { icon: '🔄', text: 'Connecting...', className: 'connecting' },
    connected: { icon: '✅', text: 'Connected', className: 'connected' },
    reconnecting: { icon: '🔄', text: 'Reconnecting...', className: 'reconnecting' },
    disconnected: { icon: '⚫', text: 'Disconnected', className: 'disconnected' },
    error: { icon: '❌', text: 'Connection Error', className: 'error' },
  } as const;

  const config = statusConfig[connectionState];
  if (!config) return null;

  return (
    <div className={`status ${config.className}`}>
      {config.icon} {config.text}
      {connectionState === 'error' && (
        <button onClick={onReconnect} className="reconnect-button">
          Reconnect
        </button>
      )}
    </div>
  );
};
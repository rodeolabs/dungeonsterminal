// Error Boundary component for React error handling

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * Provides a fallback UI and optional error reporting
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Example error reporting - replace with your preferred service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Send to error reporting service (Sentry, LogRocket, etc.)
    console.error('Error Report:', errorReport);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">⚠️</div>
            <h2 className="error-boundary__title">
              Oops! Something went wrong
            </h2>
            <p className="error-boundary__message">
              The mystical energies have been disrupted! Don't worry, your adventure data is safe.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error Details (Development Mode)</summary>
                <pre className="error-boundary__error">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="error-boundary__component-stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            
            <div className="error-boundary__actions">
              <button 
                onClick={this.handleRetry}
                className="error-boundary__button error-boundary__button--primary"
              >
                Try Again
              </button>
              <button 
                onClick={this.handleReload}
                className="error-boundary__button error-boundary__button--secondary"
              >
                Reload Page
              </button>
            </div>
            
            <p className="error-boundary__help">
              If this problem persists, try refreshing the page or contact support.
            </p>
          </div>
          
          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .error-boundary__container {
              max-width: 600px;
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              padding: 3rem;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .error-boundary__icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            
            .error-boundary__title {
              font-size: 2rem;
              font-weight: 600;
              margin-bottom: 1rem;
              color: #fff;
            }
            
            .error-boundary__message {
              font-size: 1.1rem;
              margin-bottom: 2rem;
              opacity: 0.9;
              line-height: 1.6;
            }
            
            .error-boundary__details {
              text-align: left;
              margin: 2rem 0;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              padding: 1rem;
            }
            
            .error-boundary__details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 1rem;
            }
            
            .error-boundary__error,
            .error-boundary__component-stack {
              background: rgba(0, 0, 0, 0.3);
              padding: 1rem;
              border-radius: 4px;
              font-size: 0.875rem;
              overflow-x: auto;
              white-space: pre-wrap;
              margin: 0.5rem 0;
            }
            
            .error-boundary__actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 2rem;
            }
            
            .error-boundary__button {
              padding: 0.75rem 2rem;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            
            .error-boundary__button--primary {
              background: #4f46e5;
              color: white;
            }
            
            .error-boundary__button--primary:hover {
              background: #4338ca;
              transform: translateY(-2px);
            }
            
            .error-boundary__button--secondary {
              background: rgba(255, 255, 255, 0.2);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .error-boundary__button--secondary:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-2px);
            }
            
            .error-boundary__help {
              font-size: 0.9rem;
              opacity: 0.8;
              margin: 0;
            }
            
            @media (max-width: 768px) {
              .error-boundary {
                padding: 1rem;
              }
              
              .error-boundary__container {
                padding: 2rem;
              }
              
              .error-boundary__title {
                font-size: 1.5rem;
              }
              
              .error-boundary__actions {
                flex-direction: column;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
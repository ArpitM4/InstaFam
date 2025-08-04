"use client";

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="w-full max-w-5xl mt-8 flex justify-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-400 mb-2">Something went wrong</h3>
            <p className="text-red-300 mb-4">
              We're experiencing technical difficulties. Please refresh the page and try again.
            </p>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-red-400">Error Details (Development Only)</summary>
                <pre className="mt-2 text-xs text-red-300 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

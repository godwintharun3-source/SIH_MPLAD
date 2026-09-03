import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-200 rounded-xl text-xs">
          An error occurred in this module. Check console for details.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

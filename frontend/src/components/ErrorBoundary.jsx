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
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-200 rounded-xl text-xs font-mono">
          An error occurred in this 3D module.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

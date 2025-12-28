import React from 'react';
import { trackError } from '../lib/errorTracking';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    trackError(error, { source: 'react', componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <p>Ocurrió un error en la interfaz. Intenta recargar la página.</p>
          <button onClick={() => this.setState({ hasError: false })}>Reintentar</button>
        </div>
      );
    }

    return this.props.children;
  }
}

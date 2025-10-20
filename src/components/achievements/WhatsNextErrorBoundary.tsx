import React, { Component, ReactNode } from 'react';
import { ErrorState } from '@/components/ui/error-state';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WhatsNextErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WhatsNext Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          title="Unable to Load Recommendations"
          message="Something went wrong while loading your achievement recommendations."
          type="generic"
          onRetry={this.handleRetry}
          showDetails={false}
          className="my-4"
        />
      );
    }

    return this.props.children;
  }
}

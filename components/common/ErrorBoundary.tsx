import React from 'react';
import { View } from 'react-native';

type Props = {
  onError?: () => void;
  children: React.ReactNode;
};

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // Notify parent (for navigation) if provided
    try {
      this.props.onError && this.props.onError();
    } catch (e) {
      // ignore
    }
    // Could also log to remote here
    // console.error('Uncaught render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Parent should navigate to error page. Render empty fallback.
      return <View />;
    }
    return this.props.children as any;
  }
}

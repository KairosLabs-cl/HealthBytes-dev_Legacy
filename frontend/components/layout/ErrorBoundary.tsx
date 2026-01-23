import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Log to error reporting service (Sentry/Bugsnag)
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-gray-50">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6">
            Ocurrió un error inesperado. Por favor, intenta nuevamente.
          </Text>
          {__DEV__ && this.state.error && (
            <View className="mb-4 p-4 bg-red-50 rounded-lg">
              <Text className="text-sm text-red-800 font-mono">
                {this.state.error.toString()}
              </Text>
            </View>
          )}
          <Pressable
            onPress={this.handleReset}
            className="bg-black px-6 py-3 rounded-lg active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
          >
            <Text className="text-white font-semibold">Reintentar</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (__DEV__) {
      console.error("[ErrorBoundary] Error no manejado:", error.message);
      console.error("[ErrorBoundary] Stack:", info.componentStack);
    }
    // TODO: integrar Sentry en producción
    // Sentry.captureException(error, { extra: info });
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          backgroundColor: "#ffffff",
        }}
      >
        <Text style={{ fontSize: 52, marginBottom: 16 }}>😕</Text>

        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
            color: "#000000",
          }}
        >
          Algo salió mal
        </Text>

        <Text
          style={{
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 32,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          Ocurrió un error inesperado.{"\n"}Por favor intenta de nuevo.
        </Text>

        {__DEV__ && this.state.error && (
          <View
            style={{
              backgroundColor: "#fef2f2",
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
              width: "100%",
            }}
          >
            <Text
              style={{
                color: "#dc2626",
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              {this.state.error.message}
            </Text>
          </View>
        )}

        <Pressable
          onPress={this.reset}
          style={({ pressed }) => ({
            backgroundColor: "#000000",
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
            Intentar de nuevo
          </Text>
        </Pressable>
      </View>
    );
  }
}

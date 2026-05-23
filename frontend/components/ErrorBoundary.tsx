import React from "react";
import { Pressable, Text, View } from "react-native";
import * as Sentry from "@sentry/react-native";
import { AlertTriangle } from "lucide-react-native";

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
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
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
          backgroundColor: "#fafafa",
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            backgroundColor: "#fef2f2",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={34} color="#dc2626" strokeWidth={2.2} />
        </View>

        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
            color: "#09090b",
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
            backgroundColor: "#09090b",
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

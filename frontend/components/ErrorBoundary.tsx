import React from "react";
import { Pressable, Text, View } from "react-native";
import * as Sentry from "@sentry/react-native";
import { AlertTriangle } from "lucide-react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const { palette } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: palette.colors.surface.warm,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          backgroundColor: `${palette.colors.state.error}20`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <AlertTriangle
          size={34}
          color={palette.colors.state.error}
          strokeWidth={2.2}
        />
      </View>

      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 8,
          color: palette.colors.ink.primary,
        }}
      >
        Algo salió mal
      </Text>

      <Text
        style={{
          color: palette.colors.ink.muted,
          textAlign: "center",
          marginBottom: 32,
          fontSize: 15,
          lineHeight: 22,
        }}
      >
        Ocurrió un error inesperado.{"\n"}Por favor intenta de nuevo.
      </Text>

      {__DEV__ && error && (
        <View
          style={{
            backgroundColor: `${palette.colors.state.error}20`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 24,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: palette.colors.state.error,
              fontSize: 12,
              fontFamily: "monospace",
            }}
          >
            {error.message}
          </Text>
        </View>
      )}

      <Pressable
        onPress={onReset}
        style={({ pressed }) => ({
          backgroundColor: palette.colors.ink.primary,
          paddingHorizontal: 28,
          paddingVertical: 14,
          borderRadius: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          style={{
            color: palette.colors.ink.inverse,
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          Intentar de nuevo
        </Text>
      </Pressable>
    </View>
  );
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

    return <ErrorFallback error={this.state.error} onReset={this.reset} />;
  }
}

import React from "react";
import { View, Text, Platform } from "react-native";

type StockBadgeProps = {
  stock?: number;
  variant?: "overlay" | "inline";
};

function StockBadge({ stock, variant = "inline" }: StockBadgeProps) {
  if (stock === undefined || stock === null) return null;

  if (stock === 0 && variant === "overlay") {
    return (
      <View
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          backgroundColor: "#EF4444",
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 8,
          zIndex: 10,
          ...Platform.select({
            web: { boxShadow: "0 1px 4px rgba(0,0,0,0.15)" },
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            },
            android: { elevation: 3 },
            default: {},
          }),
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: "#FFFFFF",
            fontWeight: "700",
            letterSpacing: 0.3,
          }}
        >
          Agotado
        </Text>
      </View>
    );
  }

  if (stock > 0 && stock <= 5 && variant === "inline") {
    return (
      <Text
        style={{
          fontSize: 10,
          color: "#EA580C",
          fontWeight: "600",
          marginTop: 2,
          marginBottom: 4,
        }}
      >
        {stock === 1 ? "¡Última unidad!" : `Últimas ${stock} unidades`}
      </Text>
    );
  }

  return null;
}

export default React.memo(StockBadge);

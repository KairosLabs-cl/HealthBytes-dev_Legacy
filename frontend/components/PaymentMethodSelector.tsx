import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { CreditCardIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export type PaymentMethod = "venti" | "mercado_pago";

export interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  disabled?: boolean;
  disabledLabel?: string;
}> = [
  {
    id: "venti",
    label: "Venti",
    description: "Transferencia bancaria segura",
    icon: "💳",
    disabled: true,
    disabledLabel: "Próximamente",
  },
  {
    id: "mercado_pago",
    label: "Mercado Pago",
    description: "Billetera digital de Mercado Pago",
    icon: "🏦",
  },
];

export function PaymentMethodSelector({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <VStack space="md">
      <View>
        <HStack className="items-center mb-2">
          <CreditCardIcon size={24} color="#2D2926" />
          <Text className="text-xl font-bold text-ink ml-2">
            Método de Pago
          </Text>
        </HStack>
        <Text className="text-ink-subtle text-sm">
          Selecciona cómo deseas pagar
        </Text>
      </View>

      <VStack space="md">
        {PAYMENT_METHODS.map((method) => (
          <Pressable
            key={method.id}
            onPress={() => !method.disabled && onSelect(method.id)}
            disabled={method.disabled}
            style={{ minHeight: 64 }}
            className={`p-4 rounded-2xl border ${
              method.disabled
                ? "border-border-subtle bg-surface-warm opacity-60"
                : selected === method.id
                  ? "border-brand-green bg-[#F0FDF4]"
                  : "border-border-subtle bg-surface-card shadow-soft-lift"
            }`}
            accessibilityRole="radio"
            accessibilityLabel={`${method.label}, ${method.description}${
              method.disabled ? `, ${method.disabledLabel}` : ""
            }`}
            accessibilityHint={
              method.disabled
                ? "Este método de pago todavía no está disponible"
                : "Selecciona este método de pago"
            }
            accessibilityState={{
              checked: selected === method.id,
              disabled: method.disabled,
            }}
          >
            <HStack className="items-center justify-between">
              <HStack className="flex-1 items-center">
                <Text className="text-3xl mr-3" accessibilityElementsHidden>
                  {method.icon}
                </Text>
                <View className="flex-1">
                  <HStack className="items-center">
                    <Text className="text-lg font-bold text-ink">
                      {method.label}
                    </Text>
                    {method.disabled && method.disabledLabel && (
                      <View className="ml-2 px-2 py-0.5 bg-surface-warm border border-border-subtle rounded-full">
                        <Text className="text-xs text-ink-subtle">
                          {method.disabledLabel}
                        </Text>
                      </View>
                    )}
                  </HStack>
                  <Text className="text-sm text-ink-subtle">
                    {method.description}
                  </Text>
                </View>
              </HStack>

              {/* Radio button - hidden for disabled methods */}
              {!method.disabled && (
                <View
                  className={`w-6 h-6 rounded-full border items-center justify-center ${
                    selected === method.id
                      ? "border-brand-green bg-brand-green"
                      : "border-border-subtle bg-surface-card"
                  }`}
                >
                  {selected === method.id && (
                    <Text className="text-white font-bold text-sm">✓</Text>
                  )}
                </View>
              )}
            </HStack>
          </Pressable>
        ))}
      </VStack>
    </VStack>
  );
}

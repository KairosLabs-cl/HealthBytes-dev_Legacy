import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Check, CreditCardIcon, Landmark, WalletCards } from "lucide-react-native";
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
  disabled?: boolean;
  disabledLabel?: string;
}> = [
  {
    id: "venti",
    label: "Venti",
    description: "Transferencia bancaria segura",
    disabled: true,
    disabledLabel: "Próximamente",
  },
  {
    id: "mercado_pago",
    label: "Mercado Pago",
    description: "Billetera digital de Mercado Pago",
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
          <Text className="ml-2 text-xl font-black tracking-[-0.2px] text-[#09090b]">
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
            style={{
              minHeight: 72,
              backgroundColor:
                selected === method.id ? "#f0fdf4" : "#ffffff",
              borderColor:
                selected === method.id
                  ? "#22c55e"
                  : "rgba(226,232,240,0.9)",
              opacity: method.disabled ? 0.62 : 1,
            }}
            className="rounded-[24px] border p-4"
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
              selected: selected === method.id,
              disabled: method.disabled,
            }}
          >
            <HStack className="items-center justify-between">
              <HStack className="flex-1 items-center">
                <View
                  className={`mr-3 h-11 w-11 items-center justify-center rounded-2xl ${
                    selected === method.id ? "bg-white" : "bg-slate-100"
                  }`}
                >
                  {method.id === "venti" ? (
                    <Landmark size={20} color="#09090b" strokeWidth={2.3} />
                  ) : (
                    <WalletCards size={20} color="#09090b" strokeWidth={2.3} />
                  )}
                </View>
                <View className="flex-1">
                  <HStack className="items-center">
                    <Text className="text-lg font-black text-[#09090b]">
                      {method.label}
                    </Text>
                    {method.disabled && method.disabledLabel && (
                      <View className="ml-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-0.5">
                        <Text className="text-xs font-semibold text-zinc-500">
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
                  className={`h-7 w-7 items-center justify-center rounded-xl border ${
                    selected === method.id
                      ? "border-[#22c55e] bg-[#22c55e]"
                      : "border-border-subtle bg-surface-card"
                  }`}
                >
                  {selected === method.id && (
                    <Check size={16} color="#ffffff" strokeWidth={2.8} />
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

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
          <CreditCardIcon size={24} color="#000" />
          <Text className="text-xl font-bold text-black ml-2">
            Método de Pago
          </Text>
        </HStack>
        <Text className="text-gray-500 text-sm">
          Selecciona cómo deseas pagar
        </Text>
      </View>

      <VStack space="md">
        {PAYMENT_METHODS.map((method) => (
          <Pressable
            key={method.id}
            onPress={() => !method.disabled && onSelect(method.id)}
            className={`p-4 rounded-2xl border-2 ${
              method.disabled
                ? "border-gray-100 bg-gray-50 opacity-60"
                : selected === method.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white"
            }`}
          >
            <HStack className="items-center justify-between">
              <HStack className="flex-1 items-center">
                <Text className="text-3xl mr-3">{method.icon}</Text>
                <View className="flex-1">
                  <HStack className="items-center">
                    <Text className="text-lg font-bold text-black">
                      {method.label}
                    </Text>
                    {method.disabled && method.disabledLabel && (
                      <View className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full">
                        <Text className="text-xs text-gray-500">
                          {method.disabledLabel}
                        </Text>
                      </View>
                    )}
                  </HStack>
                  <Text className="text-sm text-gray-500">
                    {method.description}
                  </Text>
                </View>
              </HStack>

              {/* Radio button - hidden for disabled methods */}
              {!method.disabled && (
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selected === method.id
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
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

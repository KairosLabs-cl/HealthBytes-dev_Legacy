import { Modal, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { useState } from "react";

const DIETARY_OPTIONS = [
  { slug: "sin-gluten", label: "Sin Gluten", emoji: "🌾", description: "Apto para celíacos" },
  { slug: "vegano", label: "Vegano", emoji: "🌱", description: "Sin productos de origen animal" },
  { slug: "sin-lactosa", label: "Sin Lactosa", emoji: "🥛", description: "Apto para intolerantes" },
  { slug: "bajo-en-azucar", label: "Bajo en azúcar", emoji: "🍬", description: "Reducido en azúcares" },
  { slug: "alto-en-proteina", label: "Alto en proteína", emoji: "💪", description: "Ideal para deportistas" },
  { slug: "para-diabeticos", label: "Para diabéticos", emoji: "🩺", description: "Bajo índice glucémico" },
] as const;

interface OnboardingModalProps {
  visible: boolean;
  onComplete: (tags: string[]) => void;
  onSkip: () => void;
}

export default function OnboardingModal({ visible, onComplete, onSkip }: OnboardingModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleContinue = () => {
    onComplete(selected);
    setSelected([]);
  };

  const handleSkip = () => {
    setSelected([]);
    onSkip();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white px-6 pt-8 pb-10">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl mb-2">🥗</Text>
          <Text className="text-2xl font-bold text-black text-center">
            Tus preferencias dietarias
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-2 leading-5">
            Selecciona tus restricciones para que te mostremos solo productos aptos para ti.
          </Text>
        </View>

        {/* Tag grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <View className="flex-row flex-wrap gap-3">
            {DIETARY_OPTIONS.map(({ slug, label, emoji, description }) => {
              const isActive = selected.includes(slug);
              return (
                <Pressable
                  key={slug}
                  onPress={() => toggle(slug)}
                  style={{ minHeight: 44, width: "47%" }}
                  className={`rounded-2xl border-2 p-3 ${
                    isActive
                      ? "bg-green-50 border-green-500"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text className="text-2xl mb-1">{emoji}</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      isActive ? "text-green-700" : "text-gray-800"
                    }`}
                  >
                    {label}
                  </Text>
                  <Text
                    className={`text-xs mt-0.5 ${
                      isActive ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Actions */}
        <View className="gap-3 mt-4">
          <Button
            onPress={handleContinue}
            className="bg-black rounded-full min-h-[52px]"
            disabled={selected.length === 0}
          >
            <ButtonText className="text-white font-semibold text-base">
              Continuar{selected.length > 0 ? ` (${selected.length})` : ""}
            </ButtonText>
          </Button>

          <Pressable
            onPress={handleSkip}
            className="items-center py-3"
            style={{ minHeight: 44 }}
          >
            <Text className="text-gray-500 text-sm font-medium">
              Saltar por ahora
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

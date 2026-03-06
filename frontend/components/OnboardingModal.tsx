import { Modal, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { useState } from "react";
import { updateDietaryPreferences } from "@/api/preferences";
import { useAuth } from "@clerk/clerk-expo";

const DIETARY_OPTIONS = [
  { slug: "sin-gluten", label: "Sin Gluten", emoji: "🌾", description: "Apto para celíacos", testID: "tag-celiac" },
  { slug: "para-diabeticos", label: "Para diabéticos", emoji: "🩺", description: "Bajo índice glucémico", testID: "tag-diabetic" },
  { slug: "vegano", label: "Vegano", emoji: "🌱", description: "Sin productos de origen animal", testID: "tag-vegan" },
  { slug: "sin-lactosa", label: "Sin Lactosa", emoji: "🥛", description: "Apto para intolerantes" },
  { slug: "bajo-en-azucar", label: "Bajo en azúcar", emoji: "🍬", description: "Reducido en azúcares" },
  { slug: "alto-en-proteina", label: "Alto en proteína", emoji: "💪", description: "Ideal para deportistas" },
  { slug: "sin-nueces", label: "Sin Nueces", emoji: "🥜", description: "Libre de frutos secos" },
  { slug: "sin-mariscos", label: "Sin Mariscos", emoji: "🦐", description: "Sin mariscos ni crustáceos" },
] as const;

const TOTAL_STEPS = 3;

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const { getToken } = useAuth();

  if (!visible) return null;

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    if (selected.length > 0) {
      const token = await getToken();
      if (token) {
        updateDietaryPreferences(selected, token).catch(() => {
          // fire-and-forget: failure is non-critical
        });
      }
    }
    setStep(0);
    setSelected([]);
    onComplete();
  };

  const handleSkip = () => {
    setStep(0);
    setSelected([]);
    onComplete();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white px-6 pt-8 pb-10">
        {/* Progress indicator */}
        <View className="flex-row gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              className={`flex-1 h-1 rounded-full ${
                i <= step ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          ))}
        </View>

        {step === 0 && <StepWelcome />}
        {step === 1 && <StepPreferences selected={selected} toggle={toggle} />}
        {step === 2 && <StepConfirmation selectedCount={selected.length} />}

        {/* Actions */}
        <View className="gap-3 mt-4">
          {step === 0 && (
            <Button
              onPress={handleNext}
              className="bg-black rounded-full min-h-[52px]"
            >
              <ButtonText className="text-white font-semibold text-base">
                Comenzar
              </ButtonText>
            </Button>
          )}

          {step === 1 && (
            <Button
              onPress={handleNext}
              className="bg-black rounded-full min-h-[52px]"
            >
              <ButtonText className="text-white font-semibold text-base">
                Continuar{selected.length > 0 ? ` (${selected.length})` : ""}
              </ButtonText>
            </Button>
          )}

          {step === 2 && (
            <Button
              testID="submit-btn"
              onPress={handleFinish}
              className="bg-black rounded-full min-h-[52px]"
            >
              <ButtonText className="text-white font-semibold text-base">
                Explorar productos
              </ButtonText>
            </Button>
          )}

          <Pressable
            testID="skip-btn"
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

/* ---------- Step 1: Welcome ---------- */

function StepWelcome() {
  return (
    <View className="flex-1 justify-center items-center px-4">
      <Text className="text-5xl mb-4">🥗</Text>
      <Text className="text-3xl font-bold text-black text-center mb-3">
        Bienvenido a HealthBytes
      </Text>
      <Text className="text-base text-gray-500 text-center leading-6 px-2">
        Encontra productos saludables adaptados a tus necesidades alimentarias.
        Filtramos por vos para que compres con tranquilidad.
      </Text>
    </View>
  );
}

/* ---------- Step 2: Dietary preferences ---------- */

interface StepPreferencesProps {
  selected: string[];
  toggle: (slug: string) => void;
}

function StepPreferences({ selected, toggle }: StepPreferencesProps) {
  return (
    <View className="flex-1">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-black text-center">
          Tus restricciones dietarias
        </Text>
        <Text className="text-gray-500 text-sm text-center mt-2 leading-5">
          Selecciona tus restricciones para que te mostremos solo productos aptos para ti.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <View className="flex-row flex-wrap gap-3">
          {DIETARY_OPTIONS.map(({ slug, label, emoji, description, ...rest }) => {
            const isActive = selected.includes(slug);
            const testID = (rest as any).testID as string | undefined;
            return (
              <Pressable
                key={slug}
                testID={testID}
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
    </View>
  );
}

/* ---------- Step 3: Confirmation ---------- */

interface StepConfirmationProps {
  selectedCount: number;
}

function StepConfirmation({ selectedCount }: StepConfirmationProps) {
  return (
    <View className="flex-1 justify-center items-center px-4">
      <Text className="text-5xl mb-4">🎉</Text>
      <Text className="text-3xl font-bold text-black text-center mb-3">
        Listo!
      </Text>
      <Text className="text-base text-gray-500 text-center leading-6 px-2">
        {selectedCount > 0
          ? `Personalizamos tu experiencia con ${selectedCount} ${
              selectedCount === 1 ? "restriccion" : "restricciones"
            }. Te mostraremos productos aptos para vos.`
          : "Podés configurar tus restricciones en cualquier momento desde tu perfil."}
      </Text>
    </View>
  );
}

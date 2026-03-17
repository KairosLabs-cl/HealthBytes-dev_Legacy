import { Modal, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useState, useCallback } from "react";
import { updateDietaryPreferences } from "@/api/preferences";
import { useAuth } from "@clerk/clerk-expo";
import { DietaryTag, useProductFilters } from "@/store/productFiltersStore";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

const DIETARY_OPTIONS = [
  {
    slug: "sin-gluten",
    label: "Sin Gluten",
    emoji: "🌾",
    description: "Apto para celíacos",
    testID: "tag-celiac",
  },
  {
    slug: "para-diabeticos",
    label: "Para diabéticos",
    emoji: "🩺",
    description: "Bajo índice glucémico",
    testID: "tag-diabetic",
  },
  {
    slug: "vegano",
    label: "Vegano",
    emoji: "🌱",
    description: "Sin productos de origen animal",
    testID: "tag-vegan",
  },
  {
    slug: "sin-lactosa",
    label: "Sin Lactosa",
    emoji: "🥛",
    description: "Apto para intolerantes",
  },
  {
    slug: "bajo-en-azucar",
    label: "Bajo en azúcar",
    emoji: "🍬",
    description: "Reducido en azúcares",
  },
  {
    slug: "alto-en-proteina",
    label: "Alto en proteína",
    emoji: "💪",
    description: "Ideal para deportistas",
  },
] as const;

const TOTAL_STEPS = 3;

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({
  visible,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const { getToken } = useAuth();
  const setDietaryTags = useProductFilters((state) => state.setDietaryTags);

  const toggle = useCallback((slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  if (!visible) return null;

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    if (selected.length > 0) {
      // Sincronizar con el store local para aplicar filtros en el Home instantáneamente
      setDietaryTags(selected as DietaryTag[]);

      // Sincronizar en background con Backend, fire and forget
      const token = await getToken();
      if (token) {
        updateDietaryPreferences(selected, token).catch(() => {});
      }
    }

    // Smooth reset and close
    setTimeout(() => {
      setStep(0);
      setSelected([]);
    }, 400); // Wait for modal animation to close

    onComplete();
  };

  const handleSkip = () => {
    setTimeout(() => {
      setStep(0);
      setSelected([]);
    }, 400);
    onComplete();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-[#FCFAF8]">
        {/* Progress indicator */}
        <View className="px-6 pt-12 pb-4 flex-row gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              className={`flex-1 h-1.5 rounded-full ${
                i <= step ? "bg-[#2E5C3A]" : "bg-[#EAE5E0]"
              }`}
            />
          ))}
        </View>

        <View className="flex-1 px-6">
          {step === 0 && <StepWelcome key="step0" onNext={handleNext} />}
          {step === 1 && <StepPreferences key="step1" selected={selected} toggle={toggle} onNext={handleNext} />}
          {step === 2 && <StepConfirmation key="step2" selectedCount={selected.length} onFinish={handleFinish} />}
        </View>

        {/* Skip button at the very bottom, globally available across steps if needed, but mainly for step 0 and 1 */}
        {step < 2 && (
          <Pressable
            testID="skip-btn"
            onPress={handleSkip}
            className="items-center pb-12 pt-4"
            style={{ minHeight: 48 }}
          >
            <Text className="text-gray-500 text-sm font-medium">
              Saltar por ahora
            </Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

/* ---------- Reusable Button ---------- */

function PrimaryButton({ onPress, label, testID }: { onPress: () => void; label: string; testID?: string }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.96); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <Pressable
      testID={testID}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className="mt-6"
    >
      <Animated.View
        style={[animatedStyle, { minHeight: 60 }]}
        className="bg-[#2D2926] rounded-full items-center justify-center w-full shadow-sm"
      >
        <Text className="text-white font-bold text-lg">
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}


/* ---------- Step 1: Welcome ---------- */

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1 justify-center items-center"
    >
      <View className="items-center mb-8">
        <Text className="text-[80px] mb-6">🥗</Text>
        <Text className="text-4xl font-extrabold text-[#2D2926] text-center mb-4 leading-tight">
          Bienvenido a HealthBytes
        </Text>
        <Text className="text-lg text-[#2D2926] opacity-70 text-center leading-relaxed px-2">
          Encontra productos saludables adaptados a tus necesidades alimentarias. Filtramos por vos para que compres con tranquilidad.
        </Text>
      </View>

      <View className="w-full mt-8">
        <PrimaryButton onPress={onNext} label="Comenzar" />
      </View>
    </Animated.View>
  );
}

/* ---------- Step 2: Dietary preferences ---------- */

interface StepPreferencesProps {
  selected: string[];
  toggle: (slug: string) => void;
  onNext: () => void;
}

function DietaryTagCard({
  item,
  isActive,
  onPress
}: {
  item: typeof DIETARY_OPTIONS[number],
  isActive: boolean,
  onPress: () => void
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.92); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <Pressable
      testID={(item as any).testID}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{ width: "47%", minHeight: 120, marginBottom: 12 }}
    >
      <Animated.View
        style={[animatedStyle, { flex: 1, elevation: isActive ? 2 : 0 }]}
        className={`rounded-3xl border-[2px] p-4 justify-between transition-colors duration-200 ${
          isActive
            ? "bg-[#FFFFFF] border-[#2E5C3A]"
            : "bg-transparent border-[#EAE5E0]"
        }`}
      >
        <View className="items-start">
          <Text className="text-4xl mb-3">{item.emoji}</Text>
        </View>
        <View>
          <Text className={`text-base font-bold ${isActive ? "text-[#2D2926]" : "text-[#2D2926] opacity-80"}`}>
            {item.label}
          </Text>
          <Text className={`text-xs mt-1 ${isActive ? "text-[#2E5C3A] font-medium" : "text-[#2D2926] opacity-50"}`}>
            {item.description}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}


function StepPreferences({ selected, toggle, onNext }: StepPreferencesProps) {
  return (
    <Animated.View
      entering={SlideInRight.duration(400)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1"
    >
      <View className="my-6">
        <Text className="text-3xl font-extrabold text-[#2D2926] text-center mb-2">
          ¿Qué tipo de dieta sigues?
        </Text>
        <Text className="text-[#2D2926] opacity-70 text-base text-center leading-relaxed px-4">
          Selecciona tus restricciones para personalizar tu tienda.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-row flex-wrap justify-between">
          {DIETARY_OPTIONS.map((item) => (
            <DietaryTagCard
              key={item.slug}
              item={item}
              isActive={selected.includes(item.slug)}
              onPress={() => toggle(item.slug)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="w-full pb-4 pt-2">
        <PrimaryButton
          onPress={onNext}
          label={selected.length > 0 ? `Continuar (${selected.length})` : "Continuar"}
        />
      </View>
    </Animated.View>
  );
}

/* ---------- Step 3: Confirmation ---------- */

interface StepConfirmationProps {
  selectedCount: number;
  onFinish: () => void;
}

function StepConfirmation({ selectedCount, onFinish }: StepConfirmationProps) {
  return (
    <Animated.View
      entering={SlideInRight.duration(400)}
      exiting={FadeOut.duration(300)}
      className="flex-1 justify-center items-center pb-12"
    >
      <View className="items-center mb-8">
        <Text className="text-[80px] mb-6">🎉</Text>
        <Text className="text-4xl font-extrabold text-[#2D2926] text-center mb-4 px-2">
          ¡Todo listo!
        </Text>
        <Text className="text-lg text-[#2D2926] opacity-70 text-center leading-relaxed px-6">
          {selectedCount > 0
            ? `Personalizamos tu experiencia con ${selectedCount} ${
                selectedCount === 1 ? "restriccion" : "restricciones"
              }. Te mostraremos productos aptos garantizados.`
            : "Podés configurar tus restricciones en cualquier momento desde tu perfil."}
        </Text>
      </View>

      <View className="w-full mt-4">
        <PrimaryButton testID="submit-btn" onPress={onFinish} label="Explorar catálogo" />
      </View>
    </Animated.View>
  );
}

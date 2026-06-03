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
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Check, CheckCircle2, Salad } from "lucide-react-native";
import { DIETARY_OPTIONS } from "@/lib/dietaryOptions";
import { useAppTheme } from "@/hooks/useAppTheme";

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
  const reducedMotion = useReducedMotion();
  const { palette } = useAppTheme();

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
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        {/* Progress indicator */}
        <View className="px-6 pt-12 pb-4 flex-row gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              className="flex-1 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  i <= step
                    ? palette.colors.brand.green
                    : palette.colors.border.subtle,
              }}
            />
          ))}
        </View>

        <View className="flex-1 px-6">
          {step === 0 && (
            <StepWelcome key="step0" reducedMotion={reducedMotion} />
          )}
          {step === 1 && (
            <StepPreferences
              key="step1"
              selected={selected}
              toggle={toggle}
              reducedMotion={reducedMotion}
            />
          )}
          {step === 2 && (
            <StepConfirmation
              key="step2"
              selectedCount={selected.length}
              reducedMotion={reducedMotion}
            />
          )}
        </View>

        {/* Fixed Bottom Actions */}
        <View
          className="px-6 pb-12 pt-4"
          style={{ backgroundColor: palette.colors.surface.warm }}
        >
          <PrimaryButton
            testID={step === 2 ? "submit-btn" : undefined}
            onPress={step === 2 ? handleFinish : handleNext}
            label={
              step === 0
                ? "Comenzar"
                : step === 1
                  ? selected.length > 0
                    ? `Continuar (${selected.length})`
                    : "Continuar"
                  : "Explorar catálogo"
            }
          />

          {step < 2 && (
            <Pressable
              testID="skip-btn"
              onPress={handleSkip}
              className="items-center mt-4"
              style={{ minHeight: 48, justifyContent: "center" }}
              accessibilityLabel="Omitir tutorial"
              accessibilityRole="button"
            >
              <Text
                className="text-sm font-medium"
                style={{ color: palette.colors.ink.subtle }}
              >
                Saltar por ahora
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Reusable Button ---------- */

function PrimaryButton({
  onPress,
  label,
  testID,
}: {
  onPress: () => void;
  label: string;
  testID?: string;
}) {
  const scale = useSharedValue(1);
  const { palette } = useAppTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      testID={testID}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{ width: "100%", marginTop: 8 }}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            minHeight: 60,
            width: "100%",
            backgroundColor: palette.colors.accent.primary,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text
          className="font-bold text-lg"
          style={{ color: palette.colors.ink.inverse }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/* ---------- Step 1: Welcome ---------- */

interface StepProps {
  reducedMotion: boolean;
}

function StepWelcome({ reducedMotion }: StepProps) {
  const { palette } = useAppTheme();

  return (
    <Animated.View
      entering={reducedMotion ? FadeIn.duration(0) : FadeIn.duration(400)}
      exiting={
        reducedMotion ? SlideOutLeft.duration(0) : SlideOutLeft.duration(300)
      }
      className="flex-1 justify-center items-center pb-8"
    >
      <View className="items-center mb-4">
        <View
          className="mb-6 h-20 w-20 items-center justify-center rounded-[28px]"
          style={{ backgroundColor: palette.colors.accent.light }}
        >
          <Salad
            size={42}
            color={palette.colors.icon.accent}
            strokeWidth={2.2}
          />
        </View>
        <Text
          className="text-4xl font-extrabold text-center mb-4 leading-tight"
          style={{ color: palette.colors.ink.primary }}
        >
          Bienvenido a HealthBytes
        </Text>
        <Text
          className="text-lg text-center leading-relaxed px-2"
          style={{ color: palette.colors.ink.muted }}
        >
          Encontra productos saludables adaptados a tus necesidades
          alimentarias. Filtramos por vos para que compres con tranquilidad.
        </Text>
      </View>
    </Animated.View>
  );
}

/* ---------- Step 2: Dietary preferences ---------- */

interface StepPreferencesProps {
  selected: string[];
  toggle: (slug: string) => void;
  reducedMotion: boolean;
}

function DietaryTagCard({
  item,
  isActive,
  onPress,
}: {
  item: (typeof DIETARY_OPTIONS)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  const DietaryIcon = item.icon;
  const scale = useSharedValue(1);
  const { palette } = useAppTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      testID={"testID" in item ? item.testID : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{ width: "47%", minHeight: 120, marginBottom: 12 }}
      accessibilityLabel={isActive ? `${item.label} seleccionado` : item.label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isActive }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            flex: 1,
            elevation: isActive ? 2 : 0,
            borderRadius: 24,
            borderWidth: 2,
            padding: 16,
            justifyContent: "space-between",
            backgroundColor: isActive
              ? palette.colors.surface.card
              : "transparent",
            borderColor: isActive
              ? palette.colors.accent.primary
              : palette.colors.border.subtle,
          },
        ]}
      >
        <View style={{ alignItems: "flex-start" }}>
          <View
            style={{
              width: 36,
              height: 36,
              marginBottom: 12,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive
                ? palette.colors.brand.green
                : palette.colors.surface.muted,
            }}
          >
            {isActive ? (
              <Check
                size={18}
                color={palette.colors.ink.inverse}
                strokeWidth={2.8}
              />
            ) : (
              <DietaryIcon
                size={18}
                color={palette.colors.icon.primary}
                strokeWidth={2.2}
              />
            )}
          </View>
        </View>
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: palette.colors.ink.primary,
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              fontSize: 12,
              marginTop: 4,
              fontWeight: isActive ? "500" : "normal",
              color: isActive
                ? palette.colors.accent.primary
                : palette.colors.ink.muted,
            }}
          >
            {item.description}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function StepPreferences({
  selected,
  toggle,
  reducedMotion,
}: StepPreferencesProps) {
  const { palette } = useAppTheme();

  return (
    <Animated.View
      entering={
        reducedMotion ? SlideInRight.duration(0) : SlideInRight.duration(400)
      }
      exiting={
        reducedMotion ? SlideOutLeft.duration(0) : SlideOutLeft.duration(300)
      }
      className="flex-1 pt-4"
    >
      <View className="my-6">
        <Text
          className="text-3xl font-extrabold text-center mb-2"
          style={{ color: palette.colors.ink.primary }}
        >
          ¿Qué tipo de dieta sigues?
        </Text>
        <Text
          className="text-base text-center leading-relaxed px-4"
          style={{ color: palette.colors.ink.muted }}
        >
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
    </Animated.View>
  );
}

/* ---------- Step 3: Confirmation ---------- */

interface StepConfirmationProps {
  selectedCount: number;
  reducedMotion: boolean;
}

function StepConfirmation({
  selectedCount,
  reducedMotion,
}: StepConfirmationProps) {
  const { palette } = useAppTheme();

  return (
    <Animated.View
      entering={
        reducedMotion ? SlideInRight.duration(0) : SlideInRight.duration(400)
      }
      exiting={reducedMotion ? FadeOut.duration(0) : FadeOut.duration(300)}
      className="flex-1 justify-center items-center pb-12"
    >
      <View className="items-center mb-8">
        <View
          className="mb-6 h-20 w-20 items-center justify-center rounded-[28px]"
          style={{ backgroundColor: palette.colors.accent.light }}
        >
          <CheckCircle2
            size={42}
            color={palette.colors.icon.accent}
            strokeWidth={2.2}
          />
        </View>
        <Text
          className="text-4xl font-extrabold text-center mb-4 px-2"
          style={{ color: palette.colors.ink.primary }}
        >
          ¡Todo listo!
        </Text>
        <Text
          className="text-lg text-center leading-relaxed px-6"
          style={{ color: palette.colors.ink.muted }}
        >
          {selectedCount > 0
            ? `Personalizamos tu experiencia con ${selectedCount} ${
                selectedCount === 1 ? "restriccion" : "restricciones"
              }. Te mostraremos coincidencias basadas en tus preferencias; revisá siempre la etiqueta del producto.`
            : "Podés configurar tus restricciones en cualquier momento desde tu perfil."}
        </Text>
      </View>
    </Animated.View>
  );
}

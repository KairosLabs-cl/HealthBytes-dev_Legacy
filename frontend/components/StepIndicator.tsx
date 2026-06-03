import { HStack } from "@/components/ui/hstack";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Check } from "lucide-react-native";
import { Text, View } from "react-native";

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  steps,
}: StepIndicatorProps) {
  const { palette } = useAppTheme();

  return (
    <View className="mb-8">
      <HStack space="md" className="items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <View key={step} className="flex-1 items-center">
              {/* Circle */}
              <View
                className="mb-2 h-10 w-10 items-center justify-center rounded-2xl border"
                style={{
                  backgroundColor: isCompleted
                    ? palette.colors.state.success
                    : isActive
                      ? palette.colors.ink.primary
                      : palette.colors.surface.card,
                  borderColor:
                    isCompleted || isActive
                      ? "transparent"
                      : palette.colors.border.subtle,
                }}
              >
                {isCompleted ? (
                  <Check
                    size={16}
                    color={palette.colors.ink.inverse}
                    strokeWidth={2.8}
                  />
                ) : (
                  <Text
                    className={`text-sm font-bold ${
                      isActive ? "text-ink-inverse" : "text-ink-subtle"
                    }`}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>

              {/* Label */}
              <Text
                className={`text-xs font-semibold text-center ${
                  isActive ? "text-ink" : "text-ink-subtle"
                }`}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </HStack>

      {/* Progress Bar */}
      <View className="mt-4 h-1 overflow-hidden rounded-full bg-border-subtle">
        <View
          className="h-full rounded-full bg-ink"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </View>
    </View>
  );
}

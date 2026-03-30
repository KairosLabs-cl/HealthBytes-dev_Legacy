import { HStack } from "@/components/ui/hstack";
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
                className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${
                  isCompleted
                    ? "bg-brand-green"
                    : isActive
                      ? "bg-blue-600"
                      : "bg-border-subtle"
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    isCompleted || isActive ? "text-white" : "text-ink-muted"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </Text>
              </View>

              {/* Label */}
              <Text
                className={`text-xs font-semibold text-center ${
                  isActive ? "text-blue-600" : "text-ink-subtle"
                }`}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </HStack>

      {/* Progress Bar */}
      <View className="h-1 bg-border-subtle rounded-full mt-4 overflow-hidden">
        <View
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </View>
    </View>
  );
}

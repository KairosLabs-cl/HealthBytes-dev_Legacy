import { HStack } from "@/components/ui/hstack";
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
                    ? "#22c55e"
                    : isActive
                      ? "#09090b"
                      : "#ffffff",
                  borderColor:
                    isCompleted || isActive
                      ? "transparent"
                      : "rgba(226,232,240,0.9)",
                }}
              >
                {isCompleted ? (
                  <Check size={16} color="#ffffff" strokeWidth={2.8} />
                ) : (
                  <Text
                    className={`text-sm font-bold ${
                      isActive ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>

              {/* Label */}
              <Text
                className={`text-xs font-semibold text-center ${
                  isActive ? "text-[#09090b]" : "text-zinc-500"
                }`}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </HStack>

      {/* Progress Bar */}
      <View className="mt-4 h-1 overflow-hidden rounded-full bg-slate-200">
        <View
          className="h-full rounded-full bg-[#09090b]"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </View>
    </View>
  );
}

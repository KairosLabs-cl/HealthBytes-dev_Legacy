import { useReducedMotion as useReanimatedReducedMotion } from "react-native-reanimated";

export function useReducedMotion(): boolean {
  const reducedMotion = useReanimatedReducedMotion();
  return reducedMotion;
}

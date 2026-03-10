import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import OnboardingModal from "../OnboardingModal";

// Mock Clerk auth
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue("test-token"),
  })),
}));

// Mock the preferences API
jest.mock("@/api/preferences", () => ({
  updateDietaryPreferences: jest.fn().mockResolvedValue(undefined),
}));

// Mock UI components
jest.mock("@/components/ui/text", () => {
  const mockReact = require("react");
  const { Text } = require("react-native");
  return {
    Text: (props: any) => mockReact.createElement(Text, props, props.children),
  };
});

jest.mock("@/components/ui/button", () => {
  const mockReact = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    Button: ({ children, onPress, testID, ...rest }: any) =>
      mockReact.createElement(
        Pressable,
        { onPress, testID, ...rest },
        children
      ),
    ButtonText: ({ children, ...rest }: any) =>
      mockReact.createElement(Text, rest, children),
  };
});

describe("OnboardingModal", () => {
  const onComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when visible is false", () => {
    const { toJSON } = render(
      <OnboardingModal visible={false} onComplete={onComplete} />
    );
    expect(toJSON()).toBeNull();
  });

  it("renders the welcome step when visible is true", () => {
    render(<OnboardingModal visible={true} onComplete={onComplete} />);
    expect(screen.getByText("Bienvenido a HealthBytes")).toBeTruthy();
  });

  it("calls onComplete when skip button is pressed", () => {
    render(<OnboardingModal visible={true} onComplete={onComplete} />);
    fireEvent.press(screen.getByTestId("skip-btn"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("shows dietary tag testIDs on step 2 and submit-btn on step 3", async () => {
    render(<OnboardingModal visible={true} onComplete={onComplete} />);

    // Step 0 -> Step 1 (preferences)
    fireEvent.press(screen.getByText("Comenzar"));

    expect(screen.getByTestId("tag-celiac")).toBeTruthy();
    expect(screen.getByTestId("tag-diabetic")).toBeTruthy();
    expect(screen.getByTestId("tag-vegan")).toBeTruthy();

    // Step 1 -> Step 2 (confirmation)
    fireEvent.press(screen.getByText("Continuar"));

    expect(screen.getByTestId("submit-btn")).toBeTruthy();

    // Press submit and expect onComplete to be called
    await act(async () => {
      fireEvent.press(screen.getByTestId("submit-btn"));
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

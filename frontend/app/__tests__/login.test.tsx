import React from "react";
import { render, screen } from "@testing-library/react-native";
import LoginScreen from "../(auth)/login";

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "myapp://login"),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/components/ui/text", () => {
  const mockReact = require("react");
  const { Text } = require("react-native");
  return {
    Text: (props: any) => mockReact.createElement(Text, props, props.children),
  };
});

describe("LoginScreen", () => {
  it("identifies Clerk as the authentication provider", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Autenticación protegida por Clerk")).toBeTruthy();
  });
});

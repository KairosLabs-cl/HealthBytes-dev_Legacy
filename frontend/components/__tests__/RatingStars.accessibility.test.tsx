import React from "react";
import { render, screen } from "@testing-library/react-native";
import { RatingStars } from "../RatingStars";

describe("RatingStars accessibility", () => {
  it("announces one concise label for non-interactive ratings", () => {
    render(<RatingStars rating={4.5} showFraction />);

    const rating = screen.getByLabelText("Calificación 4.5 de 5 estrellas");
    expect(rating.props.accessible).toBe(true);
  });

  it("keeps interactive stars individually operable", () => {
    render(<RatingStars rating={0} interactive onChange={jest.fn()} />);

    const firstStar = screen.getByLabelText("1 de 5 estrellas");
    expect(firstStar.props.accessibilityRole).toBe("button");
  });
});

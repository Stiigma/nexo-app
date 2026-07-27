// Created by: OpenCode (AI-assisted), 2026-07-26

import { describe, expect, it } from "vitest";
import { lightboxKeyAction, swipeDirection } from "./photo-lightbox-navigation";

describe("photo lightbox navigation", () => {
  it("maps only supported keyboard commands", () => {
    expect(lightboxKeyAction("Escape")).toBe("close");
    expect(lightboxKeyAction("ArrowLeft")).toBe("prev");
    expect(lightboxKeyAction("ArrowRight")).toBe("next");
    expect(lightboxKeyAction("Enter")).toBeNull();
  });

  it("requires a horizontal swipe of at least fifty pixels", () => {
    expect(swipeDirection(49, 0)).toBeNull();
    expect(swipeDirection(80, 90)).toBeNull();
    expect(swipeDirection(50, 10)).toBe("prev");
    expect(swipeDirection(-70, 10)).toBe("next");
  });
});

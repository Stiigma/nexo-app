// Created by: OpenCode (AI-assisted), 2026-07-26

export type LightboxKeyAction = "close" | "prev" | "next" | null;

export function lightboxKeyAction(key: string): LightboxKeyAction {
  if (key === "Escape") return "close";
  if (key === "ArrowLeft") return "prev";
  if (key === "ArrowRight") return "next";
  return null;
}

export function swipeDirection(
  deltaX: number,
  deltaY: number,
  threshold = 50,
): "prev" | "next" | null {
  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) return null;
  return deltaX > 0 ? "prev" : "next";
}

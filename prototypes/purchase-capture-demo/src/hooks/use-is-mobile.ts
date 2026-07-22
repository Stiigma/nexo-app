import { useMediaQuery } from "./use-media-query";

/** `true` cuando el viewport es móvil (<768px). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** `true` cuando el viewport es escritorio (>=1024px). */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

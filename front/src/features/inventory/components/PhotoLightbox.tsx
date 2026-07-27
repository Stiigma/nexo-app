// Created by: OpenCode (AI-assisted), 2026-07-26

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, ImageOff, Loader2, X } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { adjacentIndex, clampIndex, type PhotoUrl } from "../lib/item-photos";
import { lightboxKeyAction, swipeDirection } from "../lib/photo-lightbox-navigation";

interface PhotoLightboxProps {
  photos: PhotoUrl[];
  initialIndex: number;
  onClose: () => void;
}

interface PointerOrigin {
  id: number;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  intent: "horizontal" | "vertical" | null;
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());
  const pointerOriginRef = useRef<PointerOrigin | null>(null);
  const didSwipeRef = useRef(false);
  const photoIds = useMemo(() => photos.map(({ id }) => id).join("|"), [photos]);
  const [currentIndex, setCurrentIndex] = useState(() => clampIndex(initialIndex, photos.length));
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const currentPhoto = photos[currentIndex];

  const navigate = useCallback((direction: "prev" | "next") => {
    setCurrentIndex((index) => adjacentIndex(index, photos.length, direction));
  }, [photos.length]);

  useEffect(() => {
    setCurrentIndex(clampIndex(initialIndex, photos.length));
  }, [initialIndex, photoIds, photos.length]);

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
    if (currentPhoto) thumbnailRefs.current.get(currentPhoto.id)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentPhoto?.id]);

  useEffect(() => {
    const adjacentPhotos = [photos[currentIndex - 1], photos[currentIndex + 1]].filter(Boolean);
    adjacentPhotos.forEach((photo) => {
      const image = new Image();
      image.src = photo.src;
    });
  }, [currentIndex, photoIds, photos]);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      const action = lightboxKeyAction(event.key);
      if (action) {
        event.preventDefault();
        if (action === "close") onClose();
        else navigate(action);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [navigate, onClose]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    didSwipeRef.current = false;
    pointerOriginRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      deltaX: 0,
      deltaY: 0,
      intent: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = pointerOriginRef.current;
    if (!origin || origin.id !== event.pointerId) return;
    origin.deltaX = event.clientX - origin.x;
    origin.deltaY = event.clientY - origin.y;
    if (!origin.intent && Math.max(Math.abs(origin.deltaX), Math.abs(origin.deltaY)) >= 8) {
      origin.intent = Math.abs(origin.deltaX) > Math.abs(origin.deltaY)
        ? "horizontal"
        : "vertical";
    }
    if (origin.intent === "horizontal") event.preventDefault();
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = pointerOriginRef.current;
    pointerOriginRef.current = null;
    if (!origin || origin.id !== event.pointerId) return;
    const direction = origin.intent === "vertical"
      ? null
      : swipeDirection(
          event.clientX - origin.x,
          event.clientY - origin.y,
        );
    if (direction) {
      didSwipeRef.current = true;
      navigate(direction);
    }
  }

  if (!currentPhoto) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotos"
      onClick={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Foto {currentIndex + 1} de {photos.length}
      </p>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:top-6"
        aria-label="Cerrar galería"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-16 sm:px-20">
        <button
          type="button"
          onClick={() => navigate("prev")}
          disabled={currentIndex === 0}
          className="absolute left-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-30 sm:left-6"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        <div
          className="relative flex h-full w-full touch-pan-y items-center justify-center"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { pointerOriginRef.current = null; }}
          onClick={(event) => {
            if (didSwipeRef.current) {
              didSwipeRef.current = false;
              return;
            }
            if (event.currentTarget === event.target) onClose();
          }}
        >
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center" role="status">
              <Loader2 className="h-10 w-10 animate-spin" />
              <span className="sr-only">Cargando foto</span>
            </div>
          )}
          {imageError ? (
            <div className="flex flex-col items-center gap-3 text-white/75" role="alert">
              <ImageOff className="h-12 w-12" />
              <span>Error al cargar</span>
            </div>
          ) : (
            <img
              key={currentPhoto.id}
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              draggable={false}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              onClick={(event) => event.stopPropagation()}
              className={cn(
                "max-h-full max-w-full select-none object-contain transition-opacity",
                imageLoading ? "opacity-0" : "opacity-100",
              )}
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("next")}
          disabled={currentIndex === photos.length - 1}
          className="absolute right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-30 sm:right-6"
          aria-label="Foto siguiente"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>

      {photos.length > 1 && (
        <div className="z-20 flex shrink-0 gap-2 overflow-x-auto border-t border-white/10 px-4 py-3 sm:justify-center">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              ref={(element) => {
                if (element) thumbnailRefs.current.set(photo.id, element);
                else thumbnailRefs.current.delete(photo.id);
              }}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                index === currentIndex ? "border-white" : "border-transparent opacity-65 hover:opacity-100",
              )}
              aria-label={`Mostrar foto ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <img src={photo.src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

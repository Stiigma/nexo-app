import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface PhotoLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

/**
 * Lightbox de pantalla completa — solo la foto, nada más.
 * - Fondo negro sólido (sin blur, sin texto, sin nada que distraiga).
 * - Foto centrada, lo más grande posible respetando aspect ratio.
 * - Click fuera de la foto, tecla Escape o botón X para cerrar.
 */
export function PhotoLightbox({ src, alt, onClose }: PhotoLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Foto completa"
    >
      {/* Botón cerrar — siempre visible, esquina superior derecha */}
      <button
        type="button"
        onClick={onClose}
        className="fixed right-6 top-6 z-[10000] flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40"
        aria-label="Cerrar foto"
      >
        <X size={28} />
      </button>

      {/* Foto — el click en la foto NO cierra para evitar cierre accidental */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-screen max-w-full object-contain"
        style={{
          // Sombra sutil para dar profundidad en fondos claros
          filter: "drop-shadow(0 0 40px rgba(0,0,0,0.5))",
        }}
      />
    </div>
  );
}

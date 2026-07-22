const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(/\/$/, "");

/**
 * The browser only knows the stable, authenticated Nexo route. The media
 * gateway renews the provider-specific read capability when this URL is used.
 */
export function itemPhotoContentUrl(photoId: string): string {
  return `${API_BASE_URL}/media/photos/${encodeURIComponent(photoId)}/content`;
}

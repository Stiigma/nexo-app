import { useEffect, useState } from "react";

/**
 * Hook utilitario: debounce de un string.
 * Devuelve el valor tras `delay` ms sin cambios.
 */
export function useDebouncedSearch(value: string, delay = 300): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

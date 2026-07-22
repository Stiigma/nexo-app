import { useEffect } from "react";
import { createPurchaseCartRepository } from "./data/createPurchaseCartRepository";
import { usePurchaseCartStore } from "./state/usePurchaseCartStore";
import { NexoAppShell } from "./components/nexo/NexoAppShell";

export default function App() {
  const initialize = usePurchaseCartStore((s) => s.initialize);
  const setOffline = usePurchaseCartStore((s) => s.setOffline);

  useEffect(() => {
    let active = true;

    createPurchaseCartRepository()
      .then((repository) => {
        if (active) {
          void initialize(repository);
        }
      })
      .catch((initError: unknown) => {
        usePurchaseCartStore.setState({
          loading: false,
          error:
            initError instanceof Error
              ? initError.message
              : "No se pudo iniciar SQLite local.",
        });
      });

    return () => {
      active = false;
    };
  }, [initialize]);

  useEffect(() => {
    function syncOnlineState() {
      setOffline(!navigator.onLine);
    }

    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, [setOffline]);

  return <NexoAppShell />;
}

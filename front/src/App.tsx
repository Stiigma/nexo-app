import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { AppRouter } from "./routes";
import { AuthInitializer } from "./common/components/guards/AuthInitializer";
import { Toaster } from "./common/components/ui/sonner";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <AppRouter />
        <Toaster position="top-right" />
      </AuthInitializer>
    </QueryClientProvider>
  );
}

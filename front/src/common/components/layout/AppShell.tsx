import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-h-screen flex-col pb-[60px] md:pb-0">
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}

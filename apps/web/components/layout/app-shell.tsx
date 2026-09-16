import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { ConnectionBanner } from "./connection-banner";
import { PageTransition } from "./page-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ConnectionBanner />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

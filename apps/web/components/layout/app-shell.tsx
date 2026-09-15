import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { ConnectionBanner } from "./connection-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ConnectionBanner />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

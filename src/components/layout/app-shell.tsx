import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-neutral-900 dark:text-neutral-100 lg:grid lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <main className="min-h-screen px-4 py-6 transition-colors sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

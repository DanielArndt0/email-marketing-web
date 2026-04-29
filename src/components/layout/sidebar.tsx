"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Megaphone,
  Send,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/audiences", label: "Audiences", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dispatches", label: "Dispatches", icon: Send },
  { href: "/settings", label: "Configurações", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur transition-colors dark:border-neutral-800 dark:bg-neutral-950/95 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <Link href="/" className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-neutral-800 text-white shadow-soft transition-colors dark:bg-neutral-100 dark:text-neutral-950">
          <BarChart3 className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
            Email
          </p>

          <h1 className="text-lg font-bold text-slate-950 dark:text-neutral-100">
            Marketing Web
          </h1>
        </div>
      </Link>

      <nav className="grid gap-1">
        {items.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-neutral-800 text-white shadow-sm dark:bg-neutral-800 dark:text-neutral-50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4",
                  isActive
                    ? "text-white dark:text-neutral-100"
                    : "text-slate-500 dark:text-neutral-500",
                )}
              />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm font-medium text-slate-950 dark:text-neutral-100">
          Integração
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-neutral-400">
          Este painel consome apenas a Control API via HTTP.
        </p>
      </div>
    </aside>
  );
}

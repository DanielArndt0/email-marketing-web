"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AtSign,
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
  { href: "/smtp-senders", label: "Remetentes", icon: AtSign },
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
    <aside className="app-sidebar border-b px-4 py-4 backdrop-blur transition-colors lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <Link href="/" className="mb-6 flex items-center gap-3">
        <div className="app-primary-button grid h-11 w-11 place-items-center rounded-2xl shadow-soft">
          <BarChart3 className="h-5 w-5" />
        </div>

        <div>
          <p className="app-eyebrow">Email</p>

          <h1 className="app-heading text-lg font-bold">Marketing Web</h1>
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
                  ? "app-sidebar-link-active shadow-sm"
                  : "app-sidebar-link",
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "opacity-100" : "opacity-80",
                )}
              />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="app-card-muted mt-6 rounded-2xl p-4">
        <p className="app-heading text-sm font-medium">Integração</p>

        <p className="app-muted mt-1 text-xs leading-5">
          Este painel consome apenas a Control API via HTTP.
        </p>
      </div>
    </aside>
  );
}

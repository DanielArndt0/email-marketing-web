import Link from "next/link";
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

export function Sidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <Link href="/" className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-soft">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Email
          </p>
          <h1 className="text-lg font-bold text-slate-950">Marketing Web</h1>
        </div>
      </Link>

      <nav className="grid gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition",
              "hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-950">Integração</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Este painel consome apenas a Control API via HTTP.
        </p>
      </div>
    </aside>
  );
}

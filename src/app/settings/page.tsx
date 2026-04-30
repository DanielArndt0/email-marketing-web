"use client";

import type { ElementType, ReactNode } from "react";
import { CheckCircle2, Moon, Server, Sun } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { useTheme } from "@/components/theme/theme-provider";
import { env } from "@/lib/env/client-env";

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition dark:border-neutral-800 dark:bg-neutral-950 md:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-2 text-slate-600 transition dark:bg-neutral-900 dark:text-neutral-300">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-neutral-100">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-neutral-400">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">
      {children}
    </label>
  );
}

function HelperText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-neutral-500">
      {children}
    </p>
  );
}

function ReadOnlyCode({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-700 transition dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
      {children}
    </div>
  );
}

function themeOptionClassName(isSelected: boolean) {
  if (isSelected) {
    return "rounded-2xl border border-neutral-700 bg-neutral-800 p-4 text-left text-white shadow-sm transition hover:bg-neutral-700 dark:border-neutral-500 dark:bg-neutral-800";
  }

  return "rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800";
}

export default function SettingsPage() {
  const { theme, isDark, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configurações"
        title="Configurações básicas"
        description="Preferências visuais, ambiente da Control API e preparação das configurações de remetentes SMTP."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <SettingsCard
            title="Aparência"
            description="Controle o tema visual do painel de Email Marketing Web."
            icon={isDark ? Moon : Sun}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={themeOptionClassName(theme === "light")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      theme === "light"
                        ? "rounded-xl bg-white/10 p-2"
                        : "rounded-xl bg-slate-200 p-2 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300"
                    }
                  >
                    <Sun className="h-5 w-5" />
                  </div>

                  {theme === "light" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : null}
                </div>

                <p
                  className={
                    theme === "light"
                      ? "mt-4 font-semibold text-white"
                      : "mt-4 font-semibold text-slate-950 dark:text-neutral-100"
                  }
                >
                  Claro
                </p>

                <p
                  className={
                    theme === "light"
                      ? "mt-1 text-sm leading-6 text-slate-300"
                      : "mt-1 text-sm leading-6 text-slate-500 dark:text-neutral-400"
                  }
                >
                  Visual limpo para uso padrão durante o dia.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={themeOptionClassName(theme === "dark")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={
                      theme === "dark"
                        ? "rounded-xl bg-white/10 p-2"
                        : "rounded-xl bg-slate-200 p-2 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300"
                    }
                  >
                    <Moon className="h-5 w-5" />
                  </div>

                  {theme === "dark" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  ) : null}
                </div>

                <p
                  className={
                    theme === "dark"
                      ? "mt-4 font-semibold text-white"
                      : "mt-4 font-semibold text-slate-950 dark:text-neutral-100"
                  }
                >
                  Escuro
                </p>

                <p
                  className={
                    theme === "dark"
                      ? "mt-1 text-sm leading-6 text-neutral-300"
                      : "mt-1 text-sm leading-6 text-slate-500 dark:text-neutral-400"
                  }
                >
                  Interface escura em grafite neutro, próxima do visual claro.
                </p>
              </button>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Control API"
            description="Informações do ambiente atual consumido pelo painel."
            icon={Server}
          >
            <div className="space-y-3">
              <FieldLabel>URL base da Control API</FieldLabel>

              <ReadOnlyCode>{env.NEXT_PUBLIC_API_BASE_URL}</ReadOnlyCode>

              <HelperText>
                A URL base continua sendo configurada via arquivo{" "}
                <code>.env.local</code>.
              </HelperText>
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

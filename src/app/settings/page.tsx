"use client";

import type { ElementType, ReactNode } from "react";
import { CheckCircle2, Moon, Server, Sun } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { useTheme } from "@/components/theme/theme-provider";
import { clientEnv } from "@/lib/env/client-env";

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
    <section className="app-card rounded-3xl p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="app-icon-box rounded-2xl p-2">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="app-heading text-lg font-semibold">{title}</h2>

          <p className="app-muted mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="app-label text-sm font-medium">{children}</label>;
}

function HelperText({ children }: { children: ReactNode }) {
  return <p className="app-soft mt-1 text-xs leading-5">{children}</p>;
}

function ReadOnlyCode({ children }: { children: ReactNode }) {
  return (
    <div className="app-card-muted rounded-2xl px-4 py-3 font-mono text-xs">
      {children}
    </div>
  );
}

function themeOptionClassName(isSelected: boolean) {
  if (isSelected) {
    return "app-primary-button rounded-2xl border p-4 text-left shadow-sm";
  }

  return "app-card-muted rounded-2xl p-4 text-left transition hover:bg-[var(--app-surface-hover)]";
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
                        : "app-icon-box rounded-xl p-2"
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
                      ? "mt-4 font-semibold"
                      : "app-heading mt-4 font-semibold"
                  }
                >
                  Claro
                </p>

                <p
                  className={
                    theme === "light"
                      ? "mt-1 text-sm leading-6 opacity-75"
                      : "app-muted mt-1 text-sm leading-6"
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
                        : "app-icon-box rounded-xl p-2"
                    }
                  >
                    <Moon className="h-5 w-5" />
                  </div>

                  {theme === "dark" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : null}
                </div>

                <p
                  className={
                    theme === "dark"
                      ? "mt-4 font-semibold"
                      : "app-heading mt-4 font-semibold"
                  }
                >
                  Escuro
                </p>

                <p
                  className={
                    theme === "dark"
                      ? "mt-1 text-sm leading-6 opacity-75"
                      : "app-muted mt-1 text-sm leading-6"
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

              <ReadOnlyCode>{clientEnv.API_BASE_PATH}</ReadOnlyCode>

              <HelperText>
                O navegador usa a rota interna do Next.js. A URL real da Control
                API é configurada no runtime do servidor por{" "}
                <code>API_BASE_URL</code>.
              </HelperText>
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

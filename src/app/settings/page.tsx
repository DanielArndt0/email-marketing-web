"use client";

import type { ElementType, ReactNode } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Mail,
  Moon,
  Save,
  Server,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme/theme-provider";
import { env } from "@/lib/env/client-env";

type SmtpFormValues = {
  name: string;
  host: string;
  port: string;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  secure: boolean;
  isDefault: boolean;
};

const initialSmtpFormValues: SmtpFormValues = {
  name: "",
  host: "",
  port: "587",
  user: "",
  password: "",
  fromName: "",
  fromEmail: "",
  secure: true,
  isDefault: false,
};

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

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
    >
      <div>
        <p className="font-medium text-slate-950 dark:text-neutral-100">
          {label}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-neutral-400">
          {description}
        </p>
      </div>

      <span
        className={
          checked
            ? "flex h-7 w-12 items-center rounded-full bg-neutral-800 p-1 transition dark:bg-emerald-500"
            : "flex h-7 w-12 items-center rounded-full bg-slate-300 p-1 transition dark:bg-neutral-700"
        }
      >
        <span
          className={
            checked
              ? "h-5 w-5 translate-x-5 rounded-full bg-white transition"
              : "h-5 w-5 rounded-full bg-white transition"
          }
        />
      </span>
    </button>
  );
}

function DisabledNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />

      <p>
        Estes campos já estão preparados visualmente, mas ainda não salvam na
        Control API. A integração pode ser ligada depois ao módulo de remetentes
        SMTP.
      </p>
    </div>
  );
}

function inputClassName() {
  return "mt-2 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500";
}

function statusBoxClassName() {
  return "rounded-2xl border border-slate-200 bg-slate-50 p-4 transition dark:border-neutral-800 dark:bg-neutral-900";
}

function endpointBoxClassName() {
  return "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-700 transition dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300";
}

function themeOptionClassName(isSelected: boolean) {
  if (isSelected) {
    return "rounded-2xl border border-neutral-700 bg-neutral-800 p-4 text-left text-white shadow-sm transition hover:bg-neutral-700 dark:border-neutral-500 dark:bg-neutral-800";
  }

  return "rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800";
}

export default function SettingsPage() {
  const { theme, isDark, setTheme } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [smtpValues, setSmtpValues] = useState<SmtpFormValues>(
    initialSmtpFormValues,
  );

  function updateSmtpField<K extends keyof SmtpFormValues>(
    field: K,
    value: SmtpFormValues[K],
  ) {
    setSmtpValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

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

          <SettingsCard
            title="Remetente SMTP"
            description="Campos preparados para futura integração de múltiplos remetentes por campanha."
            icon={Mail}
          >
            <div className="space-y-5">
              <DisabledNotice />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Nome da configuração</FieldLabel>
                  <Input
                    value={smtpValues.name}
                    onChange={(event) =>
                      updateSmtpField("name", event.target.value)
                    }
                    placeholder="Ex: Garbo principal"
                    className={inputClassName()}
                  />
                  <HelperText>
                    Nome interno para identificar este remetente.
                  </HelperText>
                </div>

                <div>
                  <FieldLabel>From name</FieldLabel>
                  <Input
                    value={smtpValues.fromName}
                    onChange={(event) =>
                      updateSmtpField("fromName", event.target.value)
                    }
                    placeholder="Ex: Garbo Certificação Digital"
                    className={inputClassName()}
                  />
                  <HelperText>
                    Nome exibido como remetente nas campanhas.
                  </HelperText>
                </div>

                <div>
                  <FieldLabel>From e-mail</FieldLabel>
                  <Input
                    type="email"
                    value={smtpValues.fromEmail}
                    onChange={(event) =>
                      updateSmtpField("fromEmail", event.target.value)
                    }
                    placeholder="Ex: contato@garbo.com.br"
                    className={inputClassName()}
                  />
                  <HelperText>E-mail público usado no campo From.</HelperText>
                </div>

                <div>
                  <FieldLabel>SMTP user</FieldLabel>
                  <Input
                    value={smtpValues.user}
                    onChange={(event) =>
                      updateSmtpField("user", event.target.value)
                    }
                    placeholder="Ex: usuario@smtp.com"
                    className={inputClassName()}
                  />
                  <HelperText>Usuário de autenticação SMTP.</HelperText>
                </div>

                <div>
                  <FieldLabel>SMTP host</FieldLabel>
                  <Input
                    value={smtpValues.host}
                    onChange={(event) =>
                      updateSmtpField("host", event.target.value)
                    }
                    placeholder="Ex: smtp.seudominio.com"
                    className={inputClassName()}
                  />
                  <HelperText>Servidor SMTP usado para envio.</HelperText>
                </div>

                <div>
                  <FieldLabel>SMTP port</FieldLabel>
                  <Input
                    value={smtpValues.port}
                    onChange={(event) =>
                      updateSmtpField("port", event.target.value)
                    }
                    placeholder="Ex: 587"
                    className={inputClassName()}
                  />
                  <HelperText>
                    Normalmente 587 para STARTTLS ou 465 para SSL.
                  </HelperText>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>SMTP password</FieldLabel>

                  <div className="mt-2 flex gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={smtpValues.password}
                      onChange={(event) =>
                        updateSmtpField("password", event.target.value)
                      }
                      placeholder="Senha ou app password"
                      className="dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <HelperText>
                    Futuramente este campo deve ser salvo com proteção no
                    backend, nunca exposto novamente em texto puro.
                  </HelperText>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ToggleSwitch
                  checked={smtpValues.secure}
                  onChange={(checked) => updateSmtpField("secure", checked)}
                  label="SMTP secure"
                  description="Define se a conexão SMTP usará modo seguro."
                />

                <ToggleSwitch
                  checked={smtpValues.isDefault}
                  onChange={(checked) => updateSmtpField("isDefault", checked)}
                  label="Remetente padrão"
                  description="Marca este remetente como padrão para novas campanhas."
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-950 dark:text-neutral-100">
                    Integração pendente
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
                    O botão ficará ativo quando a Control API expuser os
                    endpoints de remetentes SMTP.
                  </p>
                </div>

                <Button type="button" disabled>
                  <Save className="h-4 w-4" />
                  Salvar SMTP
                </Button>
              </div>
            </div>
          </SettingsCard>
        </div>

        <aside className="space-y-6">
          <SettingsCard
            title="Status visual"
            description="Resumo rápido das preferências atuais do painel."
            icon={ShieldCheck}
          >
            <div className="space-y-3">
              <div className={statusBoxClassName()}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                  Tema atual
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-neutral-100">
                  {theme === "dark" ? "Escuro" : "Claro"}
                </p>
              </div>

              <div className={statusBoxClassName()}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                  API
                </p>

                <p className="mt-2 break-all text-sm font-medium text-slate-950 dark:text-neutral-100">
                  {env.NEXT_PUBLIC_API_BASE_URL}
                </p>
              </div>

              <div className={statusBoxClassName()}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                  SMTP
                </p>

                <p className="mt-2 text-sm font-medium text-slate-950 dark:text-neutral-100">
                  Campos preparados
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-neutral-400">
                  Ainda sem persistência no backend.
                </p>
              </div>
            </div>
          </SettingsCard>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { Activity, FileText, Megaphone, Send, Users } from "lucide-react";

import { env } from "@/lib/env/client-env";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useApiHealth } from "@/features/system/use-api-health";
import { useTemplates } from "@/features/templates/hooks";

export default function DashboardPage() {
  const health = useApiHealth();

  const apiStatusLabel = health.isLoading
    ? "Verificando..."
    : health.data?.status === "ok"
      ? "Online"
      : "Indisponível";

  const templatesQuery = useTemplates();

  const templatesCount = templatesQuery.isLoading
    ? "..."
    : templatesQuery.data
      ? String(templatesQuery.data.length)
      : "0";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Painel de Email Marketing"
        description="Visão geral da Control API, atalhos operacionais e módulos principais do ecossistema."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Status da API"
          value={apiStatusLabel}
          description={env.NEXT_PUBLIC_API_BASE_URL}
          icon={Activity}
        />
        <StatCard
          title="Templates"
          value={templatesCount}
          description="Templates cadastrados"
          icon={FileText}
        />
        <StatCard
          title="Audiences"
          value="—"
          description="Bases e filtros salvos"
          icon={Users}
        />
        <StatCard
          title="Dispatches"
          value="—"
          description="Fila e histórico de envios"
          icon={Send}
        />
      </section>

      {health.isError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Erro ao consultar a Control API:</strong>{" "}
          {health.error instanceof Error
            ? health.error.message
            : "Erro desconhecido"}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-2 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Próximos passos
            </h2>
            <p className="text-sm text-slate-500">
              Comece cadastrando templates e audiences. Depois vincule ambos em
              campanhas.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-medium">1. Templates</h3>
            <p className="mt-1 text-sm text-slate-500">
              Crie os conteúdos HTML/texto e padronize variáveis como{" "}
              {"{{name}}"} e {"{{company}}"}.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-medium">2. Audiences</h3>
            <p className="mt-1 text-sm text-slate-500">
              Configure fontes como CNPJ API, CSV import ou lista manual.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-medium">3. Campaigns</h3>
            <p className="mt-1 text-sm text-slate-500">
              Vincule template e audience para preparar a campanha para execução
              futura.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

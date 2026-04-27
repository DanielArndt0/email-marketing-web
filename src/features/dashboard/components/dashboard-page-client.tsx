"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  FileText,
  Send,
  Settings,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { env } from "@/lib/env/client-env";
import { useAudiences } from "@/features/audiences/hooks";
import { useCampaigns } from "@/features/campaigns/hooks";
import { useApiHealth } from "@/features/system/use-api-health";
import { useTemplates } from "@/features/templates/hooks";

import { CampaignsSummaryTable } from "./campaigns-summary-table";

function DashboardShortcut({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof FileText;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white p-2 text-slate-500 shadow-sm transition group-hover:text-slate-950">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
    </Link>
  );
}

export function DashboardPageClient() {
  const health = useApiHealth();
  const templatesQuery = useTemplates();
  const audiencesQuery = useAudiences();
  const campaignsQuery = useCampaigns();

  const apiStatusLabel = health.isLoading
    ? "Verificando..."
    : health.data?.status === "ok"
      ? "Online"
      : "Indisponível";

  const templatesCount = templatesQuery.isLoading
    ? "..."
    : templatesQuery.data
      ? String(templatesQuery.data.length)
      : "0";

  const audiencesCount = audiencesQuery.isLoading
    ? "..."
    : audiencesQuery.data
      ? String(audiencesQuery.data.length)
      : "0";

  const campaignsCount = campaignsQuery.isLoading
    ? "..."
    : campaignsQuery.data
      ? String(campaignsQuery.data.length)
      : "0";

  const campaigns = campaignsQuery.data ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Painel de Email Marketing"
        description="Visão geral da Control API, campanhas cadastradas e atalhos operacionais do ecossistema."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Status da API"
          value={apiStatusLabel}
          description={env.NEXT_PUBLIC_API_BASE_URL}
          icon={Activity}
        />

        <StatCard
          title="Campanhas"
          value={campaignsCount}
          description="Campanhas cadastradas"
          icon={Send}
        />

        <StatCard
          title="Templates"
          value={templatesCount}
          description="Templates cadastrados"
          icon={FileText}
        />

        <StatCard
          title="Audiências"
          value={audiencesCount}
          description="Bases e filtros salvos"
          icon={Users}
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

      <section className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CampaignsSummaryTable
          campaigns={campaigns}
          isLoading={campaignsQuery.isLoading}
          isError={campaignsQuery.isError}
        />

        <aside className="h-[500px]">
          <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 shrink-0">
              <h2 className="text-lg font-semibold text-slate-950">Atalhos</h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Acesse os módulos principais.
              </p>
            </div>

            <div className="space-y-3">
              <DashboardShortcut
                href="/campaigns"
                title="Campanhas"
                description="Vincular template e audience."
                icon={Send}
              />

              <DashboardShortcut
                href="/templates"
                title="Templates"
                description="Criar conteúdos HTML ou texto."
                icon={FileText}
              />

              <DashboardShortcut
                href="/audiences"
                title="Audiências"
                description="Gerenciar públicos e filtros."
                icon={Users}
              />

              <DashboardShortcut
                href="/settings"
                title="Configurações"
                description="Ajustar integrações do painel."
                icon={Settings}
              />
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

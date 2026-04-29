"use client";

import Link from "next/link";
import {
  CalendarClock,
  ExternalLink,
  FileText,
  Send,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

import type { Campaign, CampaignStatus } from "@/features/campaigns/types";

function getStatusLabel(status: CampaignStatus) {
  const labels: Record<CampaignStatus, string> = {
    draft: "Rascunho",
    ready: "Pronta",
    scheduled: "Agendada",
    running: "Em execução",
    paused: "Pausada",
    completed: "Concluída",
    canceled: "Cancelada",
    failed: "Falhou",
  };

  return labels[status] ?? status;
}

function getStatusClassName(status: CampaignStatus) {
  const classes: Record<CampaignStatus, string> = {
    draft:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    ready:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
    scheduled:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300",
    running:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    paused:
      "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    canceled:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    failed:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  };

  return classes[status] ?? classes.draft;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Sem agendamento";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getTemplateName(campaign: Campaign) {
  return campaign.template?.name ?? campaign.templateId ?? "Sem template";
}

function getAudienceName(campaign: Campaign) {
  return campaign.audience?.name ?? campaign.audienceId ?? "Sem audience";
}

function getCampaignSubtitle(campaign: Campaign) {
  return campaign.subject || campaign.goal || "Sem objetivo informado";
}

export function CampaignsSummaryTable({
  campaigns,
  isLoading,
  isError,
}: {
  campaigns: Campaign[];
  isLoading: boolean;
  isError: boolean;
}) {
  const latestCampaigns = campaigns.slice(0, 5);

  if (isLoading) {
    return (
      <EmptyState
        title="Carregando campanhas..."
        description="Consultando campanhas cadastradas na Control API."
      />
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Não foi possível carregar as campanhas"
        description="Verifique se a Control API está rodando e se o endpoint de campanhas está disponível."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-colors dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 transition-colors dark:border-neutral-800 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-neutral-800 p-2 text-white shadow-sm dark:bg-neutral-800 dark:text-neutral-100">
            <Send className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-neutral-100">
              Resumo de campanhas
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
              {campaigns.length}{" "}
              {campaigns.length === 1
                ? "campanha cadastrada"
                : "campanhas cadastradas"}
            </p>
          </div>
        </div>

        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Ver campanhas
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="px-6 py-10 text-center transition-colors">
          <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">
            Nenhuma campanha cadastrada ainda.
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
            Crie uma campanha vinculando um template e uma audience.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-neutral-800">
          {latestCampaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="grid gap-4 px-6 py-5 transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/45 lg:grid-cols-[minmax(0,1.3fr)_120px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-950 dark:text-neutral-100">
                  {campaign.name}
                </p>

                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-neutral-400">
                  {getCampaignSubtitle(campaign)}
                </p>
              </div>

              <div className="flex items-start">
                <Badge className={getStatusClassName(campaign.status)}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                  Template
                </p>

                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                  <span className="truncate">{getTemplateName(campaign)}</span>
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                  Audience
                </p>

                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
                  <Users className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                  <span className="truncate">{getAudienceName(campaign)}</span>
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                  Agendamento
                </p>

                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
                  <CalendarClock className="h-4 w-4 shrink-0 text-slate-400 dark:text-neutral-500" />
                  <span className="truncate">
                    {formatDateTime(campaign.scheduleAt)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

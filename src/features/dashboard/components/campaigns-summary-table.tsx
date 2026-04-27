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
    draft: "border-slate-200 bg-slate-50 text-slate-600",
    ready: "border-blue-200 bg-blue-50 text-blue-700",
    scheduled: "border-indigo-200 bg-indigo-50 text-indigo-700",
    running: "border-amber-200 bg-amber-50 text-amber-700",
    paused: "border-zinc-200 bg-zinc-50 text-zinc-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    canceled: "border-rose-200 bg-rose-50 text-rose-700",
    failed: "border-red-200 bg-red-50 text-red-700",
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
    <section className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-950 p-2 text-white">
            <Send className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Resumo de campanhas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {campaigns.length}{" "}
              {campaigns.length === 1
                ? "campanha cadastrada"
                : "campanhas cadastradas"}
            </p>
          </div>
        </div>

        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
        >
          Ver campanhas
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            Nenhuma campanha cadastrada ainda.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Crie uma campanha vinculando um template e uma audience.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {latestCampaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="grid gap-4 px-6 py-5 transition hover:bg-slate-50/70 xl:grid-cols-[minmax(0,1.4fr)_120px_minmax(0,1fr)_minmax(0,1fr)_180px]"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">{campaign.name}</p>

                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                  {getCampaignSubtitle(campaign)}
                </p>
              </div>

              <div className="flex items-start">
                <Badge className={getStatusClassName(campaign.status)}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Template
                </p>

                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{getTemplateName(campaign)}</span>
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Audience
                </p>

                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                  <Users className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{getAudienceName(campaign)}</span>
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Agendamento
                </p>

                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                  <CalendarClock className="h-4 w-4 shrink-0 text-slate-400" />
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

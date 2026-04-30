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
    draft: "app-badge",
    ready: "app-badge-info",
    scheduled: "app-badge-info",
    running: "app-badge-warning",
    paused: "app-badge",
    completed: "app-badge-success",
    canceled: "app-badge-danger",
    failed: "app-badge-danger",
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
    <section className="app-list rounded-2xl">
      <div className="app-list-header flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="app-primary-button rounded-xl p-2 shadow-sm">
            <Send className="h-4 w-4" />
          </div>

          <div>
            <h2 className="app-heading text-lg font-semibold">
              Resumo de campanhas
            </h2>

            <p className="app-muted mt-1 text-sm">
              {campaigns.length}{" "}
              {campaigns.length === 1
                ? "campanha cadastrada"
                : "campanhas cadastradas"}
            </p>
          </div>
        </div>

        <Link
          href="/campaigns"
          className="app-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--app-text-strong)]"
        >
          Ver campanhas
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="app-heading text-sm font-medium">
            Nenhuma campanha cadastrada ainda.
          </p>

          <p className="app-muted mt-1 text-sm">
            Crie uma campanha vinculando um template e uma audience.
          </p>
        </div>
      ) : (
        <div>
          {latestCampaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="app-list-row grid gap-4 border-t px-6 py-5 first:border-t-0 lg:grid-cols-[minmax(0,1.3fr)_120px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start"
            >
              <div className="min-w-0">
                <p className="app-heading font-semibold">{campaign.name}</p>

                <p className="app-muted mt-1 line-clamp-2 text-sm leading-6">
                  {getCampaignSubtitle(campaign)}
                </p>
              </div>

              <div className="flex items-start">
                <Badge className={getStatusClassName(campaign.status)}>
                  {getStatusLabel(campaign.status)}
                </Badge>
              </div>

              <div className="min-w-0">
                <p className="app-soft mb-1 text-xs font-medium uppercase tracking-wide">
                  Template
                </p>

                <div className="app-text flex min-w-0 items-center gap-2 text-sm">
                  <FileText className="app-soft h-4 w-4 shrink-0" />
                  <span className="truncate">{getTemplateName(campaign)}</span>
                </div>
              </div>

              <div className="min-w-0">
                <p className="app-soft mb-1 text-xs font-medium uppercase tracking-wide">
                  Audience
                </p>

                <div className="app-text flex min-w-0 items-center gap-2 text-sm">
                  <Users className="app-soft h-4 w-4 shrink-0" />
                  <span className="truncate">{getAudienceName(campaign)}</span>
                </div>
              </div>

              <div className="min-w-0">
                <p className="app-soft mb-1 text-xs font-medium uppercase tracking-wide">
                  Agendamento
                </p>

                <div className="app-text flex min-w-0 items-center gap-2 text-sm">
                  <CalendarClock className="app-soft h-4 w-4 shrink-0" />
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

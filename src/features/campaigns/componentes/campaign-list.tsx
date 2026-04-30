"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/lib/api/http-client";

import { useDeleteCampaign, useDispatchCampaign } from "../hooks";
import type { Campaign, CampaignStatus } from "../types";

type CampaignFeedback = {
  type: "success" | "error";
  message: string;
};

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

function getDispatchSuccessMessage(campaign: Campaign) {
  return `Dispatches da campanha "${campaign.name}" foram criados e enfileirados com sucesso.`;
}

export function CampaignList({
  campaigns,
  onPreview,
  onEdit,
}: {
  campaigns: Campaign[];
  onPreview: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
}) {
  const deleteCampaign = useDeleteCampaign();
  const dispatchCampaign = useDispatchCampaign();

  const [feedback, setFeedback] = useState<CampaignFeedback | null>(null);
  const [dispatchingCampaignId, setDispatchingCampaignId] = useState<
    string | null
  >(null);

  async function handleDispatchCampaign(campaign: Campaign) {
    setFeedback(null);
    setDispatchingCampaignId(campaign.id);

    try {
      await dispatchCampaign.mutateAsync(campaign.id);

      setFeedback({
        type: "success",
        message: getDispatchSuccessMessage(campaign),
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Não foi possível criar os dispatches desta campanha.",
        ),
      });
    } finally {
      setDispatchingCampaignId(null);
    }
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="Nenhuma campanha cadastrada"
        description="Crie sua primeira campanha vinculando um template e uma audience."
      />
    );
  }

  return (
    <section className="app-list rounded-2xl">
      <div className="app-list-header px-6 py-5">
        <h2 className="app-heading text-lg font-semibold">
          Campanhas cadastradas
        </h2>

        <div className="app-muted mt-1 text-sm">
          {campaigns.length}{" "}
          {campaigns.length === 1
            ? "campanha cadastrada"
            : "campanhas cadastradas"}
        </div>
      </div>

      {feedback ? (
        <div className="px-6 pt-5">
          <div
            className={
              feedback.type === "success"
                ? "app-alert-success flex items-start gap-3 rounded-2xl px-4 py-3 text-sm"
                : "app-alert-danger flex items-start gap-3 rounded-2xl px-4 py-3 text-sm"
            }
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <p className="min-w-0 flex-1">{feedback.message}</p>

            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="rounded-lg p-1 transition hover:bg-[var(--app-surface-hover)]"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div>
        {campaigns.map((campaign) => {
          const isDispatching = dispatchingCampaignId === campaign.id;

          return (
            <article
              key={campaign.id}
              className="app-list-row flex flex-col gap-4 border-t px-6 py-5 first:border-t-0 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="app-icon-box mr-1 rounded-xl p-2">
                    <Send className="h-4 w-4" />
                  </div>

                  <h3 className="app-heading font-semibold">{campaign.name}</h3>

                  <Badge className={getStatusClassName(campaign.status)}>
                    {getStatusLabel(campaign.status)}
                  </Badge>
                </div>

                {campaign.goal ? (
                  <p className="app-muted mt-2 text-sm">{campaign.goal}</p>
                ) : (
                  <p className="app-soft mt-2 text-sm">
                    Sem objetivo informado
                  </p>
                )}

                <div className="app-text mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <FileText className="app-soft h-4 w-4" />
                    <span className="truncate">
                      {getTemplateName(campaign)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="app-soft h-4 w-4" />
                    <span className="truncate">
                      {getAudienceName(campaign)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarClock className="app-soft h-4 w-4" />
                    <span className="truncate">
                      {formatDateTime(campaign.scheduleAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleDispatchCampaign(campaign)}
                  disabled={isDispatching || dispatchCampaign.isPending}
                  title="Resolver audience, aplicar mappings e enfileirar dispatches"
                >
                  <Send className="h-4 w-4" />
                  {isDispatching ? "Enfileirando..." : "Preparar envios"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onPreview(campaign)}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(campaign)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCampaign.mutate(campaign.id)}
                  disabled={deleteCampaign.isPending}
                  title="Excluir campanha"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

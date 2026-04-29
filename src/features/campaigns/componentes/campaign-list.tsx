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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-colors dark:border-neutral-700 dark:bg-neutral-900">
      <div className="border-b border-slate-200 px-6 py-5 transition-colors dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-slate-950">
          Campanhas cadastradas
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-neutral-800">
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
                ? "flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                : "flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
              className="rounded-lg p-1 transition hover:bg-white/70"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="divide-y divide-slate-100 dark:divide-neutral-800">
        {campaigns.map((campaign) => {
          const isDispatching = dispatchingCampaignId === campaign.id;

          return (
            <article
              key={campaign.id}
              className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-slate-50/60 dark:hover:bg-neutral-800/45 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="mr-1 rounded-xl bg-slate-100 p-2 text-slate-500">
                    <Send className="h-4 w-4" />
                  </div>

                  <h3 className="font-semibold text-slate-950">
                    {campaign.name}
                  </h3>

                  <Badge className={getStatusClassName(campaign.status)}>
                    {getStatusLabel(campaign.status)}
                  </Badge>
                </div>

                {campaign.goal ? (
                  <p className="mt-2 text-sm text-slate-500">{campaign.goal}</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    Sem objetivo informado
                  </p>
                )}

                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {getTemplateName(campaign)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="truncate">
                      {getAudienceName(campaign)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-slate-400" />
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

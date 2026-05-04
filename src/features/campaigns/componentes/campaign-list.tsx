"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileText,
  Mail,
  Pencil,
  Send,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/lib/api/http-client";

import {
  useDeleteCampaign,
  useDispatchCampaign,
  useUpdateCampaign,
} from "../hooks";
import type { Campaign } from "../types";

import { CampaignReadinessChecklist } from "./status/campaign-readiness-checklist";
import { CampaignStatusActions } from "./status/campaign-status-actions";
import { CampaignStatusBadge } from "./status/campaign-status-badge";
import { CampaignDispatchConfirmationDialog } from "./status/campaign-dispatch-confirmation-dialog";

type CampaignFeedback = {
  type: "success" | "error";
  message: string;
};

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

function getSmtpSenderName(campaign: Campaign) {
  if (campaign.smtpSender) {
    return `${campaign.smtpSender.name} — ${campaign.smtpSender.fromEmail}`;
  }

  return campaign.smtpSenderId ?? "Sem remetente SMTP";
}

function getDispatchSuccessMessage(campaign: Campaign) {
  return `Dispatch da campanha "${campaign.name}" foi solicitado com sucesso. O status de execução será atualizado pelo backend.`;
}

function getUpdateSuccessMessage(campaign: Campaign, action: string) {
  return `Campanha "${campaign.name}" atualizada: ${action}.`;
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
  const updateCampaign = useUpdateCampaign();
  const dispatchCampaign = useDispatchCampaign();

  const [feedback, setFeedback] = useState<CampaignFeedback | null>(null);
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(
    null,
  );
  const [campaignToDispatch, setCampaignToDispatch] = useState<Campaign | null>(
    null,
  );

  async function runCampaignOperation(
    campaign: Campaign,
    operation: () => Promise<unknown>,
    successMessage: string,
    fallbackErrorMessage: string,
  ) {
    setFeedback(null);
    setPendingCampaignId(campaign.id);

    try {
      await operation();

      setFeedback({
        type: "success",
        message: successMessage,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(error, fallbackErrorMessage),
      });
    } finally {
      setPendingCampaignId(null);
    }
  }

  function handleRequestSendNow(campaign: Campaign) {
    setCampaignToDispatch(campaign);
  }

  async function handleConfirmSendNow(campaign: Campaign) {
    await runCampaignOperation(
      campaign,
      () =>
        dispatchCampaign.mutateAsync({
          id: campaign.id,
          input: {},
        }),
      getDispatchSuccessMessage(campaign),
      "Não foi possível iniciar os envios desta campanha.",
    );

    setCampaignToDispatch(null);
  }

  async function handleScheduleCampaign(campaign: Campaign) {
    if (!campaign.scheduleAt) {
      setFeedback({
        type: "error",
        message:
          "Defina uma data de agendamento editando a campanha antes de agendar o envio.",
      });

      return;
    }

    await runCampaignOperation(
      campaign,
      () =>
        updateCampaign.mutateAsync({
          id: campaign.id,
          input: { status: "scheduled" },
        }),
      getUpdateSuccessMessage(campaign, "agendada para envio"),
      "Não foi possível agendar esta campanha.",
    );
  }

  async function handlePauseCampaign(campaign: Campaign) {
    await runCampaignOperation(
      campaign,
      () =>
        updateCampaign.mutateAsync({
          id: campaign.id,
          input: { status: "scheduled" },
        }),
      getUpdateSuccessMessage(campaign, "pausada"),
      "Não foi possível pausar esta campanha.",
    );
  }

  async function handleResumeCampaign(campaign: Campaign) {
    await runCampaignOperation(
      campaign,
      () =>
        updateCampaign.mutateAsync({
          id: campaign.id,
          input: { status: "scheduled" },
        }),
      getUpdateSuccessMessage(campaign, "retomada como pronta"),
      "Não foi possível retomar esta campanha.",
    );
  }

  async function handleCancelCampaign(campaign: Campaign) {
    await runCampaignOperation(
      campaign,
      () =>
        updateCampaign.mutateAsync({
          id: campaign.id,
          input: { status: "scheduled" },
        }),
      getUpdateSuccessMessage(campaign, "cancelada"),
      "Não foi possível cancelar esta campanha.",
    );
  }

  async function handleRetryCampaign(campaign: Campaign) {
    await runCampaignOperation(
      campaign,
      () =>
        dispatchCampaign.mutateAsync({
          id: campaign.id,
          input: {},
        }),
      `Nova tentativa de dispatch da campanha "${campaign.name}" foi solicitada com sucesso.`,
      "Não foi possível tentar novamente o envio desta campanha.",
    );
  }

  async function handleDeleteCampaign(campaign: Campaign) {
    await runCampaignOperation(
      campaign,
      () => deleteCampaign.mutateAsync(campaign.id),
      `Campanha "${campaign.name}" excluída com sucesso.`,
      "Não foi possível excluir esta campanha.",
    );
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="Nenhuma campanha cadastrada"
        description="Crie sua primeira campanha vinculando um template, uma audience e um remetente SMTP."
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="app-card-flat rounded-2xl p-5">
        <h2 className="app-heading text-lg font-semibold">
          Campanhas cadastradas
        </h2>

        <p className="app-muted mt-1 text-sm">
          {campaigns.length}{" "}
          {campaigns.length === 1
            ? "campanha cadastrada"
            : "campanhas cadastradas"}
        </p>
      </section>

      {feedback ? (
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
      ) : null}

      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const isPending = pendingCampaignId === campaign.id;
          const isDraft = campaign.status === "draft";
          const isCompleted = campaign.status === "completed";
          const isCanceled = campaign.status === "canceled";
          const canEditCampaign = campaign.status !== "running";

          return (
            <article
              key={campaign.id}
              className="app-card-flat rounded-2xl p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="app-icon-box mr-1 rounded-xl p-2">
                      <Send className="h-4 w-4" />
                    </div>

                    <h3 className="app-heading font-semibold">
                      {campaign.name}
                    </h3>

                    <CampaignStatusBadge status={campaign.status} />
                  </div>

                  {campaign.goal ? (
                    <p className="app-muted mt-2 text-sm">{campaign.goal}</p>
                  ) : (
                    <p className="app-soft mt-2 text-sm">
                      Sem objetivo informado
                    </p>
                  )}

                  <div className="app-text mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="app-soft h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {getTemplateName(campaign)}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <Users className="app-soft h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {getAudienceName(campaign)}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <Mail className="app-soft h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {getSmtpSenderName(campaign)}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <CalendarClock className="app-soft h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {formatDateTime(campaign.scheduleAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    className="app-button app-button-muted h-9 px-3 text-sm"
                    onClick={() => onPreview(campaign)}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>

                  <button
                    type="button"
                    className="app-button app-button-muted h-9 px-3 text-sm"
                    onClick={() => onEdit(campaign)}
                    disabled={!canEditCampaign}
                    title={
                      canEditCampaign
                        ? "Editar campanha"
                        : "Não é possível editar uma campanha em envio."
                    }
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>

                  <button
                    type="button"
                    className="app-button app-button-ghost h-9 px-3 text-sm"
                    onClick={() => handleDeleteCampaign(campaign)}
                    disabled={isPending}
                    title="Excluir campanha"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isDraft ? (
                <div className="mt-5">
                  <CampaignReadinessChecklist campaign={campaign} />
                </div>
              ) : null}

              {!isCompleted && !isCanceled ? (
                <div className="mt-5 flex flex-col gap-3 border-t border-[var(--app-border-soft)] pt-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="app-heading text-sm font-semibold">
                      Ações disponíveis
                    </p>

                    <p className="app-muted mt-1 text-sm">
                      {isDraft
                        ? "Complete os vínculos da campanha para liberar o envio."
                        : "Envie, agende ou gerencie esta campanha conforme o status atual."}
                    </p>
                  </div>

                  {isDraft ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="app-button app-button-muted h-9 px-3 text-sm"
                        onClick={() => onEdit(campaign)}
                      >
                        <Pencil className="h-4 w-4" />
                        Completar campanha
                      </button>

                      <button
                        type="button"
                        className="app-button app-button-danger h-9 px-3 text-sm"
                        onClick={() => handleCancelCampaign(campaign)}
                        disabled={isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancelar campanha
                      </button>
                    </div>
                  ) : (
                    <CampaignStatusActions
                      campaign={campaign}
                      isPending={isPending}
                      onSendNow={handleRequestSendNow}
                      onSchedule={handleScheduleCampaign}
                      onPause={handlePauseCampaign}
                      onResume={handleResumeCampaign}
                      onCancel={handleCancelCampaign}
                      onRetry={handleRetryCampaign}
                    />
                  )}
                </div>
              ) : (
                <div className="mt-5 border-t border-[var(--app-border-soft)] pt-4">
                  <p className="app-muted text-sm">
                    {isCompleted
                      ? "Campanha finalizada. Consulte a tela de envios para acompanhar entregas, falhas e tentativas."
                      : "Campanha cancelada."}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {campaignToDispatch ? (
        <CampaignDispatchConfirmationDialog
          campaign={campaignToDispatch}
          isPending={pendingCampaignId === campaignToDispatch.id}
          onCancel={() => setCampaignToDispatch(null)}
          onConfirm={handleConfirmSendNow}
        />
      ) : null}
    </div>
  );
}

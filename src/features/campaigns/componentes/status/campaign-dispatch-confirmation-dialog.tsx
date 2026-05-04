"use client";

import { AlertTriangle, Send, X } from "lucide-react";

import type { Campaign } from "../../types";
import { CampaignReadinessChecklist } from "./campaign-readiness-checklist";
import { isCampaignReadyForDispatch } from "./campaign-status-rules";

type CampaignDispatchConfirmationDialogProps = {
  campaign: Campaign;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (campaign: Campaign) => void;
};

export function CampaignDispatchConfirmationDialog({
  campaign,
  isPending = false,
  onCancel,
  onConfirm,
}: CampaignDispatchConfirmationDialogProps) {
  const isReady = isCampaignReadyForDispatch(campaign);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <section className="app-card w-full max-w-2xl rounded-3xl">
        <div className="app-list-header flex items-start justify-between gap-4 px-5 py-4">
          <div>
            <h2 className="app-heading text-lg font-semibold">
              Confirmar envio da campanha
            </h2>

            <p className="app-muted mt-1 text-sm">
              Revise o checklist antes de iniciar o dispatch.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="app-button app-button-ghost h-9 px-3 text-sm"
            disabled={isPending}
            aria-label="Fechar confirmação"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="app-card-muted rounded-2xl p-4">
            <p className="app-eyebrow">Campanha</p>

            <h3 className="app-heading mt-2 text-xl font-semibold">
              {campaign.name}
            </h3>

            <p className="app-muted mt-1 text-sm">
              {campaign.subject || "Sem assunto informado"}
            </p>
          </div>

          <CampaignReadinessChecklist campaign={campaign} />

          {!isReady ? (
            <div className="app-alert-warning flex items-start gap-3 rounded-2xl px-4 py-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

              <p>
                Esta campanha ainda não está pronta para envio. Complete os
                vínculos obrigatórios antes de iniciar o dispatch.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--app-border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="app-button app-button-muted h-10 px-4 text-sm"
              disabled={isPending}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => onConfirm(campaign)}
              className="app-button app-button-primary h-10 px-4 text-sm"
              disabled={isPending || !isReady}
            >
              <Send className="h-4 w-4" />
              {isPending ? "Iniciando envio..." : "Confirmar envio"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

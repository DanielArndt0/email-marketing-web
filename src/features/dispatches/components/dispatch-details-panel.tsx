import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  RotateCcw,
  X,
} from "lucide-react";

import type { MonitoredCampaign } from "../types";
import { DispatchStatusBadge } from "./dispatch-status-badge";

type DispatchDetailsPanelProps = {
  campaign: MonitoredCampaign;
  onClose: () => void;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDeliveryRate(campaign: MonitoredCampaign) {
  if (campaign.totalRecipients === 0) {
    return 0;
  }

  return Math.round((campaign.sentCount / campaign.totalRecipients) * 100);
}

export function DispatchDetailsPanel({
  campaign,
  onClose,
}: DispatchDetailsPanelProps) {
  const failedDeliveries = campaign.deliveries.filter(
    (delivery) => delivery.status === "failed",
  );

  const deliveryRate = getDeliveryRate(campaign);

  return (
    <section className="app-card rounded-2xl">
      <div className="app-list-header flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="app-heading text-lg font-semibold">
              Detalhes da campanha monitorada
            </h2>

            <DispatchStatusBadge status={campaign.status} />
          </div>

          <p className="app-muted mt-1 text-sm">
            Acompanhe destinatários, falhas, tentativas e eventos operacionais.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="app-button app-button-ghost h-9 px-3 text-sm"
        >
          <X className="h-4 w-4" />
          Fechar
        </button>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="app-card-muted rounded-2xl p-5">
            <p className="app-eyebrow">Campanha</p>

            <div className="mt-3 flex flex-col gap-2">
              <h3 className="app-heading text-xl font-semibold">
                {campaign.campaignName}
              </h3>

              <p className="app-muted text-sm">{campaign.subject}</p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="app-card-flat rounded-xl p-4">
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  Remetente
                </p>
                <p className="app-text mt-1 text-sm font-medium">
                  {campaign.smtpSenderName}
                </p>
                <p className="app-soft mt-1 truncate text-xs">
                  {campaign.smtpFromEmail}
                </p>
              </div>

              <div className="app-card-flat rounded-xl p-4">
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  Provedor
                </p>
                <p className="app-text mt-1 text-sm font-medium">
                  {campaign.provider}
                </p>
              </div>

              <div className="app-card-flat rounded-xl p-4">
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  Tentativas
                </p>
                <p className="app-text mt-1 text-sm font-medium">
                  Máximo de {campaign.maxAttempts} por destinatário
                </p>
              </div>
            </div>
          </div>

          <div className="app-card-muted rounded-2xl p-5">
            <p className="app-eyebrow">Resumo operacional</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="app-card-flat rounded-xl p-4">
                <p className="app-muted text-sm">Destinatários</p>
                <strong className="app-heading mt-1 block text-2xl">
                  {campaign.totalRecipients}
                </strong>
              </div>

              <div className="app-card-flat rounded-xl p-4">
                <p className="app-muted text-sm">Taxa de envio</p>
                <strong className="app-heading mt-1 block text-2xl">
                  {deliveryRate}%
                </strong>
              </div>

              <div className="app-card-flat rounded-xl p-4">
                <p className="app-muted text-sm">Enviados</p>
                <strong className="mt-1 block text-2xl text-[var(--app-success-text)]">
                  {campaign.sentCount}
                </strong>
              </div>

              <div className="app-card-flat rounded-xl p-4">
                <p className="app-muted text-sm">Falhas</p>
                <strong className="mt-1 block text-2xl text-[var(--app-danger-text)]">
                  {campaign.failedCount}
                </strong>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--app-surface)]">
              <div
                className="h-full rounded-full bg-[var(--app-primary)]"
                style={{ width: `${deliveryRate}%` }}
              />
            </div>

            <div className="app-soft mt-3 flex items-center gap-2 text-xs">
              <Clock className="h-4 w-4" />
              Início: {formatDateTime(campaign.startedAt)}
            </div>
          </div>
        </div>

        {failedDeliveries.length > 0 ? (
          <div className="app-alert-danger rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5" />

              <div>
                <p className="font-semibold">
                  {failedDeliveries.length} e-mail(s) falharam nesta campanha
                </p>
                <p className="mt-1 text-sm">
                  Revise o erro SMTP, remetente usado e os destinatários abaixo
                  antes de executar um novo retry.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="app-card-muted rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="app-heading font-semibold">
                  Destinatários da campanha
                </h3>
                <p className="app-muted mt-1 text-sm">
                  Status individual de cada e-mail renderizado.
                </p>
              </div>

              <span className="app-badge app-badge-surface px-3 py-1">
                {campaign.deliveries.length} registros
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--app-border)]">
              <div className="grid grid-cols-[1.4fr_120px_120px_1fr] gap-3 bg-[var(--app-surface)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-soft)]">
                <span>Destinatário</span>
                <span>Status</span>
                <span>Tentativas</span>
                <span>Erro / resposta</span>
              </div>

              <div className="divide-y divide-[var(--app-border-soft)]">
                {campaign.deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="grid grid-cols-[1.4fr_120px_120px_1fr] gap-3 bg-[var(--app-surface-muted)] px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="app-heading truncate font-medium">
                        {delivery.recipientEmail}
                      </p>
                      <p className="app-soft mt-1 truncate text-xs">
                        {delivery.companyName ??
                          delivery.leadName ??
                          "Sem nome"}
                      </p>
                    </div>

                    <div>
                      <DispatchStatusBadge status={delivery.status} />
                    </div>

                    <p className="app-text">
                      {delivery.attemptCount}/{delivery.maxAttempts}
                    </p>

                    <div className="min-w-0">
                      <p className="app-text truncate">
                        {delivery.lastError ?? delivery.smtpResponse ?? "—"}
                      </p>
                      <p className="app-soft mt-1 text-xs">
                        {delivery.status === "sent"
                          ? `Enviado em ${formatDateTime(delivery.sentAt)}`
                          : delivery.status === "failed"
                            ? `Falhou em ${formatDateTime(delivery.failedAt)}`
                            : `Fila em ${formatDateTime(delivery.queuedAt)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="app-card-muted rounded-2xl p-5">
            <h3 className="app-heading font-semibold">Timeline</h3>
            <p className="app-muted mt-1 text-sm">
              Eventos principais do processamento.
            </p>

            <div className="mt-5 space-y-4">
              {campaign.timeline.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div className="app-icon-box flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    {event.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : event.status === "danger" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : event.status === "warning" ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <p className="app-heading text-sm font-semibold">
                      {event.title}
                    </p>
                    <p className="app-muted mt-1 text-sm">
                      {event.description}
                    </p>
                    <p className="app-soft mt-1 text-xs">
                      {formatDateTime(event.occurredAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

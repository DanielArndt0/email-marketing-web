import { Eye, RotateCcw } from "lucide-react";

import type { MonitoredCampaign } from "../types";
import { DispatchStatusBadge } from "./dispatch-status-badge";

type DispatchesListProps = {
  campaigns: MonitoredCampaign[];
  selectedCampaignId?: string | null;
  onSelectCampaign: (campaign: MonitoredCampaign) => void;
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

export function DispatchesList({
  campaigns,
  selectedCampaignId,
  onSelectCampaign,
}: DispatchesListProps) {
  if (campaigns.length === 0) {
    return (
      <section className="app-empty-state rounded-2xl p-10 text-center">
        <h2 className="app-heading text-lg font-semibold">
          Nenhuma campanha monitorada
        </h2>
        <p className="app-muted mt-2 text-sm">
          Ajuste os filtros para visualizar outros registros.
        </p>
      </section>
    );
  }

  return (
    <section className="app-list rounded-2xl">
      <div className="app-list-header px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="app-heading text-lg font-semibold">
              Campanhas monitoradas
            </h2>
            <p className="app-muted mt-1 text-sm">
              Acompanhe volume, entregas, falhas, fila e retry por campanha.
            </p>
          </div>

          <span className="app-badge app-badge-surface px-3 py-1">
            {campaigns.length} campanhas
          </span>
        </div>
      </div>

      <div className="divide-y divide-[var(--app-border-soft)]">
        {campaigns.map((campaign) => {
          const deliveryRate = getDeliveryRate(campaign);
          const isSelected = campaign.id === selectedCampaignId;

          return (
            <article
              key={campaign.id}
              className={[
                "app-list-row grid gap-4 px-5 py-4 xl:grid-cols-[1.4fr_180px_180px_180px_150px]",
                isSelected ? "bg-[var(--app-surface-hover)]" : "",
              ].join(" ")}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="app-heading font-semibold">
                    {campaign.campaignName}
                  </h3>

                  <DispatchStatusBadge status={campaign.status} />
                </div>

                <p className="app-muted mt-1 text-sm">{campaign.subject}</p>

                <p className="app-soft mt-1 text-xs">
                  Remetente: {campaign.smtpSenderName} •{" "}
                  {campaign.smtpFromEmail}
                </p>
              </div>

              <div>
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  Volume
                </p>
                <p className="app-text mt-1 text-sm">
                  {campaign.sentCount}/{campaign.totalRecipients} enviados
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--app-primary)]"
                    style={{ width: `${deliveryRate}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  Falhas
                </p>
                <p className="app-text mt-1 text-sm">
                  {campaign.failedCount} falhas
                </p>
                <p className="app-soft mt-1 text-xs">
                  {campaign.retryingCount} em retry
                </p>
              </div>

              <div>
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  Início
                </p>
                <p className="app-text mt-1 text-sm">
                  {formatDateTime(campaign.startedAt)}
                </p>
              </div>

              <div className="flex items-center justify-start gap-2 xl:justify-end">
                <button
                  type="button"
                  onClick={() => onSelectCampaign(campaign)}
                  className="app-button app-button-muted h-9 px-3 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Detalhes
                </button>

                <button
                  type="button"
                  className="app-button app-button-surface h-9 px-3 text-sm"
                  disabled={campaign.failedCount === 0}
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

import { CheckCircle2, CircleAlert } from "lucide-react";

import type { Campaign } from "../../types";
import {
  getCampaignReadinessRequirements,
  isCampaignReadyForDispatch,
} from "./campaign-status-rules";

type CampaignReadinessChecklistProps = {
  campaign: Campaign;
};

export function CampaignReadinessChecklist({
  campaign,
}: CampaignReadinessChecklistProps) {
  const requirements = getCampaignReadinessRequirements(campaign);
  const isReady = isCampaignReadyForDispatch(campaign);

  return (
    <section className="app-card-muted rounded-2xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="app-heading text-sm font-semibold">
            Checklist de prontidão
          </h3>

          <p className="app-muted mt-1 text-sm">
            Validações necessárias antes de liberar envio ou agendamento.
          </p>
        </div>

        <span
          className={
            isReady
              ? "app-badge app-badge-success px-3 py-1"
              : "app-badge app-badge-warning px-3 py-1"
          }
        >
          {isReady ? "Pronta" : "Pendente"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {requirements.map((requirement) => (
          <div
            key={requirement.key}
            className="app-card-flat flex items-center gap-2 rounded-xl px-3 py-2"
          >
            {requirement.passed ? (
              <CheckCircle2 className="h-4 w-4 text-[var(--app-success-text)]" />
            ) : (
              <CircleAlert className="h-4 w-4 text-[var(--app-warning-text)]" />
            )}

            <span className="app-text text-sm">{requirement.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

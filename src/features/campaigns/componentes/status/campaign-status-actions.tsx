import {
  CalendarClock,
  FileBarChart,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";

import type { Campaign } from "../../types";
import {
  actionRequiresReadiness,
  campaignActionLabels,
  campaignActionsByStatus,
  type CampaignAction,
  isCampaignReadyForDispatch,
} from "./campaign-status-rules";

type CampaignStatusActionsProps = {
  campaign: Campaign;
  isPending?: boolean;

  onSendNow: (campaign: Campaign) => void;
  onSchedule: (campaign: Campaign) => void;
  onPause: (campaign: Campaign) => void;
  onResume: (campaign: Campaign) => void;
  onCancel: (campaign: Campaign) => void;
  onRetry: (campaign: Campaign) => void;
  onViewReport?: (campaign: Campaign) => void;
};

const actionIcons: Record<CampaignAction, React.ElementType> = {
  send_now: Send,
  schedule_campaign: CalendarClock,
  pause_campaign: PauseCircle,
  resume_campaign: PlayCircle,
  retry_campaign: RotateCcw,
  cancel_campaign: XCircle,
  view_report: FileBarChart,
};

function getActionVariant(action: CampaignAction) {
  if (
    action === "send_now" ||
    action === "retry_campaign" ||
    action === "resume_campaign"
  ) {
    return "app-button-primary";
  }

  if (action === "cancel_campaign") {
    return "app-button-danger";
  }

  return "app-button-muted";
}

export function CampaignStatusActions({
  campaign,
  isPending = false,
  onSendNow,
  onSchedule,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onViewReport,
}: CampaignStatusActionsProps) {
  const actions = campaignActionsByStatus[campaign.status];
  const isReady = isCampaignReadyForDispatch(campaign);

  if (campaign.status === "completed") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="app-muted text-sm">Campanha finalizada.</span>

        {onViewReport ? (
          <button
            type="button"
            className="app-button app-button-muted h-9 px-3 text-sm"
            onClick={() => onViewReport(campaign)}
          >
            <FileBarChart className="h-4 w-4" />
            Ver relatório
          </button>
        ) : null}
      </div>
    );
  }

  if (campaign.status === "canceled") {
    return <p className="app-muted text-sm">Campanha cancelada.</p>;
  }

  function handleAction(action: CampaignAction) {
    switch (action) {
      case "send_now":
        onSendNow(campaign);
        break;
      case "schedule_campaign":
        onSchedule(campaign);
        break;
      case "pause_campaign":
        onPause(campaign);
        break;
      case "resume_campaign":
        onResume(campaign);
        break;
      case "retry_campaign":
        onRetry(campaign);
        break;
      case "cancel_campaign":
        onCancel(campaign);
        break;
      case "view_report":
        onViewReport?.(campaign);
        break;
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => {
        const Icon = actionIcons[action];
        const disabled =
          isPending || (actionRequiresReadiness(action) && !isReady);

        return (
          <button
            key={action}
            type="button"
            className={`app-button ${getActionVariant(action)} h-9 px-3 text-sm`}
            onClick={() => handleAction(action)}
            disabled={disabled}
            title={
              disabled && actionRequiresReadiness(action)
                ? "Complete a checklist antes de continuar."
                : undefined
            }
          >
            <Icon className="h-4 w-4" />
            {campaignActionLabels[action]}
          </button>
        );
      })}
    </div>
  );
}

import type { CampaignStatus } from "../../types";
import { campaignStatusLabels } from "./campaign-status-rules";

const statusClasses: Record<CampaignStatus, string> = {
  draft: "app-badge app-badge-muted",
  ready: "app-badge app-badge-info",
  scheduled: "app-badge app-badge-info",
  running: "app-badge app-badge-warning",
  paused: "app-badge app-badge-soft",
  failed: "app-badge app-badge-danger",
  completed: "app-badge app-badge-success",
  canceled: "app-badge app-badge-soft",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`${statusClasses[status]} px-3 py-1`}>
      {campaignStatusLabels[status]}
    </span>
  );
}

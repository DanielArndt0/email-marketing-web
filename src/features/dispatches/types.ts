export type DispatchStatus =
  | "queued"
  | "processing"
  | "sent"
  | "failed"
  | "retrying"
  | "canceled";

export type EmailDelivery = {
  id: string;
  recipientEmail: string;
  leadName?: string | null;
  companyName?: string | null;
  status: DispatchStatus;
  attemptCount: number;
  maxAttempts: number;
  queuedAt: string;
  sentAt?: string | null;
  failedAt?: string | null;
  lastError?: string | null;
  smtpResponse?: string | null;
  providerMessageId?: string | null;
};

export type DispatchTimelineEvent = {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  status: "info" | "success" | "warning" | "danger";
};

export type MonitoredCampaign = {
  id: string;
  campaignName: string;
  subject: string;
  status: DispatchStatus;
  provider: string;
  smtpSenderName: string;
  smtpFromEmail: string;
  startedAt: string;
  finishedAt?: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  queuedCount: number;
  retryingCount: number;
  maxAttempts: number;
  deliveries: EmailDelivery[];
  timeline: DispatchTimelineEvent[];
};

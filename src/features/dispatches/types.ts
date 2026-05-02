export type DispatchStatus =
  | "queued"
  | "processing"
  | "sent"
  | "failed"
  | "retrying"
  | "canceled";

export type EmailDispatch = {
  id: string;
  campaignName: string;
  recipientEmail: string;
  subject: string;
  status: DispatchStatus;
  provider: string;
  attemptCount: number;
  maxAttempts: number;
  queuedAt: string;
  sentAt?: string | null;
  failedAt?: string | null;
  lastError?: string | null;
};

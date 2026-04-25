export type EmailDispatchStatus =
  | "pending"
  | "processing"
  | "sent"
  | "error"
  | "cancelled";

export type EmailDispatch = {
  id: string;
  campaignId: string;
  contactId?: string;
  to: string;
  status: EmailDispatchStatus;
  error?: string | null;
  providerMessageId?: string | null;
  renderedHtml?: string | null;
  renderedText?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

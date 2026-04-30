import { z } from "zod";

export const campaignStatuses = [
  "draft",
  "ready",
  "scheduled",
  "running",
  "paused",
  "completed",
  "canceled",
  "failed",
] as const;

export const campaignFormSchema = z.object({
  name: z.string().min(1, "Informe o nome da campanha."),
  goal: z.string().optional().default(""),
  subject: z.string().optional().default(""),
  status: z.enum([
    "draft",
    "ready",
    "scheduled",
    "running",
    "paused",
    "completed",
    "canceled",
    "failed",
  ]),
  templateId: z.string().optional().default(""),
  audienceId: z.string().optional().default(""),
  smtpSenderId: z.string().optional().default(""),
  scheduleAt: z.string().optional().default(""),
  templateVariableMappings: z.record(z.string(), z.any()).default({}),
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export function toOptionalString(value?: string | null) {
  const normalized = value?.trim();

  return normalized || undefined;
}

export function toApiDateTime(value?: string | null) {
  if (!value?.trim()) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function toDateTimeLocalValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

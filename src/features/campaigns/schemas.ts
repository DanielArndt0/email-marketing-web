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
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres."),
  goal: z.string().optional(),
  subject: z.string().optional(),
  status: z.enum(campaignStatuses),
  templateId: z.string().optional(),
  audienceId: z.string().optional(),
  scheduleAt: z.string().optional(),
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export function toNullableString(value?: string | null) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
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

import type { CreateCampaignInput, UpdateCampaignInput } from "../../../types";
import type { CampaignFormValues } from "../campaign-form.types";

function emptyToUndefined(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeScheduleAt(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export function buildCreateCampaignPayload(
  values: CampaignFormValues,
): CreateCampaignInput {
  return {
    name: values.name.trim(),
    goal: emptyToUndefined(values.goal),
    subject: emptyToUndefined(values.subject),
    status: values.status,
    templateId: emptyToUndefined(values.templateId),
    audienceId: emptyToUndefined(values.audienceId),
    smtpSenderId: emptyToUndefined(values.smtpSenderId),
    scheduleAt: normalizeScheduleAt(values.scheduleAt),
    templateVariableMappings: values.templateVariableMappings ?? {},
  };
}

export function buildUpdateCampaignPayload(
  values: CampaignFormValues,
): UpdateCampaignInput {
  return buildCreateCampaignPayload(values);
}

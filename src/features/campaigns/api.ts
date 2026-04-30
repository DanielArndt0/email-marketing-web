import { endpoints } from "@/lib/api/endpoints";
import { deleteJson, getJson, postJson } from "@/lib/api/http";
import { httpClient } from "@/lib/api/http-client";

import type {
  Campaign,
  CampaignListResponse,
  CreateCampaignInput,
  DispatchCampaignBatchInput,
  DispatchCampaignBatchResult,
  DispatchCampaignInput,
  DispatchCampaignResult,
  TemplateVariableMappings,
  UpdateCampaignInput,
} from "./types";

type CampaignApiRecord = Campaign & {
  template_id?: string | null;
  audience_id?: string | null;
  smtp_sender_id?: string | null;
  template_variable_mappings?: unknown;
  templateVariableMappings?: unknown;
};

function normalizeTemplateVariableMappings(
  value: unknown,
): TemplateVariableMappings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(
    value as Record<string, unknown>,
  ).reduce<TemplateVariableMappings>((mappings, [variable, mapping]) => {
    if (typeof mapping === "string" && mapping.trim()) {
      mappings[variable] = {
        source: "lead",
        path: mapping.trim(),
      };

      return mappings;
    }

    if (mapping && typeof mapping === "object" && !Array.isArray(mapping)) {
      const record = mapping as Record<string, unknown>;

      const source = record.source === "static" ? "static" : "lead";
      const path = typeof record.path === "string" ? record.path.trim() : "";
      const value = typeof record.value === "string" ? record.value : "";
      const legacyField =
        typeof record.field === "string" ? record.field.trim() : "";

      if (source === "static") {
        mappings[variable] = {
          source: "static",
          value,
        };

        return mappings;
      }

      if (path) {
        mappings[variable] = {
          source: "lead",
          path,
        };

        return mappings;
      }

      if (legacyField) {
        mappings[variable] = {
          source: "lead",
          path: legacyField,
        };
      }
    }

    return mappings;
  }, {});
}

function normalizeCampaign(campaign: CampaignApiRecord): Campaign {
  const {
    template_id: templateIdSnakeCase,
    audience_id: audienceIdSnakeCase,
    smtp_sender_id: smtpSenderIdSnakeCase,
    template_variable_mappings: snakeCaseMappings,
    templateVariableMappings: camelCaseMappings,
    ...rest
  } = campaign;

  return {
    ...rest,
    templateId: rest.templateId ?? templateIdSnakeCase ?? null,
    audienceId: rest.audienceId ?? audienceIdSnakeCase ?? null,
    smtpSenderId: rest.smtpSenderId ?? smtpSenderIdSnakeCase ?? null,
    templateVariableMappings: normalizeTemplateVariableMappings(
      camelCaseMappings ?? snakeCaseMappings,
    ),
  };
}

function normalizeCampaignList(response: CampaignListResponse) {
  const campaigns = Array.isArray(response)
    ? response
    : (response.items ?? response.data ?? []);

  return campaigns.map((campaign) =>
    normalizeCampaign(campaign as CampaignApiRecord),
  );
}

export async function listCampaigns() {
  const response = await getJson<CampaignListResponse>(
    endpoints.campaigns.list,
  );

  return normalizeCampaignList(response);
}

export async function getCampaign(id: string) {
  const response = await getJson<CampaignApiRecord>(
    endpoints.campaigns.byId(id),
  );

  return normalizeCampaign(response);
}

export async function createCampaign(input: CreateCampaignInput) {
  const response = await postJson<CampaignApiRecord, CreateCampaignInput>(
    endpoints.campaigns.create,
    input,
  );

  return normalizeCampaign(response);
}

export async function updateCampaign(id: string, input: UpdateCampaignInput) {
  const response = await httpClient.patch<CampaignApiRecord>(
    endpoints.campaigns.byId(id),
    input,
  );

  return normalizeCampaign(response.data);
}

export async function deleteCampaign(id: string) {
  return deleteJson<void>(endpoints.campaigns.byId(id));
}

export async function dispatchCampaign(id: string) {
  return postJson<DispatchCampaignResult, DispatchCampaignInput>(
    endpoints.campaigns.dispatch(id),
    {},
  );
}

export async function dispatchCampaignBatch(campaignIds: string[]) {
  return postJson<DispatchCampaignBatchResult, DispatchCampaignBatchInput>(
    endpoints.campaigns.dispatchBatch,
    {
      campaignIds,
    },
  );
}

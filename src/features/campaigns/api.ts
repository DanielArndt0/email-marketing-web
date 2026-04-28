import { endpoints } from "@/lib/api/endpoints";
import { deleteJson, getJson, postJson } from "@/lib/api/http";
import { httpClient } from "@/lib/api/http-client";

import type {
  Campaign,
  CampaignListResponse,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "./types";

type CampaignApiRecord = Campaign & {
  template_variable_mappings?: unknown;
  templateVariableMappings?: unknown;
};

function normalizeTemplateVariableMappings(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, string>
  >((mappings, [variable, field]) => {
    if (typeof field === "string" && field.trim()) {
      mappings[variable] = field.trim();
    }

    return mappings;
  }, {});
}

function normalizeCampaign(campaign: CampaignApiRecord): Campaign {
  const {
    template_variable_mappings: snakeCaseMappings,
    templateVariableMappings: camelCaseMappings,
    ...rest
  } = campaign;

  return {
    ...rest,
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

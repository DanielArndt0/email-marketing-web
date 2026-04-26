import { endpoints } from "@/lib/api/endpoints";
import { deleteJson, getJson, postJson } from "@/lib/api/http";
import { httpClient } from "@/lib/api/http-client";

import type {
  Campaign,
  CampaignListResponse,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "./types";

function normalizeCampaignList(response: CampaignListResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? response.data ?? [];
}

export async function listCampaigns() {
  const response = await getJson<CampaignListResponse>(
    endpoints.campaigns.list,
  );

  return normalizeCampaignList(response);
}

export async function getCampaign(id: string) {
  return getJson<Campaign>(endpoints.campaigns.byId(id));
}

export async function createCampaign(input: CreateCampaignInput) {
  return postJson<Campaign, CreateCampaignInput>(
    endpoints.campaigns.create,
    input,
  );
}

export async function updateCampaign(id: string, input: UpdateCampaignInput) {
  const response = await httpClient.patch<Campaign>(
    endpoints.campaigns.byId(id),
    input,
  );

  return response.data;
}

export async function deleteCampaign(id: string) {
  return deleteJson<void>(endpoints.campaigns.byId(id));
}

"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { CampaignForm } from "./campaign-form";
import { CampaignList } from "./campaign-list";
import { CampaignPreview } from "./campaign-preview";
import { useCampaigns } from "../hooks";
import type { Campaign } from "../types";

export function CampaignsPageClient() {
  const campaignsQuery = useCampaigns();

  const [formCampaign, setFormCampaign] = useState<Campaign | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const campaigns = useMemo(
    () => campaignsQuery.data ?? [],
    [campaignsQuery.data],
  );

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-8">
      <PageHeader
        eyebrow="Campaigns"
        title="Campanhas"
        description="Gestão de campanhas com vínculo de template, audience e preparação para execução futura."
        actions={
          <Button
            onClick={() => {
              setIsCreating(true);
              setFormCampaign(null);
              setPreviewCampaign(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova campanha
          </Button>
        }
      />

      {isCreating || formCampaign ? (
        <CampaignForm
          campaign={formCampaign}
          onCancel={() => {
            setIsCreating(false);
            setFormCampaign(null);
          }}
          onSaved={() => {
            setIsCreating(false);
            setFormCampaign(null);
          }}
        />
      ) : previewCampaign ? (
        <CampaignPreview
          campaign={previewCampaign}
          onClose={() => setPreviewCampaign(null)}
        />
      ) : campaignsQuery.isLoading ? (
        <EmptyState
          title="Carregando campanhas..."
          description="Consultando a Control API."
        />
      ) : campaignsQuery.isError ? (
        <EmptyState
          title="Não foi possível carregar as campanhas"
          description="Verifique se a Control API está rodando e se os endpoints estão corretos."
        />
      ) : (
        <CampaignList
          campaigns={campaigns}
          onPreview={(campaign) => {
            setPreviewCampaign(campaign);
            setIsCreating(false);
            setFormCampaign(null);
          }}
          onEdit={(campaign) => {
            setFormCampaign(campaign);
            setIsCreating(false);
            setPreviewCampaign(null);
          }}
        />
      )}
    </div>
  );
}

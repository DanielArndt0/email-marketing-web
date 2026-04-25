"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { AudienceForm } from "./audience-form";
import { AudienceList } from "./audience-list";
import { AudiencePreview } from "./audience-preview";
import { useAudiences } from "../hooks";
import type { Audience } from "../types";

export function AudiencesPageClient() {
  const audiencesQuery = useAudiences();

  const [formAudience, setFormAudience] = useState<Audience | null>(null);
  const [previewAudience, setPreviewAudience] = useState<Audience | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const audiences = useMemo(
    () => audiencesQuery.data ?? [],
    [audiencesQuery.data],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Audiences"
        title="Audiências"
        description="Crie públicos reutilizáveis a partir da CNPJ API, CSV import ou lista manual."
        actions={
          <Button
            onClick={() => {
              setIsCreating(true);
              setFormAudience(null);
              setPreviewAudience(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova audience
          </Button>
        }
      />

      {isCreating || formAudience ? (
        <AudienceForm
          audience={formAudience}
          onCancel={() => {
            setIsCreating(false);
            setFormAudience(null);
          }}
          onSaved={() => {
            setIsCreating(false);
            setFormAudience(null);
          }}
        />
      ) : previewAudience ? (
        <AudiencePreview
          audience={previewAudience}
          onClose={() => setPreviewAudience(null)}
        />
      ) : audiencesQuery.isLoading ? (
        <EmptyState
          title="Carregando audiences..."
          description="Consultando a Control API."
        />
      ) : audiencesQuery.isError ? (
        <EmptyState
          title="Não foi possível carregar as audiences"
          description="Verifique se a Control API está rodando e se os endpoints estão corretos."
        />
      ) : (
        <AudienceList
          audiences={audiences}
          onPreview={(audience) => {
            setPreviewAudience(audience);
            setIsCreating(false);
            setFormAudience(null);
          }}
          onEdit={(audience) => {
            setFormAudience(audience);
            setIsCreating(false);
            setPreviewAudience(null);
          }}
        />
      )}
    </div>
  );
}

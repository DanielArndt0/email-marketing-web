"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { TemplateForm } from "./template-form";
import { TemplateList } from "./template-list";
import { TemplateViewer } from "./template-viewer";
import { useTemplates } from "../hooks";
import type { EmailTemplate } from "../types";

export function TemplatesPageClient() {
  const templatesQuery = useTemplates();

  const [formTemplate, setFormTemplate] = useState<EmailTemplate | null>(null);
  const [viewTemplate, setViewTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const templates = useMemo(
    () => templatesQuery.data ?? [],
    [templatesQuery.data],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Templates"
        title="Templates de e-mail"
        description="Crie e gerencie conteúdos HTML/texto. Use variáveis como {{name}}, {{company}} e {{link}} para personalização futura."
        actions={
          <Button
            onClick={() => {
              setIsCreating(true);
              setFormTemplate(null);
              setViewTemplate(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo template
          </Button>
        }
      />

      {isCreating || formTemplate ? (
        <TemplateForm
          template={formTemplate}
          onCancel={() => {
            setIsCreating(false);
            setFormTemplate(null);
          }}
          onSaved={() => {
            setIsCreating(false);
            setFormTemplate(null);
          }}
        />
      ) : viewTemplate ? (
        <TemplateViewer
          template={viewTemplate}
          onClose={() => setViewTemplate(null)}
        />
      ) : templatesQuery.isLoading ? (
        <EmptyState
          title="Carregando templates..."
          description="Consultando a Control API."
        />
      ) : templatesQuery.isError ? (
        <EmptyState
          title="Não foi possível carregar os templates"
          description="Verifique se a Control API está rodando e se o endpoint de templates está correto."
        />
      ) : (
        <TemplateList
          templates={templates}
          onView={(template) => {
            setViewTemplate(template);
            setIsCreating(false);
            setFormTemplate(null);
          }}
          onEdit={(template) => {
            setFormTemplate(template);
            setIsCreating(false);
            setViewTemplate(null);
          }}
        />
      )}
    </div>
  );
}

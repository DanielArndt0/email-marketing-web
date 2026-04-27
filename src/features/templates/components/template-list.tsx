"use client";

import { AlertTriangle, Eye, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { useDeleteTemplate } from "../hooks";
import type { EmailTemplate } from "../types";

function getTemplateVariableKey(variable: unknown) {
  if (typeof variable === "string") {
    return variable;
  }

  if (variable && typeof variable === "object") {
    const record = variable as Record<string, unknown>;

    if (typeof record.key === "string") {
      return record.key;
    }

    if (typeof record.name === "string") {
      return record.name;
    }
  }

  return "";
}

function getTemplateVariables(template: EmailTemplate) {
  if (!Array.isArray(template.variables)) {
    return [];
  }

  return template.variables.map(getTemplateVariableKey).filter(Boolean);
}

function getErrorMessage(error: unknown) {
  let message = "Não foi possível excluir este template.";
  let campaignsCount: number | undefined;

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    const payload = record.payload;

    if (payload && typeof payload === "object") {
      const payloadRecord = payload as Record<string, unknown>;

      if (typeof payloadRecord.message === "string") {
        message = payloadRecord.message;
      } else if (typeof payloadRecord.error === "string") {
        message = payloadRecord.error;
      }

      if (typeof payloadRecord.campaignsCount === "number") {
        campaignsCount = payloadRecord.campaignsCount;
      }
    } else if (typeof record.message === "string") {
      message = record.message;
    }
  }

  if (
    message.includes("campaigns_template_id_fkey") ||
    message.includes("foreign key constraint")
  ) {
    message =
      "O template não pode ser excluído porque já está vinculado a uma ou mais campanhas.";
  }

  if (typeof campaignsCount === "number") {
    return `${message.replace(/\.$/, "")}. ${campaignsCount} ${
      campaignsCount === 1 ? "campanha vinculada" : "campanhas vinculadas"
    }.`;
  }

  return message;
}

export function TemplateList({
  templates,
  onEdit,
  onPreview,
}: {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onPreview: (template: EmailTemplate) => void;
}) {
  const deleteTemplate = useDeleteTemplate();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteTemplate(id: string) {
    setDeleteError(null);

    try {
      await deleteTemplate.mutateAsync(id);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    }
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        title="Nenhum template cadastrado"
        description="Crie seu primeiro template para começar a montar campanhas."
      />
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Templates cadastrados
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {templates.length}{" "}
          {templates.length === 1
            ? "template cadastrado"
            : "templates cadastrados"}
        </p>
      </div>

      {deleteError ? (
        <div className="mx-6 mt-5 flex items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

            <p>{deleteError}</p>
          </div>

          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="rounded-lg p-1 text-amber-700 transition hover:bg-amber-100"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="divide-y divide-slate-100">
        {templates.map((template) => {
          const variables = getTemplateVariables(template);

          return (
            <article
              key={template.id}
              className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/60 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-950">
                  {template.name}
                </h3>

                {template.subject ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {template.subject}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">
                    Sem assunto informado
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {variables.length > 0 ? (
                    variables.map((variable) => (
                      <Badge key={variable}>{"{{" + variable + "}}"}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">
                      Nenhuma variável declarada
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {variables.length}{" "}
                  {variables.length === 1
                    ? "variável declarada"
                    : "variáveis declaradas"}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onPreview(template)}
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(template)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                  disabled={deleteTemplate.isPending}
                  title="Excluir template"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

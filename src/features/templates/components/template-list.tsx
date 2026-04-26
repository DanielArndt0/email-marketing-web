"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import { useDeleteTemplate } from "../hooks";
import type { EmailTemplate } from "../types";
import { extractUsedVariablesFromContent } from "./template-variable-highlight";

function getTemplateVariableKeys(template: EmailTemplate) {
  return (
    template.variables
      ?.map((variable) => variable.key)
      .filter((key): key is string => Boolean(key?.trim())) ?? []
  );
}

export function TemplateList({
  templates,
  onView,
  onEdit,
}: {
  templates: EmailTemplate[];
  onView: (template: EmailTemplate) => void;
  onEdit: (template: EmailTemplate) => void;
}) {
  const deleteTemplate = useDeleteTemplate();

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
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
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
      </div>

      <div className="divide-y divide-slate-100">
        {templates.map((template) => {
          const declaredVariables = getTemplateVariableKeys(template);

          const usedVariables = extractUsedVariablesFromContent(
            `${template.htmlContent ?? ""}\n${template.textContent ?? ""}`,
          );

          const variablesToDisplay =
            usedVariables.length > 0 ? usedVariables : declaredVariables;

          const visibleVariables = variablesToDisplay.slice(0, 4);

          const hiddenVariablesCount = Math.max(
            variablesToDisplay.length - visibleVariables.length,
            0,
          );

          const undeclaredVariables = usedVariables.filter(
            (variable) => !declaredVariables.includes(variable),
          );

          const unusedDeclaredVariables = declaredVariables.filter(
            (variable) => !usedVariables.includes(variable),
          );

          return (
            <article
              key={template.id}
              className="p-5 transition hover:bg-slate-50/70"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-950">
                    {template.name}
                  </h3>

                  {template.subject ? (
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {template.subject}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">
                      Sem assunto informado
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {visibleVariables.map((variable) => {
                      const isDeclared = declaredVariables.includes(variable);

                      return (
                        <Badge
                          key={variable}
                          title={
                            isDeclared
                              ? "Variável declarada"
                              : "Variável usada, mas não declarada"
                          }
                          className={
                            isDeclared
                              ? "bg-slate-50 text-slate-600"
                              : "border-rose-200 bg-rose-50 text-rose-600"
                          }
                        >
                          {"{{" + variable + "}}"}
                        </Badge>
                      );
                    })}

                    {hiddenVariablesCount > 0 ? (
                      <Badge className="bg-slate-100 text-slate-500">
                        +{hiddenVariablesCount} variáveis
                      </Badge>
                    ) : null}

                    {variablesToDisplay.length === 0 ? (
                      <span className="text-xs text-slate-400">
                        Nenhuma variável identificada
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>
                      {usedVariables.length}{" "}
                      {usedVariables.length === 1 ? "usada" : "usadas"}
                    </span>

                    <span>•</span>

                    <span>
                      {declaredVariables.length}{" "}
                      {declaredVariables.length === 1
                        ? "declarada"
                        : "declaradas"}
                    </span>

                    {undeclaredVariables.length > 0 ? (
                      <>
                        <span>•</span>
                        <span className="font-medium text-rose-600">
                          {undeclaredVariables.length}{" "}
                          {undeclaredVariables.length === 1
                            ? "não declarada"
                            : "não declaradas"}
                        </span>
                      </>
                    ) : null}

                    {unusedDeclaredVariables.length > 0 ? (
                      <>
                        <span>•</span>
                        <span className="font-medium text-amber-600">
                          {unusedDeclaredVariables.length}{" "}
                          {unusedDeclaredVariables.length === 1
                            ? "declarada não usada"
                            : "declaradas não usadas"}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onView(template)}
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
                    onClick={() => deleteTemplate.mutate(template.id)}
                    disabled={deleteTemplate.isPending}
                    title="Excluir template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

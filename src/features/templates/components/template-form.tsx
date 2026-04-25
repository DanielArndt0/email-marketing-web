"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Code2, Eye, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCreateTemplate, useUpdateTemplate } from "../hooks";
import {
  parseVariables,
  templateFormSchema,
  type TemplateFormValues,
} from "../schemas";
import type { EmailTemplate } from "../types";
import {
  buildHighlightedHtmlPreview,
  extractDeclaredVariables,
  renderHighlightedVariables,
} from "./template-variable-highlight";

type PreviewMode = "visual" | "code";

export function TemplateForm({
  template,
  onCancel,
  onSaved,
}: {
  template: EmailTemplate | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [previewMode, setPreviewMode] = useState<PreviewMode>("visual");

  const isEditing = Boolean(template);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name ?? "",
      subject: template?.subject ?? "",
      html: template?.htmlContent ?? "",
      text: template?.textContent ?? "",
      variables: template?.variables?.join(", ") ?? "name, company, link",
    },
  });

  const htmlPreview = useWatch({
    control: form.control,
    name: "html",
  });

  const textPreview = useWatch({
    control: form.control,
    name: "text",
  });

  const variablesValue = useWatch({
    control: form.control,
    name: "variables",
  });

  const declaredVariables = useMemo(
    () => extractDeclaredVariables(variablesValue),
    [variablesValue],
  );

  const highlightedHtmlPreview = useMemo(
    () => buildHighlightedHtmlPreview(htmlPreview, declaredVariables),
    [htmlPreview, declaredVariables],
  );

  async function onSubmit(values: TemplateFormValues) {
    const htmlContent = values.html?.trim();
    const textContent = values.text?.trim();

    const payload = {
      name: values.name.trim(),
      subject: values.subject.trim(),
      ...(htmlContent ? { htmlContent } : {}),
      ...(textContent ? { textContent } : {}),
      variables: parseVariables(values.variables),
    };

    if (template) {
      await updateTemplate.mutateAsync({
        id: template.id,
        input: payload,
      });
    } else {
      await createTemplate.mutateAsync(payload);
    }

    onSaved();
  }

  const isPending = createTemplate.isPending || updateTemplate.isPending;
  const hasHtmlPreview = Boolean(htmlPreview?.trim());

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {isEditing ? "Editar template" : "Novo template"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Mantenha o conteúdo objetivo e padronize variáveis com chaves
            duplas.
          </p>
        </div>

        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField label="Nome" error={form.formState.errors.name?.message}>
              <Input
                placeholder="Ex: Oferta Grupo Expand"
                {...form.register("name")}
              />
            </FormField>

            <FormField
              label="Assunto"
              error={form.formState.errors.subject?.message}
            >
              <Input
                placeholder="Ex: Uma alternativa para expandir sua empresa"
                {...form.register("subject")}
              />
            </FormField>
          </div>

          <FormField label="Variáveis permitidas">
            <Input
              placeholder="name, company, link"
              {...form.register("variables")}
            />
          </FormField>

          <p className="text-xs text-slate-400">
            Exemplo de uso no template: Olá {"{{name}}"}, temos uma solução para{" "}
            {"{{company}}"}.
          </p>

          <FormField label="HTML" error={form.formState.errors.html?.message}>
            <Textarea
              className="min-h-[360px] font-mono text-xs leading-5"
              placeholder="<h1>Olá {{name}}</h1><p>Veja nossa oferta: {{link}}</p>"
              {...form.register("html")}
            />
          </FormField>

          <FormField
            label="Texto puro"
            error={form.formState.errors.text?.message}
          >
            <Textarea
              className="min-h-32"
              placeholder="Olá {{name}}, veja nossa oferta: {{link}}"
              {...form.register("text")}
            />
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar template"}
            </Button>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:sticky xl:top-6 xl:self-start">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Preview
              </p>

              <h3 className="mt-2 text-base font-semibold text-slate-950">
                HTML renderizado
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Variáveis declaradas ficam destacadas. Variáveis não declaradas
                ficam em vermelho.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={previewMode === "visual" ? "default" : "secondary"}
                onClick={() => setPreviewMode("visual")}
              >
                <Eye className="h-4 w-4" />
                Visual
              </Button>

              <Button
                type="button"
                size="sm"
                variant={previewMode === "code" ? "default" : "secondary"}
                onClick={() => setPreviewMode("code")}
              >
                <Code2 className="h-4 w-4" />
                Código
              </Button>
            </div>
          </div>

          {previewMode === "visual" ? (
            hasHtmlPreview ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <iframe
                  title="Preview visual do template"
                  srcDoc={highlightedHtmlPreview}
                  sandbox=""
                  className="h-[640px] w-full bg-white"
                />
              </div>
            ) : (
              <div className="grid h-[320px] place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                Informe um conteúdo HTML para visualizar o template renderizado.
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">
                  HTML
                </h4>

                <pre className="h-[420px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                  {htmlPreview?.trim()
                    ? renderHighlightedVariables(htmlPreview, declaredVariables)
                    : "Sem conteúdo HTML."}
                </pre>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">
                  Texto puro
                </h4>

                <div className="min-h-28 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                  {textPreview?.trim()
                    ? renderHighlightedVariables(textPreview, declaredVariables)
                    : "Sem conteúdo em texto puro."}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </form>
  );
}

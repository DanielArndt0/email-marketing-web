"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Code2, Eye, Save, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
type ContentMode = "html" | "text";

type TemplateRecord = EmailTemplate & {
  htmlContent?: string | null;
  textContent?: string | null;
};

function getTemplateHtml(template: TemplateRecord | null) {
  return template?.htmlContent ?? "";
}

function getTemplateText(template: TemplateRecord | null) {
  return template?.textContent ?? "";
}

function getTemplateVariablesText(template: TemplateRecord | null) {
  if (!Array.isArray(template?.variables)) {
    return "";
  }

  return template.variables
    .map((variable) => {
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
    })
    .filter(Boolean)
    .join(", ");
}

function getInitialContentMode(template: TemplateRecord | null): ContentMode {
  const html = getTemplateHtml(template);
  const text = getTemplateText(template);

  if (!html?.trim() && text?.trim()) {
    return "text";
  }

  return "html";
}

function getDefaultValues(template: TemplateRecord | null): TemplateFormValues {
  return {
    name: template?.name ?? "",
    subject: template?.subject ?? "",
    html: getTemplateHtml(template),
    text: getTemplateText(template),
    variables: getTemplateVariablesText(template),
  };
}

export function TemplateForm({
  template,
  onCancel,
  onSaved,
}: {
  template: EmailTemplate | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const normalizedTemplate = template as TemplateRecord | null;

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [previewMode, setPreviewMode] = useState<PreviewMode>("visual");
  const [contentMode, setContentMode] = useState<ContentMode>(
    getInitialContentMode(normalizedTemplate),
  );
  const [htmlFileName, setHtmlFileName] = useState("");

  const isEditing = Boolean(template);

  const defaultValues = useMemo(
    () => getDefaultValues(normalizedTemplate),
    [normalizedTemplate],
  );

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    setContentMode(getInitialContentMode(normalizedTemplate));
    setHtmlFileName("");
  }, [defaultValues, form, normalizedTemplate]);

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

  async function handleHtmlFileChange(file?: File) {
    if (!file) {
      return;
    }

    const content = await file.text();

    setHtmlFileName(file.name);
    setContentMode("html");

    form.setValue("html", content, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: TemplateFormValues) {
    const htmlContent = values.html?.trim() ?? "";
    const textContent = values.text?.trim() ?? "";

    if (contentMode === "html" && !htmlContent) {
      form.setError("html", {
        type: "custom",
        message: "Informe o conteúdo HTML ou importe um arquivo .html.",
      });
      return;
    }

    if (contentMode === "text" && !textContent) {
      form.setError("text", {
        type: "custom",
        message: "Informe o conteúdo em texto puro.",
      });
      return;
    }

    const payload = {
      name: values.name.trim(),
      subject: values.subject.trim(),
      variables: parseVariables(values.variables),

      ...(contentMode === "html" ? { htmlContent } : { textContent }),
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
  const hasTextPreview = Boolean(textPreview?.trim());

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5"
    >
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">
                Dados do template
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Defina as informações principais e as variáveis permitidas.
              </p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <FormField
                label="Nome"
                error={form.formState.errors.name?.message}
              >
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

            <div className="mt-4">
              <FormField label="Variáveis permitidas">
                <Input
                  placeholder="Ex: name, company, link"
                  {...form.register("variables")}
                />
              </FormField>

              <p className="mt-2 text-xs text-slate-400">
                Exemplo de uso no template: Olá {"{{name}}"}, temos uma solução
                para {"{{company}}"}.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">
                  Conteúdo do template
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Escolha se este template será salvo como HTML ou texto puro.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setContentMode("html")}
                  className={
                    contentMode === "html"
                      ? "inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm"
                      : "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-slate-600 transition hover:bg-white"
                  }
                >
                  <Code2 className="h-4 w-4" />
                  HTML
                </button>

                <button
                  type="button"
                  onClick={() => setContentMode("text")}
                  className={
                    contentMode === "text"
                      ? "inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm"
                      : "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-slate-600 transition hover:bg-white"
                  }
                >
                  Texto puro
                </button>
              </div>
            </div>

            {contentMode === "html" ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Editor HTML
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Escreva o HTML manualmente ou importe um arquivo{" "}
                      <span className="font-mono">.html</span>.
                    </p>
                  </div>

                  <label className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
                    <Upload className="h-4 w-4" />
                    Importar HTML
                    <input
                      type="file"
                      accept=".html,.htm,text/html"
                      className="sr-only"
                      onChange={(event) =>
                        handleHtmlFileChange(event.target.files?.[0])
                      }
                    />
                  </label>
                </div>

                {htmlFileName ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Arquivo importado:{" "}
                    <span className="font-medium text-slate-700">
                      {htmlFileName}
                    </span>
                  </p>
                ) : null}

                <FormField
                  label="HTML"
                  error={form.formState.errors.html?.message}
                >
                  <Textarea
                    wrap="off"
                    className="h-[360px] max-h-[360px] resize-none overflow-auto rounded-xl bg-slate-50 font-mono text-sm leading-6 text-slate-800"
                    placeholder="<h1>Olá {{name}}</h1><p>Veja nossa oferta: {{link}}</p>"
                    {...form.register("html")}
                  />
                </FormField>
              </div>
            ) : (
              <FormField
                label="Texto puro"
                error={form.formState.errors.text?.message}
              >
                <Textarea
                  className="h-[360px] max-h-[360px] resize-none overflow-auto rounded-xl bg-slate-50 text-sm leading-6 text-slate-800"
                  placeholder="Olá {{name}}, veja nossa oferta: {{link}}"
                  {...form.register("text")}
                />
              </FormField>
            )}
          </section>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar template"}
            </Button>
          </div>
        </div>

        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:sticky xl:top-6 xl:self-start">
          <div className="mb-4 flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Preview
              </p>

              <h3 className="mt-2 text-base font-semibold text-slate-950">
                {contentMode === "html" ? "HTML renderizado" : "Texto puro"}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Variáveis declaradas ficam destacadas. Variáveis não declaradas
                ficam em vermelho.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
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

          {contentMode === "html" ? (
            previewMode === "visual" ? (
              hasHtmlPreview ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <iframe
                    title="Preview visual do template"
                    srcDoc={highlightedHtmlPreview}
                    sandbox=""
                    className="h-[430px] w-full bg-white"
                  />
                </div>
              ) : (
                <div className="grid h-[430px] place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  Informe um conteúdo HTML para visualizar o template
                  renderizado.
                </div>
              )
            ) : (
              <pre className="h-[430px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                {htmlPreview?.trim()
                  ? renderHighlightedVariables(htmlPreview, declaredVariables)
                  : "Sem conteúdo HTML."}
              </pre>
            )
          ) : previewMode === "visual" ? (
            hasTextPreview ? (
              <div className="h-[430px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
                {renderHighlightedVariables(textPreview, declaredVariables)}
              </div>
            ) : (
              <div className="grid h-[430px] place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                Informe um conteúdo em texto puro para visualizar o preview.
              </div>
            )
          ) : (
            <pre className="h-[430px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {textPreview?.trim()
                ? renderHighlightedVariables(textPreview, declaredVariables)
                : "Sem conteúdo em texto puro."}
            </pre>
          )}
        </aside>
      </div>
    </form>
  );
}

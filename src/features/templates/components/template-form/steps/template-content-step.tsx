import { Code2, Upload } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { TemplateFormValues } from "../../../schemas";
import type { ContentMode } from "../types";

export function TemplateContentStep({
  form,
  contentMode,
  htmlFileName,
  onContentModeChange,
  onHtmlFileChange,
}: {
  form: UseFormReturn<TemplateFormValues>;
  contentMode: ContentMode;
  htmlFileName: string;
  onContentModeChange: (mode: ContentMode) => void;
  onHtmlFileChange: (file?: File) => Promise<void>;
}) {
  return (
    <div className="min-w-0 space-y-4">
      <TemplateMainDataSection form={form} />

      <TemplateContentEditorSection
        form={form}
        contentMode={contentMode}
        htmlFileName={htmlFileName}
        onContentModeChange={onContentModeChange}
        onHtmlFileChange={onHtmlFileChange}
      />
    </div>
  );
}

function TemplateMainDataSection({
  form,
}: {
  form: UseFormReturn<TemplateFormValues>;
}) {
  return (
    <section className="app-card-muted rounded-2xl p-4">
      <div>
        <h3 className="app-heading text-base font-semibold">
          Dados do template
        </h3>

        <p className="app-muted mt-1 text-sm leading-6">
          Defina as informações principais e as variáveis permitidas.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormField label="Nome" error={form.formState.errors.name?.message}>
          <Input
            className="app-input-surface"
            placeholder="Ex: Oferta Grupo Expand"
            {...form.register("name")}
          />
        </FormField>

        <FormField
          label="Assunto"
          error={form.formState.errors.subject?.message}
        >
          <Input
            className="app-input-surface"
            placeholder="Ex: Uma alternativa para expandir sua empresa"
            {...form.register("subject")}
          />
        </FormField>
      </div>

      <div className="mt-4">
        <FormField label="Variáveis permitidas">
          <Input
            className="app-input-surface"
            placeholder="Ex: name, company, link"
            {...form.register("variables")}
          />
        </FormField>

        <p className="app-soft mt-2 text-xs">
          Exemplo de uso no template: Olá {"{{name}}"}, temos uma solução para{" "}
          {"{{company}}"}.
        </p>
      </div>
    </section>
  );
}

function TemplateContentEditorSection({
  form,
  contentMode,
  htmlFileName,
  onContentModeChange,
  onHtmlFileChange,
}: {
  form: UseFormReturn<TemplateFormValues>;
  contentMode: ContentMode;
  htmlFileName: string;
  onContentModeChange: (mode: ContentMode) => void;
  onHtmlFileChange: (file?: File) => Promise<void>;
}) {
  return (
    <section className="app-card-muted rounded-2xl p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="app-heading text-base font-semibold">
            Conteúdo do template
          </h3>

          <p className="app-muted mt-1 text-sm leading-6">
            Escolha se este template será salvo como HTML ou texto puro.
          </p>
        </div>

        <div className="app-segmented">
          <button
            type="button"
            onClick={() => onContentModeChange("html")}
            className={
              contentMode === "html"
                ? "app-segmented-item app-segmented-item-active"
                : "app-segmented-item"
            }
          >
            <Code2 className="h-4 w-4" />
            HTML
          </button>

          <button
            type="button"
            onClick={() => onContentModeChange("text")}
            className={
              contentMode === "text"
                ? "app-segmented-item app-segmented-item-active"
                : "app-segmented-item"
            }
          >
            Texto puro
          </button>
        </div>
      </div>

      {contentMode === "html" ? (
        <TemplateHtmlEditor
          form={form}
          htmlFileName={htmlFileName}
          onHtmlFileChange={onHtmlFileChange}
        />
      ) : (
        <TemplateTextEditor form={form} />
      )}
    </section>
  );
}

function TemplateHtmlEditor({
  form,
  htmlFileName,
  onHtmlFileChange,
}: {
  form: UseFormReturn<TemplateFormValues>;
  htmlFileName: string;
  onHtmlFileChange: (file?: File) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <div className="app-card-flat flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="app-heading text-sm font-medium">Editor HTML</p>

          <p className="app-muted mt-1 text-xs">
            Escreva o HTML manualmente ou importe um arquivo{" "}
            <span className="font-mono">.html</span>.
          </p>
        </div>

        <label className="app-button app-button-surface inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium">
          <Upload className="h-4 w-4" />
          Importar HTML
          <input
            type="file"
            accept=".html,.htm,text/html"
            className="sr-only"
            onChange={(event) => onHtmlFileChange(event.target.files?.[0])}
          />
        </label>
      </div>

      {htmlFileName ? (
        <p className="app-card-flat rounded-xl px-3 py-2 text-xs">
          Arquivo importado:{" "}
          <span className="app-heading font-medium">{htmlFileName}</span>
        </p>
      ) : null}

      <FormField label="HTML" error={form.formState.errors.html?.message}>
        <Textarea
          wrap="off"
          className="app-input-surface h-[360px] max-h-[360px] resize-none overflow-auto rounded-xl font-mono text-sm leading-6"
          placeholder="<h1>Olá {{name}}</h1><p>Veja nossa oferta: {{link}}</p>"
          {...form.register("html")}
        />
      </FormField>
    </div>
  );
}

function TemplateTextEditor({
  form,
}: {
  form: UseFormReturn<TemplateFormValues>;
}) {
  return (
    <FormField label="Texto puro" error={form.formState.errors.text?.message}>
      <Textarea
        className="app-input-surface h-[360px] max-h-[360px] resize-none overflow-auto rounded-xl text-sm leading-6"
        placeholder="Olá {{name}}, veja nossa oferta: {{link}}"
        {...form.register("text")}
      />
    </FormField>
  );
}

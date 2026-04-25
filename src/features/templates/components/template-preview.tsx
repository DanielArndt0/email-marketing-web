import { EmptyState } from "@/components/ui/empty-state";

import type { EmailTemplate } from "../types";

export function TemplatePreview({
  template,
}: {
  template: EmailTemplate | null;
}) {
  if (!template) {
    return (
      <EmptyState
        title="Selecione um template"
        description="O preview aparecerá aqui."
      />
    );
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Preview
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          {template.name}
        </h2>

        {template.subject ? (
          <p className="mt-1 text-sm text-slate-500">{template.subject}</p>
        ) : null}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">HTML</h3>
          <pre className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {template.htmlContent || "Sem conteúdo HTML."}
          </pre>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Texto puro
          </h3>
          <div className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {template.textContent || "Sem conteúdo em texto puro."}
          </div>
        </div>
      </div>
    </aside>
  );
}

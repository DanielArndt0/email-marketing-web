"use client";

import { Code2, Eye, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { EmailTemplate } from "../types";

type ViewMode = "visual" | "code";

export function TemplateViewer({
  template,
  onClose,
}: {
  template: EmailTemplate;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<ViewMode>("visual");

  const htmlContent = template.htmlContent?.trim();
  const textContent = template.textContent?.trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Preview
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            {template.name}
          </h2>

          {template.subject ? (
            <p className="mt-1 text-sm text-slate-500">{template.subject}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={mode === "visual" ? "default" : "secondary"}
            size="sm"
            onClick={() => setMode("visual")}
          >
            <Eye className="h-4 w-4" />
            Visual
          </Button>

          <Button
            type="button"
            variant={mode === "code" ? "default" : "secondary"}
            size="sm"
            onClick={() => setMode("code")}
          >
            <Code2 className="h-4 w-4" />
            Código
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      </div>

      {mode === "visual" ? (
        htmlContent ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <iframe
              title={`Preview do template ${template.name}`}
              srcDoc={htmlContent}
              sandbox=""
              className="h-[640px] w-full bg-white"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Este template não possui conteúdo HTML para renderizar.
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">HTML</h3>

            <pre className="max-h-[520px] overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-5 text-xs leading-6 text-slate-100">
              {htmlContent || "Sem conteúdo HTML."}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Texto puro
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              {textContent || "Sem conteúdo em texto puro."}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

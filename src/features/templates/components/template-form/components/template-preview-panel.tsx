import { Code2, Eye } from "lucide-react";
import type { ReactNode } from "react";

import { renderHighlightedVariables } from "../../template-variable-highlight";
import type { TemplatePreviewState } from "../types";

export function TemplatePreviewPanel({
  contentMode,
  previewMode,
  htmlPreview,
  textPreview,
  declaredVariables,
  highlightedHtmlPreview,
  hasHtmlPreview,
  hasTextPreview,
  onPreviewModeChange,
}: TemplatePreviewState) {
  return (
    <aside className="app-card-muted min-w-0 rounded-2xl p-4 xl:sticky xl:top-6 xl:self-start">
      <div className="mb-4 flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div>
          <p className="app-eyebrow">Preview</p>

          <h3 className="app-heading mt-2 text-base font-semibold">
            {contentMode === "html" ? "HTML renderizado" : "Texto puro"}
          </h3>

          <p className="app-muted mt-1 text-xs leading-5">
            Variáveis declaradas ficam destacadas. Variáveis não declaradas
            ficam em vermelho. Referências CID usam URLs temporárias apenas para
            preview.
          </p>
        </div>

        <div className="app-segmented">
          <button
            type="button"
            onClick={() => onPreviewModeChange("visual")}
            className={
              previewMode === "visual"
                ? "app-segmented-item app-segmented-item-active"
                : "app-segmented-item"
            }
          >
            <Eye className="h-4 w-4" />
            Visual
          </button>

          <button
            type="button"
            onClick={() => onPreviewModeChange("code")}
            className={
              previewMode === "code"
                ? "app-segmented-item app-segmented-item-active"
                : "app-segmented-item"
            }
          >
            <Code2 className="h-4 w-4" />
            Código
          </button>
        </div>
      </div>

      {contentMode === "html" ? (
        previewMode === "visual" ? (
          hasHtmlPreview ? (
            <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-white">
              <iframe
                title="Preview visual do template"
                srcDoc={highlightedHtmlPreview}
                sandbox=""
                className="h-[430px] w-full bg-white"
              />
            </div>
          ) : (
            <PreviewEmptyState message="Informe um conteúdo HTML para visualizar o template renderizado." />
          )
        ) : (
          <PreviewCodeBlock>
            {htmlPreview?.trim()
              ? renderHighlightedVariables(htmlPreview, declaredVariables)
              : "Sem conteúdo HTML."}
          </PreviewCodeBlock>
        )
      ) : previewMode === "visual" ? (
        hasTextPreview ? (
          <div className="h-[430px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-sm leading-7 text-[var(--app-text)]">
            {renderHighlightedVariables(textPreview, declaredVariables)}
          </div>
        ) : (
          <PreviewEmptyState message="Informe um conteúdo em texto puro para visualizar o preview." />
        )
      ) : (
        <PreviewCodeBlock>
          {textPreview?.trim()
            ? renderHighlightedVariables(textPreview, declaredVariables)
            : "Sem conteúdo em texto puro."}
        </PreviewCodeBlock>
      )}
    </aside>
  );
}

function PreviewEmptyState({ message }: { message: string }) {
  return (
    <div className="grid h-[430px] place-items-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-center text-sm text-[var(--app-text-muted)]">
      {message}
    </div>
  );
}

function PreviewCodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="h-[430px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--app-border)] bg-neutral-800 p-4 text-xs leading-6 text-slate-100">
      {children}
    </pre>
  );
}

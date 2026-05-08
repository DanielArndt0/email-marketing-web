import { Paperclip } from "lucide-react";

import { TemplateEmailAttachmentsSection } from "../../../files/components/template-email-attachments-section";
import type { TemplateEmailAttachment } from "../../../files/types";
import type { ContentMode } from "../types";

type TemplateAttachmentsReviewStepProps = {
  attachments: TemplateEmailAttachment[];
  contentMode: ContentMode;
  declaredVariables: string[];
  embeddedAssetsCount: number;
  namePreview?: string;
  subjectPreview?: string;
  onAddFiles: (files: File[]) => void;
  onRemove: (attachmentId: string) => void | Promise<void>;
};

export function TemplateAttachmentsReviewStep({
  attachments,
  contentMode,
  declaredVariables,
  embeddedAssetsCount,
  namePreview,
  subjectPreview,
  onAddFiles,
  onRemove,
}: TemplateAttachmentsReviewStepProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
      <div className="min-w-0 space-y-4">
        <section className="app-card-muted rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="app-icon-box rounded-xl p-3">
              <Paperclip className="h-5 w-5" />
            </div>

            <div>
              <h3 className="app-heading text-base font-semibold">
                Anexos comuns do e-mail
              </h3>

              <p className="app-muted mt-1 text-sm leading-6">
                Use esta etapa para PDFs, propostas, contratos, boletos,
                apresentações ou outros arquivos que o destinatário deve baixar
                ou abrir.
              </p>

              <p className="app-soft mt-2 text-xs leading-5">
                Anexos comuns não recebem CID e não são usados dentro do HTML do
                template.
              </p>
            </div>
          </div>
        </section>

        <TemplateEmailAttachmentsSection
          attachments={attachments}
          onAddFiles={onAddFiles}
          onRemove={onRemove}
        />

        <div className="app-alert-warning rounded-2xl px-4 py-3 text-sm">
          A API registra metadados e{" "}
          <span className="font-mono">storageKey</span>. O arquivo físico
          precisa existir no storage acessível pelo worker para ser anexado no
          envio.
        </div>
      </div>

      <aside className="app-card-muted min-w-0 rounded-2xl p-4 xl:sticky xl:top-6 xl:self-start">
        <p className="app-eyebrow">Revisão</p>

        <h3 className="app-heading mt-2 text-base font-semibold">
          Conferência do template
        </h3>

        <p className="app-muted mt-1 text-sm leading-6">
          Revise os principais dados antes de salvar.
        </p>

        <div className="mt-5 space-y-3">
          <div className="app-card-flat rounded-2xl p-4">
            <p className="app-soft text-xs font-semibold uppercase tracking-wide">
              Nome
            </p>

            <p className="app-heading mt-1 text-sm font-medium">
              {namePreview?.trim() || "Não informado"}
            </p>
          </div>

          <div className="app-card-flat rounded-2xl p-4">
            <p className="app-soft text-xs font-semibold uppercase tracking-wide">
              Assunto
            </p>

            <p className="app-heading mt-1 text-sm font-medium">
              {subjectPreview?.trim() || "Não informado"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="app-card-flat rounded-2xl p-4">
              <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                Tipo
              </p>

              <p className="app-heading mt-1 text-sm font-medium">
                {contentMode === "html" ? "HTML" : "Texto puro"}
              </p>
            </div>

            <div className="app-card-flat rounded-2xl p-4">
              <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                Variáveis
              </p>

              <p className="app-heading mt-1 text-sm font-medium">
                {declaredVariables.length}
              </p>
            </div>

            <div className="app-card-flat rounded-2xl p-4">
              <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                Imagens CID
              </p>

              <p className="app-heading mt-1 text-sm font-medium">
                {embeddedAssetsCount}
              </p>
            </div>

            <div className="app-card-flat rounded-2xl p-4">
              <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                Anexos
              </p>

              <p className="app-heading mt-1 text-sm font-medium">
                {attachments.length}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

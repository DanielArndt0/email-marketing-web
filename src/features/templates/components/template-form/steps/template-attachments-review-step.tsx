import { Paperclip } from "lucide-react";

import { TemplateEmailAttachmentsSection } from "../../../files/components/template-email-attachments-section";
import type { TemplateEmailAttachment } from "../../../files/types";
import type { ContentMode } from "../types";

export function TemplateAttachmentsReviewStep({
  attachments,
  contentMode,
  declaredVariables,
  embeddedAssetsCount,
  namePreview,
  subjectPreview,
  onAddFiles,
  onRemove,
}: {
  attachments: TemplateEmailAttachment[];
  contentMode: ContentMode;
  declaredVariables: string[];
  embeddedAssetsCount: number;
  namePreview?: string;
  subjectPreview?: string;
  onAddFiles: (files: File[]) => void;
  onRemove: (attachmentId: string) => void;
}) {
  return (
    <>
      <div className="min-w-0 space-y-4">
        <TemplateAttachmentsIntro />

        <TemplateEmailAttachmentsSection
          attachments={attachments}
          onAddFiles={onAddFiles}
          onRemove={onRemove}
        />

        <div className="app-alert-warning rounded-2xl px-4 py-3 text-sm">
          Os uploads desta tela estão preparados no front-end, mas ainda não são
          enviados no salvamento do template. A conexão real será feita quando
          os endpoints de assets e anexos estiverem definidos.
        </div>
      </div>

      <TemplateReviewPanel
        contentMode={contentMode}
        declaredVariables={declaredVariables}
        embeddedAssetsCount={embeddedAssetsCount}
        attachmentsCount={attachments.length}
        namePreview={namePreview}
        subjectPreview={subjectPreview}
      />
    </>
  );
}

function TemplateAttachmentsIntro() {
  return (
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
            apresentações ou outros arquivos que o destinatário deve baixar ou
            abrir.
          </p>

          <p className="app-soft mt-2 text-xs leading-5">
            Anexos comuns não recebem CID e não são usados dentro do HTML do
            template.
          </p>
        </div>
      </div>
    </section>
  );
}

function TemplateReviewPanel({
  contentMode,
  declaredVariables,
  embeddedAssetsCount,
  attachmentsCount,
  namePreview,
  subjectPreview,
}: {
  contentMode: ContentMode;
  declaredVariables: string[];
  embeddedAssetsCount: number;
  attachmentsCount: number;
  namePreview?: string;
  subjectPreview?: string;
}) {
  return (
    <aside className="app-card-muted min-w-0 rounded-2xl p-4 xl:sticky xl:top-6 xl:self-start">
      <p className="app-eyebrow">Revisão</p>

      <h3 className="app-heading mt-2 text-base font-semibold">
        Conferência do template
      </h3>

      <p className="app-muted mt-1 text-sm leading-6">
        Revise os principais dados antes de salvar.
      </p>

      <div className="mt-5 space-y-3">
        <ReviewItem
          label="Nome"
          value={namePreview?.trim() || "Não informado"}
        />
        <ReviewItem
          label="Assunto"
          value={subjectPreview?.trim() || "Não informado"}
        />

        <div className="grid grid-cols-2 gap-3">
          <ReviewItem
            label="Tipo"
            value={contentMode === "html" ? "HTML" : "Texto puro"}
          />
          <ReviewItem label="Variáveis" value={declaredVariables.length} />
          <ReviewItem label="Imagens CID" value={embeddedAssetsCount} />
          <ReviewItem label="Anexos" value={attachmentsCount} />
        </div>
      </div>
    </aside>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="app-card-flat rounded-2xl p-4">
      <p className="app-soft text-xs font-semibold uppercase tracking-wide">
        {label}
      </p>

      <p className="app-heading mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

"use client";

import { FileText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { TemplateEmailAttachment } from "../types";
import { formatTemplateFileSize } from "../utils";
import { TemplateFileDropzone } from "./template-file-dropzone";

type TemplateEmailAttachmentsSectionProps = {
  attachments: TemplateEmailAttachment[];
  onAddFiles: (files: File[]) => void;
  onRemove: (attachmentId: string) => void;
};

export function TemplateEmailAttachmentsSection({
  attachments,
  onAddFiles,
  onRemove,
}: TemplateEmailAttachmentsSectionProps) {
  return (
    <section className="app-card-muted rounded-2xl p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="app-heading text-base font-semibold">
            Anexos do e-mail
          </h3>

          <p className="app-muted mt-1 text-sm leading-6">
            Use para PDFs, propostas, contratos, boletos, apresentações ou
            arquivos que o destinatário deve baixar ou abrir.
          </p>
        </div>

        <span className="app-badge app-badge-surface px-3 py-1">
          {attachments.length} {attachments.length === 1 ? "anexo" : "anexos"}
        </span>
      </div>

      <div className="mt-4">
        <TemplateFileDropzone
          title="Adicionar anexos comuns"
          description="Arquivos anexados ao e-mail. Eles não são usados dentro do HTML e não recebem CID."
          onFilesSelected={onAddFiles}
        />
      </div>

      {attachments.length > 0 ? (
        <div className="mt-4 space-y-3">
          {attachments.map((attachment) => (
            <article
              key={attachment.id}
              className="app-card-flat flex items-center gap-3 rounded-2xl p-3"
            >
              <div className="app-icon-box shrink-0 rounded-xl p-3">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="app-heading truncate text-sm font-semibold">
                  {attachment.fileName}
                </h4>
                <p className="app-muted mt-1 text-xs">
                  {attachment.mimeType} •{" "}
                  {formatTemplateFileSize(attachment.sizeBytes)}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onRemove(attachment.id)}
                aria-label={`Remover ${attachment.fileName}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <div className="app-empty-state mt-4 rounded-2xl p-5 text-center">
          <p className="app-heading text-sm font-semibold">
            Nenhum anexo comum
          </p>
          <p className="app-muted mt-1 text-sm">
            Adicione anexos apenas quando o arquivo precisar ser baixado ou
            aberto pelo destinatário.
          </p>
        </div>
      )}
    </section>
  );
}

"use client";

import { Copy, ImageIcon, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { TemplateEmbeddedAsset } from "../types";
import { formatFileSize } from "../utils";
import { TemplateFileDropzone } from "./template-file-dropzone";

type TemplateEmbeddedAssetsSectionProps = {
  assets: TemplateEmbeddedAsset[];
  onAddFiles: (files: File[]) => void;
  onRemove: (assetId: string) => void;
  onCopyCid: (asset: TemplateEmbeddedAsset) => void;
  onInsertImage: (asset: TemplateEmbeddedAsset) => void;
};

export function TemplateEmbeddedAssetsSection({
  assets,
  onAddFiles,
  onRemove,
  onCopyCid,
  onInsertImage,
}: TemplateEmbeddedAssetsSectionProps) {
  return (
    <section className="app-card-muted rounded-2xl p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="app-heading text-base font-semibold">
            Imagens incorporadas
          </h3>

          <p className="app-muted mt-1 text-sm leading-6">
            Use para logos, banners, ícones e imagens que aparecem dentro do
            HTML do e-mail usando referências{" "}
            <span className="font-mono">cid:</span>.
          </p>
        </div>

        <span className="app-badge app-badge-surface px-3 py-1">
          {assets.length} {assets.length === 1 ? "imagem" : "imagens"}
        </span>
      </div>

      <div className="mt-4">
        <TemplateFileDropzone
          title="Adicionar imagens do template"
          description="PNG, JPG, GIF, SVG ou WEBP. A imagem será usada dentro do corpo HTML, não como anexo comum."
          accept="image/*"
          onFilesSelected={onAddFiles}
        />
      </div>

      {assets.length > 0 ? (
        <div className="mt-4 space-y-3">
          {assets.map((asset) => (
            <article
              key={asset.id}
              className="app-card-flat grid gap-3 rounded-2xl p-3 sm:grid-cols-[72px_minmax(0,1fr)]"
            >
              <div className="app-card-muted grid h-[72px] place-items-center overflow-hidden rounded-xl">
                {asset.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.previewUrl}
                    alt={asset.fileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="app-soft h-6 w-6" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h4 className="app-heading truncate text-sm font-semibold">
                      {asset.fileName}
                    </h4>

                    <p className="app-muted mt-1 text-xs">
                      {asset.mimeType} • {formatFileSize(asset.sizeBytes)}
                    </p>

                    <code className="app-card-muted mt-2 inline-flex max-w-full rounded-lg px-2 py-1 text-xs">
                      cid:{asset.cid}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onCopyCid(asset)}
                    >
                      <Copy className="h-4 w-4" />
                      Copiar CID
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onInsertImage(asset)}
                    >
                      <Plus className="h-4 w-4" />
                      Inserir HTML
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(asset.id)}
                      aria-label={`Remover ${asset.fileName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="app-empty-state mt-4 rounded-2xl p-5 text-center">
          <p className="app-heading text-sm font-semibold">
            Nenhuma imagem incorporada
          </p>
          <p className="app-muted mt-1 text-sm">
            Adicione imagens para usar referências CID dentro do HTML.
          </p>
        </div>
      )}
    </section>
  );
}

import { ImageIcon } from "lucide-react";

import { TemplateEmbeddedAssetsSection } from "../../../files/components/template-embedded-assets-section";
import type { TemplateEmbeddedAsset } from "../../../files/types";

export function TemplateAssetsStep({
  assets,
  onAddFiles,
  onRemove,
  onCopyCid,
  onInsertImage,
}: {
  assets: TemplateEmbeddedAsset[];
  onAddFiles: (files: File[]) => void;
  onRemove: (assetId: string) => void;
  onCopyCid: (asset: TemplateEmbeddedAsset) => Promise<void>;
  onInsertImage: (asset: TemplateEmbeddedAsset) => void;
}) {
  return (
    <div className="min-w-0 space-y-4">
      <section className="app-card-muted rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="app-icon-box rounded-xl p-3">
            <ImageIcon className="h-5 w-5" />
          </div>

          <div>
            <h3 className="app-heading text-base font-semibold">
              Imagens incorporadas ao HTML
            </h3>

            <p className="app-muted mt-1 text-sm leading-6">
              Use esta etapa para adicionar logos, banners, ícones e imagens que
              aparecem dentro do corpo do e-mail por referência{" "}
              <span className="font-mono">cid:</span>.
            </p>

            <p className="app-soft mt-2 text-xs leading-5">
              Essas imagens não são anexos comuns. Elas são assets visuais
              usados pelo HTML do template.
            </p>
          </div>
        </div>
      </section>

      <TemplateEmbeddedAssetsSection
        assets={assets}
        onAddFiles={onAddFiles}
        onRemove={onRemove}
        onCopyCid={onCopyCid}
        onInsertImage={onInsertImage}
      />
    </div>
  );
}

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TemplateFormHeader({
  isEditing,
  onCancel,
}: {
  isEditing: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-[var(--app-border)] pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="app-heading text-lg font-semibold">
          {isEditing ? "Editar template" : "Novo template"}
        </h2>

        <p className="app-muted mt-1 text-sm">
          Configure conteúdo, imagens internas e anexos do e-mail em etapas.
        </p>
      </div>

      <Button type="button" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4" />
        Cancelar
      </Button>
    </div>
  );
}

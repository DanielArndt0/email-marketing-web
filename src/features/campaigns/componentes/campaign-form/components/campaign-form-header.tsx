import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Campaign } from "../../../types";

export function CampaignFormHeader({
  campaign,
  onCancel,
}: {
  campaign: Campaign | null;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">
          {campaign ? "Editar campanha" : "Nova campanha"}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Configure a campanha em etapas para manter o fluxo simples.
        </p>
      </div>

      <Button type="button" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4" />
        Cancelar
      </Button>
    </div>
  );
}

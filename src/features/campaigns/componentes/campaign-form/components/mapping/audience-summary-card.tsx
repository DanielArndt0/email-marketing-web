import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Audience } from "@/features/audiences/types";

import type { LeadPathOption } from "../../campaign-form.types";

export function AudienceSummaryCard({
  selectedAudience,
  leadPathOptions,
}: {
  selectedAudience: Audience | null;
  leadPathOptions: LeadPathOption[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-slate-500" />

        <h4 className="font-semibold text-slate-950">Audience selecionada</h4>
      </div>

      {selectedAudience ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-slate-900">
            {selectedAudience.name}
          </p>

          <p className="text-sm text-slate-500">
            Origem: {selectedAudience.sourceType}
          </p>

          <div className="max-h-[110px] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              {leadPathOptions.length > 0 ? (
                leadPathOptions.map((option) => (
                  <Badge
                    key={option.path}
                    className="bg-slate-50 text-slate-600"
                  >
                    {option.path}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  Nenhum path detectado
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          Selecione uma audience para visualizar os paths.
        </p>
      )}
    </div>
  );
}

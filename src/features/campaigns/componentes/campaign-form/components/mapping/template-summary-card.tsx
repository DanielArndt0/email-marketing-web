import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { EmailTemplate } from "@/features/templates/types";

export function TemplateSummaryCard({
  selectedTemplate,
  templateVariables,
}: {
  selectedTemplate: EmailTemplate | null;
  templateVariables: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-slate-500" />

        <h4 className="font-semibold text-slate-950">Template selecionado</h4>
      </div>

      {selectedTemplate ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-slate-900">
            {selectedTemplate.name}
          </p>

          <p className="line-clamp-2 text-sm text-slate-500">
            {selectedTemplate.subject || "Sem assunto informado"}
          </p>

          <div className="max-h-[110px] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              {templateVariables.length > 0 ? (
                templateVariables.map((variable) => (
                  <Badge key={variable} className="bg-slate-50 text-slate-600">
                    {"{{" + variable + "}}"}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  Nenhuma variável declarada
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          Selecione um template para visualizar as variáveis.
        </p>
      )}
    </div>
  );
}

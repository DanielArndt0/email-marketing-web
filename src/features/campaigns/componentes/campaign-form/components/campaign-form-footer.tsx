import { ChevronLeft, ChevronRight, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { WizardStep } from "../campaign-form.types";

export function CampaignFormFooter({
  currentStep,
  isPending,
  onCancel,
  onPrevious,
  onNext,
  onSave,
}: {
  currentStep: WizardStep;
  isPending: boolean;
  onCancel: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {currentStep > 0 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onPrevious}
            disabled={isPending}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        ) : null}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>

        {currentStep < 2 ? (
          <Button type="button" onClick={onNext} disabled={isPending}>
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={onSave} disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar campanha"}
          </Button>
        )}
      </div>
    </div>
  );
}

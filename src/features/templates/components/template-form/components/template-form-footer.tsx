import { ArrowLeft, ArrowRight, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TEMPLATE_FORM_LAST_STEP } from "../constants";
import type { TemplateFormStep } from "../types";

export function TemplateFormFooter({
  currentStep,
  isPending,
  onCancel,
  onPrevious,
  onNext,
}: {
  currentStep: TemplateFormStep;
  isPending: boolean;
  onCancel: () => void;
  onPrevious: () => void;
  onNext: () => Promise<void>;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-[var(--app-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {currentStep > 0 ? (
          <Button type="button" variant="secondary" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>

        {currentStep < TEMPLATE_FORM_LAST_STEP ? (
          <Button type="button" onClick={onNext}>
            Próximo
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar template"}
          </Button>
        )}
      </div>
    </div>
  );
}

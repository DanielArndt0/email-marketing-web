import { CheckCircle2 } from "lucide-react";

import { CAMPAIGN_WIZARD_STEPS } from "../campaign-form.constants";
import type { WizardStep } from "../campaign-form.types";

export function WizardStepIndicator({
  currentStep,
}: {
  currentStep: WizardStep;
}) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      {CAMPAIGN_WIZARD_STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <div
            key={step.title}
            className={
              isActive
                ? "rounded-2xl border border-slate-950 bg-slate-950 p-4 text-white"
                : isDone
                  ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
                  : "rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-500"
            }
          >
            <div className="flex items-center gap-3">
              <div
                className={
                  isActive
                    ? "grid h-8 w-8 place-items-center rounded-xl bg-white text-sm font-semibold text-slate-950"
                    : isDone
                      ? "grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-700"
                      : "grid h-8 w-8 place-items-center rounded-xl bg-white text-sm font-semibold text-slate-500"
                }
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>

              <div>
                <p className="text-sm font-semibold">{step.title}</p>

                <p
                  className={
                    isActive
                      ? "mt-0.5 text-xs text-slate-300"
                      : "mt-0.5 text-xs opacity-80"
                  }
                >
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

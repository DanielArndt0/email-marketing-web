import { CheckCircle2 } from "lucide-react";

import { templateFormSteps } from "../constants";
import type { TemplateFormStep } from "../types";

export function TemplateWizardStepIndicator({
  currentStep,
}: {
  currentStep: TemplateFormStep;
}) {
  return (
    <div className="grid gap-3 border-b border-[var(--app-border)] pb-5 md:grid-cols-3">
      {templateFormSteps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div
            key={step.title}
            className={[
              "rounded-2xl border p-4 transition",
              isActive
                ? "border-[var(--app-primary)] bg-[var(--app-surface)]"
                : isCompleted
                  ? "border-[var(--app-success-border)] bg-[var(--app-success-bg)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface-muted)]",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <div
                className={[
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold",
                  isActive
                    ? "bg-[var(--app-primary)] text-[var(--app-primary-contrast)]"
                    : isCompleted
                      ? "bg-[var(--app-success-bg)] text-[var(--app-success-text)]"
                      : "bg-[var(--app-surface)] text-[var(--app-text-muted)]",
                ].join(" ")}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>

              <div className="min-w-0">
                <p className="app-heading text-sm font-semibold">
                  {step.title}
                </p>

                <p className="app-muted mt-1 truncate text-xs">
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

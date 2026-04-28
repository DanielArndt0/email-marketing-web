"use client";

import { CampaignFormAlert } from "./campaign-form/components/campaign-form-alert";
import { CampaignFormFooter } from "./campaign-form/components/campaign-form-footer";
import { CampaignFormHeader } from "./campaign-form/components/campaign-form-header";
import { WizardStepIndicator } from "./campaign-form/components/wizard-step-indicator";
import { CampaignDataStep } from "./campaign-form/components/steps/campaign-data-step";
import { CampaignLinksStep } from "./campaign-form/components/steps/campaign-links-step";
import { CampaignSummaryStep } from "./campaign-form/components/steps/campaign-summary-step";
import type { CampaignFormProps } from "./campaign-form/campaign-form.types";
import { useCampaignFormController } from "./campaign-form/hooks/use-campaign-form-controller";

export function CampaignForm(props: CampaignFormProps) {
  const controller = useCampaignFormController(props);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
      <CampaignFormHeader campaign={props.campaign} onCancel={props.onCancel} />

      <WizardStepIndicator currentStep={controller.currentStep} />

      <CampaignFormAlert message={controller.submitError} />

      <div className="mt-5">
        {controller.currentStep === 0 ? (
          <CampaignDataStep form={controller.form} />
        ) : null}

        {controller.currentStep === 1 ? (
          <CampaignLinksStep
            form={controller.form}
            templates={controller.templates}
            audiences={controller.audiences}
            selectedTemplate={controller.selectedTemplate}
            selectedAudience={controller.selectedAudience}
            templateVariables={controller.templateVariables}
            audienceFields={controller.audienceFields}
            templateVariableMappings={controller.templateVariableMappings}
            onMappingSourceChange={controller.handleMappingSourceChange}
            onMappingPathChange={controller.handleMappingPathChange}
            onMappingStaticValueChange={
              controller.handleMappingStaticValueChange
            }
          />
        ) : null}

        {controller.currentStep === 2 ? (
          <CampaignSummaryStep
            form={controller.form}
            selectedTemplate={controller.selectedTemplate}
            selectedAudience={controller.selectedAudience}
            templateVariableMappings={controller.templateVariableMappings}
          />
        ) : null}
      </div>

      <CampaignFormFooter
        currentStep={controller.currentStep}
        isPending={controller.isPending}
        onCancel={props.onCancel}
        onPrevious={controller.goToPreviousStep}
        onNext={controller.goToNextStep}
        onSave={controller.handleSave}
      />
    </section>
  );
}

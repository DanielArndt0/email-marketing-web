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
  const campaign = props.campaign ?? null;
  const controller = useCampaignFormController({
    ...props,
    campaign,
  });

  return (
    <section className="app-card rounded-3xl p-5 md:p-6">
      <CampaignFormHeader campaign={campaign} onCancel={props.onCancel} />

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
            smtpSenders={controller.smtpSenders}
            selectedTemplate={controller.selectedTemplate}
            selectedAudience={controller.selectedAudience}
            selectedSmtpSender={controller.selectedSmtpSender}
            leadPathOptions={controller.leadPathOptions}
            templateVariableMappings={controller.templateVariableMappings}
            onMappingSourceChange={controller.handleMappingSourceChange}
            onMappingPathChange={controller.handleMappingPathChange}
            onMappingStaticValueChange={
              controller.handleMappingStaticValueChange
            }
            onMappingFallbackChange={controller.handleMappingFallbackChange}
          />
        ) : null}

        {controller.currentStep === 2 ? (
          <CampaignSummaryStep
            form={controller.form}
            selectedTemplate={controller.selectedTemplate}
            selectedAudience={controller.selectedAudience}
            selectedSmtpSender={controller.selectedSmtpSender}
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

"use client";

import type { ReactNode } from "react";

import { TemplateFormFooter } from "./components/template-form-footer";
import { TemplateFileFeedback } from "./components/template-file-feedback";
import { TemplateFormHeader } from "./components/template-form-header";
import { TemplatePreviewPanel } from "./components/template-preview-panel";
import { TemplateWizardStepIndicator } from "./components/template-wizard-step-indicator";
import { useTemplateFormController } from "./hooks/use-template-form-controller";
import { TemplateAssetsStep } from "./steps/template-assets-step";
import { TemplateAttachmentsReviewStep } from "./steps/template-attachments-review-step";
import { TemplateContentStep } from "./steps/template-content-step";
import type { TemplateFormProps, TemplatePreviewState } from "./types";

export function TemplateForm(props: TemplateFormProps) {
  const controller = useTemplateFormController(props);

  return (
    <form
      onSubmit={controller.handleSubmit}
      className="app-card w-full rounded-2xl p-4 sm:p-5"
    >
      <TemplateFormHeader
        isEditing={controller.isEditing}
        onCancel={props.onCancel}
      />

      <TemplateWizardStepIndicator currentStep={controller.currentStep} />

      <TemplateFileFeedback message={controller.fileFeedback} />

      <div className="mt-5">
        {controller.currentStep === 0 ? (
          <TemplateStepLayout preview={controller.previewState}>
            <TemplateContentStep
              form={controller.form}
              contentMode={controller.contentMode}
              htmlFileName={controller.htmlFileName}
              onContentModeChange={controller.setContentMode}
              onHtmlFileChange={controller.handleHtmlFileChange}
            />
          </TemplateStepLayout>
        ) : null}

        {controller.currentStep === 1 ? (
          <TemplateStepLayout preview={controller.previewState}>
            <TemplateAssetsStep
              assets={controller.embeddedAssets}
              onAddFiles={controller.handleAddEmbeddedAssetFiles}
              onRemove={controller.handleRemoveEmbeddedAsset}
              onCopyCid={controller.handleCopyCid}
              onInsertImage={controller.handleInsertEmbeddedImage}
            />
          </TemplateStepLayout>
        ) : null}

        {controller.currentStep === 2 ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
            <TemplateAttachmentsReviewStep
              attachments={controller.emailAttachments}
              contentMode={controller.contentMode}
              declaredVariables={controller.declaredVariables}
              embeddedAssetsCount={controller.embeddedAssets.length}
              namePreview={controller.namePreview}
              subjectPreview={controller.subjectPreview}
              onAddFiles={controller.handleAddEmailAttachmentFiles}
              onRemove={controller.handleRemoveEmailAttachment}
            />
          </div>
        ) : null}
      </div>

      <TemplateFormFooter
        currentStep={controller.currentStep}
        isPending={controller.isPending}
        onCancel={props.onCancel}
        onPrevious={controller.goToPreviousStep}
        onNext={controller.goToNextStep}
      />
    </form>
  );
}

function TemplateStepLayout({
  children,
  preview,
}: {
  children: ReactNode;
  preview: TemplatePreviewState;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
      {children}
      <TemplatePreviewPanel {...preview} />
    </div>
  );
}

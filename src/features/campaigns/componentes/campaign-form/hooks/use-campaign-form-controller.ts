import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useAudiences } from "@/features/audiences/hooks";
import { useTemplates } from "@/features/templates/hooks";
import { getApiErrorMessage } from "@/lib/api/http-client";

import { useCreateCampaign, useUpdateCampaign } from "../../../hooks";
import { campaignFormSchema, type CampaignFormValues } from "../../../schemas";
import type { CampaignFormProps, WizardStep } from "../campaign-form.types";
import { getLeadPathOptions } from "../utils/audience-fields";
import { buildCampaignPayload } from "../utils/campaign-payload";
import {
  getDefaultValues,
  toOptionalString,
} from "../utils/form-default-values";
import { getTemplateVariables } from "../utils/template-variables";

import { useTemplateVariableMapping } from "./use-template-variable-mapping";

export function useCampaignFormController({
  campaign,
  onSaved,
}: CampaignFormProps) {
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const templatesQuery = useTemplates();
  const audiencesQuery = useAudiences();

  const [currentStep, setCurrentStep] = useState<WizardStep>(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const templates = useMemo(
    () => templatesQuery.data ?? [],
    [templatesQuery.data],
  );

  const audiences = useMemo(
    () => audiencesQuery.data ?? [],
    [audiencesQuery.data],
  );

  const defaultValues = useMemo(() => getDefaultValues(campaign), [campaign]);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    setCurrentStep(0);
    setSubmitError(null);
  }, [defaultValues, form]);

  const templateId = form.watch("templateId");
  const audienceId = form.watch("audienceId");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? null,
    [templates, templateId],
  );

  const selectedAudience = useMemo(
    () => audiences.find((audience) => audience.id === audienceId) ?? null,
    [audiences, audienceId],
  );

  const templateVariables = useMemo(
    () => getTemplateVariables(selectedTemplate),
    [selectedTemplate],
  );

  const leadPathOptions = useMemo(
    () => getLeadPathOptions(selectedAudience),
    [selectedAudience],
  );

  const {
    templateVariableMappings,
    handleMappingSourceChange,
    handleMappingPathChange,
    handleMappingStaticValueChange,
    unmappedVariables,
  } = useTemplateVariableMapping({
    campaign,
    templateVariables,
    leadPathOptions,
  });

  const isPending = createCampaign.isPending || updateCampaign.isPending;

  async function goToNextStep() {
    setSubmitError(null);

    if (currentStep === 0) {
      const isValid = await form.trigger([
        "name",
        "goal",
        "subject",
        "status",
        "scheduleAt",
      ]);

      if (!isValid) {
        return;
      }

      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      const templateIdValue = toOptionalString(form.getValues("templateId"));
      const audienceIdValue = toOptionalString(form.getValues("audienceId"));

      let hasError = false;

      if (!templateIdValue) {
        form.setError("templateId", {
          type: "custom",
          message: "Selecione um template.",
        });

        hasError = true;
      }

      if (!audienceIdValue) {
        form.setError("audienceId", {
          type: "custom",
          message: "Selecione uma audience.",
        });

        hasError = true;
      }

      if (hasError) {
        return;
      }

      if (unmappedVariables.length > 0) {
        setSubmitError(
          `Mapeie as variáveis do template antes de continuar: ${unmappedVariables
            .map((variable) => `{{${variable}}}`)
            .join(", ")}.`,
        );

        return;
      }

      form.clearErrors(["templateId", "audienceId"]);
      setCurrentStep(2);
    }
  }

  function goToPreviousStep() {
    setSubmitError(null);

    setCurrentStep((step) => (step > 0 ? ((step - 1) as WizardStep) : step));
  }

  async function submitCampaign(values: CampaignFormValues): Promise<void> {
    setSubmitError(null);

    const payload = buildCampaignPayload({
      values,
      templateVariables,
      templateVariableMappings,
    });

    try {
      if (campaign) {
        await updateCampaign.mutateAsync({
          id: campaign.id,
          input: payload,
        });
      } else {
        await createCampaign.mutateAsync(payload);
      }

      onSaved();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Não foi possível salvar esta campanha."),
      );
    }
  }

  const handleSave = form.handleSubmit(submitCampaign);

  return {
    form,
    currentStep,
    submitError,
    templates,
    audiences,
    selectedTemplate,
    selectedAudience,
    templateVariables,
    leadPathOptions,
    templateVariableMappings,
    isPending,
    goToNextStep,
    goToPreviousStep,
    handleSave,
    handleMappingSourceChange,
    handleMappingPathChange,
    handleMappingStaticValueChange,
  };
}

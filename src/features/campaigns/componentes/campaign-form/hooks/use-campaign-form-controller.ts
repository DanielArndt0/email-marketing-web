import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useAudiences } from "@/features/audiences/hooks";
import { useSmtpSenders } from "@/features/smtp-senders/hooks";
import { useTemplates } from "@/features/templates/hooks";
import { getApiErrorMessage } from "@/lib/api/http-client";

import { useCreateCampaign, useUpdateCampaign } from "../../../hooks";
import { campaignFormSchema } from "../../../schemas";
import type {
  CampaignFormProps,
  CampaignFormValues,
  WizardStep,
} from "../campaign-form.types";
import { getAudienceLeadPathOptions } from "../utils/audience-fields";
import {
  buildCreateCampaignPayload,
  buildUpdateCampaignPayload,
} from "../utils/campaign-payload";
import {
  getDefaultValues,
  toOptionalString,
} from "../utils/form-default-values";
import { getTemplateVariables } from "../utils/template-variables";

import { useTemplateVariableMapping } from "./use-template-variable-mapping";

export function useCampaignFormController({
  campaign = null,
  onSaved,
}: CampaignFormProps) {
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const templatesQuery = useTemplates();
  const audiencesQuery = useAudiences();
  const smtpSendersQuery = useSmtpSenders({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

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

  const smtpSenders = useMemo(() => {
    const data = smtpSendersQuery.data;

    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data;
    }

    return data.items ?? [];
  }, [smtpSendersQuery.data]);

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

  const selectedTemplateId = form.watch("templateId");
  const selectedAudienceId = form.watch("audienceId");
  const selectedSmtpSenderId = form.watch("smtpSenderId");

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId],
  );

  const selectedAudience = useMemo(
    () =>
      audiences.find((audience) => audience.id === selectedAudienceId) ?? null,
    [audiences, selectedAudienceId],
  );

  const selectedSmtpSender = useMemo(
    () =>
      smtpSenders.find((sender) => sender.id === selectedSmtpSenderId) ?? null,
    [smtpSenders, selectedSmtpSenderId],
  );

  const templateVariables = useMemo(
    () => getTemplateVariables(selectedTemplate),
    [selectedTemplate],
  );

  const leadPathOptions = useMemo(
    () => getAudienceLeadPathOptions(selectedAudience),
    [selectedAudience],
  );

  const audienceFields = useMemo(
    () => leadPathOptions.map((option) => option.path),
    [leadPathOptions],
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
      const smtpSenderIdValue = toOptionalString(
        form.getValues("smtpSenderId"),
      );

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

      if (!smtpSenderIdValue) {
        form.setError("smtpSenderId", {
          type: "custom",
          message: "Selecione um remetente SMTP.",
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

      form.clearErrors(["templateId", "audienceId", "smtpSenderId"]);
      setCurrentStep(2);
    }
  }

  function goToPreviousStep() {
    setSubmitError(null);

    setCurrentStep((step) => (step > 0 ? ((step - 1) as WizardStep) : step));
  }

  async function submitCampaign(values: CampaignFormValues): Promise<void> {
    setSubmitError(null);

    const createPayload = buildCreateCampaignPayload(values);
    const updatePayload = buildUpdateCampaignPayload(values);

    console.log("CAMPAIGN FORM VALUES", values);
    console.log("CREATE CAMPAIGN PAYLOAD", createPayload);
    console.log("UPDATE CAMPAIGN PAYLOAD", updatePayload);

    try {
      if (campaign) {
        await updateCampaign.mutateAsync({
          id: campaign.id,
          input: updatePayload,
        });
      } else {
        await createCampaign.mutateAsync(createPayload);
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
    smtpSenders,

    templatesQuery,
    audiencesQuery,
    smtpSendersQuery,

    selectedTemplate,
    selectedAudience,
    selectedSmtpSender,

    templateVariables,
    leadPathOptions,
    audienceFields,

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

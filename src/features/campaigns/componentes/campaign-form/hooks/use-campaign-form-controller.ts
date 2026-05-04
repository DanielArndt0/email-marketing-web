import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useAudiencePreview, useAudiences } from "@/features/audiences/hooks";
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

  const selectedTemplateId = useWatch({
    control: form.control,
    name: "templateId",
  });

  const selectedAudienceId = useWatch({
    control: form.control,
    name: "audienceId",
  });

  const audiencePreviewQuery = useAudiencePreview(
    selectedAudienceId || undefined,
  );

  const selectedSmtpSenderId = useWatch({
    control: form.control,
    name: "smtpSenderId",
  });

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
    () =>
      getAudienceLeadPathOptions(
        selectedAudience,
        audiencePreviewQuery.data?.items ?? [],
      ),
    [selectedAudience, audiencePreviewQuery.data?.items],
  );

  const {
    templateVariableMappings,
    unmappedVariables,
    handleMappingSourceChange,
    handleMappingPathChange,
    handleMappingStaticValueChange,
    handleMappingFallbackChange,
  } = useTemplateVariableMapping({
    form,
    campaign,
    templateVariables,
    leadPathOptions,
  });

  const isPending = createCampaign.isPending || updateCampaign.isPending;

  async function validateCampaignDataStep() {
    return form.trigger(["name", "goal", "subject", "status", "scheduleAt"]);
  }

  function validateCampaignLinksStep() {
    const templateIdValue = toOptionalString(form.getValues("templateId"));
    const audienceIdValue = toOptionalString(form.getValues("audienceId"));
    const smtpSenderIdValue = toOptionalString(form.getValues("smtpSenderId"));

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
      return false;
    }

    if (unmappedVariables.length > 0) {
      setSubmitError(
        `Mapeie as variáveis do template antes de continuar: ${unmappedVariables
          .map((variable) => `{{${variable.key}}}`)
          .join(", ")}.`,
      );

      return false;
    }

    form.clearErrors(["templateId", "audienceId", "smtpSenderId"]);
    return true;
  }

  async function goToNextStep() {
    setSubmitError(null);

    if (currentStep === 0) {
      const isValid = await validateCampaignDataStep();

      if (!isValid) {
        return;
      }

      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      const isValid = validateCampaignLinksStep();

      if (!isValid) {
        return;
      }

      setCurrentStep(2);
    }
  }

  function goToPreviousStep() {
    setSubmitError(null);

    setCurrentStep((step) => (step > 0 ? ((step - 1) as WizardStep) : step));
  }

  function getStatusAfterSave(values: CampaignFormValues) {
    const hasTemplate = Boolean(toOptionalString(values.templateId));
    const hasAudience = Boolean(toOptionalString(values.audienceId));
    const hasSmtpSender = Boolean(toOptionalString(values.smtpSenderId));

    const isReadyForDispatch = hasTemplate && hasAudience && hasSmtpSender;

    if (!isReadyForDispatch) {
      return "draft";
    }

    if (!campaign) {
      return "ready";
    }

    if (campaign.status === "draft") {
      return "ready";
    }

    return values.status;
  }

  async function submitCampaign(values: CampaignFormValues): Promise<void> {
    setSubmitError(null);

    const valuesWithAutomaticStatus: CampaignFormValues = {
      ...values,
      status: getStatusAfterSave(values),
    };

    try {
      if (campaign) {
        await updateCampaign.mutateAsync({
          id: campaign.id,
          input: buildUpdateCampaignPayload(valuesWithAutomaticStatus),
        });
      } else {
        await createCampaign.mutateAsync(
          buildCreateCampaignPayload(valuesWithAutomaticStatus),
        );
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
    templateVariableMappings,

    audiencePreviewQuery,

    isPending,

    goToNextStep,
    goToPreviousStep,
    handleSave,

    handleMappingSourceChange,
    handleMappingPathChange,
    handleMappingStaticValueChange,
    handleMappingFallbackChange,
  };
}

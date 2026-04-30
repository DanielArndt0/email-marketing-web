"use client";

import { Eye, EyeOff, Info, Mail, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api/http-client";

import { useCreateSmtpSender, useUpdateSmtpSender } from "../hooks";
import type {
  CreateSmtpSenderInput,
  SmtpSender,
  UpdateSmtpSenderInput,
} from "../types";

type SmtpSenderFormValues = {
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  host: string;
  port: string;
  secure: boolean;
  username: string;
  password: string;
  isActive: boolean;
};

const initialValues: SmtpSenderFormValues = {
  name: "",
  fromName: "",
  fromEmail: "",
  replyToEmail: "",
  host: "",
  port: "587",
  secure: false,
  username: "",
  password: "",
  isActive: true,
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium app-heading">{children}</label>;
}

function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-5 app-soft">{children}</p>;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="app-card-muted flex w-full items-center justify-between gap-4 rounded-2xl p-4 text-left"
    >
      <div>
        <p className="font-medium app-heading">{label}</p>
        <p className="mt-1 text-sm leading-6 app-muted">{description}</p>
      </div>

      <span
        className={
          checked
            ? "flex h-7 w-12 items-center rounded-full bg-neutral-800 p-1 transition dark:bg-emerald-500"
            : "flex h-7 w-12 items-center rounded-full bg-slate-300 p-1 transition dark:bg-neutral-600"
        }
      >
        <span
          className={
            checked
              ? "h-5 w-5 translate-x-5 rounded-full bg-white transition"
              : "h-5 w-5 rounded-full bg-white transition"
          }
        />
      </span>
    </button>
  );
}

function emptyToNull(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function mapSenderToFormValues(
  sender: SmtpSender | null,
): SmtpSenderFormValues {
  if (!sender) {
    return initialValues;
  }

  return {
    name: sender.name,
    fromName: sender.fromName,
    fromEmail: sender.fromEmail,
    replyToEmail: sender.replyToEmail ?? "",
    host: sender.host,
    port: String(sender.port),
    secure: sender.secure,
    username: sender.username ?? "",
    password: "",
    isActive: sender.isActive,
  };
}

function buildCreatePayload(
  values: SmtpSenderFormValues,
): CreateSmtpSenderInput {
  return {
    name: values.name.trim(),
    fromName: values.fromName.trim(),
    fromEmail: values.fromEmail.trim(),
    replyToEmail: emptyToNull(values.replyToEmail),
    host: values.host.trim(),
    port: Number(values.port),
    secure: values.secure,
    username: emptyToNull(values.username),
    password: emptyToNull(values.password),
    isActive: values.isActive,
  };
}

function buildUpdatePayload(
  values: SmtpSenderFormValues,
): UpdateSmtpSenderInput {
  const payload: UpdateSmtpSenderInput = {
    name: values.name.trim(),
    fromName: values.fromName.trim(),
    fromEmail: values.fromEmail.trim(),
    replyToEmail: emptyToNull(values.replyToEmail),
    host: values.host.trim(),
    port: Number(values.port),
    secure: values.secure,
    username: emptyToNull(values.username),
    isActive: values.isActive,
  };

  const password = emptyToNull(values.password);

  if (password) {
    payload.password = password;
  }

  return payload;
}

export function SmtpSenderForm({
  sender,
  onCancel,
}: {
  sender: SmtpSender | null;
  onCancel: () => void;
}) {
  const createSender = useCreateSmtpSender();
  const updateSender = useUpdateSmtpSender();

  const [values, setValues] = useState<SmtpSenderFormValues>(() =>
    mapSenderToFormValues(sender),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = sender !== null;
  const isPending = createSender.isPending || updateSender.isPending;

  useEffect(() => {
    setValues(mapSenderToFormValues(sender));
    setSubmitError(null);
  }, [sender]);

  function updateField<K extends keyof SmtpSenderFormValues>(
    field: K,
    value: SmtpSenderFormValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    try {
      if (sender) {
        await updateSender.mutateAsync({
          id: sender.id,
          input: buildUpdatePayload(values),
        });
      } else {
        await createSender.mutateAsync(buildCreatePayload(values));
      }

      onCancel();
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isEditing
            ? "Não foi possível atualizar o remetente."
            : "Não foi possível cadastrar o remetente.",
        ),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="app-card rounded-3xl p-5 md:p-6">
      <div className="flex flex-col gap-4 border-b pb-5 app-divider sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="app-icon-box rounded-2xl p-2">
            <Mail className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold app-heading">
              {isEditing ? "Editar remetente SMTP" : "Novo remetente SMTP"}
            </h2>

            <p className="mt-1 text-sm leading-6 app-muted">
              Configure os dados de identificação, autenticação e conexão SMTP.
            </p>
          </div>
        </div>

        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>

      {submitError ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{submitError}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <FieldLabel>Nome da configuração</FieldLabel>
          <Input
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Ex: Garbo principal"
            required
            className="mt-2 app-input"
          />
          <HelperText>Nome interno para identificar este remetente.</HelperText>
        </div>

        <div>
          <FieldLabel>From name</FieldLabel>
          <Input
            value={values.fromName}
            onChange={(event) => updateField("fromName", event.target.value)}
            placeholder="Ex: Garbo Certificação Digital"
            required
            className="mt-2 app-input"
          />
          <HelperText>Nome exibido como remetente da campanha.</HelperText>
        </div>

        <div>
          <FieldLabel>From e-mail</FieldLabel>
          <Input
            type="email"
            value={values.fromEmail}
            onChange={(event) => updateField("fromEmail", event.target.value)}
            placeholder="Ex: contato@garbo.com.br"
            required
            className="mt-2 app-input"
          />
          <HelperText>E-mail público usado no campo From.</HelperText>
        </div>

        <div>
          <FieldLabel>Reply-to e-mail</FieldLabel>
          <Input
            type="email"
            value={values.replyToEmail}
            onChange={(event) =>
              updateField("replyToEmail", event.target.value)
            }
            placeholder="Ex: atendimento@garbo.com.br"
            className="mt-2 app-input"
          />
          <HelperText>
            Opcional. E-mail para respostas dos destinatários.
          </HelperText>
        </div>

        <div>
          <FieldLabel>SMTP host</FieldLabel>
          <Input
            value={values.host}
            onChange={(event) => updateField("host", event.target.value)}
            placeholder="Ex: smtp.seudominio.com"
            required
            className="mt-2 app-input"
          />
          <HelperText>Servidor SMTP usado para envio.</HelperText>
        </div>

        <div>
          <FieldLabel>SMTP port</FieldLabel>
          <Input
            type="number"
            value={values.port}
            onChange={(event) => updateField("port", event.target.value)}
            placeholder="587"
            min={1}
            max={65535}
            required
            className="mt-2 app-input"
          />
          <HelperText>
            Normalmente 587 para STARTTLS ou 465 para SSL.
          </HelperText>
        </div>

        <div>
          <FieldLabel>SMTP username</FieldLabel>
          <Input
            value={values.username}
            onChange={(event) => updateField("username", event.target.value)}
            placeholder="Ex: usuario@smtp.com"
            className="mt-2 app-input"
          />
          <HelperText>Opcional, conforme o provedor SMTP.</HelperText>
        </div>

        <div>
          <FieldLabel>
            SMTP password {isEditing ? "(preencha apenas para trocar)" : ""}
          </FieldLabel>

          <div className="mt-2 flex gap-2">
            <Input
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Senha ou app password"
              className="app-input"
            />

            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          <HelperText>
            A senha deve ser salva com proteção no backend e não deve retornar
            em texto puro.
          </HelperText>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ToggleSwitch
          checked={values.secure}
          onChange={(checked) => updateField("secure", checked)}
          label="SMTP secure"
          description="Define se a conexão SMTP usa modo seguro."
        />

        <ToggleSwitch
          checked={values.isActive}
          onChange={(checked) => updateField("isActive", checked)}
          label="Remetente ativo"
          description="Permite usar este remetente em campanhas."
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t pt-5 app-divider sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium app-heading">
            {isEditing ? "Salvar alterações" : "Cadastrar remetente"}
          </p>

          <p className="mt-1 text-sm app-muted">
            Depois, a campanha poderá selecionar qual remetente será usado no
            dispatch.
          </p>
        </div>

        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Cadastrar remetente"}
        </Button>
      </div>
    </form>
  );
}

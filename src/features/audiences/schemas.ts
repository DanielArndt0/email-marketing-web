import { z } from "zod";

export const audienceFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe um nome com pelo menos 2 caracteres."),
    description: z.string().optional(),
    sourceType: z.enum(["cnpj-api", "csv-import", "manual-list"]),

    mode: z.enum(["cnae", "razao-social", "socio"]).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(500).optional(),
    uf: z.string().optional(),
    municipio: z.string().optional(),
    codigosCnae: z.string().optional(),
    razaoSocial: z.string().optional(),
    nomeSocio: z.string().optional(),

    csvContent: z.string().optional(),
    emailColumn: z.string().optional(),
    delimiter: z.string().optional(),
    manualRecipients: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === "cnpj-api") {
      if (!data.mode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mode"],
          message: "Selecione o modo de busca da CNPJ API.",
        });
        return;
      }

      if (data.mode === "cnae" && !data.codigosCnae?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["codigosCnae"],
          message: "Informe pelo menos um CNAE.",
        });
      }

      if (data.mode === "razao-social" && !data.razaoSocial?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["razaoSocial"],
          message: "Informe a razão social.",
        });
      }

      if (data.mode === "socio" && !data.nomeSocio?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nomeSocio"],
          message: "Informe o nome do sócio.",
        });
      }

      return;
    }

    if (data.sourceType === "csv-import") {
      if (!data.csvContent?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["csvContent"],
          message: "Informe o conteúdo do CSV.",
        });
      }

      if (!data.emailColumn?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["emailColumn"],
          message: "Informe a coluna de e-mail.",
        });
      }

      return;
    }

    if (data.sourceType === "manual-list") {
      if (!data.manualRecipients?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["manualRecipients"],
          message: "Informe pelo menos um destinatário.",
        });
      }
    }
  });

export type AudienceFormValues = z.infer<typeof audienceFormSchema>;

export function parseCnaeCodes(value?: string) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseManualRecipients(value?: string) {
  if (!value) return [];

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [email, externalId] = line
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      return {
        email,
        ...(externalId ? { externalId } : {}),
      };
    })
    .filter((recipient) => Boolean(recipient.email));
}

export function buildAudienceFilters(values: AudienceFormValues) {
  if (values.sourceType === "csv-import") {
    return {
      csvContent: values.csvContent?.trim() ?? "",
      emailColumn: values.emailColumn?.trim() || "email",
      delimiter: values.delimiter?.trim() || ",",
      limit: values.limit ?? 20,
    };
  }

  if (values.sourceType === "manual-list") {
    return {
      recipients: parseManualRecipients(values.manualRecipients),
      limit: values.limit ?? 20,
    };
  }

  return {
    mode: values.mode,
    page: values.page ?? 1,
    limit: values.limit ?? 50,
    ...(values.uf?.trim() ? { uf: values.uf.trim().toUpperCase() } : {}),
    ...(values.municipio?.trim() ? { municipio: values.municipio.trim() } : {}),
    ...(values.mode === "cnae"
      ? { codigosCnae: parseCnaeCodes(values.codigosCnae) }
      : {}),
    ...(values.mode === "razao-social" && values.razaoSocial?.trim()
      ? { razaoSocial: values.razaoSocial.trim() }
      : {}),
    ...(values.mode === "socio" && values.nomeSocio?.trim()
      ? { nomeSocio: values.nomeSocio.trim() }
      : {}),
  };
}

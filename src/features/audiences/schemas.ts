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
  })
  .superRefine((data, ctx) => {
    if (data.sourceType !== "cnpj-api") return;

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
  });

export type AudienceFormValues = z.infer<typeof audienceFormSchema>;

export function parseCnaeCodes(value?: string) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildAudienceFilters(values: AudienceFormValues) {
  if (values.sourceType !== "cnpj-api") {
    return {};
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

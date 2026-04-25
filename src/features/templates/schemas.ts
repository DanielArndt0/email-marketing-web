import { z } from "zod";

export const templateFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe um nome com pelo menos 2 caracteres."),
    subject: z.string().trim().min(2, "Informe o assunto do e-mail."),
    html: z.string().optional(),
    text: z.string().optional(),
    variables: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasHtml = Boolean(data.html?.trim());
    const hasText = Boolean(data.text?.trim());

    if (!hasHtml && !hasText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["html"],
        message: "Informe o conteúdo HTML ou o texto puro do template.",
      });
    }
  });

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

export function parseVariables(value?: string) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

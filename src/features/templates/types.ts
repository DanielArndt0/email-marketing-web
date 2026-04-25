export type TemplateVariable = {
  key: string;
  label?: string;
  required?: boolean;
  description?: string;
  example?: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: TemplateVariable[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTemplateInput = {
  name: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: TemplateVariable[];
};

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export type EmailTemplate = {
  id: string;
  name: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTemplateInput = {
  name: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: string[];
};

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

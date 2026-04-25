export type AudienceSourceType = "cnpj-api" | "csv-import" | "manual-list";

export type CnpjApiAudienceMode = "cnae" | "razao-social" | "socio";

export type CnpjApiAudienceFilters = {
  mode: CnpjApiAudienceMode;
  page?: number;
  limit?: number;
  uf?: string;
  municipio?: string;
  codigosCnae?: string[];
  razaoSocial?: string;
  nomeSocio?: string;
};

export type Audience = {
  id: string;
  name: string;
  description?: string;
  sourceType: AudienceSourceType;
  filters?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAudienceInput = {
  name: string;
  description?: string;
  sourceType: AudienceSourceType;
  filters?: Record<string, unknown>;
};

export type UpdateAudienceInput = Partial<CreateAudienceInput>;

export type AudiencePreviewItem = {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  cnpj?: string;
  uf?: string;
  municipio?: string;
  [key: string]: unknown;
};

export type AudiencePreviewResponse = {
  items: AudiencePreviewItem[];
  total?: number;
  page?: number;
  limit?: number;
};

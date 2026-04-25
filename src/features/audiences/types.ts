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
  sourceType: AudienceSourceType;
  filters?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

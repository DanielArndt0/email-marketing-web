import { endpoints } from "@/lib/api/endpoints";
import { getJson } from "@/lib/api/http";

export type DomainOption = {
  code: string;
  description: string;
};

export type SelectOption = {
  value: string;
  label: string;
  code: string;
  description: string;
};

type DomainOptionsResponse = {
  items: DomainOption[];
};

function toCitySelectOption(option: DomainOption): SelectOption {
  return {
    // Município deve ser salvo pelo nome/descrição no filtro da audience.
    value: option.description,
    label: option.description,
    code: option.code,
    description: option.description,
  };
}

function toCnaeSelectOption(option: DomainOption): SelectOption {
  return {
    // CNAE deve ser salvo pelo código.
    value: option.code,
    label: `${option.code} - ${option.description}`,
    code: option.code,
    description: option.description,
  };
}

export async function listCnpjApiCities({
  uf,
  search,
}: {
  uf: string;
  search?: string;
}): Promise<SelectOption[]> {
  if (!uf) return [];

  const response = await getJson<DomainOptionsResponse>(
    endpoints.domains.cnpjApi.cities,
    {
      uf,
      search,
      page: 1,
      limit: 30,
    },
  );

  return response.items.map(toCitySelectOption);
}

export async function listCnpjApiCnaes({
  search,
}: {
  search?: string;
}): Promise<SelectOption[]> {
  const response = await getJson<DomainOptionsResponse>(
    endpoints.domains.cnpjApi.cnaes,
    {
      search,
      page: 1,
      limit: 30,
    },
  );

  return response.items.map(toCnaeSelectOption);
}

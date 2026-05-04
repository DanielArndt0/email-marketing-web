# Arquitetura

O Email Marketing Web é o front-end administrativo do ecossistema de e-mail marketing. A aplicação é separada da Control API e consome seus recursos por HTTP usando um proxy interno do Next.js.

## Objetivo arquitetural

A aplicação deve ser uma imagem de front-end reutilizável em diferentes ambientes. Para isso, o browser não acessa diretamente a URL real da API.

Fluxo atual:

```txt
Browser → rota interna do Next.js → Control API
```

## Integração com a API

O client HTTP usa uma base relativa:

```txt
/api/backend
```

A rota interna encaminha as chamadas para a API real usando a variável privada de runtime:

```env
API_BASE_URL
```

Arquivo responsável:

```txt
src/app/api/backend/[...path]/route.ts
```

O schema OpenAPI também é acessado por rota interna:

```txt
/api/openapi-schema
```

Arquivo responsável:

```txt
src/app/api/openapi-schema/route.ts
```

Variável usada no servidor:

```env
OPENAPI_SCHEMA_URL
```

## Variáveis de ambiente

Variáveis usadas:

```env
API_BASE_URL=http://control-api:3000
OPENAPI_SCHEMA_URL=http://control-api:3000/documentation/json
```

Essas variáveis são privadas e não devem usar o prefixo `NEXT_PUBLIC_`.

## Camadas do projeto

```txt
src/app
```

Rotas do Next.js App Router, páginas e route handlers internos.

```txt
src/components
```

Componentes reutilizáveis, layout, UI, providers e tema.

```txt
src/features
```

Módulos funcionais por domínio da aplicação.

```txt
src/lib/api
```

Cliente HTTP, helpers de request e mapa centralizado de endpoints.

```txt
src/lib/env
```

Configurações seguras expostas ao client, contendo apenas rotas internas relativas.

```txt
src/types
```

Tipos compartilhados e tipos gerados do OpenAPI.

```txt
docs
```

Documentação técnica e funcional do projeto.

## Organização por feature

Cada feature segue a estrutura padrão:

```txt
api.ts
hooks.ts
types.ts
schemas.ts
components/
```

Responsabilidades:

- `api.ts`: funções HTTP da feature;
- `hooks.ts`: hooks de TanStack Query;
- `types.ts`: contratos TypeScript do domínio;
- `schemas.ts`: validações com Zod;
- `components/`: componentes visuais e telas da feature.

## Features principais

```txt
src/features/templates
```

Gestão de templates de e-mail.

```txt
src/features/audiences
```

Gestão de audiences e preview de leads.

```txt
src/features/campaigns
```

Criação, edição, status, mapeamento de variáveis e dispatch de campanhas.

```txt
src/features/smtp-senders
```

Gestão e teste de remetentes SMTP.

```txt
src/features/dispatches
```

Monitoramento visual de envios e falhas.

```txt
src/features/dashboard
```

Visão geral operacional.

```txt
src/features/system
```

Health check e informações da API.

## Regras de campanha

A UI não deve forçar estados sistêmicos do processo de envio.

O front-end pode solicitar ações como:

- salvar campanha;
- agendar;
- pausar;
- retomar;
- cancelar;
- solicitar dispatch.

O front-end não deve definir manualmente:

- `running`;
- `completed`;
- `failed`.

Esses estados são responsabilidade da Control API e do worker de dispatch.

## Mapeamento de variáveis

O mapeamento de variáveis conecta as variáveis declaradas no template aos dados do lead.

Origens suportadas:

- `lead`;
- `static`.

Campos com origem `lead` podem ter fallback.

Exemplo:

```json
{
  "name": {
    "source": "lead",
    "path": "metadata.name",
    "fallback": "cliente"
  }
}
```

Os paths do lead devem ser derivados dos campos reais da audience/preview, evitando opções mockadas ou presumidas que não existam na fonte de dados.

## Design system

O projeto usa tokens e classes semânticas em `src/app/globals.css` para manter consistência entre tema claro e escuro.

Exemplos:

```txt
app-card
app-button
app-badge
app-input-surface
app-select-surface
app-empty-state
```

Essa abordagem evita acoplamento visual excessivo a cores hardcoded e facilita ajustes globais de tema.

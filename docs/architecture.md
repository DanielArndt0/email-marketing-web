# Arquitetura inicial

O front-end é separado do back-end e deve consumir apenas a Control API via HTTP.

## Camadas

- `src/app`: rotas do Next.js App Router.
- `src/components`: componentes reutilizáveis e layout.
- `src/features`: módulos por domínio de UI.
- `src/lib/api`: cliente HTTP, endpoints e helpers de request.
- `src/lib/env`: validação de variáveis públicas.
- `src/types`: tipos compartilhados e tipos gerados do OpenAPI.

## Convenções

- Componentes de tela ficam dentro da feature.
- Requisições HTTP ficam em `api.ts` dentro da feature.
- Hooks de TanStack Query ficam em `hooks.ts`.
- Validações de formulário ficam em `schemas.ts`.
- Contratos específicos ficam em `types.ts`.
- Endpoints ficam centralizados em `src/lib/api/endpoints.ts`.

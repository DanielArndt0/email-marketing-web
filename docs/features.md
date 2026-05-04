# Funcionalidades implementadas

Este documento resume as funcionalidades atualmente implementadas no front-end do Email Marketing Web.

## 1. Infraestrutura de integração com a Control API

### Proxy interno para API

O front-end deixou de usar variáveis públicas para apontar diretamente para a Control API.

Antes, o navegador acessava a URL completa da API usando variáveis públicas de build. Agora, o navegador chama uma rota interna relativa:

```txt
/api/backend/...
```

Essa rota é tratada pelo servidor Next.js e encaminhada para a Control API real usando a variável privada:

```env
API_BASE_URL
```

Arquivo implementado:

```txt
src/app/api/backend/[...path]/route.ts
```

Características:

- suporta métodos `GET`, `POST`, `PATCH`, `PUT` e `DELETE`;
- preserva query string;
- repassa corpo da requisição quando aplicável;
- remove headers inadequados para proxy;
- usa `cache: "no-store"`;
- retorna erro controlado quando `API_BASE_URL` não está configurada.

### Proxy interno para OpenAPI

O schema OpenAPI também passou a ser acessado por rota interna:

```txt
/api/openapi-schema
```

A rota usa a variável privada:

```env
OPENAPI_SCHEMA_URL
```

Arquivo implementado:

```txt
src/app/api/openapi-schema/route.ts
```

### Objetivo da mudança

Permitir que a mesma imagem Docker do front-end funcione em ambientes diferentes apenas alterando variáveis de runtime do container.

Fluxo atual:

```txt
Browser → rota interna do front-end → Control API real
```

## 2. Cliente HTTP

O client HTTP usa Axios com base relativa:

```txt
/api/backend
```

Arquivo principal:

```txt
src/lib/api/http-client.ts
```

Funcionalidades:

- cliente Axios centralizado;
- timeout configurado;
- normalização de mensagens de erro;
- suporte a payloads de erro da API;
- helper `getApiErrorMessage` para feedback amigável na UI.

Helpers de request:

```txt
src/lib/api/http.ts
```

Implementados:

- `getJson`
- `postJson`
- `putJson`
- `patchJson`
- `deleteJson`

## 3. Dashboard

O dashboard apresenta visão inicial do sistema e componentes de resumo operacional.

Arquivos principais:

```txt
src/app/page.tsx
src/features/dashboard/components/dashboard-page-client.tsx
src/features/dashboard/components/campaigns-summary-table.tsx
```

Recursos:

- visão geral do painel;
- resumo de campanhas;
- acesso rápido aos módulos principais.

## 4. Templates de e-mail

Módulo responsável pela gestão dos modelos de e-mail.

Arquivos principais:

```txt
src/app/templates/page.tsx
src/features/templates/api.ts
src/features/templates/hooks.ts
src/features/templates/components/templates-page-client.tsx
src/features/templates/components/template-form.tsx
src/features/templates/components/template-list.tsx
src/features/templates/components/template-preview.tsx
src/features/templates/components/template-viewer.tsx
```

Funcionalidades implementadas:

- criação de template;
- edição de template;
- listagem de templates;
- preview do template;
- suporte a assunto;
- suporte a conteúdo HTML;
- suporte a conteúdo em texto puro;
- suporte a variáveis declaradas;
- destaque visual de variáveis no conteúdo.

Exemplo de variável declarada:

```json
{
  "key": "name",
  "label": "Nome",
  "required": true,
  "description": "Nome do lead",
  "example": "Maria"
}
```

## 5. Audiences

Módulo responsável pela criação e gerenciamento das bases de destinatários.

Arquivos principais:

```txt
src/app/audiences/page.tsx
src/features/audiences/api.ts
src/features/audiences/hooks.ts
src/features/audiences/components/audiences-client-page.tsx
src/features/audiences/components/audience-form.tsx
src/features/audiences/components/audience-list.tsx
src/features/audiences/components/audience-preview.tsx
```

Fontes suportadas:

- CNPJ API;
- importação CSV;
- lista manual.

Funcionalidades implementadas:

- criação de audience;
- edição de audience;
- listagem de audiences;
- preview de leads resolvidos;
- definição de filtros conforme a fonte;
- suporte a metadados dinâmicos;
- integração com opções de domínio para filtros da CNPJ API.

### CNPJ API

Suporte a filtros como:

- modo por CNAE;
- modo por razão social;
- modo por sócio;
- UF;
- município;
- códigos CNAE;
- razão social;
- nome do sócio.

### Preview de audience

O preview é usado para validar os dados disponíveis antes de vincular uma audience em campanhas.

A partir dele, o front-end consegue identificar os paths reais dos leads para o mapeamento de variáveis da campanha.

## 6. Remetentes SMTP

Módulo responsável pelo gerenciamento dos remetentes usados nos disparos.

Arquivos principais:

```txt
src/app/smtp-senders/page.tsx
src/features/smtp-senders/api.ts
src/features/smtp-senders/hooks.ts
src/features/smtp-senders/components/smtp-senders-page-clients.tsx
src/features/smtp-senders/components/smtp-sender-form.tsx
src/features/smtp-senders/components/smtp-sender-list.tsx
```

Funcionalidades implementadas:

- cadastro de remetente SMTP;
- edição de remetente SMTP;
- listagem paginada;
- filtro por remetentes ativos;
- teste de conexão/envio;
- exibição de último status de teste;
- exibição de erro do último teste;
- suporte a e-mail de resposta;
- suporte a host, porta, conexão segura, usuário e senha.

## 7. Campanhas

Módulo central para criação, configuração e execução de campanhas.

Arquivos principais:

```txt
src/app/campaigns/page.tsx
src/features/campaigns/api.ts
src/features/campaigns/hooks.ts
src/features/campaigns/types.ts
src/features/campaigns/schemas.ts
src/features/campaigns/componentes/campaigns-page-client.tsx
src/features/campaigns/componentes/campaign-list.tsx
src/features/campaigns/componentes/campaign-preview.tsx
src/features/campaigns/componentes/campaign-form.tsx
```

Funcionalidades implementadas:

- criação de campanha;
- edição de campanha;
- listagem de campanhas;
- preview da campanha;
- vínculo com template;
- vínculo com audience;
- vínculo com remetente SMTP;
- agendamento;
- dispatch imediato;
- retry de dispatch;
- cancelamento;
- pausa e retomada conforme status;
- feedback visual de operações;
- bloqueio de edição durante execução.

## 8. Wizard de criação/edição de campanha

O formulário de campanha foi organizado em etapas.

Arquivos principais:

```txt
src/features/campaigns/componentes/campaign-form/hooks/use-campaign-form-controller.ts
src/features/campaigns/componentes/campaign-form/components/steps/campaign-data-step.tsx
src/features/campaigns/componentes/campaign-form/components/steps/campaign-links-step.tsx
src/features/campaigns/componentes/campaign-form/components/steps/campaign-summary-step.tsx
src/features/campaigns/componentes/campaign-form/components/wizard-step-indicator.tsx
```

Etapas:

1. dados da campanha;
2. vínculos e mapeamento;
3. resumo.

Validações:

- nome obrigatório;
- template obrigatório para campanha pronta;
- audience obrigatória para campanha pronta;
- remetente SMTP obrigatório para campanha pronta;
- variáveis obrigatórias precisam estar mapeadas;
- agendamento precisa ser data válida quando informado.

## 9. Mapeamento de variáveis de template

O mapeamento permite conectar variáveis do template aos dados do lead.

Arquivos principais:

```txt
src/features/campaigns/componentes/campaign-form/hooks/use-template-variable-mapping.ts
src/features/campaigns/componentes/campaign-form/utils/audience-fields.ts
src/features/campaigns/componentes/campaign-form/utils/template-variables.ts
src/features/campaigns/componentes/campaign-form/components/steps/campaign-links-step.tsx
```

Fontes de valor suportadas:

- `lead`: valor extraído de um path do lead;
- `static`: valor fixo definido no front.

Exemplo com campo do lead:

```json
{
  "name": {
    "source": "lead",
    "path": "metadata.name"
  }
}
```

Exemplo com valor fixo:

```json
{
  "company": {
    "source": "static",
    "value": "Garbo"
  }
}
```

## 10. Fallback em variáveis mapeadas

Foi implementado suporte a fallback para variáveis com origem no lead.

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

Uso esperado:

- se `metadata.name` existir, usa o valor do lead;
- se `metadata.name` estiver vazio ou indisponível, o back-end pode usar `cliente`.

Esse recurso ajuda tanto na experiência do disparo quanto no debug de templates e dados incompletos.

## 11. Correção dos paths reais da audience

O front-end passou a evitar paths mockados ou presumidos por tipo de fonte.

O comportamento esperado é usar os campos realmente disponíveis na audience, especialmente a partir do preview dos leads.

Exemplo de audience com campos reais:

```txt
email
name
company
```

Paths esperados no mapeamento:

```txt
email
metadata.name
metadata.company
```

Com isso, o mapeamento deixa de oferecer campos inexistentes como `metadata.razaoSocial`, `metadata.municipio` ou `metadata.uf` quando esses campos não existem na fonte real.

## 12. Status das campanhas

Foi implementada uma camada de regras para controlar ações por status.

Arquivos principais:

```txt
src/features/campaigns/componentes/status/campaign-status-rules.tsx
src/features/campaigns/componentes/status/campaign-status-badge.tsx
src/features/campaigns/componentes/status/campaign-status-actions.tsx
src/features/campaigns/componentes/status/campaign-readiness-checklist.tsx
src/features/campaigns/componentes/status/campaign-dispatch-confirmation-dialog.tsx
```

Status suportados:

- `draft`
- `ready`
- `scheduled`
- `running`
- `paused`
- `completed`
- `canceled`
- `failed`

Regras importantes:

- campanha completa pode ficar pronta automaticamente ao salvar;
- o front-end não deve alterar manualmente para `running`, `completed` ou `failed`;
- envio deve chamar endpoint de dispatch;
- status sistêmicos devem ser controlados pelo back-end/worker;
- campanha pronta não precisa de ação manual para voltar a rascunho;
- edição não deve mudar status por si só quando os dados continuam válidos.

## 13. Checklist de prontidão

O checklist valida se a campanha possui os elementos mínimos para envio.

Itens verificados:

- template selecionado;
- audience selecionada;
- remetente SMTP selecionado;
- remetente SMTP ativo.

O checklist é usado principalmente:

- em campanhas incompletas;
- antes da confirmação de envio.

## 14. Confirmação de envio

Antes de iniciar um dispatch, o usuário visualiza um diálogo de confirmação.

Arquivo principal:

```txt
src/features/campaigns/componentes/status/campaign-dispatch-confirmation-dialog.tsx
```

Recursos:

- mostra campanha selecionada;
- exibe checklist de prontidão;
- permite cancelar;
- permite confirmar envio;
- bloqueia confirmação quando checklist não está válido;
- chama `POST /campaigns/:id/dispatch` ao confirmar.

## 15. Dispatches e monitoramento de envios

Módulo voltado ao acompanhamento de envios.

Arquivos principais:

```txt
src/app/dispatches/page.tsx
src/features/dispatches/components/dispatches-page-client.tsx
src/features/dispatches/components/dispatches-metrics.tsx
src/features/dispatches/components/dispatches-filters.tsx
src/features/dispatches/components/dispatches-list.tsx
src/features/dispatches/components/dispatch-details-panel.tsx
src/features/dispatches/components/dispatch-status-badge.tsx
src/features/dispatches/mock.ts
```

Funcionalidades implementadas na interface:

- métricas de campanhas monitoradas;
- quantidade enviada;
- quantidade com falha;
- quantidade em fila;
- filtros por busca e status;
- lista de campanhas monitoradas;
- detalhes da campanha;
- detalhes por destinatário;
- status por envio;
- tentativas;
- último erro;
- resposta SMTP;
- identificador do provedor;
- timeline operacional.

Observação: este módulo possui estrutura de UI e mock de dados para desenvolvimento/visualização até a integração completa com a API real de dispatches.

## 16. Configurações e tema

Arquivos principais:

```txt
src/app/settings/page.tsx
src/components/theme/theme-provider.tsx
src/app/globals.css
```

Funcionalidades:

- alternância entre tema claro e escuro;
- persistência visual do tema;
- tokens CSS semânticos;
- exibição da rota interna usada para integração com a API;
- ausência de exposição da URL real da Control API no browser.

## 17. Design system interno

O projeto usa classes semânticas globais para manter consistência visual.

Exemplos:

```txt
app-card
app-card-muted
app-card-flat
app-empty-state
app-list
app-list-row
app-button
app-button-primary
app-button-muted
app-button-surface
app-badge
app-badge-success
app-badge-warning
app-input-surface
app-select-surface
```

## 18. Endpoints centralizados

Os endpoints consumidos pelo front-end ficam centralizados em:

```txt
src/lib/api/endpoints.ts
```

Grupos implementados:

- `health`
- `templates`
- `audiences`
- `smtpSenders`
- `domains`
- `campaigns`
- `dispatches`

## 19. Hooks e cache

O projeto usa TanStack Query para cache, loading states, mutations e invalidação.

Padrão por feature:

```txt
api.ts
hooks.ts
types.ts
schemas.ts
components/
```

Benefícios:

- separação entre UI e acesso HTTP;
- revalidação após criação/edição/exclusão;
- feedback mais previsível na interface;
- código mais organizado por domínio.

## 20. Geração de tipos OpenAPI

Script implementado:

```txt
scripts/generate-openapi-types.mjs
```

Comando:

```bash
npm run openapi:types
```

Variável usada:

```env
OPENAPI_SCHEMA_URL
```

Objetivo:

- gerar contratos TypeScript a partir da documentação OpenAPI da Control API;
- evitar uso de variáveis públicas para schema;
- manter o fluxo compatível com Docker/runtime.

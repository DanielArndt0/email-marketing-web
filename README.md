# Email Marketing Web

![License](https://img.shields.io/badge/license-MIT-green)
![Contributing](https://img.shields.io/badge/contributing-guidelines-blue)

Front-end administrativo do ecossistema **Email Marketing**, responsável por operar campanhas, templates, audiences, remetentes SMTP e monitoramento de envios a partir da Control API.

O projeto foi desenvolvido com foco em operação real, validação de dados, organização por domínio e compatibilidade com ambientes Docker/GHCR.

---

## Visão geral

O **Email Marketing Web** funciona como painel operacional para:

- criar e gerenciar templates de e-mail;
- montar audiences a partir de diferentes fontes;
- criar campanhas com fluxo guiado;
- mapear variáveis dinâmicas entre template e lead;
- configurar remetentes SMTP;
- acompanhar dispatches, falhas, tentativas e histórico de envio;
- consumir a Control API por rotas internas do próprio Next.js.

A aplicação **não expõe a URL real da API para o navegador**. O browser chama rotas relativas do front-end, e o servidor Next.js faz o proxy para a Control API usando variáveis privadas de runtime.

---

## Stack

| Camada            | Tecnologia         |
| ----------------- | ------------------ |
| Framework         | Next.js App Router |
| UI                | React 19           |
| Linguagem         | TypeScript         |
| Estilização       | Tailwind CSS       |
| Estado assíncrono | TanStack Query     |
| Formulários       | React Hook Form    |
| Validação         | Zod                |
| HTTP Client       | Axios              |
| Ícones            | Lucide React       |
| Tipos da API      | openapi-typescript |

---

## Documentação

| Documento                                              | Conteúdo                                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| [`docs/architecture.md`](docs/architecture.md)         | Arquitetura do front-end, fluxo de proxy, organização de pastas e comunicação com a API.      |
| [`docs/features.md`](docs/features.md)                 | Funcionalidades implementadas por módulo: templates, audiences, campanhas, SMTP e dispatches. |
| [`docs/environment-ghcr.md`](docs/environment-ghcr.md) | Execução do ambiente completo com imagens publicadas no GitHub Container Registry.            |

---

## Requisitos

Para desenvolvimento local do front-end:

| Ferramenta | Versão mínima |
| ---------- | ------------- |
| Node.js    | 20            |
| npm        | 10            |

Também é necessário ter a **Control API** disponível em ambiente local, Docker ou servidor remoto.

---

## Configuração de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis privadas usadas pelo servidor Next.js.

Exemplo para desenvolvimento local, considerando a Control API disponível em `localhost:3333`:

```env
API_BASE_URL=http://localhost:3333
OPENAPI_SCHEMA_URL=http://localhost:3333/documentation/json
```

> Essas variáveis não são sensíveis. Elas podem apontar para endereços públicos ou internos, dependendo do ambiente.

A decisão de não usar `NEXT_PUBLIC_*` neste projeto não é por sigilo, mas por compatibilidade com Docker.

No Next.js, variáveis `NEXT_PUBLIC_*` são incorporadas ao bundle do navegador durante o build. Isso faria a imagem Docker do front-end ficar presa à URL da API usada no momento da geração da imagem.

Por isso, o projeto usa variáveis de runtime no servidor Next.js e rotas internas de proxy. Assim, a mesma imagem Docker pode ser reutilizada em ambientes diferentes, alterando apenas o arquivo de ambiente.

### Como o proxy funciona

```txt
Browser
  → /api/backend/...
  → Next.js Route Handler
  → API_BASE_URL/...
  → Control API
```

Para o schema OpenAPI:

```txt
Browser
  → /api/openapi-schema
  → Next.js Route Handler
  → OPENAPI_SCHEMA_URL
```

No ambiente Docker/GHCR, o valor de `API_BASE_URL` deve apontar para o nome interno do serviço da Control API na rede Docker.

Exemplo:

```env
API_BASE_URL=http://control-api:3000
OPENAPI_SCHEMA_URL=http://control-api:3000/documentation/json
```

Nesse caso, a porta deve acompanhar a porta interna configurada para a Control API no ambiente Docker.

---

## Instalação local

Clone o repositório e instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` com as variáveis necessárias:

```env
API_BASE_URL=http://localhost:3333
OPENAPI_SCHEMA_URL=http://localhost:3333/documentation/json
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```txt
http://localhost:3001
```

---

## Scripts disponíveis

| Comando                 | Descrição                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| `npm run dev`           | Inicia o Next.js em modo desenvolvimento na porta `3001`.        |
| `npm run build`         | Gera o build de produção.                                        |
| `npm run start`         | Executa a aplicação em modo produção na porta `3001`.            |
| `npm run typecheck`     | Valida os tipos TypeScript.                                      |
| `npm run lint`          | Executa o ESLint.                                                |
| `npm run format:check`  | Verifica formatação com Prettier.                                |
| `npm run check`         | Executa typecheck, formatação, lint e build.                     |
| `npm run openapi:types` | Gera tipos TypeScript a partir do schema OpenAPI da Control API. |

---

## Validação do projeto

Antes de abrir pull request ou gerar release, execute:

```bash
npm run check
```

Esse comando valida:

- tipos TypeScript;
- formatação;
- regras de lint;
- build de produção.

---

## Tipos OpenAPI

O projeto pode gerar tipos TypeScript a partir do schema OpenAPI da Control API:

```bash
npm run openapi:types
```

O script utiliza a variável:

```env
OPENAPI_SCHEMA_URL=http://localhost:3333/documentation/json
```

No Docker/GHCR, essa URL deve apontar para o endereço interno da Control API na rede Docker.

---

## Funcionalidades

| Módulo        | Resumo                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------- |
| Dashboard     | Visão geral operacional do ambiente.                                                          |
| Templates     | Cadastro, edição, preview e validação de templates com HTML, texto puro, assunto e variáveis. |
| Audiences     | Criação de bases por CNPJ API, CSV ou lista manual, com preview dos leads resolvidos.         |
| Campanhas     | Wizard para criação de campanhas, vínculo com template, audience e remetente SMTP.            |
| Variáveis     | Mapeamento de variáveis do template para campos reais do lead, valor fixo ou fallback.        |
| SMTP          | Cadastro, edição, ativação e teste de remetentes SMTP.                                        |
| Dispatches    | Monitoramento de envios, falhas, tentativas, respostas SMTP e timeline operacional.           |
| Configurações | Tema claro/escuro e informações do ambiente atual.                                            |

Veja a lista completa em [`docs/features.md`](docs/features.md).

---

## Execução com Docker/GHCR

Este repositório também pode ser usado como ponto de execução do ambiente completo do ecossistema Email Marketing, a partir da pasta `example/`.

Ela deve conter:

```txt
example/
├─  compose.ghcr.yaml
├─ .env.ghcr.example
└─ .env.ghcr
```

O arquivo `.env.ghcr` deve ser criado com base no `.env.ghcr.example`.

Com os arquivos na mesma pasta, execute:

```bash
docker compose --env-file .env.ghcr -f compose.ghcr.yaml up -d
```

Esse ambiente sobe:

- Email Marketing Web;
- Control API;
- Dispatch Worker;
- PostgreSQL customizado;
- Redis;
- Mailpit.

Mais detalhes em [`docs/environment-ghcr.md`](docs/environment-ghcr.md).

---

## Convenções importantes

- O browser deve chamar apenas rotas relativas internas.
- A URL real da Control API deve ficar em variável privada de runtime.
- Não use `NEXT_PUBLIC_*` para configurar conexão com a API.
- Requisições HTTP ficam no `api.ts` de cada feature.
- Hooks de React Query ficam em `hooks.ts`.
- Schemas de formulário ficam em `schemas.ts`.
- Tipos específicos ficam em `types.ts`.
- Endpoints compartilhados ficam em `src/lib/api/endpoints.ts`.
- Componentes de tela ficam dentro da feature correspondente.

---

## Licença

Distribuído sob licença MIT.

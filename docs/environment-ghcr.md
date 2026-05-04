# Ambiente completo com imagens do GitHub Container Registry

Este documento explica como executar o ecossistema completo do Email Marketing usando imagens publicadas no GitHub Container Registry.

Este ambiente sobe:

- Email Marketing Web;
- Control API;
- Dispatch Worker;
- PostgreSQL customizado com schema inicial;
- Redis;
- Mailpit.

## Arquivo de ambiente

O arquivo [`.env.ghcr.example`](../example/.env.ghcr.example) é o modelo de referência.

Antes de executar o ambiente, é necessário criar um arquivo real chamado:

```txt
.env.ghcr
```

Esse arquivo deve ficar na mesma pasta do [`compose.ghcr.yaml`](../example/compose.ghcr.yaml)

O `.env.ghcr` deve conter as variáveis necessárias para executar o back-end, o front-end e os serviços auxiliares. Use o conteúdo de [`.env.ghcr.example`](../example/.env.ghcr.example) como base e ajuste os valores conforme o ambiente.

O arquivo `.env.ghcr` não deve ser versionado no Git.

## Conexão do front-end com a API

O front-end não utiliza variáveis públicas `NEXT_PUBLIC_*` para definir a URL da API.

Essa decisão evita que a imagem Docker do front-end fique presa à URL usada no momento do build.

O navegador deve chamar apenas rotas relativas do próprio front-end, por exemplo:

```txt
/api/backend
/api/openapi-schema
```

Essas rotas internas funcionam como proxy e encaminham as requisições para a Control API usando variáveis privadas de runtime

Dentro do Docker Compose, `control-api` é o nome do serviço da Control API na rede interna dos containers. Por isso, o front-end deve apontar para `http://control-api:3000`, e não para `localhost`.

## Variáveis principais

O arquivo `.env.ghcr` centraliza:

- tag das imagens publicadas no GHCR;
- credenciais locais do PostgreSQL;
- portas publicadas no host;
- conexão da Control API com PostgreSQL, Redis e Mailpit;
- conexão do Email Marketing Web com a Control API;
- URL do schema OpenAPI;
- configurações auxiliares usadas pelo backend.

## Execução

A execução deve ser feita a partir da pasta onde estão o arquivo de ambiente e o arquivo Compose.

Por padrão, este projeto utiliza:

```txt
.env.ghcr
compose.ghcr.yaml
```

Depois execute:

```bash
docker compose --env-file .env.ghcr -f compose.ghcr.yaml up -d
```

Esse comando não faz build local das aplicações.

Ele apenas baixa e executa as imagens já publicadas no GitHub Container Registry, além das imagens públicas do Redis e Mailpit.

## Acessos locais

Com os valores padrão do `.env.ghcr.example`, os acessos ficam assim:

```txt
Email Marketing Web:  http://localhost:3001
Control API:          http://localhost:3333
Mailpit UI:           http://localhost:8025
PostgreSQL:           localhost:5433
Redis:                localhost:6380
```

## Parar o ambiente

Execute:

```bash
docker compose --env-file .env.ghcr -f compose.ghcr.yaml down
```

## Recriar o banco do zero

A imagem customizada do PostgreSQL contém o schema inicial do projeto.

Esse schema é executado apenas quando o volume do banco ainda está vazio. Para recriar o banco do zero, remova os volumes:

```bash
docker compose --env-file .env.ghcr -f compose.ghcr.yaml down -v
docker compose --env-file .env.ghcr -f compose.ghcr.yaml up -d
```

## Atualizar a versão das imagens

Para usar uma nova versão publicada no GitHub Container Registry, altere a variável no arquivo `.env.ghcr`:

```env
IMAGE_TAG=v1.0.1
```

Depois, execute:

```bash
docker compose --env-file .env.ghcr -f compose.ghcr.yaml pull
docker compose --env-file .env.ghcr -f compose.ghcr.yaml up -d
```

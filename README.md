# Catalog Backend Challenge

API em NestJS para gerenciamento de categorias e produtos, com persistência em PostgreSQL, mensageria com RabbitMQ e trilha de auditoria assíncrona.

O objetivo deste repositório é demonstrar capacidade de:

- tomar decisões técnicas coerentes
- implementar uma solução funcional e bem organizada
- justificar trade-offs de forma clara

## Visão Geral

A aplicação expõe uma API REST para:

- criar, listar e atualizar categorias
- criar, listar e atualizar produtos
- adicionar e remover categorias de um produto
- adicionar, atualizar e remover atributos de um produto
- ativar e arquivar produtos

Além do fluxo principal de catálogo, a aplicação também:

- publica eventos de domínio relevantes no RabbitMQ
- consome esses eventos em um módulo de auditoria
- persiste logs de auditoria em banco
- expõe um endpoint `/health` para verificar dependências críticas
- expõe documentação Swagger em `/docs`

Ao abrir `http://localhost:3000/`, a aplicação redireciona para `http://localhost:3000/docs`.

## Tecnologias

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- RabbitMQ
- Swagger
- Jest

## Estrutura do Projeto

O projeto foi organizado por módulos de negócio e por camadas.

- `src/modules/categories`
  Contém domínio, commands, queries, handlers, controller e persistência de categorias.
- `src/modules/products`
  Contém domínio, commands, queries, handlers, controller e persistência de produtos.
- `src/modules/audit`
  Consome eventos do RabbitMQ e grava logs em `audit_logs`.
- `src/modules/health`
  Expõe verificações de saúde de banco, mensageria, auditoria e metadados da aplicação.
- `src/shared`
  Infraestrutura compartilhada de banco, HTTP e mensageria.

## Decisões Arquiteturais

### 1. Separação por módulos de negócio

O projeto foi dividido em `categories`, `products`, `audit` e `health`. Isso ajuda a manter coesão alta e facilita evolução incremental do desafio.

### 2. Domínio explícito

As regras principais de negócio vivem nas entidades de domínio, principalmente:

- `product.entity.ts`
- `category.entity.ts`

Exemplos de regras modeladas no domínio:

- produto só pode ser ativado se tiver ao menos uma categoria
- produto só pode ser ativado se tiver ao menos um atributo
- produto arquivado não pode ter categorias alteradas
- produto arquivado não pode ter atributos alterados
- categoria não pode ser pai de si mesma

Essa decisão foi tomada para evitar que regras fiquem espalhadas entre controller, service e banco.

### 3. NestJS CQRS na camada de aplicação

A camada de aplicação foi estruturada com `@nestjs/cqrs`, separando operações de escrita em commands e handlers, e operações de leitura em queries e handlers.

Exemplos:

- `CreateProductCommand` + `CreateProductHandler`
- `ActivateProductCommand` + `ActivateProductHandler`
- `AddCategoryToProductCommand` + `AddCategoryToProductHandler`
- `ListCategoriesQuery` + `ListCategoriesHandler`

Isso deixa o fluxo de negócio explícito, melhora testabilidade e reduz acoplamento entre transporte HTTP e regra de negócio.

### 4. Repositórios por contrato

Os módulos usam contratos de repositório no domínio e implementações TypeORM na infraestrutura. Exemplos:

- `product.repository.ts`
- `category.repository.ts`

Trade-off:

- vantagem: menor acoplamento da aplicação ao ORM
- custo: mais arquivos e mapeamentos

### 5. Migrations como fonte de verdade do schema

O projeto usa `synchronize: false` e schema versionado por migrations.

Motivação:

- maior previsibilidade
- melhor maturidade para ambiente real
- mais controle sobre evolução de banco

Trade-off:

- exige disciplina maior na manutenção das migrations
- é um pouco mais lento do que `synchronize: true` para prototipagem inicial

### 6. Auditoria assíncrona desacoplada do fluxo principal

A gravação da trilha de auditoria não acontece diretamente dentro dos handlers de catálogo. Em vez disso:

1. Um evento é publicado
2. o RabbitMQ recebe esse evento em uma fila durável
3. o módulo `audit` consome a mensagem
4. o audit log é persistido no PostgreSQL

Essa escolha reduz acoplamento entre catálogo e auditoria e modela melhor um cenário próximo de produção.

## Estratégia de Mensageria e Auditoria

### Publicação de eventos

Os eventos são publicados por meio do contrato:

- `domain-event-publisher.ts`

A implementação concreta atual é:

- `rabbitmq-event.publisher.ts`

Os eventos publicados incluem ações como:

- criação de produto
- atualização de produto
- ativação e arquivamento
- inclusão e remoção de categorias
- inclusão, atualização e remoção de atributos
- atualização de categoria

### Consumo de eventos

O módulo de auditoria possui um consumidor dedicado:

- `audit-events.consumer.ts`

Esse consumidor:

- conecta no RabbitMQ
- consome a fila `audit.events`
- persiste os eventos recebidos em `audit_logs`
- faz `ack` quando a gravação ocorre com sucesso
- faz `nack` sem requeue em caso de falha de processamento

### Motivações da abordagem

- desacoplar auditoria do tempo de resposta da API
- registrar eventos relevantes para rastreabilidade
- permitir futura integração com outros consumidores

### Trade-offs

- a consistência entre catálogo e auditoria é eventual, não imediata
- uma indisponibilidade do RabbitMQ afeta a publicação de eventos
- o fluxo ganha robustez e extensibilidade, mas também mais moving parts

## Endpoint de Health

O endpoint `GET /health` consolida verificações importantes:

- PostgreSQL
- RabbitMQ
- dependência do fluxo de auditoria
- metadados da aplicação

Arquivos principais:

- `health.controller.ts`
- `health.service.ts`

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Subir infraestrutura local

```bash
docker compose up -d
```

Isso sobe:

- PostgreSQL em `localhost:5432`
- RabbitMQ em `localhost:5672`
- painel do RabbitMQ em `http://localhost:15672`

Credenciais padrão do RabbitMQ:

- usuário: `catalog`
- senha: `catalog`

### 4. Rodar migrations

```bash
npm run migration:run
```

### 5. Iniciar a aplicação

```bash
npm run start:dev
```

### 6. Acessar a documentação

- API docs: `http://localhost:3000/docs`
- Health check: `http://localhost:3000/health`

## Como Rodar os Testes

### Testes unitários

```bash
npm run test
```

Cobrem principalmente regras de domínio, por exemplo:

- ativação de produto
- restrições de produto arquivado
- validação de categoria pai

### Testes end-to-end

```bash
npm run test:e2e
```

Pré-requisitos para os e2e:

- PostgreSQL rodando
- migrations já aplicadas

Observações sobre a estratégia e2e atual:

- os testes sobem a aplicação real
- RabbitMQ é substituído por doubles no contexto de teste, para o e2e focar no fluxo HTTP + banco
- os dados de e2e usam prefixos próprios, como `E2E_PRODUCT_` e `E2E_CATEGORY_`
- o teste limpa apenas registros criados pelo próprio fluxo de teste

Essa abordagem foi escolhida para evitar apagar dados arbitrários do banco local.

### Coverage

```bash
npm run test:cov
```

## Migrations

Scripts disponíveis:

```bash
npm run migration:run
npm run migration:revert
npm run migration:show
npm run migration:generate -- src/shared/infrastructure/database/migrations/NomeDaMigration
```

Migrations atuais:

- `CreateCatalogSchema`
- `AuditLogSchema`

## Variáveis de Ambiente

As variáveis abaixo estão em .env.example:

### Aplicação

- `NODE_ENV`
  Ambiente de execução. Exemplo: `development`.
- `PORT`
  Porta HTTP da aplicação.
- `LOG_LEVEL`
  Nível de log do `nestjs-pino`.

### Banco de dados

- `DATABASE_HOST`
  Host do PostgreSQL.
- `DATABASE_PORT`
  Porta do PostgreSQL.
- `DATABASE_USER`
  Usuário do PostgreSQL.
- `DATABASE_PASSWORD`
  Senha do PostgreSQL.
- `DATABASE_NAME`
  Nome do banco.

### RabbitMQ

- `RABBITMQ_URL`
  URL de conexão do RabbitMQ.
- `RABBITMQ_AUDIT_QUEUE`
  Nome da fila usada para eventos de auditoria.
- `RABBITMQ_AUDIT_DLQ`
  Nome da dead-letter queue planejada para auditoria.

Observação:

- `RABBITMQ_AUDIT_DLQ` está previsto no ambiente, mas o fluxo atual ainda não configura explicitamente a DLQ na infraestrutura da fila. Mantive a variável para indicar a direção arquitetural e permitir evolução futura.

## Endpoints Principais

### Categories

- `POST /categories`
- `GET /categories`
- `PATCH /categories/:id`

### Products

- `POST /products`
- `GET /products`
- `PATCH /products/:id`
- `POST /products/:id/activate`
- `POST /products/:id/archive`
- `POST /products/:id/categories`
- `DELETE /products/:id/categories/:categoryId`
- `POST /products/:id/attributes`
- `PATCH /products/:id/attributes/:key`
- `DELETE /products/:id/attributes/:key`

## Fluxo Principal para Validação

Um fluxo completo esperado da API é:

1. Criar uma categoria
2. Criar um produto em status `DRAFT`
3. Associar a categoria ao produto
4. Adicionar um atributo dinâmico ao produto
5. Ativar o produto
6. Verificar que o produto foi alterado para `ACTIVE`
7. Verificar que os eventos de auditoria foram publicados e registrados

Esse fluxo resume a regra central do desafio porque exercita:

- consistência das regras de domínio do produto
- relacionamento entre categorias e produtos
- suporte a atributos dinâmicos
- transição controlada de status
- emissão de eventos de domínio
- persistência da trilha de auditoria

Na prática, esse mesmo encadeamento norteia o teste end-to-end do projeto.

## Trade-offs Assumidos

Algumas decisões foram intencionais para equilibrar clareza, tempo e maturidade:

- uso de módulos e de uma camada explícita de commands, queries e handlers, mesmo com mais arquivos
- uso de events + RabbitMQ para auditoria, mesmo sendo mais complexo do que gravar direto em banco
- uso de migrations em vez de `synchronize`
- e2e com limpeza seletiva por prefixo, em vez de truncar o banco inteiro

## Resumo Final

Este projeto prioriza:

- domínio explícito
- separação entre aplicação, domínio e infraestrutura
- versionamento de schema por migrations
- mensageria desacoplada para auditoria
- documentação de API via Swagger
- testes cobrindo domínio e fluxo fim a fim

As escolhas feitas buscam mostrar uma solução funcional, coerente e organizada, com trade-offs justificados para um desafio técnico de backend.

# PRD — RentDesk ERP Web para Gestão de Locação de Equipamentos Industriais

## 1. Visão Geral do Produto

### 1.1 Objetivo
Desenvolver um sistema web ERP voltado para empresas do setor de locação de equipamentos industriais — com ênfase em plataformas elevatórias e similares —, centralizando a gestão operacional, financeira, de estoque e de manutenção em uma única plataforma integrada.

### 1.2 Problema a Resolver
Empresas de locação de equipamentos industriais frequentemente operam com processos manuais ou fragmentados (planilhas, sistemas desconexos), gerando retrabalho, perda de rastreabilidade, dificuldades no controle financeiro e ausência de visibilidade sobre o ciclo de vida dos equipamentos.

### 1.3 Proposta de Valor
Um ERP web moderno, acessível via browser, que integra locação, faturamento, estoque de equipamentos, estoque de peças, manutenção e gestão de colaboradores em fluxos coesos e auditáveis, atendendo às especificidades operacionais do mercado de locação industrial.

### 1.4 Público-Alvo
- Gestores e diretores da empresa locadora
- Equipe comercial e de contratos
- Equipe de logística e operações
- Técnicos de manutenção
- Equipe financeira/administrativo

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework frontend | React com TypeScript |
| Build tool | Vite |
| Estilização | Tailwind CSS |
| Backend / BaaS | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Autenticação | Supabase Auth (JWT) |
| Armazenamento de arquivos | Supabase Storage (fotos, anexos) |
| Hospedagem sugerida | Vercel ou Netlify (frontend) + Supabase Cloud (backend) |

---

## 3. Arquitetura Geral

```
┌──────────────────────────────────────────────┐
│                 React + TypeScript            │
│                    (Vite)                     │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Módulos   │  │  Rotas   │  │  Estado  │  │
│  │  (pages)   │  │ (Router) │  │ (hooks)  │  │
│  └────────────┘  └──────────┘  └──────────┘  │
└───────────────────────┬──────────────────────┘
                        │ Supabase JS Client
┌───────────────────────▼──────────────────────┐
│                   Supabase                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │PostgreSQL│  │   Auth   │  │  Storage   │  │
│  │(tabelas) │  │  (RLS)   │  │  (fotos)   │  │
│  └──────────┘  └──────────┘  └────────────┘  │
└──────────────────────────────────────────────┘
```

### 3.1 Controle de Acesso
O controle de acesso será implementado via **Row Level Security (RLS)** do Supabase combinado com níveis de permissão armazenados no perfil do usuário. Todas as operações de leitura e escrita no banco respeitarão as políticas de RLS baseadas no papel (`role`) do colaborador autenticado.

---

## 4. Módulos do Sistema

### 4.1 Módulo de Locação de Equipamentos

#### 4.1.1 Descrição
Gerencia todo o ciclo de vida de uma locação industrial: criação do contrato, emissão de fatura, acompanhamento de status, devolução e conciliação financeira.

#### 4.1.2 Entidade: Fatura de Locação (`rental_invoices`)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `client_id` | FK → clients | Referência ao cliente |
| `client_name` | text | Nome do cliente (snapshot) |
| `cnpj` | text | CNPJ do cliente (snapshot) |
| `equipment_id` | FK → equipments | Referência ao equipamento |
| `equipment_name` | text | Nome do equipamento (snapshot) |
| `equipment_type` | text | Tipo do equipamento (ex: Plataforma Tesoura, Plataforma Articulada, Telescópica) |
| `equipment_size` | text | Tamanho/altura de trabalho do equipamento |
| `asset_number` | text | Número de patrimônio |
| `work_site` | text | Local da obra / instalação industrial |
| `billing_period_start` | date | Início do período de faturamento |
| `billing_period_end` | date | Fim do período de faturamento |
| `billing_status` | enum | Status do faturamento: Pendente, Emitida, Cancelada |
| `return_date` | date | Data de devolução do equipamento |
| `cost_rental` | numeric | Custo de locação |
| `cost_insurance` | numeric | Custo de seguro |
| `cost_freight` | numeric | Custo de frete |
| `cost_rcd` | numeric | Custo RCD |
| `cost_third_party` | numeric | Serviços de terceiros |
| `cost_training` | numeric | Custo de treinamento operacional |
| `total_value` | numeric | Valor total (calculado) |
| `due_date` | date | Vencimento da fatura |
| `payment_method` | text | Forma de pagamento |
| `bank_reconciliation_date` | date | Data da conciliação bancária |
| `reconciliation_status` | enum | Status da conciliação: Pendente, Conciliado, Divergente |
| `client_score` | integer | Nota atribuída ao cliente nesta fatura (1-5) |
| `notes` | text | Observações |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Última atualização |

#### 4.1.3 Funcionalidades
- Criação de nova locação vinculada a cliente e equipamento cadastrados
- Geração e visualização de fatura em tela (layout imprimível / exportável em PDF)
- Edição de todos os campos da fatura
- Atualização de status de faturamento e de conciliação
- Registro da data de devolução do equipamento (integrado ao módulo de estoque, atualizando o status do equipamento)
- Listagem de locações com filtros por: cliente, equipamento, status de faturamento, período, status de conciliação
- Dashboard com indicadores: total faturado no período, faturas em aberto, faturas vencidas, equipamentos em campo

---

### 4.2 Módulo de Estoque de Equipamentos

#### 4.2.1 Descrição
Cadastro e controle de todos os equipamentos industriais próprios da empresa — predominantemente plataformas elevatórias —, com rastreabilidade por número de patrimônio.

#### 4.2.2 Entidade: Equipamento (`equipments`)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `asset_number` | text | Número de patrimônio (único) |
| `name` | text | Nome do equipamento |
| `type` | text | Tipo: Plataforma Tesoura, Plataforma Articulada, Telescópica, Mastro Vertical, Rebocável, etc. |
| `model` | text | Modelo do fabricante |
| `serial_number` | text | Número de série |
| `height` | numeric | Altura máxima de trabalho (m) |
| `status` | enum | Status: Disponível, Locado, Em Manutenção, Inativo |
| `manufacture_year` | integer | Ano de fabricação |
| `value` | numeric | Valor do equipamento |
| `unit` | text | Unidade (ex: un) |
| `photo_url` | text | URL da foto no Supabase Storage |
| `notes` | text | Observações |
| `created_at` | timestamp | Data de cadastro |
| `updated_at` | timestamp | Última atualização |

#### 4.2.3 Funcionalidades
- Cadastro, edição e inativação de equipamentos
- Upload de foto do equipamento (armazenado no Supabase Storage)
- Visualização em lista e em card com foto
- Filtros por tipo, status, ano, modelo e altura de trabalho
- Atualização automática de status ao vincular/devolver em uma locação ou ao abrir/fechar uma OS de manutenção
- Histórico de locações e manutenções do equipamento

---

### 4.3 Módulo de Base de Clientes

#### 4.3.1 Descrição
Cadastro centralizado de todos os clientes industriais da empresa com dados comerciais e de contato.

#### 4.3.2 Entidade: Cliente (`clients`)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `company_name` | text | Nome da empresa |
| `cnpj` | text | CNPJ (único) |
| `contact_name` | text | Nome do contato principal |
| `phone` | text | Telefone |
| `email` | text | E-mail |
| `address_street` | text | Logradouro |
| `address_number` | text | Número |
| `address_complement` | text | Complemento |
| `address_city` | text | Cidade |
| `address_state` | text | Estado (UF) |
| `address_zip` | text | CEP |
| `average_score` | numeric | Média de avaliações do cliente |
| `documentation_url` | text | URL do documento anexado (contrato/documentos) |
| `active` | boolean | Cliente ativo/inativo |
| `created_at` | timestamp | Data de cadastro |
| `updated_at` | timestamp | Última atualização |

#### 4.3.3 Funcionalidades
- Cadastro, edição e inativação de clientes
- Busca por nome, CNPJ ou cidade
- Visualização do histórico de locações do cliente
- Validação de CNPJ no cadastro

---

### 4.4 Módulo de Estoque de Peças

#### 4.4.1 Descrição
Controle de inventário de peças de reposição utilizadas na manutenção dos equipamentos industriais.

#### 4.4.2 Entidade: Peça (`parts`)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `internal_code` | text | Código interno (único) |
| `description` | text | Descrição da peça |
| `part_number` | text | Part Number (PN) do fabricante |
| `quantity` | integer | Quantidade em estoque |
| `unit_value` | numeric | Valor unitário |
| `total_value` | numeric | Valor total (calculado: qty × unit_value) |
| `notes` | text | Observações |
| `created_at` | timestamp | Data de cadastro |
| `updated_at` | timestamp | Última atualização |

#### 4.4.3 Funcionalidades
- Cadastro, edição e exclusão de peças
- Atualização automática de quantidade ao vincular peças a uma Ordem de Serviço (baixa de estoque)
- Alerta visual de estoque baixo (configurável por peça)
- Filtros por código interno, descrição e PN
- Relatório de valor total do estoque de peças

---

### 4.5 Módulo de Gestão de Manutenções (Ordens de Serviço)

#### 4.5.1 Descrição
Controle completo do ciclo de manutenção dos equipamentos industriais, desde a abertura da OS até o encerramento, com registro de peças utilizadas e histórico. Contempla manutenções preventivas, corretivas e inspeções de conformidade.

#### 4.5.2 Entidade: Ordem de Serviço (`service_orders`)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `os_number` | text | Número sequencial da OS |
| `equipment_id` | FK → equipments | Equipamento vinculado |
| `equipment_asset_number` | text | Patrimônio (snapshot) |
| `equipment_name` | text | Nome do equipamento (snapshot) |
| `equipment_model` | text | Modelo (snapshot) |
| `equipment_serial_number` | text | Nº série (snapshot) |
| `equipment_condition_entry` | text | Dados e condição do equipamento na entrada (hodômetro, avarias, etc.) |
| `executed_by` | FK → users | Colaborador que executou |
| `execution_date` | date | Data de execução |
| `execution_location` | text | Local da execução (oficina, campo, cliente) |
| `status` | enum | Status: Aberta, Em Andamento, Aguardando Peças, Concluída, Cancelada |
| `description` | text | Descrição do serviço realizado |
| `notes` | text | Observações |
| `created_at` | timestamp | Data de abertura |
| `updated_at` | timestamp | Última atualização |

#### 4.5.3 Entidade: Peças da OS (`service_order_parts`)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `service_order_id` | FK → service_orders | OS vinculada |
| `part_id` | FK → parts | Peça utilizada |
| `quantity_used` | integer | Quantidade utilizada |
| `unit_value_at_use` | numeric | Valor unitário no momento do uso |
| `subtotal` | numeric | Subtotal (calculado) |

#### 4.5.4 Funcionalidades
- Abertura de OS vinculada a um equipamento industrial
- Preenchimento dos dados do equipamento na entrada (condição física, hodômetro, avarias visuais)
- Seleção do técnico executor e data/local de execução
- Adição de peças utilizadas com baixa automática do estoque de peças
- Atualização de status da OS com transições controladas
- Mudança automática do status do equipamento ao abrir/encerrar OS
- Listagem de OS com filtros por status, equipamento, técnico e período
- Impressão/exportação da ficha de OS

---

### 4.6 Módulo de Gestão de Usuários e Colaboradores

#### 4.6.1 Descrição
Cadastro e controle de acesso dos colaboradores da empresa ao sistema ERP.

#### 4.6.2 Entidade: Usuário/Colaborador (`users_profiles`)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Vinculado ao Supabase Auth |
| `full_name` | text | Nome completo |
| `cpf` | text | CPF (único) |
| `birth_date` | date | Data de nascimento |
| `phone` | text | Telefone |
| `email` | text | E-mail (vinculado ao Auth) |
| `address_street` | text | Logradouro |
| `address_number` | text | Número |
| `address_complement` | text | Complemento |
| `address_city` | text | Cidade |
| `address_state` | text | Estado (UF) |
| `address_zip` | text | CEP |
| `role_title` | text | Cargo/atribuição do colaborador |
| `access_level` | enum | Nível de acesso: Admin, Gerente, Operacional, Técnico, Financeiro, Visualizador |
| `active` | boolean | Colaborador ativo/inativo |
| `created_at` | timestamp | Data de cadastro |
| `updated_at` | timestamp | Última atualização |

#### 4.6.3 Níveis de Acesso

| Nível | Descrição |
|---|---|
| **Admin** | Acesso total ao sistema, incluindo gestão de usuários |
| **Gerente** | Acesso a todos os módulos operacionais e relatórios, sem gestão de usuários |
| **Financeiro** | Acesso ao módulo de locação/faturamento e relatórios financeiros |
| **Operacional** | Acesso a locações, estoque de equipamentos e clientes |
| **Técnico** | Acesso a manutenções (OS) e estoque de peças |
| **Visualizador** | Somente leitura em todos os módulos permitidos pelo gestor |

#### 4.6.4 Funcionalidades
- Cadastro de novo colaborador com criação automática de conta no Supabase Auth
- Edição de dados cadastrais e nível de acesso
- Inativação de colaborador (revoga acesso sem excluir histórico)
- Reset de senha via e-mail (fluxo nativo do Supabase Auth)
- Listagem com filtro por nível de acesso e status

---

## 5. Requisitos Não Funcionais

### 5.1 Segurança
- Toda autenticação via Supabase Auth com tokens JWT
- Row Level Security (RLS) ativo em todas as tabelas do banco
- Senhas armazenadas apenas via Supabase Auth (nunca em tabelas customizadas)
- HTTPS obrigatório em ambiente de produção

### 5.2 Performance
- Tempo de carregamento inicial (First Contentful Paint) inferior a 2 segundos em conexões 4G
- Paginação server-side em listagens com mais de 50 registros
- Uso de índices no banco para campos de busca frequente (CNPJ, patrimônio, número de OS)

### 5.3 Usabilidade
- Sistema responsivo, funcional em tablets e desktops
- Feedback visual para todas as operações assíncronas (loading states, toasts de sucesso/erro)
- Confirmação antes de operações destrutivas (exclusões, cancelamentos)

### 5.4 Auditoria
- Campos `created_at` e `updated_at` em todas as tabelas
- Registro do usuário responsável em operações críticas (criação de fatura, abertura de OS, alteração de status)

### 5.5 Disponibilidade
- SLA mínimo de 99,5% de uptime, herdado da infraestrutura Supabase Cloud

---

## 6. Integrações

| Integração | Tipo | Módulo | Descrição |
|---|---|---|---|
| Supabase Storage | Nativa | Estoque de Equipamentos | Upload e exibição de fotos dos equipamentos |
| Supabase Auth | Nativa | Usuários | Autenticação, convite e reset de senha |
| Exportação PDF | Biblioteca frontend | Locação / OS | Geração de faturas e fichas de OS em PDF |

---

## 7. Estrutura de Rotas (Sugestão)

```
/                          → Dashboard principal
/login                     → Tela de autenticação

/locacoes                  → Listagem de locações
/locacoes/nova             → Nova locação
/locacoes/:id              → Detalhe / edição da locação

/equipamentos              → Listagem do estoque de equipamentos
/equipamentos/novo         → Cadastro de equipamento
/equipamentos/:id          → Detalhe / edição de equipamento

/clientes                  → Listagem de clientes
/clientes/novo             → Cadastro de cliente
/clientes/:id              → Detalhe / edição de cliente

/pecas                     → Listagem do estoque de peças
/pecas/nova                → Cadastro de peça
/pecas/:id                 → Edição de peça

/manutencoes               → Listagem de OS
/manutencoes/nova          → Abertura de OS
/manutencoes/:id           → Detalhe / edição de OS

/usuarios                  → Listagem de colaboradores
/usuarios/novo             → Cadastro de colaborador
/usuarios/:id              → Detalhe / edição de colaborador

/configuracoes             → Configurações gerais do sistema
```

---

## 8. Modelo de Dados — Relacionamentos

```
clients ──────────────────┐
                          │ 1:N
                    rental_invoices
                          │ N:1
equipments ───────────────┘
    │
    │ 1:N
service_orders
    │ N:M (via service_order_parts)
parts


users_profiles ───────────┐
                          │ N:1
                    service_orders (executed_by)

users_profiles ───────────┐
                          │ N:1
                    rental_invoices (created_by / audit)
```

---

## 9. Critérios de Aceitação por Módulo

### Locação
- [ ] É possível criar uma locação selecionando cliente e equipamento existentes
- [ ] A fatura exibe todos os campos especificados e calcula o valor total automaticamente
- [ ] É possível atualizar o status de faturamento e de conciliação independentemente
- [ ] O registro de devolução atualiza o status do equipamento para "Disponível"
- [ ] A fatura pode ser exportada em PDF

### Estoque de Equipamentos
- [ ] É possível cadastrar equipamento com foto via upload
- [ ] O status do equipamento é atualizado automaticamente por locações e OS
- [ ] É possível visualizar o histórico de locações e manutenções de cada equipamento

### Clientes
- [ ] O CNPJ é validado no cadastro
- [ ] É possível visualizar todas as locações associadas a um cliente

### Peças
- [ ] A quantidade em estoque é reduzida automaticamente ao vincular peça a uma OS concluída
- [ ] O valor total é calculado automaticamente a partir de quantidade × valor unitário

### Manutenções (OS)
- [ ] A OS exibe dados do equipamento no momento da entrada
- [ ] Peças são vinculadas à OS com baixa automática no estoque
- [ ] A OS pode ser impressa/exportada como ficha técnica

### Usuários
- [ ] O nível de acesso controla efetivamente quais módulos e ações o colaborador visualiza e executa
- [ ] A inativação de um colaborador impede o login sem excluir seu histórico
- [ ] Somente o Admin pode criar e editar outros usuários

---

## 10. Fora do Escopo (v1.0)

- Integração com sistemas de emissão de NF-e
- Aplicativo mobile nativo
- Portal de autoatendimento para clientes
- Geolocalização e rastreamento dos equipamentos em campo
- Módulo de RH completo (ponto, folha de pagamento)
- Integração com ERP fiscal/contábil externo
- Gestão de certificações e laudos de inspeção de plataformas (ex: NR-12, NR-18)

---

## 11. Glossário

| Termo | Definição |
|---|---|
| **OS** | Ordem de Serviço de manutenção |
| **RCD** | Responsabilidade Civil Danos — cobertura de seguro específica para locação de equipamentos |
| **PN** | Part Number — código do fabricante para identificação da peça |
| **Patrimônio** | Número de identificação único atribuído pela empresa a cada equipamento do seu acervo |
| **Conciliação Bancária** | Processo de confirmação do recebimento do pagamento da fatura no extrato bancário |
| **RLS** | Row Level Security — mecanismo de controle de acesso por linha no PostgreSQL/Supabase |
| **Plataforma Elevatória** | Equipamento industrial utilizado para acesso em altura, como plataformas tesoura, articuladas e telescópicas |
| **Altura de Trabalho** | Altura máxima operacional de uma plataforma elevatória, usada como critério de classificação e locação |

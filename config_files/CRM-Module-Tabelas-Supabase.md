# Estrutura de Tabelas — Módulo de CRM
> ERP de Locação de Equipamentos Industriais  
> Backend: Supabase (PostgreSQL) | Contexto: todas as tabelas usam UUID como PK e respeitam RLS por `access_level` do colaborador autenticado.

---

## Dependências de tabelas já existentes no ERP

Este módulo **não recria** as tabelas abaixo. Todas as referências a elas são FK para estruturas já documentadas no PRD:

```
clients (id, company_name, cnpj, contact_name, phone, email, address_*, active)
  → Representa empresas já convertidas em clientes ativos do ERP.
  → No CRM, um lead pode ser promovido a cliente gerando um registro em clients.

users_profiles (id, full_name, access_level, role_title, active)
  → Colaboradores responsáveis por negociações, tarefas e atividades.
```

---

## Visão geral das novas tabelas

```
crm_leads                  → Empresas/pessoas ainda não convertidas em clients
crm_contacts               → Contatos vinculados a leads OU a clients
crm_pipelines              → Funis de venda configuráveis
crm_pipeline_stages        → Etapas de cada funil
crm_deals                  → Negociações (oportunidades)
crm_deal_activities        → Histórico de atividades de uma negociação
crm_tasks                  → Tarefas vinculadas a deals, leads ou contacts
crm_task_types             → Catálogo de tipos de tarefa
```

---

## 1. Leads

### 1.1 `crm_leads` — Cadastro de leads

Representa empresas ou pessoas que ainda não são clientes ativos. Quando convertido, o lead origina um registro em `clients`.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `company_name` | TEXT | NOT NULL | Nome da empresa ou pessoa |
| `cnpj` | TEXT | | CNPJ (quando disponível) |
| `segment` | TEXT | | Segmento industrial (ex: "Construção Civil", "Petroquímica", "Mineração") |
| `estimated_potential` | NUMERIC(12,2) | | Potencial estimado de receita anual |
| `source` | TEXT | | Origem do lead (ex: "Indicação", "Site", "Evento", "Cold Call") |
| `status` | TEXT | NOT NULL, default 'Novo' | Status: `Novo`, `Em Contato`, `Qualificado`, `Desqualificado`, `Convertido` |
| `converted_at` | TIMESTAMPTZ | | Data em que foi convertido em cliente |
| `converted_client_id` | UUID | FK → clients(id) | Registro em clients gerado após conversão |
| `owner_id` | UUID | FK → users_profiles(id), NOT NULL | Responsável pelo lead |
| `notes` | TEXT | | Observações gerais |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Regra:** quando `status = 'Convertido'`, `converted_client_id` e `converted_at` devem ser preenchidos. A conversão deve criar o registro correspondente em `clients`.

---

## 2. Contatos

### 2.1 `crm_contacts` — Contatos de leads e clientes

Pessoas físicas vinculadas a um lead **ou** a um cliente ativo. Um lead ou cliente pode ter múltiplos contatos.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `lead_id` | UUID | FK → crm_leads(id) | Lead ao qual o contato pertence (mutuamente exclusivo com client_id) |
| `client_id` | UUID | FK → clients(id) | Cliente ao qual o contato pertence (mutuamente exclusivo com lead_id) |
| `full_name` | TEXT | NOT NULL | Nome completo do contato |
| `role_title` | TEXT | | Cargo/função na empresa (ex: "Gerente de Compras", "SESMT") |
| `department` | TEXT | | Departamento |
| `email` | TEXT | | E-mail corporativo |
| `phone` | TEXT | | Telefone/WhatsApp |
| `is_primary` | BOOLEAN | NOT NULL, default FALSE | Se é o contato principal da empresa |
| `notes` | TEXT | | Observações |
| `active` | BOOLEAN | NOT NULL, default TRUE | Contato ativo |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Constraint:** `CHECK ((lead_id IS NOT NULL AND client_id IS NULL) OR (lead_id IS NULL AND client_id IS NOT NULL))` — um contato pertence a lead OU a cliente, nunca aos dois.  
> Quando um lead é convertido em cliente, os contatos vinculados ao lead devem ter `lead_id` zerado e `client_id` atualizado para o novo cliente.

---

## 3. Funis de Venda

### 3.1 `crm_pipelines` — Funis de venda

Permite ter múltiplos funis configurados (ex: "Locação de Plataformas", "Contratos de Manutenção").

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL, UNIQUE | Nome do funil (ex: "Locação Operacional") |
| `description` | TEXT | | Descrição do funil |
| `active` | BOOLEAN | NOT NULL, default TRUE | Funil ativo |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

---

### 3.2 `crm_pipeline_stages` — Etapas dos funis

Cada funil possui etapas sequenciais configuráveis. A ordem é controlada pelo campo `position`.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `pipeline_id` | UUID | FK → crm_pipelines(id), NOT NULL | Funil ao qual a etapa pertence |
| `name` | TEXT | NOT NULL | Nome da etapa (ex: "Prospecção", "Proposta Enviada", "Negociação", "Fechado Ganho", "Fechado Perdido") |
| `position` | INTEGER | NOT NULL | Ordem da etapa dentro do funil (1, 2, 3...) |
| `is_won` | BOOLEAN | NOT NULL, default FALSE | Marca a etapa como "negócio ganho" |
| `is_lost` | BOOLEAN | NOT NULL, default FALSE | Marca a etapa como "negócio perdido" |
| `probability_pct` | INTEGER | | Probabilidade de fechamento padrão (0–100%) desta etapa |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

> **Constraint:** `CHECK (NOT (is_won = TRUE AND is_lost = TRUE))` — uma etapa não pode ser ganha e perdida ao mesmo tempo.  
> **Constraint:** `CHECK (probability_pct BETWEEN 0 AND 100)`

---

## 4. Negociações (Deals)

### 4.1 `crm_deals` — Negociações / Oportunidades

Representa uma oportunidade de negócio em andamento. Pode estar vinculada a um lead (pré-conversão) ou a um cliente já ativo.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `title` | TEXT | NOT NULL | Título da negociação (ex: "Locação 2x PS12 — Obra Paulínia") |
| `pipeline_id` | UUID | FK → crm_pipelines(id), NOT NULL | Funil ao qual pertence |
| `stage_id` | UUID | FK → crm_pipeline_stages(id), NOT NULL | Etapa atual no funil |
| `lead_id` | UUID | FK → crm_leads(id) | Lead vinculado (quando o cliente ainda não foi convertido) |
| `client_id` | UUID | FK → clients(id) | Cliente vinculado (quando já convertido ou cliente existente) |
| `primary_contact_id` | UUID | FK → crm_contacts(id) | Contato principal desta negociação |
| `owner_id` | UUID | FK → users_profiles(id), NOT NULL | Responsável pela negociação |
| `value` | NUMERIC(12,2) | | Valor estimado da negociação |
| `probability_pct` | INTEGER | | Probabilidade de fechamento (0–100%), herdada da etapa ou sobrescrita |
| `expected_close_date` | DATE | | Data prevista de fechamento |
| `closed_at` | TIMESTAMPTZ | | Data efetiva de fechamento (ganho ou perdido) |
| `lost_reason` | TEXT | | Motivo da perda (obrigatório quando etapa `is_lost = TRUE`) |
| `description` | TEXT | | Descrição e contexto da oportunidade |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Constraint:** `CHECK ((lead_id IS NOT NULL AND client_id IS NULL) OR (lead_id IS NULL AND client_id IS NOT NULL) OR (client_id IS NOT NULL))` — a negociação deve estar vinculada a pelo menos um lead ou cliente.  
> **Constraint:** `CHECK (probability_pct BETWEEN 0 AND 100)`

---

### 4.2 `crm_deal_activities` — Histórico de atividades da negociação

Timeline de tudo que aconteceu em uma negociação: mudanças de etapa, contatos realizados, notas, propostas enviadas, etc.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `deal_id` | UUID | FK → crm_deals(id), NOT NULL | Negociação vinculada |
| `activity_type` | TEXT | NOT NULL | Tipo: `Nota`, `Ligação`, `E-mail`, `Reunião`, `Mudança de Etapa`, `Proposta Enviada`, `Visita Técnica` |
| `description` | TEXT | NOT NULL | Descrição da atividade |
| `stage_from_id` | UUID | FK → crm_pipeline_stages(id) | Etapa anterior (apenas em mudanças de etapa) |
| `stage_to_id` | UUID | FK → crm_pipeline_stages(id) | Etapa destino (apenas em mudanças de etapa) |
| `contact_id` | UUID | FK → crm_contacts(id) | Contato envolvido na atividade (opcional) |
| `performed_by` | UUID | FK → users_profiles(id), NOT NULL | Colaborador que registrou |
| `activity_date` | TIMESTAMPTZ | NOT NULL, default now() | Data/hora da atividade |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

---

## 5. Tarefas

### 5.1 `crm_task_types` — Tipos de tarefa

Catálogo configurável dos tipos de tarefa utilizados no CRM.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL, UNIQUE | Nome do tipo (ex: "Ligação de Follow-up", "Enviar Proposta", "Visita Técnica", "Reunião Comercial") |
| `active` | BOOLEAN | NOT NULL, default TRUE | Tipo ativo |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

---

### 5.2 `crm_tasks` — Tarefas

Tarefas criadas no contexto de uma negociação, lead ou contato. Funcionam como agenda comercial do colaborador.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `task_type_id` | UUID | FK → crm_task_types(id), NOT NULL | Tipo da tarefa |
| `title` | TEXT | NOT NULL | Título da tarefa |
| `description` | TEXT | | Descrição detalhada |
| `deal_id` | UUID | FK → crm_deals(id) | Negociação vinculada (opcional) |
| `lead_id` | UUID | FK → crm_leads(id) | Lead vinculado (opcional) |
| `contact_id` | UUID | FK → crm_contacts(id) | Contato vinculado (opcional) |
| `assigned_to` | UUID | FK → users_profiles(id), NOT NULL | Colaborador responsável pela tarefa |
| `created_by` | UUID | FK → users_profiles(id), NOT NULL | Quem criou a tarefa |
| `due_date` | TIMESTAMPTZ | NOT NULL | Prazo para conclusão |
| `completed_at` | TIMESTAMPTZ | | Data/hora de conclusão |
| `status` | TEXT | NOT NULL, default 'Pendente' | Status: `Pendente`, `Em Andamento`, `Concluída`, `Cancelada` |
| `priority` | TEXT | NOT NULL, default 'Normal' | Prioridade: `Baixa`, `Normal`, `Alta`, `Urgente` |
| `notes` | TEXT | | Observações ao concluir |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Observação:** a tarefa não exige vínculo obrigatório com deal, lead ou contato — pode ser uma tarefa comercial avulsa atribuída a um colaborador.

---

## 6. Índices recomendados

```sql
-- Leads
CREATE INDEX idx_crm_leads_owner       ON crm_leads(owner_id);
CREATE INDEX idx_crm_leads_status      ON crm_leads(status);
CREATE INDEX idx_crm_leads_converted   ON crm_leads(converted_client_id) WHERE converted_client_id IS NOT NULL;

-- Contatos
CREATE INDEX idx_crm_contacts_lead     ON crm_contacts(lead_id)   WHERE lead_id IS NOT NULL;
CREATE INDEX idx_crm_contacts_client   ON crm_contacts(client_id) WHERE client_id IS NOT NULL;

-- Funil / Etapas
CREATE INDEX idx_crm_stages_pipeline   ON crm_pipeline_stages(pipeline_id);

-- Negociações
CREATE INDEX idx_crm_deals_pipeline    ON crm_deals(pipeline_id);
CREATE INDEX idx_crm_deals_stage       ON crm_deals(stage_id);
CREATE INDEX idx_crm_deals_owner       ON crm_deals(owner_id);
CREATE INDEX idx_crm_deals_lead        ON crm_deals(lead_id)   WHERE lead_id IS NOT NULL;
CREATE INDEX idx_crm_deals_client      ON crm_deals(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_crm_deals_close_date  ON crm_deals(expected_close_date);

-- Atividades
CREATE INDEX idx_crm_activities_deal   ON crm_deal_activities(deal_id);
CREATE INDEX idx_crm_activities_date   ON crm_deal_activities(activity_date);

-- Tarefas
CREATE INDEX idx_crm_tasks_assigned    ON crm_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_due         ON crm_tasks(due_date);
CREATE INDEX idx_crm_tasks_status      ON crm_tasks(status);
CREATE INDEX idx_crm_tasks_deal        ON crm_tasks(deal_id)   WHERE deal_id IS NOT NULL;
CREATE INDEX idx_crm_tasks_lead        ON crm_tasks(lead_id)   WHERE lead_id IS NOT NULL;
```

---

## 7. Diagrama de relacionamentos

```
clients (PRD)
    │
    ├──────────────────────────────┐
    │                              │
crm_leads ──(conversão)──────→ clients
    │
    ├── crm_contacts ←──────────── clients
    │
    └── crm_deals ──→ crm_pipeline_stages ──→ crm_pipelines
            │
            ├── crm_deal_activities ──→ crm_contacts
            │                       ──→ users_profiles
            │
            └── crm_tasks ──→ crm_task_types
                           ──→ users_profiles
                           ──→ crm_contacts
                           ──→ crm_leads
```

---

## 8. Enums sugeridos

| Tabela | Coluna | Valores |
|---|---|---|
| `crm_leads` | `status` | `Novo`, `Em Contato`, `Qualificado`, `Desqualificado`, `Convertido` |
| `crm_leads` | `source` | `Indicação`, `Site`, `Evento`, `Cold Call`, `Rede Social`, `Parceiro`, `Outro` |
| `crm_deals` | (sem enum fixo para etapa) | Etapas são configuráveis via `crm_pipeline_stages` |
| `crm_deal_activities` | `activity_type` | `Nota`, `Ligação`, `E-mail`, `Reunião`, `Mudança de Etapa`, `Proposta Enviada`, `Visita Técnica` |
| `crm_tasks` | `status` | `Pendente`, `Em Andamento`, `Concluída`, `Cancelada` |
| `crm_tasks` | `priority` | `Baixa`, `Normal`, `Alta`, `Urgente` |

---

## 9. Fluxo de conversão de Lead → Cliente

```
1. Lead cadastrado em crm_leads (status = 'Novo' → 'Qualificado')
2. Negociação aberta em crm_deals vinculada ao lead
3. Deal chega em etapa com is_won = TRUE
4. Ação de conversão:
   a. Cria registro em clients com dados do crm_leads
   b. Atualiza crm_leads.status = 'Convertido'
   c. Preenche crm_leads.converted_client_id e converted_at
   d. Migra crm_contacts: lead_id → NULL, client_id → novo clients.id
   e. Atualiza crm_deals.client_id → novo clients.id, lead_id → NULL
```

---

## 10. Notas de implementação para o Gemini

- **RLS:** colaboradores com `access_level = 'Admin'` ou `'Gerente'` visualizam todos os registros. `access_level = 'Operacional'` ou `'Financeiro'` visualiza apenas deals onde `owner_id = auth.uid()` ou tarefas onde `assigned_to = auth.uid()`.
- **Kanban do funil:** a view de kanban do pipeline deve ser construída no frontend agrupando `crm_deals` por `stage_id`, ordenados por `created_at` ou `value`. Nenhuma tabela adicional de posição de card é necessária na v1.
- **Histórico automático de mudança de etapa:** ao atualizar `crm_deals.stage_id`, a camada de aplicação deve inserir automaticamente um registro em `crm_deal_activities` com `activity_type = 'Mudança de Etapa'`, preenchendo `stage_from_id` e `stage_to_id`.
- **Tarefas vencidas:** o frontend deve sinalizar visualmente tarefas com `due_date < now()` e `status IN ('Pendente', 'Em Andamento')` sem necessidade de campo adicional no banco.
- **Contatos x clients:** a tabela `clients` no PRD já possui `contact_name`, `phone` e `email` como campos únicos de contato principal. A tabela `crm_contacts` complementa isso permitindo múltiplos contatos por empresa. Ambas coexistem sem conflito.

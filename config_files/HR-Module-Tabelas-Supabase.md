# Estrutura de Tabelas — Módulo de Recursos Humanos
> ERP de Locação de Equipamentos Industriais  
> Backend: Supabase (PostgreSQL) | Contexto: todas as tabelas usam UUID como PK e respeitam RLS por `access_level` do colaborador autenticado.

---

## Dependência de base

Este módulo **não recria** a tabela de colaboradores. Todas as tabelas abaixo referenciam a tabela já existente:

```
users_profiles (id UUID PK → auth.users)
  - full_name
  - cpf
  - access_level (enum)
  - role_title
  - active (boolean)
  - ... demais campos já documentados no PRD
```

---

## 1. Plano de Cargos e Salários

### 1.1 `hr_job_levels` — Níveis hierárquicos

Representa os graus/faixas dentro de um mesmo cargo (ex: Técnico I, Técnico II, Técnico Sênior).

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL | Nome do nível (ex: "Júnior", "Pleno", "Sênior") |
| `description` | TEXT | | Descrição do nível |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

---

### 1.2 `hr_positions` — Cargos

Catálogo de cargos da empresa.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `title` | TEXT | NOT NULL | Título do cargo (ex: "Técnico de Manutenção") |
| `department` | TEXT | NOT NULL | Departamento (ex: "Operações", "Comercial", "Administrativo") |
| `description` | TEXT | | Descrição e responsabilidades do cargo |
| `cbo_code` | TEXT | | Código Brasileiro de Ocupações (CBO) |
| `active` | BOOLEAN | NOT NULL, default TRUE | Cargo ativo ou desativado |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

---

### 1.3 `hr_salary_ranges` — Faixas salariais

Cada cargo pode ter múltiplas faixas, uma por nível hierárquico.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `position_id` | UUID | FK → hr_positions(id), NOT NULL | Cargo ao qual a faixa pertence |
| `level_id` | UUID | FK → hr_job_levels(id), NOT NULL | Nível hierárquico da faixa |
| `salary_min` | NUMERIC(12,2) | NOT NULL | Piso salarial da faixa |
| `salary_mid` | NUMERIC(12,2) | | Ponto médio (midpoint) da faixa |
| `salary_max` | NUMERIC(12,2) | NOT NULL | Teto salarial da faixa |
| `effective_date` | DATE | NOT NULL | Data de vigência desta faixa |
| `notes` | TEXT | | Observações (ex: "Revisão anual 2025") |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Regra:** `salary_min <= salary_mid <= salary_max`  
> Constraint sugerida: `CHECK (salary_min <= salary_max)`

---

### 1.4 `hr_employee_positions` — Histórico de cargos do colaborador

Registra cada movimentação de cargo/salário de um colaborador ao longo do tempo.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK → users_profiles(id), NOT NULL | Colaborador |
| `position_id` | UUID | FK → hr_positions(id), NOT NULL | Cargo assumido |
| `level_id` | UUID | FK → hr_job_levels(id), NOT NULL | Nível assumido |
| `salary` | NUMERIC(12,2) | NOT NULL | Salário negociado nesta vigência |
| `start_date` | DATE | NOT NULL | Início da vigência |
| `end_date` | DATE | | Fim da vigência (NULL = posição atual) |
| `change_reason` | TEXT | | Motivo da movimentação (promoção, reajuste, transferência, etc.) |
| `registered_by` | UUID | FK → users_profiles(id) | Quem registrou a movimentação |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Regra:** apenas um registro com `end_date IS NULL` por colaborador representa o cargo atual.

---

## 2. Monitoramento de Documentação

### 2.1 `hr_document_types` — Tipos de documento

Catálogo configurável dos documentos que a empresa exige de cada colaborador.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL, UNIQUE | Nome do documento (ex: "CNH", "ASO", "CTPS") |
| `description` | TEXT | | Descrição e instruções |
| `requires_expiry` | BOOLEAN | NOT NULL, default FALSE | Se o documento possui data de validade |
| `alert_days_before` | INTEGER | default 30 | Quantos dias antes do vencimento emitir alerta |
| `mandatory` | BOOLEAN | NOT NULL, default TRUE | Se é obrigatório para todos os colaboradores |
| `active` | BOOLEAN | NOT NULL, default TRUE | Tipo ativo no sistema |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

---

### 2.2 `hr_employee_documents` — Documentos dos colaboradores

Registro de cada documento entregue por cada colaborador.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK → users_profiles(id), NOT NULL | Colaborador titular |
| `document_type_id` | UUID | FK → hr_document_types(id), NOT NULL | Tipo do documento |
| `document_number` | TEXT | | Número/identificador do documento |
| `issue_date` | DATE | | Data de emissão |
| `expiry_date` | DATE | | Data de validade (obrigatório se `requires_expiry = TRUE`) |
| `status` | TEXT | NOT NULL, default 'Válido' | Status: `Válido`, `Vencido`, `A Vencer`, `Pendente`, `Dispensado` |
| `file_url` | TEXT | | URL do arquivo no Supabase Storage |
| `notes` | TEXT | | Observações |
| `registered_by` | UUID | FK → users_profiles(id) | Quem registrou |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Sugestão de automação:** uma função ou trigger no Supabase pode atualizar o campo `status` automaticamente para `Vencido` quando `expiry_date < CURRENT_DATE` e para `A Vencer` quando `expiry_date <= CURRENT_DATE + alert_days_before`.

---

## 3. Controle de Vencimento de Integrações

> "Integração" neste contexto refere-se ao processo de integração/admissão do colaborador em um cliente, obra ou unidade industrial, que pode ter prazo de validade (ex: integrações SST, CIPA, DDS por contrato/cliente).

### 3.1 `hr_integration_types` — Tipos de integração

Catálogo dos tipos de integração exigidos.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL, UNIQUE | Nome da integração (ex: "Integração SST Cliente X", "NR-35 Trabalho em Altura") |
| `description` | TEXT | | Descrição e requisitos |
| `validity_days` | INTEGER | | Validade padrão em dias (pode ser sobrescrita por registro) |
| `alert_days_before` | INTEGER | NOT NULL, default 15 | Dias de antecedência para alertas de vencimento |
| `active` | BOOLEAN | NOT NULL, default TRUE | Tipo ativo |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

---

### 3.2 `hr_employee_integrations` — Integrações dos colaboradores

Registra cada integração realizada por cada colaborador, com controle de validade.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK → users_profiles(id), NOT NULL | Colaborador |
| `integration_type_id` | UUID | FK → hr_integration_types(id), NOT NULL | Tipo de integração |
| `client_id` | UUID | FK → clients(id) | Cliente/empresa onde a integração foi realizada (opcional) |
| `integration_date` | DATE | NOT NULL | Data em que a integração foi realizada |
| `expiry_date` | DATE | | Data de vencimento da integração |
| `status` | TEXT | NOT NULL, default 'Válida' | Status: `Válida`, `Vencida`, `A Vencer`, `Cancelada` |
| `location` | TEXT | | Local onde foi realizada (obra, unidade, endereço) |
| `notes` | TEXT | | Observações adicionais |
| `file_url` | TEXT | | Comprovante/certificado no Supabase Storage |
| `registered_by` | UUID | FK → users_profiles(id) | Quem registrou |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Sugestão de automação:** o mesmo padrão de trigger aplicado em `hr_employee_documents` pode atualizar `status` automaticamente com base em `expiry_date` e `alert_days_before` do tipo de integração.

---

## 4. Lançamento de Treinamentos

> Os treinamentos são realizados externamente ao sistema. O sistema registra apenas o lançamento (histórico, comprovante e validade), sem aplicar ou hospedar o conteúdo.

### 4.1 `hr_training_catalog` — Catálogo de treinamentos

Catálogo centralizado dos treinamentos reconhecidos pela empresa.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL | Nome do treinamento (ex: "NR-11 Operação de Plataformas") |
| `category` | TEXT | | Categoria (ex: "Segurança", "Operação", "Gestão", "Qualidade") |
| `description` | TEXT | | Descrição e objetivos do treinamento |
| `workload_hours` | NUMERIC(5,1) | | Carga horária padrão |
| `validity_days` | INTEGER | | Validade padrão em dias (0 ou NULL = sem validade) |
| `alert_days_before` | INTEGER | NOT NULL, default 30 | Dias de antecedência para alertas de renovação |
| `mandatory` | BOOLEAN | NOT NULL, default FALSE | Se é obrigatório para todos os colaboradores |
| `active` | BOOLEAN | NOT NULL, default TRUE | Treinamento ativo no catálogo |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

---

### 4.2 `hr_employee_trainings` — Treinamentos lançados por colaborador

Registro de cada treinamento externo concluído por um colaborador.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK → users_profiles(id), NOT NULL | Colaborador que realizou o treinamento |
| `training_id` | UUID | FK → hr_training_catalog(id), NOT NULL | Treinamento do catálogo |
| `provider` | TEXT | | Instituição/empresa fornecedora do treinamento |
| `instructor` | TEXT | | Nome do instrutor (quando aplicável) |
| `completion_date` | DATE | NOT NULL | Data de conclusão do treinamento |
| `workload_hours` | NUMERIC(5,1) | | Carga horária efetiva (pode diferir do padrão) |
| `expiry_date` | DATE | | Data de validade do certificado (quando aplicável) |
| `status` | TEXT | NOT NULL, default 'Válido' | Status: `Válido`, `Vencido`, `A Vencer` |
| `certificate_url` | TEXT | | Certificado no Supabase Storage |
| `cost` | NUMERIC(12,2) | | Custo do treinamento (para controle de investimento em T&D) |
| `notes` | TEXT | | Observações |
| `registered_by` | UUID | FK → users_profiles(id) | Quem lançou o registro |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

---

## 5. Índices recomendados

```sql
-- Plano de cargos
CREATE INDEX idx_employee_positions_user     ON hr_employee_positions(user_id);
CREATE INDEX idx_employee_positions_current  ON hr_employee_positions(user_id) WHERE end_date IS NULL;

-- Documentos
CREATE INDEX idx_employee_documents_user     ON hr_employee_documents(user_id);
CREATE INDEX idx_employee_documents_expiry   ON hr_employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_employee_documents_status   ON hr_employee_documents(status);

-- Integrações
CREATE INDEX idx_employee_integrations_user   ON hr_employee_integrations(user_id);
CREATE INDEX idx_employee_integrations_expiry ON hr_employee_integrations(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_employee_integrations_status ON hr_employee_integrations(status);

-- Treinamentos
CREATE INDEX idx_employee_trainings_user     ON hr_employee_trainings(user_id);
CREATE INDEX idx_employee_trainings_expiry   ON hr_employee_trainings(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_employee_trainings_status   ON hr_employee_trainings(status);
```

---

## 6. Diagrama de relacionamentos

```
users_profiles
    │
    ├── hr_employee_positions ──→ hr_positions ──→ hr_salary_ranges ──→ hr_job_levels
    │                        ──→ hr_job_levels
    │
    ├── hr_employee_documents ──→ hr_document_types
    │
    ├── hr_employee_integrations ──→ hr_integration_types
    │                            ──→ clients
    │
    └── hr_employee_trainings ──→ hr_training_catalog
```

---

## 7. Enums sugeridos (podem ser implementados como TEXT com CHECK constraint ou como ENUM nativo do PostgreSQL)

| Tabela | Coluna | Valores |
|---|---|---|
| `hr_employee_documents` | `status` | `Válido`, `Vencido`, `A Vencer`, `Pendente`, `Dispensado` |
| `hr_employee_integrations` | `status` | `Válida`, `Vencida`, `A Vencer`, `Cancelada` |
| `hr_employee_trainings` | `status` | `Válido`, `Vencido`, `A Vencer` |
| `hr_employee_positions` | `change_reason` | `Admissão`, `Promoção`, `Reajuste`, `Transferência`, `Rebaixamento`, `Desligamento` |
| `hr_training_catalog` | `category` | `Segurança`, `Operação`, `Gestão`, `Qualidade`, `Comportamental`, `Técnico` |

---

## 8. Notas de implementação para o Gemini

- Todas as tabelas devem ter **RLS habilitado** no Supabase. Colaboradores com `access_level = 'Admin'` ou `'Gerente'` têm acesso irrestrito. Colaboradores com `access_level = 'Técnico'` ou `'Operacional'` podem apenas visualizar os próprios registros.
- Os campos `registered_by` e `updated_at` devem ser preenchidos automaticamente via trigger ou via camada de aplicação React antes do `upsert`.
- O campo `status` em documentos, integrações e treinamentos pode ser derivado automaticamente por uma **Supabase Edge Function** ou **PostgreSQL Function** agendada via `pg_cron`, comparando `expiry_date` com `CURRENT_DATE` e o `alert_days_before` de cada tipo.
- Os uploads de arquivos (`file_url`, `certificate_url`) devem ser armazenados no **Supabase Storage** em buckets privados, com URLs assinadas de curta duração geradas no frontend.
- A tabela `hr_employee_positions` com `end_date IS NULL` representa o cargo **vigente**. A camada de aplicação deve setar `end_date = today` no registro anterior antes de inserir o novo ao registrar uma movimentação.

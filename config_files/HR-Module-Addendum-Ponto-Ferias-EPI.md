# Adendo de Tabelas — Módulo de RH: Ponto, Férias e EPI
> ERP de Locação de Equipamentos Industriais  
> Este documento complementa o arquivo `HR-Module-Tabelas-Supabase.md` existente.  
> As tabelas já documentadas (users_profiles, hr_employee_positions, hr_employee_documents, etc.) são referenciadas como dependências mas não são redefinidas aqui.

---

## Dependências do módulo RH existente

```
users_profiles (id, full_name, cpf, access_level, active)
  → Fonte de todos os colaboradores e gerentes do sistema.
  → access_level = 'Gerente' determina quem aprova férias.
  → access_level = 'Admin' pode aprovar qualquer solicitação.

hr_employee_positions (user_id, position_id, end_date IS NULL = cargo atual)
  → Usado para contextualizar o colaborador na folha de ponto.
```

---

## 1. Registro de Ponto

### 1.1 Visão geral do fluxo

```
Colaborador acessa o sistema
    │
    ├── [1] Clica em "Registrar Ponto"
    │         └── Sistema registra o evento com timestamp e tipo
    │         └── Cria registro em hr_time_records
    │
    ├── [2] Repete para cada evento do dia (entrada, saída almoço, retorno, saída)
    │         └── Até 4 registros por dia por colaborador
    │
    ├── [3] Ao fim do período (quinzenal ou mensal)
    │         └── Admin/Gerente gera a folha de ponto em hr_timesheet_reports
    │         └── Folha calculada a partir dos registros de hr_time_records
    │         └── PDF gerado no frontend e armazenado no Supabase Storage
    │
    └── [4] Folha aprovada e arquivada no sistema
```

---

### 1.2 `hr_time_records` — Registros de ponto individuais

Cada batida de ponto gera um registro nesta tabela. O sistema não impede múltiplos registros do mesmo tipo no mesmo dia — a validação e o ajuste são feitos na geração da folha.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK → users_profiles(id), NOT NULL | Colaborador que registrou |
| `record_type` | TEXT | NOT NULL | Tipo: `Entrada`, `Saída Almoço`, `Retorno Almoço`, `Saída` |
| `recorded_at` | TIMESTAMPTZ | NOT NULL, default now() | Data e hora exata do registro |
| `record_date` | DATE | NOT NULL, default CURRENT_DATE | Data do registro (derivada de `recorded_at`, facilita queries por dia) |
| `origin` | TEXT | NOT NULL, default 'Sistema' | Origem: `Sistema` (colaborador bateu), `Manual` (lançado por RH) |
| `justification` | TEXT | | Justificativa obrigatória quando `origin = 'Manual'` |
| `adjusted_by` | UUID | FK → users_profiles(id) | Quem fez o lançamento manual (NULL quando origin = 'Sistema') |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

> **Constraint:** `CHECK (origin != 'Manual' OR justification IS NOT NULL)` — lançamento manual exige justificativa.  
> **Índice prioritário:** `(user_id, record_date)` — consulta mais frequente do sistema.

---

### 1.3 `hr_timesheet_reports` — Folhas de ponto geradas

Armazena o resultado consolidado de um período de ponto de um colaborador. Gerada pelo RH ao fechar o período.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK → users_profiles(id), NOT NULL | Colaborador |
| `period_start` | DATE | NOT NULL | Início do período da folha |
| `period_end` | DATE | NOT NULL | Fim do período da folha |
| `total_days_worked` | INTEGER | NOT NULL | Total de dias com ao menos uma batida de entrada |
| `total_hours_worked` | NUMERIC(6,2) | NOT NULL | Total de horas trabalhadas no período |
| `total_overtime_hours` | NUMERIC(6,2) | NOT NULL, default 0 | Total de horas extras no período |
| `total_absence_days` | INTEGER | NOT NULL, default 0 | Total de dias de ausência não justificada |
| `status` | TEXT | NOT NULL, default 'Gerada' | Status: `Gerada`, `Aprovada`, `Contestada` |
| `file_url` | TEXT | | URL do PDF da folha no Supabase Storage |
| `generated_by` | UUID | FK → users_profiles(id), NOT NULL | Quem gerou a folha |
| `approved_by` | UUID | FK → users_profiles(id) | Quem aprovou (preenchido após aprovação) |
| `approved_at` | TIMESTAMPTZ | | Data/hora da aprovação |
| `notes` | TEXT | | Observações do RH |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Constraint:** `UNIQUE (user_id, period_start, period_end)` — apenas uma folha por colaborador por período.

### 1.4 Storage — Folhas de ponto

```
Bucket: hr-timesheets (privado)
Path:   hr-timesheets/{user_id}/{year}/{period_start}_{period_end}.pdf
```

### 1.5 Regras de negócio do ponto

- O colaborador só pode registrar ponto se `users_profiles.active = TRUE`.
- A ordem esperada dos eventos no dia é: `Entrada → Saída Almoço → Retorno Almoço → Saída`. O sistema deve alertar visualmente se a sequência estiver fora do esperado, mas não deve bloquear o registro.
- Lançamentos manuais (`origin = 'Manual'`) só podem ser feitos por usuários com `access_level IN ('Admin', 'Gerente')`.
- A geração da folha de ponto deve consolidar os registros de `hr_time_records` do período, calcular horas trabalhadas por dia (Saída - Entrada - tempo de almoço) e acumular os totais.
- O PDF da folha deve ser gerado no frontend com `@react-pdf/renderer` e armazenado no Supabase Storage após a geração.

---

## 2. Fluxo de Solicitação de Férias

### 2.1 Visão geral do fluxo

```
Colaborador acessa "Minhas Férias"
    │
    ├── [1] Abre solicitação de férias
    │         └── Preenche: período de vencimento, parcelas, datas, dias vendidos
    │         └── Cria registro em hr_vacation_requests (status = 'Pendente')
    │         └── Cria registros em hr_vacation_installments (uma linha por parcela)
    │
    ├── [2] Sistema notifica todos os Gerentes e Admins ativos
    │         └── Cria registros em hr_vacation_approvals (um por gerente/admin)
    │
    ├── [3] Cada gerente/admin acessa a solicitação e aprova ou rejeita
    │         └── Atualiza seu registro em hr_vacation_approvals
    │
    ├── [4] Quando todos os registros em hr_vacation_approvals
    │         estiverem com status 'Aprovado':
    │         └── hr_vacation_requests.status → 'Aprovada'
    │
    │     Se qualquer um rejeitar:
    │         └── hr_vacation_requests.status → 'Rejeitada'
    │         └── Demais aprovações são encerradas
    │
    └── [5] Solicitação aprovada fica registrada no histórico do colaborador
```

---

### 2.2 `hr_vacation_requests` — Solicitações de férias

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK → users_profiles(id), NOT NULL | Colaborador solicitante |
| `entitlement_period_start` | DATE | NOT NULL | Início do período aquisitivo (vencimento das férias) |
| `entitlement_period_end` | DATE | NOT NULL | Fim do período aquisitivo |
| `total_entitled_days` | INTEGER | NOT NULL, default 30 | Total de dias de férias a que o colaborador tem direito no período |
| `installments_count` | INTEGER | NOT NULL | Número de parcelas (1, 2 ou 3 conforme CLT) |
| `days_sold` | INTEGER | NOT NULL, default 0 | Dias vendidos (abono pecuniário — máx. 10 dias conforme CLT) |
| `total_days_requested` | INTEGER | NOT NULL | Total de dias de descanso solicitados (soma das parcelas, sem os vendidos) |
| `status` | TEXT | NOT NULL, default 'Pendente' | Status: `Pendente`, `Em Aprovação`, `Aprovada`, `Rejeitada`, `Cancelada` |
| `rejection_reason` | TEXT | | Motivo da rejeição (preenchido pelo gerente que rejeitou) |
| `notes` | TEXT | | Observações do colaborador |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data da solicitação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

> **Constraint:** `CHECK (installments_count BETWEEN 1 AND 3)`  
> **Constraint:** `CHECK (days_sold BETWEEN 0 AND 10)`  
> **Constraint:** `CHECK (total_days_requested + days_sold <= total_entitled_days)`

---

### 2.3 `hr_vacation_installments` — Parcelas da solicitação

Uma linha por parcela de férias dentro de uma solicitação.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `vacation_request_id` | UUID | FK → hr_vacation_requests(id), NOT NULL | Solicitação vinculada |
| `installment_number` | INTEGER | NOT NULL | Número da parcela (1, 2 ou 3) |
| `start_date` | DATE | NOT NULL | Data de início desta parcela |
| `end_date` | DATE | NOT NULL | Data de fim desta parcela |
| `duration_days` | INTEGER | NOT NULL | Duração em dias desta parcela |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

> **Constraint:** `UNIQUE (vacation_request_id, installment_number)`  
> **Constraint:** `CHECK (duration_days >= 14)` — a parcela principal deve ter no mínimo 14 dias (CLT). A verificação de qual parcela é a principal deve ser feita na camada de aplicação.  
> **Constraint:** `CHECK (end_date = start_date + duration_days - 1)` — consistência entre datas e duração.

---

### 2.4 `hr_vacation_approvals` — Aprovações individuais por gerente

Um registro por gerente/admin ativo no momento da solicitação. O fluxo é unânime: todos precisam aprovar.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `vacation_request_id` | UUID | FK → hr_vacation_requests(id), NOT NULL | Solicitação vinculada |
| `approver_id` | UUID | FK → users_profiles(id), NOT NULL | Gerente/Admin responsável por esta aprovação |
| `status` | TEXT | NOT NULL, default 'Pendente' | Status: `Pendente`, `Aprovado`, `Rejeitado` |
| `rejection_reason` | TEXT | | Motivo da rejeição (obrigatório quando status = 'Rejeitado') |
| `decided_at` | TIMESTAMPTZ | | Data/hora da decisão |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

> **Constraint:** `UNIQUE (vacation_request_id, approver_id)` — um gerente não pode ter dois registros na mesma solicitação.  
> **Constraint:** `CHECK (status != 'Rejeitado' OR rejection_reason IS NOT NULL)`

### 2.5 Lógica de transição de status da solicitação

Após cada atualização em `hr_vacation_approvals`, a camada de aplicação deve verificar:

```
SE qualquer hr_vacation_approvals.status = 'Rejeitado' para esta solicitação:
    → hr_vacation_requests.status = 'Rejeitada'
    → hr_vacation_requests.rejection_reason = motivo do gerente que rejeitou
    → Todos os demais hr_vacation_approvals pendentes: sem alteração (já encerrado)

SENÃO SE todos os hr_vacation_approvals.status = 'Aprovado':
    → hr_vacation_requests.status = 'Aprovada'

SENÃO (ainda há pendentes):
    → hr_vacation_requests.status = 'Em Aprovação' (já houve ao menos uma decisão)
```

> **Sugestão:** implementar essa lógica como uma **Supabase Database Function** disparada por trigger em `hr_vacation_approvals` após INSERT ou UPDATE, garantindo consistência mesmo em atualizações concorrentes.

```sql
-- Trigger sugerido
CREATE OR REPLACE FUNCTION fn_update_vacation_request_status()
RETURNS TRIGGER AS $$
DECLARE
  req_id UUID := NEW.vacation_request_id;
  total_approvals INTEGER;
  approved_count INTEGER;
  rejected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_approvals
    FROM hr_vacation_approvals WHERE vacation_request_id = req_id;

  SELECT COUNT(*) INTO approved_count
    FROM hr_vacation_approvals WHERE vacation_request_id = req_id AND status = 'Aprovado';

  SELECT COUNT(*) INTO rejected_count
    FROM hr_vacation_approvals WHERE vacation_request_id = req_id AND status = 'Rejeitado';

  IF rejected_count > 0 THEN
    UPDATE hr_vacation_requests
      SET status = 'Rejeitada',
          rejection_reason = NEW.rejection_reason,
          updated_at = now()
      WHERE id = req_id;
  ELSIF approved_count = total_approvals THEN
    UPDATE hr_vacation_requests
      SET status = 'Aprovada', updated_at = now()
      WHERE id = req_id;
  ELSE
    UPDATE hr_vacation_requests
      SET status = 'Em Aprovação', updated_at = now()
      WHERE id = req_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vacation_approval_status
  AFTER INSERT OR UPDATE ON hr_vacation_approvals
  FOR EACH ROW EXECUTE FUNCTION fn_update_vacation_request_status();
```

### 2.6 Regras de negócio de férias

- No momento da criação da solicitação, a aplicação deve buscar todos os `users_profiles` com `access_level IN ('Admin', 'Gerente')` e `active = TRUE`, e criar um registro em `hr_vacation_approvals` para cada um.
- Se um novo gerente for adicionado ao sistema **após** a criação de uma solicitação pendente, ele **não** é adicionado retroativamente ao fluxo de aprovação daquela solicitação.
- `days_sold + soma(installments.duration_days)` deve ser igual a `total_entitled_days`. Validar na camada de aplicação antes do INSERT.
- O colaborador pode cancelar a solicitação apenas enquanto `status IN ('Pendente', 'Em Aprovação')`.

---

## 3. Ficha de EPI

### 3.1 Visão geral

A ficha de EPI é um documento PDF externo (gerado fora do sistema, assinado fisicamente pelo colaborador) que é anexado ao perfil do colaborador. O sistema armazena o arquivo e os metadados da entrega.

```
Usuário Admin/Gerente acessa perfil do colaborador
    │
    ├── [1] Acessa aba "EPIs"
    │         └── Visualiza fichas de EPI anteriores do colaborador
    │
    ├── [2] Clica em "Anexar Ficha de EPI"
    │         └── Preenche metadados (data de entrega, EPIs relacionados, observações)
    │         └── Faz upload do PDF assinado
    │         └── Arquivo salvo no Supabase Storage
    │         └── Registro criado em hr_epi_records
    │
    └── [3] Ficha fica disponível no histórico do colaborador
              └── Download disponível via URL assinada do Supabase Storage
```

---

### 3.2 `hr_epi_catalog` — Catálogo de EPIs

Catálogo dos EPIs utilizados pela empresa, para padronizar os registros.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL, UNIQUE | Nome do EPI (ex: "Capacete de Segurança", "Cinto de Segurança Tipo Paraquedista") |
| `ca_number` | TEXT | | Número do CA (Certificado de Aprovação do MTE) |
| `description` | TEXT | | Descrição e especificações técnicas |
| `active` | BOOLEAN | NOT NULL, default TRUE | EPI ativo no catálogo |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

---

### 3.3 `hr_epi_records` — Fichas de EPI por colaborador

Cada registro representa uma entrega de EPIs documentada por um PDF assinado.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `user_id` | UUID | FK → users_profiles(id), NOT NULL | Colaborador que recebeu os EPIs |
| `delivery_date` | DATE | NOT NULL | Data de entrega dos EPIs |
| `file_url` | TEXT | NOT NULL | URL do PDF da ficha assinada no Supabase Storage |
| `file_uploaded_at` | TIMESTAMPTZ | NOT NULL, default now() | Data/hora do upload |
| `uploaded_by` | UUID | FK → users_profiles(id), NOT NULL | Usuário que fez o upload |
| `notes` | TEXT | | Observações (ex: "Substituição por desgaste", "Admissão") |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |

---

### 3.4 `hr_epi_record_items` — EPIs listados em cada ficha

Detalha quais EPIs específicos constam em cada ficha, mesmo que o PDF já os liste, para permitir buscas e relatórios por EPI.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `epi_record_id` | UUID | FK → hr_epi_records(id), NOT NULL | Ficha de EPI vinculada |
| `epi_id` | UUID | FK → hr_epi_catalog(id), NOT NULL | EPI do catálogo |
| `quantity` | INTEGER | NOT NULL, default 1 | Quantidade entregue |
| `notes` | TEXT | | Observações específicas deste item (ex: "Tamanho G", "Número 42") |

> **Constraint:** `UNIQUE (epi_record_id, epi_id)` — o mesmo EPI não aparece duas vezes na mesma ficha.

### 3.5 Storage — Fichas de EPI

```
Bucket: hr-epi-records (privado)
Path:   hr-epi-records/{user_id}/{delivery_date}_{epi_record_id}.pdf
```

---

## 4. Índices recomendados

```sql
-- Ponto
CREATE INDEX idx_time_records_user_date   ON hr_time_records(user_id, record_date);
CREATE INDEX idx_time_records_date        ON hr_time_records(record_date);
CREATE INDEX idx_timesheet_reports_user   ON hr_timesheet_reports(user_id);
CREATE INDEX idx_timesheet_reports_period ON hr_timesheet_reports(period_start, period_end);

-- Férias
CREATE INDEX idx_vacation_requests_user    ON hr_vacation_requests(user_id);
CREATE INDEX idx_vacation_requests_status  ON hr_vacation_requests(status);
CREATE INDEX idx_vacation_approvals_req    ON hr_vacation_approvals(vacation_request_id);
CREATE INDEX idx_vacation_approvals_appr   ON hr_vacation_approvals(approver_id);
CREATE INDEX idx_vacation_approvals_status ON hr_vacation_approvals(status);
CREATE INDEX idx_vacation_installments_req ON hr_vacation_installments(vacation_request_id);

-- EPI
CREATE INDEX idx_epi_records_user         ON hr_epi_records(user_id);
CREATE INDEX idx_epi_records_date         ON hr_epi_records(delivery_date);
CREATE INDEX idx_epi_record_items_record  ON hr_epi_record_items(epi_record_id);
CREATE INDEX idx_epi_record_items_epi     ON hr_epi_record_items(epi_id);
```

---

## 5. RLS — políticas recomendadas

### Ponto

| Operação | Tabela | Quem pode |
|---|---|---|
| INSERT (bater ponto) | `hr_time_records` | Qualquer colaborador ativo — restrito ao próprio `user_id` quando `origin = 'Sistema'` |
| INSERT / UPDATE manual | `hr_time_records` | `Admin`, `Gerente` — podem lançar para qualquer `user_id` |
| SELECT | `hr_time_records` | `Admin`, `Gerente`: todos os registros. Demais: apenas os próprios |
| INSERT / UPDATE / SELECT | `hr_timesheet_reports` | `Admin`, `Gerente`: irrestrito. Demais: SELECT apenas dos próprios |

### Férias

| Operação | Tabela | Quem pode |
|---|---|---|
| INSERT (abrir solicitação) | `hr_vacation_requests` | Qualquer colaborador ativo — restrito ao próprio `user_id` |
| UPDATE (cancelar) | `hr_vacation_requests` | O próprio colaborador (quando status permite) ou `Admin` |
| SELECT | `hr_vacation_requests` | `Admin`, `Gerente`: todas. Colaborador: apenas as próprias |
| UPDATE (aprovar/rejeitar) | `hr_vacation_approvals` | Apenas o `approver_id` correspondente ao `auth.uid()` |
| SELECT | `hr_vacation_approvals` | `Admin`, `Gerente`: todas. Colaborador: apenas as vinculadas às próprias solicitações |

### EPI

| Operação | Tabela | Quem pode |
|---|---|---|
| INSERT / UPDATE | `hr_epi_records`, `hr_epi_record_items` | `Admin`, `Gerente` |
| SELECT | `hr_epi_records`, `hr_epi_record_items` | `Admin`, `Gerente`: todas. Colaborador: apenas as próprias |
| INSERT / UPDATE / DELETE | `hr_epi_catalog` | Apenas `Admin` |
| SELECT | `hr_epi_catalog` | Todos os colaboradores ativos |

---

## 6. Diagrama de relacionamentos — novas tabelas

```
users_profiles
    │
    ├── hr_time_records (N registros por colaborador)
    │       └── adjusted_by → users_profiles (quem fez lançamento manual)
    │
    ├── hr_timesheet_reports (1 por colaborador por período)
    │       ├── generated_by → users_profiles
    │       └── approved_by → users_profiles
    │       └── file_url → Supabase Storage: hr-timesheets/
    │
    ├── hr_vacation_requests (N solicitações por colaborador)
    │       └── hr_vacation_installments (1:N — parcelas da solicitação)
    │       └── hr_vacation_approvals (1:N — uma aprovação por gerente/admin)
    │               └── approver_id → users_profiles
    │
    └── hr_epi_records (N fichas por colaborador)
            ├── uploaded_by → users_profiles
            ├── file_url → Supabase Storage: hr-epi-records/
            └── hr_epi_record_items (1:N — EPIs da ficha)
                    └── epi_id → hr_epi_catalog
```

---

## 7. Notas de implementação para o Gemini

### Ponto
- **Batida de ponto:** o botão de registrar ponto deve exibir qual será o próximo tipo de registro esperado para o colaborador no dia atual, inferido consultando o último `record_type` registrado em `hr_time_records` para `user_id = auth.uid()` e `record_date = CURRENT_DATE`.
- **Folha de ponto:** o cálculo de horas trabalhadas por dia deve ser feito na camada de aplicação, pareando registros de `Entrada/Saída` e descontando `Saída Almoço/Retorno Almoço`. Dias sem nenhum registro do tipo `Entrada` devem ser contados como ausência.
- **PDF da folha:** gerado com `@react-pdf/renderer` no frontend, listando dia a dia os horários registrados, total de horas e observações de ajustes manuais. Após geração, salvar no Supabase Storage e atualizar `hr_timesheet_reports.file_url`.

### Férias
- **Criação dos aprovadores:** ao inserir em `hr_vacation_requests`, a aplicação deve imediatamente buscar todos os `users_profiles` com `access_level IN ('Admin', 'Gerente')` e `active = TRUE` e criar os registros em `hr_vacation_approvals` em uma única operação (batch insert).
- **Validação de dias:** `days_sold` deve ser múltiplo inteiro e respeitando o máximo de 10 dias (CLT). A parcela principal (maior em duração) deve ter no mínimo 14 dias corridos (CLT). Validar no frontend antes do submit e no banco via trigger se possível.
- **Unicidade por período aquisitivo:** considerar adicionar constraint ou validação para evitar duas solicitações ativas para o mesmo `(user_id, entitlement_period_start, entitlement_period_end)`.

### EPI
- **Upload obrigatório:** o campo `file_url` é NOT NULL em `hr_epi_records`, portanto o upload do PDF deve ser concluído antes do INSERT do registro. O fluxo correto é: (1) upload para Storage → (2) obter URL assinada → (3) INSERT com a URL. Nunca criar o registro sem o arquivo.
- **Itens opcionais mas recomendados:** o preenchimento de `hr_epi_record_items` é opcional no sentido de que o PDF já contém a informação, mas deve ser fortemente encorajado pelo UI para permitir relatórios como "todos os colaboradores que receberam cinto de segurança nos últimos 12 meses".
- **Acesso ao PDF:** assim como nos demais módulos, usar `createSignedUrl` com expiração curta para exibição/download. Nunca expor URL pública do Storage.

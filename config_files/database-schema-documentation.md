# Estrutura do Banco de Dados - RentDesk

Este documento descreve a estrutura de tabelas, relacionamentos, chaves primárias/estrangeiras, gatilhos (triggers) e funções do banco de dados PostgreSQL/Supabase do projeto **RentDesk**.

## Sumário das Tabelas

Abaixo estão listadas as 30 tabelas ativas no esquema `public` do banco de dados:

- [`users_profiles`](#users-profiles)
- [`clients`](#clients)
- [`equipments`](#equipments)
- [`parts`](#parts)
- [`rental_invoices`](#rental-invoices)
- [`service_orders`](#service-orders)
- [`service_order_parts`](#service-order-parts)
- [`invoice_year_counters`](#invoice-year-counters)
- [`hr_job_levels`](#hr-job-levels)
- [`hr_positions`](#hr-positions)
- [`hr_salary_ranges`](#hr-salary-ranges)
- [`hr_employee_positions`](#hr-employee-positions)
- [`hr_document_types`](#hr-document-types)
- [`hr_employee_documents`](#hr-employee-documents)
- [`hr_integration_types`](#hr-integration-types)
- [`hr_employee_integrations`](#hr-employee-integrations)
- [`hr_training_catalog`](#hr-training-catalog)
- [`hr_employee_trainings`](#hr-employee-trainings)
- [`crm_leads`](#crm-leads)
- [`crm_contacts`](#crm-contacts)
- [`crm_pipelines`](#crm-pipelines)
- [`crm_pipeline_stages`](#crm-pipeline-stages)
- [`crm_deals`](#crm-deals)
- [`crm_deal_activities`](#crm-deal-activities)
- [`crm_task_types`](#crm-task-types)
- [`crm_tasks`](#crm-tasks)
- [`erp_company_settings`](#erp-company-settings)
- [`crm_deal_contract_forms`](#crm-deal-contract-forms)
- [`crm_deal_contracts`](#crm-deal-contracts)
- [`logistics_triage_photos`](#logistics-triage-photos)

---

## Detalhes das Tabelas

### users_profiles

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | - | 🔑 PK |
| `full_name` | `text` | Não | - |  |
| `cpf` | `text` | Sim | - | ✨ Unique |
| `birth_date` | `date` | Sim | - |  |
| `phone` | `text` | Sim | - |  |
| `email` | `text` | Não | - | ✨ Unique |
| `address_street` | `text` | Sim | - |  |
| `address_number` | `text` | Sim | - |  |
| `address_complement` | `text` | Sim | - |  |
| `address_city` | `text` | Sim | - |  |
| `address_state` | `text` | Sim | - |  |
| `address_zip` | `text` | Sim | - |  |
| `role_title` | `text` | Sim | - |  |
| `access_level` | `USER-DEFINED` | Sim | `'Financeiro'::access_level_type` | Valores: ["Administrador", "Diretoria", "Gerente", "Comercial", "Logística", "Manutenção", "Financeiro", "Recursos Humanos", "Usuário"] |
| `active` | `boolean` | Sim | `true` |  |
| `created_at` | `timestamp with time zone` | Sim | `now()` |  |
| `updated_at` | `timestamp with time zone` | Sim | `now()` |  |
| `photo_url` | `text` | Sim | - |  |
| `password_set` | `boolean` | Sim | `false` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `id` aponta para [`auth.users.id`](#auth.users.id)`(id)` (Constraint: `users_profiles_id_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_deal_contracts.generated_by`](#crm-deal-contracts.generated-by)`(generated_by)` aponta para a coluna local `id` (Constraint: `crm_deal_contracts_generated_by_fkey`)
* [`crm_deal_contracts.signed_uploaded_by`](#crm-deal-contracts.signed-uploaded-by)`(signed_uploaded_by)` aponta para a coluna local `id` (Constraint: `crm_deal_contracts_signed_uploaded_by_fkey`)
* [`crm_deal_contract_forms.updated_by`](#crm-deal-contract-forms.updated-by)`(updated_by)` aponta para a coluna local `id` (Constraint: `crm_deal_contract_forms_updated_by_fkey`)
* [`crm_deal_contract_forms.created_by`](#crm-deal-contract-forms.created-by)`(created_by)` aponta para a coluna local `id` (Constraint: `crm_deal_contract_forms_created_by_fkey`)
* [`crm_tasks.created_by`](#crm-tasks.created-by)`(created_by)` aponta para a coluna local `id` (Constraint: `crm_tasks_created_by_fkey`)
* [`crm_tasks.assigned_to`](#crm-tasks.assigned-to)`(assigned_to)` aponta para a coluna local `id` (Constraint: `crm_tasks_assigned_to_fkey`)
* [`crm_deal_activities.performed_by`](#crm-deal-activities.performed-by)`(performed_by)` aponta para a coluna local `id` (Constraint: `crm_deal_activities_performed_by_fkey`)
* [`service_orders.executed_by`](#service-orders.executed-by)`(executed_by)` aponta para a coluna local `id` (Constraint: `service_orders_executed_by_fkey`)
* [`rental_invoices.created_by`](#rental-invoices.created-by)`(created_by)` aponta para a coluna local `id` (Constraint: `rental_invoices_created_by_fkey`)
* [`hr_employee_positions.user_id`](#hr-employee-positions.user-id)`(user_id)` aponta para a coluna local `id` (Constraint: `hr_employee_positions_user_id_fkey`)
* [`hr_employee_positions.registered_by`](#hr-employee-positions.registered-by)`(registered_by)` aponta para a coluna local `id` (Constraint: `hr_employee_positions_registered_by_fkey`)
* [`hr_employee_documents.user_id`](#hr-employee-documents.user-id)`(user_id)` aponta para a coluna local `id` (Constraint: `hr_employee_documents_user_id_fkey`)
* [`hr_employee_documents.registered_by`](#hr-employee-documents.registered-by)`(registered_by)` aponta para a coluna local `id` (Constraint: `hr_employee_documents_registered_by_fkey`)
* [`hr_employee_integrations.user_id`](#hr-employee-integrations.user-id)`(user_id)` aponta para a coluna local `id` (Constraint: `hr_employee_integrations_user_id_fkey`)
* [`hr_employee_integrations.registered_by`](#hr-employee-integrations.registered-by)`(registered_by)` aponta para a coluna local `id` (Constraint: `hr_employee_integrations_registered_by_fkey`)
* [`hr_employee_trainings.user_id`](#hr-employee-trainings.user-id)`(user_id)` aponta para a coluna local `id` (Constraint: `hr_employee_trainings_user_id_fkey`)
* [`hr_employee_trainings.registered_by`](#hr-employee-trainings.registered-by)`(registered_by)` aponta para a coluna local `id` (Constraint: `hr_employee_trainings_registered_by_fkey`)
* [`crm_leads.owner_id`](#crm-leads.owner-id)`(owner_id)` aponta para a coluna local `id` (Constraint: `crm_leads_owner_id_fkey`)
* [`crm_deals.owner_id`](#crm-deals.owner-id)`(owner_id)` aponta para a coluna local `id` (Constraint: `crm_deals_owner_id_fkey`)
* [`logistics_triage_photos.uploaded_by`](#logistics-triage-photos.uploaded-by)`(uploaded_by)` aponta para a coluna local `id` (Constraint: `logistics_triage_photos_uploaded_by_fkey`)

#### Gatilhos (Triggers)

* **`update_users_profiles_updated_at`**
  ```sql
  CREATE TRIGGER update_users_profiles_updated_at BEFORE UPDATE ON public.users_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  ```

---

### clients

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `company_name` | `text` | Não | - |  |
| `cnpj` | `text` | Não | - | ✨ Unique |
| `contact_name` | `text` | Sim | - |  |
| `phone` | `text` | Sim | - |  |
| `email` | `text` | Sim | - |  |
| `address_street` | `text` | Sim | - |  |
| `address_number` | `text` | Sim | - |  |
| `address_complement` | `text` | Sim | - |  |
| `address_city` | `text` | Sim | - |  |
| `address_state` | `text` | Sim | - |  |
| `address_zip` | `text` | Sim | - |  |
| `active` | `boolean` | Sim | `true` |  |
| `created_at` | `timestamp with time zone` | Sim | `now()` |  |
| `updated_at` | `timestamp with time zone` | Sim | `now()` |  |
| `state_subscription` | `text` | Sim | - |  |
| `average_score` | `numeric` | Sim | `0` |  |
| `documentation_url` | `text` | Sim | - |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`rental_invoices.client_id`](#rental-invoices.client-id)`(client_id)` aponta para a coluna local `id` (Constraint: `rental_invoices_client_id_fkey`)
* [`hr_employee_integrations.client_id`](#hr-employee-integrations.client-id)`(client_id)` aponta para a coluna local `id` (Constraint: `hr_employee_integrations_client_id_fkey`)
* [`crm_leads.converted_client_id`](#crm-leads.converted-client-id)`(converted_client_id)` aponta para a coluna local `id` (Constraint: `crm_leads_converted_client_id_fkey`)
* [`crm_contacts.client_id`](#crm-contacts.client-id)`(client_id)` aponta para a coluna local `id` (Constraint: `crm_contacts_client_id_fkey`)
* [`crm_deals.client_id`](#crm-deals.client-id)`(client_id)` aponta para a coluna local `id` (Constraint: `crm_deals_client_id_fkey`)

#### Gatilhos (Triggers)

* **`update_clients_updated_at`**
  ```sql
  CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  ```

---

### equipments

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `asset_number` | `text` | Não | - | ✨ Unique |
| `name` | `text` | Não | - |  |
| `type` | `text` | Sim | - |  |
| `model` | `text` | Sim | - |  |
| `serial_number` | `text` | Sim | - |  |
| `height` | `numeric` | Sim | - |  |
| `status` | `USER-DEFINED` | Sim | `'Disponível'::equipment_status_type` | Valores: ["Disponível", "Locado", "Em Manutenção", "Inativo"] |
| `manufacture_year` | `integer` | Sim | - |  |
| `value` | `numeric` | Sim | - |  |
| `unit` | `text` | Sim | `'un'::text` |  |
| `photo_url` | `text` | Sim | - |  |
| `notes` | `text` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Sim | `now()` |  |
| `updated_at` | `timestamp with time zone` | Sim | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`service_orders.equipment_id`](#service-orders.equipment-id)`(equipment_id)` aponta para a coluna local `id` (Constraint: `service_orders_equipment_id_fkey`)
* [`rental_invoices.equipment_id`](#rental-invoices.equipment-id)`(equipment_id)` aponta para a coluna local `id` (Constraint: `rental_invoices_equipment_id_fkey`)

#### Gatilhos (Triggers)

* **`update_equipments_updated_at`**
  ```sql
  CREATE TRIGGER update_equipments_updated_at BEFORE UPDATE ON public.equipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  ```

---

### parts

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `internal_code` | `text` | Não | - | ✨ Unique |
| `description` | `text` | Não | - |  |
| `part_number` | `text` | Sim | - |  |
| `quantity` | `integer` | Sim | `0` |  |
| `unit_value` | `numeric` | Sim | `0` |  |
| `total_value` | `numeric` | Sim | `((quantity)::numeric * unit_value)` |  |
| `notes` | `text` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Sim | `now()` |  |
| `updated_at` | `timestamp with time zone` | Sim | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`service_order_parts.part_id`](#service-order-parts.part-id)`(part_id)` aponta para a coluna local `id` (Constraint: `service_order_parts_part_id_fkey`)

#### Gatilhos (Triggers)

* **`update_parts_updated_at`**
  ```sql
  CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON public.parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  ```

---

### rental_invoices

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `client_id` | `uuid` | Sim | - |  |
| `client_name` | `text` | Sim | - |  |
| `cnpj` | `text` | Sim | - |  |
| `equipment_id` | `uuid` | Sim | - |  |
| `equipment_name` | `text` | Sim | - |  |
| `equipment_type` | `text` | Sim | - |  |
| `equipment_size` | `text` | Sim | - |  |
| `asset_number` | `text` | Sim | - |  |
| `work_site` | `text` | Sim | - |  |
| `billing_period_start` | `date` | Sim | - |  |
| `billing_period_end` | `date` | Sim | - |  |
| `billing_status` | `USER-DEFINED` | Sim | `'Pendente'::billing_status_type` | Valores: ["Pendente", "Faturado", "Emitida", "Cancelada"] |
| `return_date` | `date` | Sim | - |  |
| `cost_rental` | `numeric` | Sim | `0` |  |
| `cost_insurance` | `numeric` | Sim | `0` |  |
| `cost_freight` | `numeric` | Sim | `0` |  |
| `cost_rcd` | `numeric` | Sim | `0` |  |
| `cost_third_party` | `numeric` | Sim | `0` |  |
| `cost_training` | `numeric` | Sim | `0` |  |
| `total_value` | `numeric` | Sim | `0` |  |
| `due_date` | `date` | Sim | - |  |
| `payment_method` | `text` | Sim | - |  |
| `bank_reconciliation_date` | `date` | Sim | - |  |
| `reconciliation_status` | `USER-DEFINED` | Sim | `'Atrasado'::reconciliation_status_type` | Valores: ["Pendente", "Atrasado", "Recebido", "Divergente", "No prazo"] |
| `notes` | `text` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Sim | `now()` |  |
| `updated_at` | `timestamp with time zone` | Sim | `now()` |  |
| `created_by` | `uuid` | Sim | - |  |
| `invoice_number` | `text` | Sim | - |  |
| `client_score` | `integer` | Sim | - | CHECK: client_score >= 1 AND client_score <= 5 |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `client_id` aponta para [`clients.id`](#clients.id)`(id)` (Constraint: `rental_invoices_client_id_fkey`)
* A coluna `created_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `rental_invoices_created_by_fkey`)
* A coluna `equipment_id` aponta para [`equipments.id`](#equipments.id)`(id)` (Constraint: `rental_invoices_equipment_id_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_deal_contracts.rental_invoice_id`](#crm-deal-contracts.rental-invoice-id)`(rental_invoice_id)` aponta para a coluna local `id` (Constraint: `crm_deal_contracts_rental_invoice_id_fkey`)

#### Gatilhos (Triggers)

* **`update_rental_invoices_updated_at`**
  ```sql
  CREATE TRIGGER update_rental_invoices_updated_at BEFORE UPDATE ON public.rental_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  ```
* **`trg_set_invoice_number`**
  ```sql
  CREATE TRIGGER trg_set_invoice_number BEFORE INSERT ON public.rental_invoices FOR EACH ROW WHEN ((new.invoice_number IS NULL)) EXECUTE FUNCTION generate_invoice_number()
  ```
* **`tr_update_client_score`**
  ```sql
  CREATE TRIGGER tr_update_client_score AFTER INSERT OR UPDATE OF client_score ON public.rental_invoices FOR EACH ROW EXECUTE FUNCTION update_client_average_score()
  ```

---

### service_orders

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `os_number` | `integer` | Não | `nextval('service_orders_os_number_seq'::regclass)` | ✨ Unique |
| `equipment_id` | `uuid` | Sim | - |  |
| `equipment_asset_number` | `text` | Sim | - |  |
| `equipment_name` | `text` | Sim | - |  |
| `equipment_model` | `text` | Sim | - |  |
| `equipment_serial_number` | `text` | Sim | - |  |
| `equipment_condition_entry` | `text` | Sim | - |  |
| `executed_by` | `uuid` | Sim | - |  |
| `execution_date` | `date` | Sim | - |  |
| `execution_location` | `text` | Sim | - |  |
| `status` | `USER-DEFINED` | Sim | `'Aberta'::service_order_status_type` | Valores: ["Aberta", "Em Andamento", "Aguardando Peças", "Concluída", "Cancelada"] |
| `description` | `text` | Sim | - |  |
| `notes` | `text` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Sim | `now()` |  |
| `updated_at` | `timestamp with time zone` | Sim | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `equipment_id` aponta para [`equipments.id`](#equipments.id)`(id)` (Constraint: `service_orders_equipment_id_fkey`)
* A coluna `executed_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `service_orders_executed_by_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`service_order_parts.service_order_id`](#service-order-parts.service-order-id)`(service_order_id)` aponta para a coluna local `id` (Constraint: `service_order_parts_service_order_id_fkey`)

#### Gatilhos (Triggers)

* **`update_service_orders_updated_at`**
  ```sql
  CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  ```

---

### service_order_parts

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `service_order_id` | `uuid` | Sim | - |  |
| `part_id` | `uuid` | Sim | - |  |
| `quantity_used` | `integer` | Sim | `1` |  |
| `unit_value_at_use` | `numeric` | Sim | `0` |  |
| `subtotal` | `numeric` | Sim | `0` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `service_order_id` aponta para [`service_orders.id`](#service-orders.id)`(id)` (Constraint: `service_order_parts_service_order_id_fkey`)
* A coluna `part_id` aponta para [`parts.id`](#parts.id)`(id)` (Constraint: `service_order_parts_part_id_fkey`)

---

### invoice_year_counters

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `year` | `integer` | Não | - | 🔑 PK |
| `last_seq` | `integer` | Não | `0` |  |

---

### hr_job_levels

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `name` | `text` | Não | - | Nome do nível (ex: "Júnior", "Pleno", "Sênior") |
| `description` | `text` | Sim | - | Descrição do nível |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`hr_salary_ranges.level_id`](#hr-salary-ranges.level-id)`(level_id)` aponta para a coluna local `id` (Constraint: `hr_salary_ranges_level_id_fkey`)
* [`hr_employee_positions.level_id`](#hr-employee-positions.level-id)`(level_id)` aponta para a coluna local `id` (Constraint: `hr_employee_positions_level_id_fkey`)

---

### hr_positions

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `title` | `text` | Não | - | Título do cargo (ex: "Técnico de Manutenção") |
| `department` | `text` | Não | - | Departamento (ex: "Operações", "Comercial", "Administrativo") |
| `description` | `text` | Sim | - | Descrição e responsabilidades do cargo |
| `cbo_code` | `text` | Sim | - | Código Brasileiro de Ocupações (CBO) |
| `active` | `boolean` | Não | `true` | Cargo ativo ou desativado |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`hr_employee_positions.position_id`](#hr-employee-positions.position-id)`(position_id)` aponta para a coluna local `id` (Constraint: `hr_employee_positions_position_id_fkey`)
* [`hr_salary_ranges.position_id`](#hr-salary-ranges.position-id)`(position_id)` aponta para a coluna local `id` (Constraint: `hr_salary_ranges_position_id_fkey`)

---

### hr_salary_ranges

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `position_id` | `uuid` | Não | - | Cargo ao qual a faixa pertence |
| `level_id` | `uuid` | Não | - | Nível hierárquico da faixa |
| `salary_min` | `numeric` | Não | - | Piso salarial da faixa |
| `salary_mid` | `numeric` | Sim | - | Ponto médio (midpoint) da faixa |
| `salary_max` | `numeric` | Não | - | Teto salarial da faixa |
| `effective_date` | `date` | Não | - | Data de vigência desta faixa |
| `notes` | `text` | Sim | - | Observações (ex: "Revisão anual 2025") |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `level_id` aponta para [`hr_job_levels.id`](#hr-job-levels.id)`(id)` (Constraint: `hr_salary_ranges_level_id_fkey`)
* A coluna `position_id` aponta para [`hr_positions.id`](#hr-positions.id)`(id)` (Constraint: `hr_salary_ranges_position_id_fkey`)

---

### hr_employee_positions

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `user_id` | `uuid` | Não | - | Colaborador |
| `position_id` | `uuid` | Não | - | Cargo assumido |
| `level_id` | `uuid` | Não | - | Nível assumido |
| `salary` | `numeric` | Não | - | Salário negociado nesta vigência |
| `start_date` | `date` | Não | - | Início da vigência |
| `end_date` | `date` | Sim | - | Fim da vigência (NULL = posição atual) |
| `change_reason` | `text` | Sim | - | Motivo da movimentação (promoção, reajuste, transferência, etc.) |
| `registered_by` | `uuid` | Sim | - | Quem registrou a movimentação |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `user_id` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `hr_employee_positions_user_id_fkey`)
* A coluna `position_id` aponta para [`hr_positions.id`](#hr-positions.id)`(id)` (Constraint: `hr_employee_positions_position_id_fkey`)
* A coluna `level_id` aponta para [`hr_job_levels.id`](#hr-job-levels.id)`(id)` (Constraint: `hr_employee_positions_level_id_fkey`)
* A coluna `registered_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `hr_employee_positions_registered_by_fkey`)

---

### hr_document_types

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `name` | `text` | Não | - | ✨ Unique | Nome do documento (ex: "CNH", "ASO", "CTPS") |
| `description` | `text` | Sim | - | Descrição e instruções |
| `requires_expiry` | `boolean` | Não | `false` | Se o documento possui data de validade |
| `alert_days_before` | `integer` | Sim | `30` | Quantos dias antes do vencimento emitir alerta |
| `mandatory` | `boolean` | Não | `true` | Se é obrigatório para todos os colaboradores |
| `active` | `boolean` | Não | `true` | Tipo ativo no sistema |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`hr_employee_documents.document_type_id`](#hr-employee-documents.document-type-id)`(document_type_id)` aponta para a coluna local `id` (Constraint: `hr_employee_documents_document_type_id_fkey`)

---

### hr_employee_documents

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `user_id` | `uuid` | Não | - | Colaborador titular |
| `document_type_id` | `uuid` | Não | - | Tipo do documento |
| `document_number` | `text` | Sim | - | Número/identificador do documento |
| `issue_date` | `date` | Sim | - | Data de emissão |
| `expiry_date` | `date` | Sim | - | Data de validade (obrigatório se requires_expiry = TRUE) |
| `status` | `text` | Não | `'Válido'::text` | Status: Válido, Vencido, A Vencer, Pendente, Dispensado |
| `file_url` | `text` | Sim | - | URL do arquivo no Supabase Storage |
| `notes` | `text` | Sim | - | Observações |
| `registered_by` | `uuid` | Sim | - | Quem registrou |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `document_type_id` aponta para [`hr_document_types.id`](#hr-document-types.id)`(id)` (Constraint: `hr_employee_documents_document_type_id_fkey`)
* A coluna `registered_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `hr_employee_documents_registered_by_fkey`)
* A coluna `user_id` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `hr_employee_documents_user_id_fkey`)

---

### hr_integration_types

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `name` | `text` | Não | - | ✨ Unique | Nome da integração (ex: "Integração SST Cliente X", "NR-35 Trabalho em Altura") |
| `description` | `text` | Sim | - | Descrição e requisitos |
| `validity_days` | `integer` | Sim | - | Validade padrão em dias (pode ser sobrescrita por registro) |
| `alert_days_before` | `integer` | Não | `15` | Dias de antecedência para alertas de vencimento |
| `active` | `boolean` | Não | `true` | Tipo ativo |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`hr_employee_integrations.integration_type_id`](#hr-employee-integrations.integration-type-id)`(integration_type_id)` aponta para a coluna local `id` (Constraint: `hr_employee_integrations_integration_type_id_fkey`)

---

### hr_employee_integrations

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `user_id` | `uuid` | Não | - | Colaborador |
| `integration_type_id` | `uuid` | Não | - | Tipo de integração |
| `client_id` | `uuid` | Sim | - | Cliente/empresa onde a integração foi realizada (opcional) |
| `integration_date` | `date` | Não | - | Data em que a integração foi realizada |
| `expiry_date` | `date` | Sim | - | Data de vencimento da integração |
| `status` | `text` | Não | `'Válida'::text` | Status: Válida, Vencida, A Vencer, Cancelada |
| `location` | `text` | Sim | - | Local onde foi realizada (obra, unidade, endereço) |
| `notes` | `text` | Sim | - | Observações adicionais |
| `file_url` | `text` | Sim | - | Comprovante/certificado no Supabase Storage |
| `registered_by` | `uuid` | Sim | - | Quem registrou |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `user_id` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `hr_employee_integrations_user_id_fkey`)
* A coluna `registered_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `hr_employee_integrations_registered_by_fkey`)
* A coluna `client_id` aponta para [`clients.id`](#clients.id)`(id)` (Constraint: `hr_employee_integrations_client_id_fkey`)
* A coluna `integration_type_id` aponta para [`hr_integration_types.id`](#hr-integration-types.id)`(id)` (Constraint: `hr_employee_integrations_integration_type_id_fkey`)

---

### hr_training_catalog

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `name` | `text` | Não | - | Nome do treinamento (ex: "NR-11 Operação de Plataformas") |
| `category` | `text` | Sim | - | Categoria (ex: "Segurança", "Operação", "Gestão", "Qualidade") |
| `description` | `text` | Sim | - | Descrição e objetivos do treinamento |
| `workload_hours` | `numeric` | Sim | - | Carga horária padrão |
| `validity_days` | `integer` | Sim | - | Validade padrão em dias (0 ou NULL = sem validade) |
| `alert_days_before` | `integer` | Não | `30` | Dias de antecedência para alertas de renovação |
| `mandatory` | `boolean` | Não | `false` | Se é obrigatório para todos os colaboradores |
| `active` | `boolean` | Não | `true` | Treinamento ativo no catálogo |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`hr_employee_trainings.training_id`](#hr-employee-trainings.training-id)`(training_id)` aponta para a coluna local `id` (Constraint: `hr_employee_trainings_training_id_fkey`)

---

### hr_employee_trainings

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK | Identificador único |
| `user_id` | `uuid` | Não | - | Colaborador que realizou o treinamento |
| `training_id` | `uuid` | Não | - | Treinamento do catálogo |
| `provider` | `text` | Sim | - | Instituição/empresa fornecedora do treinamento |
| `instructor` | `text` | Sim | - | Nome do instrutor (quando aplicável) |
| `completion_date` | `date` | Não | - | Data de conclusão do treinamento |
| `workload_hours` | `numeric` | Sim | - | Carga horária efetiva (pode diferir do padrão) |
| `expiry_date` | `date` | Sim | - | Data de validade do certificado (quando aplicável) |
| `status` | `text` | Não | `'Válido'::text` | Status: Válido, Vencido, A Vencer |
| `certificate_url` | `text` | Sim | - | Certificado no Supabase Storage |
| `cost` | `numeric` | Sim | - | Custo do treinamento (para controle de investimento em T&D) |
| `notes` | `text` | Sim | - | Observações |
| `registered_by` | `uuid` | Sim | - | Quem lançou o registro |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `user_id` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `hr_employee_trainings_user_id_fkey`)
* A coluna `training_id` aponta para [`hr_training_catalog.id`](#hr-training-catalog.id)`(id)` (Constraint: `hr_employee_trainings_training_id_fkey`)
* A coluna `registered_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `hr_employee_trainings_registered_by_fkey`)

---

### crm_leads

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `company_name` | `text` | Não | - |  |
| `cnpj` | `text` | Sim | - |  |
| `segment` | `text` | Sim | - |  |
| `estimated_potential` | `numeric` | Sim | - |  |
| `source` | `text` | Sim | - |  |
| `status` | `text` | Não | `'Novo'::text` |  |
| `converted_at` | `timestamp with time zone` | Sim | - |  |
| `converted_client_id` | `uuid` | Sim | - |  |
| `owner_id` | `uuid` | Não | - |  |
| `notes` | `text` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `converted_client_id` aponta para [`clients.id`](#clients.id)`(id)` (Constraint: `crm_leads_converted_client_id_fkey`)
* A coluna `owner_id` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_leads_owner_id_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_deals.lead_id`](#crm-deals.lead-id)`(lead_id)` aponta para a coluna local `id` (Constraint: `crm_deals_lead_id_fkey`)
* [`crm_contacts.lead_id`](#crm-contacts.lead-id)`(lead_id)` aponta para a coluna local `id` (Constraint: `crm_contacts_lead_id_fkey`)
* [`crm_tasks.lead_id`](#crm-tasks.lead-id)`(lead_id)` aponta para a coluna local `id` (Constraint: `crm_tasks_lead_id_fkey`)

---

### crm_contacts

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `lead_id` | `uuid` | Sim | - |  |
| `client_id` | `uuid` | Sim | - |  |
| `full_name` | `text` | Não | - |  |
| `role_title` | `text` | Sim | - |  |
| `department` | `text` | Sim | - |  |
| `email` | `text` | Sim | - |  |
| `phone` | `text` | Sim | - |  |
| `is_primary` | `boolean` | Não | `false` |  |
| `notes` | `text` | Sim | - |  |
| `active` | `boolean` | Não | `true` |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `lead_id` aponta para [`crm_leads.id`](#crm-leads.id)`(id)` (Constraint: `crm_contacts_lead_id_fkey`)
* A coluna `client_id` aponta para [`clients.id`](#clients.id)`(id)` (Constraint: `crm_contacts_client_id_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_deals.primary_contact_id`](#crm-deals.primary-contact-id)`(primary_contact_id)` aponta para a coluna local `id` (Constraint: `crm_deals_primary_contact_id_fkey`)
* [`crm_deal_activities.contact_id`](#crm-deal-activities.contact-id)`(contact_id)` aponta para a coluna local `id` (Constraint: `crm_deal_activities_contact_id_fkey`)
* [`crm_tasks.contact_id`](#crm-tasks.contact-id)`(contact_id)` aponta para a coluna local `id` (Constraint: `crm_tasks_contact_id_fkey`)

---

### crm_pipelines

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `name` | `text` | Não | - | ✨ Unique |
| `description` | `text` | Sim | - |  |
| `active` | `boolean` | Não | `true` |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_pipeline_stages.pipeline_id`](#crm-pipeline-stages.pipeline-id)`(pipeline_id)` aponta para a coluna local `id` (Constraint: `crm_pipeline_stages_pipeline_id_fkey`)
* [`crm_deals.pipeline_id`](#crm-deals.pipeline-id)`(pipeline_id)` aponta para a coluna local `id` (Constraint: `crm_deals_pipeline_id_fkey`)

---

### crm_pipeline_stages

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `pipeline_id` | `uuid` | Não | - |  |
| `name` | `text` | Não | - |  |
| `position` | `integer` | Não | - |  |
| `is_won` | `boolean` | Não | `false` |  |
| `is_lost` | `boolean` | Não | `false` |  |
| `probability_pct` | `integer` | Sim | - | CHECK: probability_pct >= 0 AND probability_pct <= 100 |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `pipeline_id` aponta para [`crm_pipelines.id`](#crm-pipelines.id)`(id)` (Constraint: `crm_pipeline_stages_pipeline_id_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_deals.stage_id`](#crm-deals.stage-id)`(stage_id)` aponta para a coluna local `id` (Constraint: `crm_deals_stage_id_fkey`)
* [`crm_deal_activities.stage_from_id`](#crm-deal-activities.stage-from-id)`(stage_from_id)` aponta para a coluna local `id` (Constraint: `crm_deal_activities_stage_from_id_fkey`)
* [`crm_deal_activities.stage_to_id`](#crm-deal-activities.stage-to-id)`(stage_to_id)` aponta para a coluna local `id` (Constraint: `crm_deal_activities_stage_to_id_fkey`)

---

### crm_deals

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `title` | `text` | Não | - |  |
| `pipeline_id` | `uuid` | Não | - |  |
| `stage_id` | `uuid` | Não | - |  |
| `lead_id` | `uuid` | Sim | - |  |
| `client_id` | `uuid` | Sim | - |  |
| `primary_contact_id` | `uuid` | Sim | - |  |
| `owner_id` | `uuid` | Não | - |  |
| `value` | `numeric` | Sim | - |  |
| `probability_pct` | `integer` | Sim | - | CHECK: probability_pct >= 0 AND probability_pct <= 100 |
| `expected_close_date` | `date` | Sim | - |  |
| `closed_at` | `timestamp with time zone` | Sim | - |  |
| `lost_reason` | `text` | Sim | - |  |
| `description` | `text` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |
| `active_contract_id` | `uuid` | Sim | - |  |
| `contract_form_id` | `uuid` | Sim | - |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `client_id` aponta para [`clients.id`](#clients.id)`(id)` (Constraint: `crm_deals_client_id_fkey`)
* A coluna `pipeline_id` aponta para [`crm_pipelines.id`](#crm-pipelines.id)`(id)` (Constraint: `crm_deals_pipeline_id_fkey`)
* A coluna `stage_id` aponta para [`crm_pipeline_stages.id`](#crm-pipeline-stages.id)`(id)` (Constraint: `crm_deals_stage_id_fkey`)
* A coluna `lead_id` aponta para [`crm_leads.id`](#crm-leads.id)`(id)` (Constraint: `crm_deals_lead_id_fkey`)
* A coluna `contract_form_id` aponta para [`crm_deal_contract_forms.id`](#crm-deal-contract-forms.id)`(id)` (Constraint: `crm_deals_contract_form_id_fkey`)
* A coluna `active_contract_id` aponta para [`crm_deal_contracts.id`](#crm-deal-contracts.id)`(id)` (Constraint: `crm_deals_active_contract_id_fkey`)
* A coluna `owner_id` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_deals_owner_id_fkey`)
* A coluna `primary_contact_id` aponta para [`crm_contacts.id`](#crm-contacts.id)`(id)` (Constraint: `crm_deals_primary_contact_id_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_deal_contracts.deal_id`](#crm-deal-contracts.deal-id)`(deal_id)` aponta para a coluna local `id` (Constraint: `crm_deal_contracts_deal_id_fkey`)
* [`crm_deal_contract_forms.deal_id`](#crm-deal-contract-forms.deal-id)`(deal_id)` aponta para a coluna local `id` (Constraint: `crm_deal_contract_forms_deal_id_fkey`)
* [`crm_tasks.deal_id`](#crm-tasks.deal-id)`(deal_id)` aponta para a coluna local `id` (Constraint: `crm_tasks_deal_id_fkey`)
* [`crm_deal_activities.deal_id`](#crm-deal-activities.deal-id)`(deal_id)` aponta para a coluna local `id` (Constraint: `crm_deal_activities_deal_id_fkey`)

---

### crm_deal_activities

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `deal_id` | `uuid` | Não | - |  |
| `activity_type` | `text` | Não | - |  |
| `description` | `text` | Não | - |  |
| `stage_from_id` | `uuid` | Sim | - |  |
| `stage_to_id` | `uuid` | Sim | - |  |
| `contact_id` | `uuid` | Sim | - |  |
| `performed_by` | `uuid` | Não | - |  |
| `activity_date` | `timestamp with time zone` | Não | `now()` |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `stage_from_id` aponta para [`crm_pipeline_stages.id`](#crm-pipeline-stages.id)`(id)` (Constraint: `crm_deal_activities_stage_from_id_fkey`)
* A coluna `deal_id` aponta para [`crm_deals.id`](#crm-deals.id)`(id)` (Constraint: `crm_deal_activities_deal_id_fkey`)
* A coluna `stage_to_id` aponta para [`crm_pipeline_stages.id`](#crm-pipeline-stages.id)`(id)` (Constraint: `crm_deal_activities_stage_to_id_fkey`)
* A coluna `contact_id` aponta para [`crm_contacts.id`](#crm-contacts.id)`(id)` (Constraint: `crm_deal_activities_contact_id_fkey`)
* A coluna `performed_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_deal_activities_performed_by_fkey`)

---

### crm_task_types

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `name` | `text` | Não | - | ✨ Unique |
| `active` | `boolean` | Não | `true` |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_tasks.task_type_id`](#crm-tasks.task-type-id)`(task_type_id)` aponta para a coluna local `id` (Constraint: `crm_tasks_task_type_id_fkey`)

---

### crm_tasks

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `task_type_id` | `uuid` | Não | - |  |
| `title` | `text` | Não | - |  |
| `description` | `text` | Sim | - |  |
| `deal_id` | `uuid` | Sim | - |  |
| `lead_id` | `uuid` | Sim | - |  |
| `contact_id` | `uuid` | Sim | - |  |
| `assigned_to` | `uuid` | Não | - |  |
| `created_by` | `uuid` | Não | - |  |
| `due_date` | `timestamp with time zone` | Não | - |  |
| `completed_at` | `timestamp with time zone` | Sim | - |  |
| `status` | `text` | Não | `'Pendente'::text` |  |
| `priority` | `text` | Não | `'Normal'::text` |  |
| `notes` | `text` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `assigned_to` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_tasks_assigned_to_fkey`)
* A coluna `contact_id` aponta para [`crm_contacts.id`](#crm-contacts.id)`(id)` (Constraint: `crm_tasks_contact_id_fkey`)
* A coluna `lead_id` aponta para [`crm_leads.id`](#crm-leads.id)`(id)` (Constraint: `crm_tasks_lead_id_fkey`)
* A coluna `deal_id` aponta para [`crm_deals.id`](#crm-deals.id)`(id)` (Constraint: `crm_tasks_deal_id_fkey`)
* A coluna `task_type_id` aponta para [`crm_task_types.id`](#crm-task-types.id)`(id)` (Constraint: `crm_tasks_task_type_id_fkey`)
* A coluna `created_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_tasks_created_by_fkey`)

---

### erp_company_settings

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `company_name` | `text` | Não | - |  |
| `cnpj` | `text` | Não | - |  |
| `state_registration` | `text` | Sim | - |  |
| `address_full` | `text` | Não | - |  |
| `logo_url` | `text` | Sim | - |  |
| `bank_name` | `text` | Sim | - |  |
| `bank_code` | `text` | Sim | - |  |
| `bank_agency` | `text` | Sim | - |  |
| `bank_account` | `text` | Sim | - |  |
| `bank_pix_key` | `text` | Sim | - |  |
| `contract_clauses` | `jsonb` | Não | - |  |
| `active` | `boolean` | Não | `true` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

---

### crm_deal_contract_forms

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `deal_id` | `uuid` | Não | - | ✨ Unique |
| `contract_date` | `date` | Não | - |  |
| `locatario_company_name` | `text` | Não | - |  |
| `locatario_cnpj` | `text` | Não | - |  |
| `locatario_state_registration` | `text` | Sim | - |  |
| `locatario_address_full` | `text` | Não | - |  |
| `equipment_description` | `text` | Não | - |  |
| `equipment_model` | `text` | Não | - |  |
| `contract_duration_days` | `integer` | Não | - |  |
| `period_start` | `date` | Sim | - |  |
| `period_end` | `date` | Sim | - |  |
| `cost_rental` | `numeric` | Não | `0` |  |
| `cost_insurance` | `numeric` | Não | `0` |  |
| `cost_freight` | `numeric` | Não | `0` |  |
| `cost_rcd` | `numeric` | Não | `0` |  |
| `cost_third_party` | `numeric` | Não | `0` |  |
| `cost_training` | `numeric` | Não | `0` |  |
| `cost_total` | `numeric` | Não | - |  |
| `billing_interval_days` | `integer` | Não | - |  |
| `work_site` | `text` | Não | - |  |
| `site_contact_name` | `text` | Sim | - |  |
| `site_contact_phone` | `text` | Sim | - |  |
| `notes` | `text` | Sim | - |  |
| `form_status` | `text` | Não | `'Rascunho'::text` |  |
| `created_by` | `uuid` | Não | - |  |
| `updated_by` | `uuid` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `deal_id` aponta para [`crm_deals.id`](#crm-deals.id)`(id)` (Constraint: `crm_deal_contract_forms_deal_id_fkey`)
* A coluna `created_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_deal_contract_forms_created_by_fkey`)
* A coluna `updated_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_deal_contract_forms_updated_by_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`crm_deals.contract_form_id`](#crm-deals.contract-form-id)`(contract_form_id)` aponta para a coluna local `id` (Constraint: `crm_deals_contract_form_id_fkey`)
* [`crm_deal_contracts.contract_form_id`](#crm-deal-contracts.contract-form-id)`(contract_form_id)` aponta para a coluna local `id` (Constraint: `crm_deal_contracts_contract_form_id_fkey`)

---

### crm_deal_contracts

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `deal_id` | `uuid` | Não | - |  |
| `contract_form_id` | `uuid` | Não | - |  |
| `contract_number` | `text` | Não | - | ✨ Unique |
| `version` | `integer` | Não | `1` |  |
| `status` | `text` | Não | `'Gerado'::text` |  |
| `generated_at` | `timestamp with time zone` | Não | `now()` |  |
| `generated_by` | `uuid` | Não | - |  |
| `signed_file_url` | `text` | Sim | - |  |
| `signed_uploaded_at` | `timestamp with time zone` | Sim | - |  |
| `signed_uploaded_by` | `uuid` | Sim | - |  |
| `snapshot` | `jsonb` | Não | - |  |
| `notes` | `text` | Sim | - |  |
| `created_at` | `timestamp with time zone` | Não | `now()` |  |
| `updated_at` | `timestamp with time zone` | Não | `now()` |  |
| `rental_invoice_id` | `uuid` | Sim | - |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `rental_invoice_id` aponta para [`rental_invoices.id`](#rental-invoices.id)`(id)` (Constraint: `crm_deal_contracts_rental_invoice_id_fkey`)
* A coluna `signed_uploaded_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_deal_contracts_signed_uploaded_by_fkey`)
* A coluna `generated_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `crm_deal_contracts_generated_by_fkey`)
* A coluna `contract_form_id` aponta para [`crm_deal_contract_forms.id`](#crm-deal-contract-forms.id)`(id)` (Constraint: `crm_deal_contracts_contract_form_id_fkey`)
* A coluna `deal_id` aponta para [`crm_deals.id`](#crm-deals.id)`(id)` (Constraint: `crm_deal_contracts_deal_id_fkey`)

#### Relacionamentos de Entrada (Tabelas que Referenciam esta)

* [`logistics_triage_photos.contract_id`](#logistics-triage-photos.contract-id)`(contract_id)` aponta para a coluna local `id` (Constraint: `logistics_triage_photos_contract_id_fkey`)
* [`crm_deals.active_contract_id`](#crm-deals.active-contract-id)`(active_contract_id)` aponta para a coluna local `id` (Constraint: `crm_deals_active_contract_id_fkey`)

---

### logistics_triage_photos

* **Segurança de Nível de Linha (RLS):** Habilitada (Enabled)

#### Colunas

| Coluna | Tipo | Nulável | Padrão | Restrições / Notas |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `uuid` | Não | `gen_random_uuid()` | 🔑 PK |
| `contract_id` | `uuid` | Não | - |  |
| `position` | `integer` | Não | - |  |
| `label` | `text` | Não | - |  |
| `file_path` | `text` | Não | - |  |
| `file_url` | `text` | Sim | - |  |
| `uploaded_by` | `uuid` | Sim | - |  |
| `uploaded_at` | `timestamp with time zone` | Sim | `now()` |  |

#### Relacionamentos de Saída (Chaves Estrangeiras Referenciadas)

* A coluna `contract_id` aponta para [`crm_deal_contracts.id`](#crm-deal-contracts.id)`(id)` (Constraint: `logistics_triage_photos_contract_id_fkey`)
* A coluna `uploaded_by` aponta para [`users_profiles.id`](#users-profiles.id)`(id)` (Constraint: `logistics_triage_photos_uploaded_by_fkey`)

---

## Definição das Funções dos Gatilhos (Trigger Functions)

Estas são as funções PL/pgSQL executadas pelos gatilhos descritos acima:

### Função `generate_invoice_number()`

```sql
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_year   INTEGER;
  v_seq    INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM now())::INTEGER;

  -- Incrementa atomicamente o contador do ano corrente
  INSERT INTO public.invoice_year_counters (year, last_seq)
  VALUES (v_year, 1)
  ON CONFLICT (year) DO UPDATE
    SET last_seq = invoice_year_counters.last_seq + 1
  RETURNING last_seq INTO v_seq;

  NEW.invoice_number := v_seq::TEXT || '/' || v_year::TEXT;
  RETURN NEW;\nEND;\n$function$\n```

### Função `update_client_average_score()`

```sql
CREATE OR REPLACE FUNCTION public.update_client_average_score()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE clients
  SET average_score = (
    SELECT ROUND(AVG(client_score), 2)
    FROM rental_invoices
    WHERE client_id = NEW.client_id AND client_score IS NOT NULL
  )
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$function$
```

### Função `update_updated_at_column()`

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```


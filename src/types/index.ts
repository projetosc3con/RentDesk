export type EquipmentStatus = 'Disponível' | 'Locado' | 'Em Manutenção' | 'Inativo';

export interface Equipment {
  id: string;
  asset_number: string;
  name: string;
  type: string;
  model: string;
  serial_number: string;
  height?: number;
  status: EquipmentStatus;
  manufacture_year: number;
  value: number;
  unit: string;
  photo_url: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: string;
  internal_code: string;
  description: string;
  part_number: string;
  quantity: number;
  unit_value: number;
  total_value: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type BillingStatus = 'Pendente' | 'Faturado' | 'Emitida' | 'Cancelada';
export type ReconciliationStatus = 'Pendente' | 'Atrasado' | 'Recebido' | 'Divergente' | 'No prazo';
export type ServiceOrderStatus = 'Aberta' | 'Em Andamento' | 'Aguardando Peças' | 'Concluída' | 'Cancelada';
export type ServiceOrderType = 'Interna' | 'Externa';

export interface ServiceOrder {
  id: string;
  os_number: number;
  order_type: ServiceOrderType;
  equipment_id?: string;
  equipment_asset_number?: string;
  equipment_name?: string;
  equipment_model?: string;
  equipment_serial_number?: string;
  equipment_condition_entry?: string;
  executed_by?: string;
  execution_date?: string;
  execution_location?: string;
  status: ServiceOrderStatus;
  description?: string;
  notes?: string;
  // Horímetro
  hour_meter_before?: number;
  hour_meter_after?: number;
  // Dados do cliente
  client_name?: string;
  client_address?: string;
  client_contact_name?: string;
  client_phone?: string;
  // Diagnóstico
  client_request?: string;
  diagnosis?: string;
  services_executed?: string;
  // Observações técnicas
  tech_observation?: string;
  tech_observation_ok?: boolean;
  equipment_functional?: boolean;
  // Campos exclusivos EXTERNA
  client_observation?: string;
  client_observation_ok?: boolean;
  checklist_equipment_conditions?: boolean;
  checklist_safe_work?: boolean;
  checklist_epi?: boolean;
  checklist_adequate_environment?: boolean;
  checklist_well_served?: boolean;
  vehicle_plate?: string;
  vehicle_km_start?: number;
  vehicle_km_end?: number;
  // Assinaturas
  signer_client_name?: string;
  signer_client_rg?: string;
  signer_client_role?: string;
  signer_tech_name?: string;
  signer_tech_role?: string;
  // Campos exclusivos INTERNA
  parts_pending?: boolean;
  // Análise Crítica
  critical_analysis?: string;
  cost_company?: number;
  cost_client?: number;
  has_pending?: boolean;
  // Timestamps
  created_at: string;
  updated_at: string;
  // Included fields
  parts?: ServiceOrderPart[];
  service_order_parts?: ServiceOrderPart[];
  service_order_labor?: ServiceOrderLabor[];
}

export interface ServiceOrderPart {
  id: string;
  service_order_id: string;
  part_id: string;
  quantity_used: number;
  unit_value_at_use: number;
  subtotal: number;
  was_used?: boolean;
  // Denormalized for UI
  part_description?: string;
  part_number?: string;
  internal_code?: string;
  parts?: Part;
}

export interface ServiceOrderLabor {
  id?: string;
  service_order_id?: string;
  technician_name: string;
  labor_date?: string;
  start_time?: string;
  end_time?: string;
  labor_type: string;
  created_at?: string;
}

export interface RentalInvoice {
  id: string;
  invoice_number?: string;
  client_id: string;
  client_name: string;
  cnpj: string;
  equipment_id: string;
  equipment_name: string;
  equipment_type: string;
  equipment_size?: string;
  asset_number: string;
  work_site: string;
  billing_period_start: string;
  billing_period_end: string;
  billing_status: BillingStatus;
  return_date?: string;
  cost_rental: number;
  cost_insurance: number;
  cost_freight: number;
  cost_rcd: number;
  cost_third_party: number;
  cost_training: number;
  total_value: number;
  due_date: string;
  payment_method: string;
  bank_reconciliation_date?: string;
  reconciliation_status: ReconciliationStatus;
  client_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company_name: string;
  cnpj: string;
  state_subscription?: string;
  contact_name: string;
  phone: string;
  email: string;
  address_street: string;
  address_number: string;
  address_complement?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  average_score?: number;
  documentation_url?: string;
  asaas_customer_id?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type AccessLevel = 'Administrador' | 'Diretoria' | 'Gerente' | 'Comercial' | 'Logística' | 'Manutenção' | 'Financeiro' | 'Recursos Humanos' | 'Usuário';

export interface UserProfile {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  address_street: string;
  address_number: string;
  address_complement?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  role_title: string;
  photo_url?: string;
  access_level: AccessLevel;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type CRMLeadStatus = 'Novo' | 'Em Contato' | 'Qualificado' | 'Desqualificado' | 'Convertido';
export type CRMLeadSource = 'Indicação' | 'Site' | 'Evento' | 'Cold Call' | 'Rede Social' | 'Parceiro' | 'Outro';

export interface CRMLead {
  id: string;
  company_name: string;
  cnpj?: string;
  segment?: string;
  estimated_potential?: number;
  source?: CRMLeadSource;
  status: CRMLeadStatus;
  converted_at?: string;
  converted_client_id?: string;
  owner_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CRMContact {
  id: string;
  lead_id?: string;
  client_id?: string;
  full_name: string;
  role_title?: string;
  department?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CRMPipeline {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CRMPipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
  probability_pct?: number;
  created_at: string;
}

export interface CRMDeal {
  id: string;
  title: string;
  pipeline_id: string;
  stage_id: string;
  lead_id?: string;
  client_id?: string;
  primary_contact_id?: string;
  owner_id: string;
  value?: number;
  probability_pct?: number;
  expected_close_date?: string;
  closed_at?: string;
  lost_reason?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type CRMActivityType = 'Nota' | 'Ligação' | 'E-mail' | 'Reunião' | 'Mudança de Etapa' | 'Proposta Enviada' | 'Visita Técnica';

export interface CRMDealActivity {
  id: string;
  deal_id: string;
  activity_type: CRMActivityType;
  description: string;
  stage_from_id?: string;
  stage_to_id?: string;
  contact_id?: string;
  performed_by: string;
  activity_date: string;
  created_at: string;
}

export interface CRMTaskType {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export type CRMTaskStatus = 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada';
export type CRMTaskPriority = 'Baixa' | 'Normal' | 'Alta' | 'Urgente';

export interface CRMTask {
  id: string;
  task_type_id: string;
  title: string;
  description?: string;
  deal_id?: string;
  lead_id?: string;
  contact_id?: string;
  assigned_to: string;
  created_by: string;
  due_date: string;
  completed_at?: string;
  status: CRMTaskStatus;
  priority: CRMTaskPriority;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreConsultaSuccess {
  sucesso: true;
  score: number;
  tipo: 'PF' | 'PJ';
}

export interface ScoreConsultaError {
  sucesso: false;
  mensagem: string;
}

export type ScoreConsultaResponse = ScoreConsultaSuccess | ScoreConsultaError;

export type AsaasCompanyType = 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION';

export interface AsaasSubaccountPayload {
  name: string;
  email: string;
  cpfCnpj: string;
  companyType?: AsaasCompanyType;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  province: string;
  postalCode: string;
  incomeValue: number;
}

export interface AsaasSubaccountResponse {
  subaccount: {
    id: string;
    apiKey: string;
    walletId: string;
    email: string;
    loginEmail: string;
  };
  settings: {
    id: string;
    company_name: string;
    cnpj: string;
    asaas_api_key: string;
    active: boolean;
  };
}

export interface AsaasSubaccountVerifyResponse {
  keyPreview: string;
  account: { status?: string; [key: string]: unknown };
}

export interface AsaasChargeBreakdown {
  total_value: number;
  fee_amount: number;
  charged_value: number;
  net_value: number | null;
}

export interface AsaasChargeResult {
  invoice_id: string;
  charge: {
    id: string;
    status: string;
    value: number;
    netValue?: number;
    invoiceUrl: string;
    bankSlipUrl?: string;
    [key: string]: unknown;
  };
  payment: Record<string, unknown>;
  breakdown?: AsaasChargeBreakdown;
  warning?: string;
}

export type AsaasPaymentStatus = 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'CANCELLED' | (string & {});

export interface Payment {
  id: string;
  invoice_id: string;
  client_id: string;
  asaas_payment_id?: string;
  billing_type: string;
  value: number;
  net_value?: number;
  net_value_projected?: number | null;
  invoice_url?: string | null;
  bank_slip_url?: string | null;
  due_date: string;
  payment_date?: string;
  status: AsaasPaymentStatus;
  is_manual_reconciliation: boolean;
  created_at: string;
  invoice?: { invoice_number?: string; client_name: string };
}

export type BillOrigin = 'ASAAS' | 'MANUAL';
export type BillType = 'receivable' | 'payable';
export type BillStatus = 'Pendente' | 'Atrasado' | 'Recebido' | 'Divergente' | 'No prazo';

export interface Bill {
  id: string;
  origin: BillOrigin;
  type: BillType;
  rental_invoice_id: string | null;
  payment_id: string | null;
  client_id: string | null;
  counterparty_name: string | null;
  description: string | null;
  gross_value: number;
  fee_amount: number | null;
  net_value: number;
  due_date: string | null;
  pix_end_to_end_id: string | null;
  bank_transaction_date: string | null;
  status: BillStatus;
  reconciled_at: string | null;
  created_at: string;
  updated_at: string;
  invoice?: { invoice_number?: string; client_name: string };
  client?: { company_name: string; cnpj: string };
}

export interface CreateBillPayload {
  type: BillType;
  counterparty_name?: string;
  description?: string;
  barcode?: string;
  gross_value: number;
  due_date: string;
  already_settled?: boolean;
  settled_date?: string;
  bank_transaction_date?: string;
  bank_raw_snapshot?: Record<string, unknown>;
}

// Item normalizado do extrato bancário: mescla `bills` (já conciliado,
// automático ou manual) com `payments` ainda sem bill vinculado (cobrança
// Asaas em aberto). Espelha BillStatementItem do backend.
export interface StatementItem {
  source: 'bill' | 'payment';
  id: string;
  type: BillType;
  status: string;
  origin: BillOrigin | null;
  gross_value: number;
  net_value: number | null;
  fee_amount: number | null;
  due_date: string | null;
  settled_date: string | null;
  client_id: string | null;
  client_name: string | null;
  counterparty_name: string | null;
  invoice_number: string | null;
  description: string | null;
  invoice_url: string | null;
  bank_slip_url: string | null;
  is_reconciled: boolean;
  raw: Record<string, unknown>;
}

// Linha normalizada do extrato bancário do BB (ver financeiroService.reconciliarExtratoBancario).
export interface BankStatementLine {
  bank_date: string;
  value: number;
  dc_indicator: 'D' | 'C';
  type: BillType;
  description: string | null;
  document_number: string | null;
  raw: Record<string, unknown>;
}

export type BankStatementMatchStatus = 'matched' | 'unmatched';

export interface BankStatementMatchResult extends BankStatementLine {
  match_status: BankStatementMatchStatus;
  matched_bill_id: string | null;
  matched_bill: StatementItem | null;
}

export interface ReconcileBankStatementResponse {
  period: { from: string; to: string };
  simulated: boolean;
  lines: BankStatementMatchResult[];
  matched_count: number;
  unmatched_count: number;
}

export type NfseStatus =
  | 'SCHEDULED'
  | 'SYNCHRONIZED'
  | 'AUTHORIZED'
  | 'PROCESSING_CANCELLATION'
  | 'CANCELLED'
  | 'CANCELLATION_DENIED'
  | 'ERROR'
  | 'ERRO';

export interface InvoiceNfse {
  id: string;
  invoice_id: string;
  gateway: string;
  external_id: string | null;
  status: NfseStatus;
  nfse_link: string | null;
  xml_url: string | null;
  service_code: string | null;
  iss_regime: 'Isento' | 'Tributado' | null;
  return_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface NfseEmitResult {
  invoice_id: string;
  nfse: InvoiceNfse;
  asaas: Record<string, unknown>;
}

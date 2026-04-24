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

export type BillingStatus = 'Pendente' | 'Emitida' | 'Cancelada' | 'Paga';
export type ReconciliationStatus = 'Pendente' | 'Conciliado' | 'Divergente';

export interface RentalInvoice {
  id: string;
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
  active: boolean;
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

export type OSStatus = 'Aberta' | 'Em Andamento' | 'Aguardando Peças' | 'Concluída' | 'Cancelada';

export interface ServiceOrder {
  id: string;
  os_number: string;
  equipment_id: string;
  equipment_asset_number: string;
  equipment_name: string;
  equipment_model: string;
  equipment_serial_number: string;
  equipment_condition_entry: string;
  executed_by: string;
  execution_date: string;
  execution_location: string;
  status: OSStatus;
  description: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AccessLevel = 'Admin' | 'Gerente' | 'Operacional' | 'Técnico' | 'Financeiro' | 'Visualizador';

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

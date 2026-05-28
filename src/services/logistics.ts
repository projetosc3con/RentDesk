import api from './api';

export interface LogisticsContract {
  id: string;
  deal_id: string;
  contract_form_id: string;
  contract_number: string;
  version: number;
  status: 'Assinado' | 'Triagem' | 'Processado';
  snapshot: any;
  signed_file_url?: string;
  rental_invoice_id?: string;
  generated_by?: string;
  created_at: string;
  updated_at?: string;
  deal?: {
    id: string;
    title: string;
    value?: number;
    expected_close_date?: string;
    client_id?: string;
    client?: {
      id: string;
      company_name: string;
      cnpj: string;
      address_street?: string;
      address_number?: string;
      address_city?: string;
      address_state?: string;
    };
    lead?: {
      id: string;
      company_name: string;
      cnpj?: string;
    };
  };
  contract_form?: {
    id?: string;
    deal_id?: string;
    equipment_description?: string;
    equipment_model?: string;
    work_site?: string;
    locatario_company_name?: string;
    locatario_cnpj?: string;
    locatario_state_registration?: string;
    locatario_address_full?: string;
    cost_rental?: number;
    cost_insurance?: number;
    cost_freight?: number;
    cost_rcd?: number;
    cost_third_party?: number;
    cost_training?: number;
    cost_total?: number;
    period_start?: string;
    period_end?: string;
    contract_duration_days?: number;
    billing_interval_days?: number;
    site_contact_name?: string;
    site_contact_phone?: string;
    notes?: string;
    contract_date?: string;
    form_status?: string;
  };
}

export interface TriagePhoto {
  id: string;
  contract_id: string;
  position: number;
  label: string;
  file_path: string;
  file_url: string;
  uploaded_by?: string;
  uploaded_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  uploaded_at: string;
}

export const logisticsService = {
  getContracts: async (): Promise<LogisticsContract[]> => {
    const response = await api.get('/logistics/contracts');
    return response.data;
  },

  getContractById: async (id: string): Promise<LogisticsContract> => {
    const response = await api.get(`/logistics/contracts/${id}`);
    return response.data;
  },

  startTriage: async (id: string): Promise<LogisticsContract> => {
    const response = await api.patch(`/logistics/contracts/${id}/start-triage`);
    return response.data;
  },

  finishProcessing: async (id: string, data: { rental_invoice_id?: string; equipment_id?: string }): Promise<LogisticsContract> => {
    const response = await api.patch(`/logistics/contracts/${id}/finish`, data);
    return response.data;
  },

  // --- Triage Photo Checklist ---

  uploadTriagePhoto: async (contractId: string, position: number, label: string, file: File): Promise<TriagePhoto> => {
    const { supabase } = await import('../lib/supabase');
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${contractId}/${position}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('logistics-triage')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const response = await api.post(`/logistics/contracts/${contractId}/triage-photos`, {
      position,
      label,
      file_path: filePath
    });
    return response.data;
  },

  getTriagePhotos: async (contractId: string): Promise<TriagePhoto[]> => {
    const response = await api.get(`/logistics/contracts/${contractId}/triage-photos`);
    return response.data;
  },

  deleteTriagePhoto: async (contractId: string, photoId: string, filePath: string): Promise<void> => {
    const { supabase } = await import('../lib/supabase');
    await supabase.storage.from('logistics-triage').remove([filePath]);
    await api.delete(`/logistics/contracts/${contractId}/triage-photos/${photoId}`);
  }
};

import api from './api';
import type {
  ScoreConsultaResponse,
  Client,
  AsaasSubaccountPayload,
  AsaasSubaccountResponse,
  AsaasSubaccountVerifyResponse,
  AsaasChargeResult,
  Payment,
  Bill,
  CreateBillPayload,
  StatementItem,
  InvoiceNfse,
  NfseEmitResult,
} from '../types';

export interface ExtratoFilters {
  client_id?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface ConciliacaoFilters {
  client_id?: string;
  status?: string;
  origin?: string;
  from?: string;
  to?: string;
}

export interface ExtratoBancarioFilters {
  client_id?: string;
  from?: string;
  to?: string;
}

export const financeiroService = {
  consultarScore: async (documento: string): Promise<ScoreConsultaResponse> => {
    const { data } = await api.post<ScoreConsultaResponse>(
      '/consultar-score',
      { documento },
      { validateStatus: () => true }
    );
    return data;
  },

  criarSubconta: async (payload: AsaasSubaccountPayload): Promise<AsaasSubaccountResponse> => {
    const { data } = await api.post<AsaasSubaccountResponse>('/payments/setup/subaccount', payload);
    return data;
  },

  verificarSubconta: async (): Promise<AsaasSubaccountVerifyResponse> => {
    const { data } = await api.get<AsaasSubaccountVerifyResponse>('/payments/setup/subaccount/verify');
    return data;
  },

  sincronizarClienteAsaas: async (clientId: string): Promise<Client> => {
    const { data } = await api.post<Client>(`/clients/${clientId}/asaas-sync`);
    return data;
  },

  verificarClienteAsaas: async (clientId: string): Promise<Record<string, unknown>> => {
    const { data } = await api.get<Record<string, unknown>>(`/clients/${clientId}/asaas-verify`);
    return data;
  },

  gerarCobranca: async (invoiceId: string): Promise<AsaasChargeResult> => {
    const { data } = await api.post<AsaasChargeResult>(`/payments/invoices/${invoiceId}/charge`);
    return data;
  },

  buscarPagamentosFatura: async (invoiceId: string): Promise<Payment[]> => {
    const { data } = await api.get<Payment[]>(`/payments/invoices/${invoiceId}`);
    return data;
  },

  listarExtrato: async (filters: ExtratoFilters = {}): Promise<Payment[]> => {
    const { data } = await api.get<Payment[]>('/payments', { params: filters });
    return data;
  },

  listarConciliacaoBancaria: async (filters: ConciliacaoFilters = {}): Promise<Bill[]> => {
    const { data } = await api.get<Bill[]>('/bills', { params: filters });
    return data;
  },

  // Extrato bancário: `payments` ainda em aberto + `bills` já conciliado
  // (automático ou manual), mesclados pelo backend numa lista única.
  listarExtratoBancario: async (filters: ExtratoBancarioFilters = {}): Promise<StatementItem[]> => {
    const { data } = await api.get<StatementItem[]>('/bills', { params: filters });
    return data;
  },

  criarLancamentoManual: async (payload: CreateBillPayload): Promise<Bill> => {
    const { data } = await api.post<Bill>('/bills', payload);
    return data;
  },

  emitirNfse: async (invoiceId: string): Promise<NfseEmitResult> => {
    const { data } = await api.post<NfseEmitResult>(`/fiscal/invoices/${invoiceId}/nfse`);
    return data;
  },

  buscarNfseFatura: async (invoiceId: string): Promise<InvoiceNfse> => {
    const { data } = await api.get<InvoiceNfse>(`/fiscal/invoices/${invoiceId}/nfse`);
    return data;
  },
};

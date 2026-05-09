import api from './api';
import type { 
  CRMPipeline, 
  CRMPipelineStage, 
  CRMLead, 
  CRMTaskType,
  CRMLeadSource,
  CRMLeadStatus
} from '../types';

export type { CRMPipeline, CRMPipelineStage, CRMLead, CRMTaskType, CRMLeadSource, CRMLeadStatus };

export const crmService = {
  // Pipelines
  getPipelines: async (): Promise<(CRMPipeline & { stages: number; activeDeals: number; stageList: CRMPipelineStage[] })[]> => {
    const response = await api.get('/crm/pipelines');
    return response.data;
  },

  createPipeline: async (data: { name: string; description: string; stages: any[] }) => {
    const response = await api.post('/crm/pipelines', data);
    return response.data;
  },

  updatePipeline: async (id: string, data: { name: string; description: string; active: boolean; stages: any[] }) => {
    const response = await api.put(`/crm/pipelines/${id}`, data);
    return response.data;
  },

  deletePipeline: async (id: string) => {
    await api.delete(`/crm/pipelines/${id}`);
  },

  // Leads
  getLeads: async (): Promise<(CRMLead & { owner_name?: string })[]> => {
    const response = await api.get('/crm/leads');
    return response.data;
  },

  createLead: async (data: Partial<CRMLead> & { contacts?: any[] }) => {
    const response = await api.post('/crm/leads', data);
    return response.data;
  },

  updateLead: async (id: string, data: Partial<CRMLead> & { contacts?: any[] }) => {
    const response = await api.put(`/crm/leads/${id}`, data);
    return response.data;
  },

  getLeadContacts: async (id: string) => {
    const response = await api.get(`/crm/leads/${id}/contacts`);
    return response.data;
  },

  convertLead: async (id: string) => {
    const response = await api.post(`/crm/leads/${id}/convert`);
    return response.data;
  },

  // Task Types
  getTaskTypes: async (): Promise<CRMTaskType[]> => {
    const response = await api.get('/crm/task-types');
    return response.data;
  }
};

import api from './api';
import type { 
  CRMPipeline, 
  CRMPipelineStage, 
  CRMLead, 
  CRMTaskType,
  CRMLeadSource,
  CRMLeadStatus,
  CRMDeal
} from '../types';

export type { CRMPipeline, CRMPipelineStage, CRMLead, CRMTaskType, CRMLeadSource, CRMLeadStatus, CRMDeal };

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

  getAllContacts: async () => {
    const response = await api.get('/crm/contacts');
    return response.data;
  },

  createContact: async (data: any) => {
    const response = await api.post('/crm/contacts', data);
    return response.data;
  },

  updateContact: async (id: string, data: any) => {
    const response = await api.put(`/crm/contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id: string) => {
    await api.delete(`/crm/contacts/${id}`);
  },

  // Task Types
  getTaskTypes: async (): Promise<CRMTaskType[]> => {
    const response = await api.get('/crm/task-types');
    return response.data;
  },

  // Deals
  getDeals: async (): Promise<any[]> => {
    const response = await api.get('/crm/deals');
    return response.data;
  },

  createDeal: async (data: Partial<CRMDeal>) => {
    const response = await api.post('/crm/deals', data);
    return response.data;
  },

  updateDeal: async (id: string, data: Partial<CRMDeal>) => {
    const response = await api.put(`/crm/deals/${id}`, data);
    return response.data;
  },

  deleteDeal: async (id: string) => {
    await api.delete(`/crm/deals/${id}`);
  },

  getDealActivities: async (): Promise<any[]> => {
    const response = await api.get('/crm/deals/activities');
    return response.data;
  },

  getTasks: async (): Promise<any[]> => {
    const response = await api.get('/crm/tasks');
    return response.data;
  },

  createTask: async (taskData: any): Promise<any> => {
    const response = await api.post('/crm/tasks', taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: any): Promise<any> => {
    const response = await api.patch(`/crm/tasks/${id}`, taskData);
    return response.data;
  }
};

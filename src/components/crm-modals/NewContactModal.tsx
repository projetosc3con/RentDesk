import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { crmService } from '../../services/crm';
import api from '../../services/api';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewContactModal: React.FC<NewContactModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  const [linkType, setLinkType] = useState<'lead' | 'client'>('lead');
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    lead_id: '',
    client_id: '',
    full_name: '',
    role_title: '',
    department: '',
    email: '',
    phone: '',
    is_primary: false,
    notes: '',
    active: true
  });

  useEffect(() => {
    if (isOpen) {
      loadLinkData();
      setFormData({
        lead_id: '',
        client_id: '',
        full_name: '',
        role_title: '',
        department: '',
        email: '',
        phone: '',
        is_primary: false,
        notes: '',
        active: true
      });
      setLinkType('lead');
    }
  }, [isOpen]);

  const loadLinkData = async () => {
    try {
      setDataLoading(true);
      const [leadsData, clientsRes] = await Promise.all([
        crmService.getLeads(),
        api.get('/clients')
      ]);
      setLeads(leadsData);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error loading leads/clients:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) return;
    
    if (linkType === 'lead' && !formData.lead_id) {
      alert('Selecione um Lead para vincular.');
      return;
    }
    if (linkType === 'client' && !formData.client_id) {
      alert('Selecione um Cliente para vincular.');
      return;
    }

    try {
      setLoading(true);
      
      const payload = { ...formData };
      if (linkType === 'lead') {
        payload.client_id = ''; // remove if exists
      } else {
        payload.lead_id = ''; // remove if exists
      }
      
      // Clean up empty foreign keys so they become NULL in Supabase
      const finalPayload: any = { ...payload };
      if (!finalPayload.lead_id) delete finalPayload.lead_id;
      if (!finalPayload.client_id) delete finalPayload.client_id;

      await crmService.createContact(finalPayload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      alert('Erro ao criar contato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-600 dark:text-mustard-400">
                <span className="material-symbols-outlined text-2xl">person_add</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Novo Contato</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Adicione um novo contato e vincule-o.</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Vinculação */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-mustard-500">link</span>
                Vinculação do Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Vincular a</label>
                  <select
                    value={linkType}
                    onChange={(e) => {
                      setLinkType(e.target.value as 'lead' | 'client');
                      setFormData(prev => ({ ...prev, lead_id: '', client_id: '' }));
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                  >
                    <option value="lead">Lead</option>
                    <option value="client">Cliente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    {linkType === 'lead' ? 'Selecione o Lead' : 'Selecione o Cliente'}
                  </label>
                  <select
                    name={linkType === 'lead' ? 'lead_id' : 'client_id'}
                    value={linkType === 'lead' ? formData.lead_id : formData.client_id}
                    onChange={handleChange}
                    disabled={dataLoading}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white disabled:opacity-50"
                  >
                    <option value="">Selecione...</option>
                    {linkType === 'lead' 
                      ? leads.map(l => <option key={l.id} value={l.id}>{l.company_name}</option>)
                      : clients.map(c => <option key={c.id} value={c.id}>{c.trading_name || c.company_name}</option>)
                    }
                  </select>
                </div>
              </div>
            </div>

            {/* Dados do Contato */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-mustard-500">badge</span>
                Dados do Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Nome Completo *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Ex: João da Silva"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Cargo</label>
                  <input
                    type="text"
                    name="role_title"
                    value={formData.role_title}
                    onChange={handleChange}
                    placeholder="Ex: Gerente Comercial"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Departamento</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Ex: Vendas"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="joao@empresa.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Telefone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer group pt-2">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="is_primary"
                    checked={formData.is_primary}
                    onChange={handleChange}
                    className="peer appearance-none w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded-lg checked:bg-mustard-500 checked:border-mustard-500 transition-all cursor-pointer"
                  />
                  <span className="material-symbols-outlined absolute text-white text-[16px] scale-0 peer-checked:scale-100 transition-transform pointer-events-none">check</span>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-mustard-600 transition-colors">Definir como contato principal</span>
              </label>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-mustard-500">description</span>
                Observações
              </h3>
              
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Observações adicionais sobre o contato..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all resize-none dark:text-white"
              />
            </div>
            
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-mustard-500 hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">save</span>
              )}
              {loading ? 'Salvando...' : 'Salvar Contato'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewContactModal;

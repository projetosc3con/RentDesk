import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { crmService } from '../../services/crm';
import { useAuth } from '../../contexts/AuthContext';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  
  const [deals, setDeals] = useState<any[]>([]);
  const [taskTypes, setTaskTypes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type_id: '',
    deal_id: '',
    assigned_to: '',
    due_date: '',
    priority: 'Normal',
    lead_id: null as string | null,
    contact_id: null as string | null,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        task_type_id: '',
        deal_id: '',
        assigned_to: profile?.id || '',
        due_date: '',
        priority: 'Normal',
        lead_id: null,
        contact_id: null,
      });
      loadData();
    }
  }, [isOpen, profile]);

  const loadData = async () => {
    try {
      const [dealsRes, typesRes] = await Promise.all([
        crmService.getDeals(),
        crmService.getTaskTypes()
      ]);
      setDeals(dealsRes);
      setTaskTypes(typesRes);
    } catch (error) {
      console.error('Erro ao carregar dados do modal:', error);
    }
  };

  const handleDealChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dealId = e.target.value;
    const deal = deals.find(d => d.id === dealId);
    
    setFormData(prev => ({
      ...prev,
      deal_id: dealId,
      lead_id: deal?.lead_id || null,
      contact_id: deal?.primary_contact_id || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.task_type_id || !formData.due_date) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      // O assigned_to e created_by serão tratados no backend ou aqui
      // No backend já setamos created_by. Aqui setamos assigned_to.
      await crmService.createTask({
        ...formData,
        assigned_to: formData.assigned_to || profile?.id
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert('Erro ao criar tarefa. Tente novamente.');
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
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-600 dark:text-mustard-400">
                <span className="material-symbols-outlined text-2xl">add_task</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Nova Tarefa</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Agende uma atividade comercial.</p>
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
          <form id="new-task-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Ligar para follow-up"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Tipo de Tarefa *</label>
                  <select
                    required
                    value={formData.task_type_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, task_type_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    {taskTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Negociação (Deal) *</label>
                <select
                  required
                  value={formData.deal_id}
                  onChange={handleDealChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white"
                >
                  <option value="">Vincular a uma negociação...</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.client?.company_name || d.lead?.company_name || 'Sem empresa'})
                    </option>
                  ))}
                </select>
                {formData.deal_id && (
                  <p className="mt-2 text-[10px] text-mustard-600 font-bold uppercase tracking-wider bg-mustard-50 dark:bg-mustard-500/10 px-2 py-1 rounded inline-block">
                    Vínculo automático: {deals.find(d => d.id === formData.deal_id)?.client?.company_name || deals.find(d => d.id === formData.deal_id)?.lead?.company_name || 'Lead/Cliente identificado'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Data de Entrega *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Responsável</label>
                  <input
                    type="text"
                    disabled
                    value={profile?.full_name || ''}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none transition-all dark:text-white opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Descrição / Notas</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhes sobre o que precisa ser feito..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all resize-none dark:text-white"
                />
              </div>
            </div>

          </form>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              form="new-task-form"
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-mustard-500 hover:bg-mustard-600 text-white shadow-lg shadow-mustard-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Criar Tarefa
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewTaskModal;

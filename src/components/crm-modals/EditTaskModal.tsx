import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { crmService } from '../../services/crm';
import { useAuth } from '../../contexts/AuthContext';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: any;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onSuccess, task }) => {
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
    status: 'Pendente',
    lead_id: null as string | null,
    contact_id: null as string | null,
  });

  useEffect(() => {
    if (isOpen && task) {
      // Format date for datetime-local input
      const date = new Date(task.due_date);
      const formattedDate = date.toISOString().slice(0, 16);

      setFormData({
        title: task.title || '',
        description: task.description || '',
        task_type_id: task.task_type_id || '',
        deal_id: task.deal_id || '',
        assigned_to: task.assigned_to || '',
        due_date: formattedDate,
        priority: task.priority || 'Normal',
        status: task.status || 'Pendente',
        lead_id: task.lead_id || null,
        contact_id: task.contact_id || null,
      });
      loadData();
    }
  }, [isOpen, task]);

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
      const updateData: any = { ...formData };
      
      if (formData.status === 'Concluída' && task.status !== 'Concluída') {
        updateData.completed_at = new Date().toISOString();
      } else if (formData.status !== 'Concluída') {
        updateData.completed_at = null;
      }

      await crmService.updateTask(task.id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      alert('Erro ao atualizar tarefa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = () => {
    if (profile?.access_level === 'Administrador' || profile?.access_level === 'Gerente') return true;
    return task?.assigned_to === profile?.id;
  };

  if (!isOpen || !task) return null;

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
                <span className="material-symbols-outlined text-2xl">edit_note</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Editar Tarefa</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Atualize os detalhes da atividade.</p>
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
          <form id="edit-task-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="space-y-4">
              {!canEdit() && (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">lock</span>
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    Você está visualizando esta tarefa em modo de leitura pois ela não está atribuída a você.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  disabled={!canEdit()}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white disabled:opacity-70"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Status</label>
                  <select
                    disabled={!canEdit()}
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white disabled:opacity-70"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Prioridade</label>
                  <select
                    disabled={!canEdit()}
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white disabled:opacity-70"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Tipo de Tarefa *</label>
                  <select
                    required
                    disabled={!canEdit()}
                    value={formData.task_type_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, task_type_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white disabled:opacity-70"
                  >
                    {taskTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Data de Entrega *</label>
                  <input
                    type="datetime-local"
                    required
                    disabled={!canEdit()}
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Negociação (Deal)</label>
                <select
                  disabled={!canEdit()}
                  value={formData.deal_id}
                  onChange={handleDealChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all dark:text-white disabled:opacity-70"
                >
                  <option value="">Sem negociação vinculada</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.client?.company_name || d.lead?.company_name || 'Sem empresa'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Descrição / Notas</label>
                <textarea
                  disabled={!canEdit()}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 outline-none transition-all resize-none dark:text-white disabled:opacity-70"
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
              Fechar
            </button>
            {canEdit() && (
              <button
                form="edit-task-form"
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
                    Salvar Alterações
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditTaskModal;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface TrainingCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

const CATEGORIES = ['Segurança', 'Operação', 'Gestão', 'Qualidade', 'Técnico', 'Outros'];

const TrainingCatalogModal: React.FC<TrainingCatalogModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Segurança',
    description: '',
    workload_hours: '',
    validity_days: '',
    alert_days_before: 30,
    mandatory: false,
    active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          category: initialData.category || 'Segurança',
          description: initialData.description || '',
          workload_hours: initialData.workload_hours?.toString() || '',
          validity_days: initialData.validity_days?.toString() || '',
          alert_days_before: initialData.alert_days_before ?? 30,
          mandatory: !!initialData.mandatory,
          active: initialData.active ?? true,
        });
      } else {
        setFormData({
          name: '', category: 'Segurança', description: '', workload_hours: '',
          validity_days: '', alert_days_before: 30, mandatory: false, active: true
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        workload_hours: formData.workload_hours ? Number(formData.workload_hours) : null,
        validity_days: formData.validity_days ? Number(formData.validity_days) : null,
        alert_days_before: formData.alert_days_before,
        mandatory: formData.mandatory,
        active: formData.active
      };
      if (initialData?.id) {
        await api.put(`/hr/trainings/catalog/${initialData.id}`, payload);
      } else {
        await api.post('/hr/trainings/catalog', payload);
      }
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '', category: 'Segurança', description: '', workload_hours: '',
        validity_days: '', alert_days_before: 30, mandatory: false, active: true
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Erro ao salvar no catálogo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? 'Editar Treinamento' : 'Novo Treinamento'}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{initialData ? 'Altere as informações do treinamento no catálogo.' : 'Adicione um novo item ao catálogo de cursos.'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome do Treinamento</label>
              <input
                type="text"
                placeholder="Ex: NR-11 Operação de Empilhadeiras"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium appearance-none dark:text-white"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Carga Horária (h)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Ex: 8.0"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.workload_hours}
                  onChange={e => setFormData({ ...formData, workload_hours: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descrição e Objetivos</label>
              <textarea
                rows={2}
                placeholder="O que o colaborador aprenderá neste treinamento..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium resize-none dark:text-white"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Validade (Dias)</label>
                <input
                  type="number"
                  placeholder="0 = Sem validade"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.validity_days}
                  onChange={e => setFormData({ ...formData, validity_days: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Alerta (Dias antes)</label>
                <input
                  type="number"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.alert_days_before}
                  onChange={e => setFormData({ ...formData, alert_days_before: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div 
              onClick={() => setFormData({ ...formData, mandatory: !formData.mandatory })}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                formData.mandatory ? 'border-mustard-500 bg-mustard-50 dark:bg-mustard-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${formData.mandatory ? 'text-mustard-600' : 'text-slate-300'}`}>
                  priority_high
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Treinamento Obrigatório</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500">Exigido para conformidade geral</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${formData.mandatory ? 'bg-mustard-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.mandatory ? 'left-6' : 'left-1'}`} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
            {errorMsg ? (
              <p className="text-red-500 text-xs font-bold">{errorMsg}</p>
            ) : <div />}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-mustard-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.name || isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar no Catálogo'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrainingCatalogModal;

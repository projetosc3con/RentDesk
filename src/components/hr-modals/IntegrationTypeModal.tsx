import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface IntegrationTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

const IntegrationTypeModal: React.FC<IntegrationTypeModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    validity_days: 365 as number | null,
    alert_days_before: 15,
    active: true,
  });

  const [hasValidity, setHasValidity] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          validity_days: initialData.validity_days,
          alert_days_before: initialData.alert_days_before ?? 15,
          active: initialData.active ?? true,
        });
        setHasValidity(initialData.validity_days !== null && initialData.validity_days > 0);
      } else {
        setFormData({
          name: '', description: '', validity_days: 365, alert_days_before: 15, active: true
        });
        setHasValidity(true);
      }
      setErrorMsg('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        validity_days: hasValidity ? (formData.validity_days ? Number(formData.validity_days) : null) : null,
        alert_days_before: formData.alert_days_before,
        active: formData.active
      };
      
      if (initialData?.id) {
        await api.put(`/hr/integrations/types/${initialData.id}`, payload);
      } else {
        await api.post('/hr/integrations/types', payload);
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Erro ao salvar tipo de integração');
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
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? 'Editar Tipo de Integração' : 'Novo Tipo de Integração'}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{initialData ? 'Edite os requisitos deste tipo.' : 'Defina os requisitos base para este tipo.'}</p>
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
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome da Integração</label>
              <input
                type="text"
                placeholder="Ex: Integração SST, NR-35 Trabalho em Altura"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descrição e Requisitos</label>
              <textarea
                rows={3}
                placeholder="Descreva as instruções e pré-requisitos..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium resize-none dark:text-white"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div 
                onClick={() => setHasValidity(!hasValidity)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  hasValidity ? 'border-mustard-500 bg-mustard-50 dark:bg-mustard-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${hasValidity ? 'text-mustard-600' : 'text-slate-300'}`}>
                    update
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Possui Validade Padrão</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500">Define o prazo de renovação</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${hasValidity ? 'bg-mustard-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hasValidity ? 'left-6' : 'left-1'}`} />
                </div>
              </div>

              <AnimatePresence>
                {hasValidity && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-4 overflow-hidden px-1"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Validade (Dias)</label>
                      <input
                        type="number"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                        value={formData.validity_days}
                        onChange={e => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 0 })}
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
                  </motion.div>
                )}
              </AnimatePresence>
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
                {isSubmitting ? 'Salvando...' : 'Salvar Tipo de Integração'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IntegrationTypeModal;

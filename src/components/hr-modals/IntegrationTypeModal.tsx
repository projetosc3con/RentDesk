import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntegrationTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IntegrationTypeModal: React.FC<IntegrationTypeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    validity_days: 365,
    alert_days_before: 15,
    active: true,
  });

  const [hasValidity, setHasValidity] = useState(true);

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
          className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Novo Tipo de Integração</h2>
                <p className="text-sm text-slate-500">Defina os requisitos base para este tipo de integração.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Integração</label>
              <input
                type="text"
                placeholder="Ex: Integração SST, NR-35 Trabalho em Altura"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição e Requisitos</label>
              <textarea
                rows={3}
                placeholder="Descreva as instruções e pré-requisitos..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div 
                onClick={() => setHasValidity(!hasValidity)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  hasValidity ? 'border-emerald-900 bg-emerald-50' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${hasValidity ? 'text-emerald-900' : 'text-slate-300'}`}>
                    update
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Possui Validade Padrão</p>
                    <p className="text-[10px] text-slate-500">Define o prazo de renovação</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${hasValidity ? 'bg-emerald-900' : 'bg-slate-200'}`}>
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
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Validade (Dias)</label>
                      <input
                        type="number"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium"
                        value={formData.validity_days}
                        onChange={e => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Alerta (Dias antes)</label>
                      <input
                        type="number"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium"
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
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              className="px-8 py-3 bg-emerald-900 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.name}
            >
              Salvar Tipo de Integração
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IntegrationTypeModal;

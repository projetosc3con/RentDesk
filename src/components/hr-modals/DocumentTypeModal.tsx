import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentTypeModal: React.FC<DocumentTypeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requires_expiry: false,
    alert_days_before: 30,
    mandatory: true,
    active: true,
  });

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
          className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Tipo</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configuração de categoria de documento.</p>
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
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome do Documento</label>
              <input
                type="text"
                placeholder="Ex: CNH, ASO, Certificado NR35"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descrição / Instruções</label>
              <textarea
                rows={2}
                placeholder="Para que serve e instruções de envio..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium resize-none dark:text-white"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setFormData({ ...formData, requires_expiry: !formData.requires_expiry })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.requires_expiry ? 'border-mustard-500 bg-mustard-50 dark:bg-mustard-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`material-symbols-outlined ${formData.requires_expiry ? 'text-mustard-600' : 'text-slate-300'}`}>
                    event_repeat
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${formData.requires_expiry ? 'bg-mustard-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.requires_expiry ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Possui Validade</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Controle de vencimento</p>
              </div>

              <div 
                onClick={() => setFormData({ ...formData, mandatory: !formData.mandatory })}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.mandatory ? 'border-mustard-500 bg-mustard-50 dark:bg-mustard-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`material-symbols-outlined ${formData.mandatory ? 'text-mustard-600' : 'text-slate-300'}`}>
                    priority_high
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${formData.mandatory ? 'bg-mustard-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.mandatory ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Obrigatório</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Exigido para todos</p>
              </div>
            </div>

            {/* Alert Days (Conditional) */}
            <AnimatePresence>
              {formData.requires_expiry && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Alerta de Vencimento (Dias antes)</label>
                  <input
                    type="number"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                    value={formData.alert_days_before}
                    onChange={e => setFormData({ ...formData, alert_days_before: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic ml-1">Dica: O sistema avisará os gestores {formData.alert_days_before} dias antes da expiração.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              className="px-8 py-3 bg-mustard-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.name}
            >
              Salvar Categoria
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocumentTypeModal;

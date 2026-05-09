import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { crmService, type CRMLead } from '../../services/crm';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: any) => void;
  lead: CRMLead | null;
}

const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({ isOpen, onClose, onSuccess, lead }) => {
  const [loading, setLoading] = useState(false);

  if (!lead) return null;

  const handleConvert = async () => {
    setLoading(true);
    try {
      const result = await crmService.convertLead(lead.id);
      onSuccess(result.client);
      onClose();
    } catch (err) {
      console.error('Erro ao converter lead:', err);
      alert('Erro ao converter lead. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Converter Lead</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Migrar para Clientes</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                Você está prestes a converter o lead <strong className="text-slate-900 dark:text-white">{lead.company_name}</strong> em um cliente da base.
              </p>
              
              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside">
                <li>O lead será marcado como <strong>Convertido</strong> no CRM.</li>
                <li>Um novo cadastro de cliente será criado.</li>
                <li>Os contatos deste lead serão migrados para o novo cliente.</li>
                <li>O sistema buscará os dados atualizados do CNPJ ({lead.cnpj || 'Não informado'}) na Receita Federal.</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConvert}
                disabled={loading}
                className="flex-[2] py-4 bg-green-500 hover:bg-green-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Confirmar Conversão
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConvertLeadModal;

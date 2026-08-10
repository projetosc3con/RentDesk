import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { financeiroService } from '../../services/financeiro';
import { getApiErrorMessage } from '../../utils/apiError';
import SearchableSelect from '../SearchableSelect';
import type { Bill, BankStatementMatchResult, StatementItem } from '../../types';

interface VincularLancamentoModalProps {
  isOpen: boolean;
  line: BankStatementMatchResult | null;
  onClose: () => void;
  onLinked: (bill: Bill) => void;
}

const VincularLancamentoModal: React.FC<VincularLancamentoModalProps> = ({ isOpen, line, onClose, onLinked }) => {
  const [candidates, setCandidates] = useState<StatementItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !line) return;
    setSelectedId('');
    setError(null);
    setLoadingCandidates(true);
    financeiroService.listarLancamentosNaoConciliados(line.type)
      .then(setCandidates)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoadingCandidates(false));
  }, [isOpen, line]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (!line || !selectedId) return;
    setSubmitting(true);
    setError(null);
    try {
      const bill = await financeiroService.vincularLancamentoExtrato(selectedId, {
        bank_date: line.bank_date,
        value: line.value,
        dc_indicator: line.dc_indicator,
        type: line.type,
        description: line.description,
        document_number: line.document_number,
        raw: line.raw,
      });
      onLinked(bill);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && line && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-mustard-100 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-500">
                <span className="material-symbols-outlined text-2xl">link</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Vincular a Lançamento Existente</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm">
                <p className="text-slate-500 dark:text-slate-400">Linha do extrato</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {new Date(line.bank_date).toLocaleDateString('pt-BR')} — {line.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({line.dc_indicator})
                </p>
                {line.description && <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{line.description}</p>}
              </div>

              <SearchableSelect
                label="Lançamento"
                placeholder={loadingCandidates ? 'Carregando...' : 'Selecione um lançamento não conciliado'}
                items={candidates}
                selectedId={selectedId}
                onSelect={setSelectedId}
                getDisplayValue={(c) => c.counterparty_name || c.client_name || c.description || c.invoice_number || '—'}
                getSearchValue={(c) => `${c.counterparty_name ?? ''} ${c.client_name ?? ''} ${c.description ?? ''} ${c.invoice_number ?? ''}`}
                disabled={loadingCandidates}
              />

              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl p-3 text-xs font-medium">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                disabled={submitting}
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={submitting || !selectedId}
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl bg-mustard-500 hover:bg-mustard-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-mustard-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Vincular'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VincularLancamentoModal;

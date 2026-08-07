import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { financeiroService } from '../../services/financeiro';
import { getApiErrorMessage } from '../../utils/apiError';
import type { Bill, BillType } from '../../types';

interface LancamentoManualModalInitialValues {
  counterparty_name?: string;
  description?: string;
  gross_value?: number;
  due_date?: string;
}

// Quando presente, indica que este lançamento está sendo criado a partir de
// uma linha do extrato bancário já conciliada (ver ConciliacaoTab) — o
// lançamento nasce já marcado como conciliado com o banco.
interface LancamentoManualModalPresetSettlement {
  settled_date: string;
  bank_transaction_date: string;
  bank_raw_snapshot: Record<string, unknown>;
}

interface LancamentoManualModalProps {
  isOpen: boolean;
  type: BillType;
  onClose: () => void;
  onCreated: (bill: Bill) => void;
  initialValues?: LancamentoManualModalInitialValues;
  presetSettlement?: LancamentoManualModalPresetSettlement;
}

const LancamentoManualModal: React.FC<LancamentoManualModalProps> = ({ isOpen, type, onClose, onCreated, initialValues, presetSettlement }) => {
  const [counterpartyName, setCounterpartyName] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [grossValue, setGrossValue] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [alreadySettled, setAlreadySettled] = useState(false);
  const [settledDate, setSettledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !initialValues) return;
    if (initialValues.counterparty_name !== undefined) setCounterpartyName(initialValues.counterparty_name);
    if (initialValues.description !== undefined) setDescription(initialValues.description);
    if (initialValues.gross_value !== undefined) setGrossValue(initialValues.gross_value);
    if (initialValues.due_date !== undefined) setDueDate(initialValues.due_date);
    if (presetSettlement) {
      setAlreadySettled(true);
      setSettledDate(presetSettlement.settled_date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isReceivable = type === 'receivable';
  const title = isReceivable ? 'Lançar Conta a Receber' : 'Lançar Conta a Pagar';
  const icon = isReceivable ? 'trending_up' : 'trending_down';

  const resetForm = () => {
    setCounterpartyName('');
    setDescription('');
    setBarcode('');
    setGrossValue(0);
    setDueDate('');
    setAlreadySettled(false);
    setSettledDate('');
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const handleGrossValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setGrossValue(Number(rawValue) / 100);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!grossValue || grossValue <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if (!dueDate) {
      setError('Informe a data de vencimento.');
      return;
    }
    if (alreadySettled && !settledDate) {
      setError(`Informe a data em que foi ${isReceivable ? 'recebido' : 'pago'}.`);
      return;
    }

    setSubmitting(true);
    try {
      const bill = await financeiroService.criarLancamentoManual({
        type,
        counterparty_name: counterpartyName.trim() || undefined,
        description: description.trim() || undefined,
        barcode: isReceivable ? undefined : barcode.trim() || undefined,
        gross_value: grossValue,
        due_date: dueDate,
        already_settled: alreadySettled,
        settled_date: alreadySettled ? settledDate : undefined,
        bank_transaction_date: presetSettlement?.bank_transaction_date,
        bank_raw_snapshot: presetSettlement?.bank_raw_snapshot,
      });
      onCreated(bill);
      resetForm();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
            </div>

            <div className="space-y-4">
              {isReceivable ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nome</label>
                  <input
                    type="text"
                    value={counterpartyName}
                    onChange={(e) => setCounterpartyName(e.target.value)}
                    placeholder="Nome de quem vai pagar (opcional)"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalhes adicionais (opcional)"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Código de Barras</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Código de barras ou código do boleto"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Fornecedor</label>
                    <input
                      type="text"
                      value={counterpartyName}
                      onChange={(e) => setCounterpartyName(e.target.value)}
                      placeholder="Nome do fornecedor (opcional)"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Valor *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-bold">R$</span>
                  <input
                    type="text"
                    value={grossValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    onChange={handleGrossValueChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Vencimento *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              {isReceivable && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais (opcional)"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm resize-none"
                  />
                </div>
              )}

              {isReceivable && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={alreadySettled}
                    onChange={(e) => setAlreadySettled(e.target.checked)}
                    className="w-4 h-4 rounded accent-mustard-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Já foi recebido?
                  </span>
                </label>
              )}

              {isReceivable && alreadySettled && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                    Data que foi recebido *
                  </label>
                  <input
                    type="date"
                    value={settledDate}
                    onChange={(e) => setSettledDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              )}

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
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-mustard-500 hover:bg-mustard-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-mustard-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LancamentoManualModal;

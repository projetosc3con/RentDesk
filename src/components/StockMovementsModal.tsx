import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { formatDate } from '../utils/date';
import type { StockMovement } from '../types';

interface StockMovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partId?: string;
  partName?: string;
  partCode?: string;
}

type MovementTypeFilter = 'TODOS' | 'ENTRADA' | 'SAIDA' | 'AJUSTE';

const StockMovementsModal: React.FC<StockMovementsModalProps> = ({
  isOpen,
  onClose,
  partId,
  partName,
  partCode,
}) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementTypeFilter>('TODOS');

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/parts/movements?limit=100';
      if (partId) {
        url += `&part_id=${encodeURIComponent(partId)}`;
      }

      const { data } = await api.get(url);
      setMovements(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar movimentações de estoque:', err);
      setError(err.response?.data?.error || 'Não foi possível carregar as movimentações.');
    } finally {
      setLoading(false);
    }
  }, [partId]);

  useEffect(() => {
    if (isOpen) {
      fetchMovements();
    }
  }, [isOpen, fetchMovements]);

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      // Type filter
      if (typeFilter !== 'TODOS' && m.movement_type !== typeFilter) {
        return false;
      }

      // Search term
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const desc = (m.part?.description || '').toLowerCase();
        const code = (m.part?.internal_code || '').toLowerCase();
        const refLabel = (m.reference_label || '').toLowerCase();
        const creatorName = (m.creator?.full_name || '').toLowerCase();
        const notes = (m.notes || '').toLowerCase();

        return (
          desc.includes(q) ||
          code.includes(q) ||
          refLabel.includes(q) ||
          creatorName.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [movements, typeFilter, search]);

  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;

    movements.forEach(m => {
      if (m.movement_type === 'ENTRADA') totalIn += Number(m.quantity) || 0;
      else if (m.movement_type === 'SAIDA') totalOut += Number(m.quantity) || 0;
    });

    return {
      totalCount: movements.length,
      totalIn,
      totalOut,
    };
  }, [movements]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-mustard-500/10 text-mustard-600 dark:text-mustard-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">history</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Movimentações de Materiais
                {partCode && (
                  <span className="text-xs uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-mustard-100 dark:bg-mustard-500/20 text-mustard-800 dark:text-mustard-400">
                    {partCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {partName
                  ? `Histórico de entradas e saídas do item "${partName}"`
                  : 'Rastreabilidade de entradas por NF-e, saídas para Ordens de Serviço e ajustes.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchMovements}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Atualizar movimentações"
            >
              <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* KPIs bar */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50/70 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
              Total de Movimentações
            </span>
            <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">
              {stats.totalCount}
            </span>
          </div>
          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-500">
              Entradas Totais (NF-e)
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              +{stats.totalIn}
            </span>
          </div>
          <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="block text-[10px] font-black uppercase tracking-widest text-red-500">
              Saídas Totais (OS)
            </span>
            <span className="text-lg font-black text-red-600 dark:text-red-400 mt-0.5 block">
              -{stats.totalOut}
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-6 pb-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por descrição, código, NF ou OS..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all"
              />
            </div>

            {/* Type Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
              {(['TODOS', 'ENTRADA', 'SAIDA', 'AJUSTE'] as MovementTypeFilter[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                    typeFilter === type
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {type === 'TODOS'
                    ? 'Todos'
                    : type === 'ENTRADA'
                    ? 'Entradas (NF-e)'
                    : type === 'SAIDA'
                    ? 'Saídas (OS)'
                    : 'Ajustes'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body / Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-medium mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-mustard-500/20 border-t-mustard-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium mt-3">Carregando movimentações...</p>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-2">
                history_toggle_off
              </span>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Nenhuma movimentação encontrada
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                As movimentações são registradas automaticamente ao importar NF-e ou ao consumir materiais em Ordens de Serviço.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3">Data / Hora</th>
                      <th className="px-4 py-3">Tipo</th>
                      {!partId && <th className="px-4 py-3">Material</th>}
                      <th className="px-4 py-3 text-right">Qtd</th>
                      <th className="px-4 py-3 text-center">Saldo</th>
                      <th className="px-4 py-3">Referência / Origem</th>
                      <th className="px-4 py-3">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredMovements.map(m => {
                      const isEntry = m.movement_type === 'ENTRADA';
                      const isExit = m.movement_type === 'SAIDA';
                      const unit = m.part?.unit || 'UN';

                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Data / Hora */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                            <div>{formatDate(m.created_at)}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(m.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </div>
                          </td>

                          {/* Tipo */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                isEntry
                                  ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                  : isExit
                                  ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                                  : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {isEntry ? 'arrow_downward' : isExit ? 'arrow_upward' : 'tune'}
                              </span>
                              {m.movement_type}
                            </span>
                          </td>

                          {/* Material (se não estiver filtrando por um material específico) */}
                          {!partId && (
                            <td className="px-4 py-3.5 max-w-xs">
                              <div className="font-bold text-slate-900 dark:text-white truncate" title={m.part?.description}>
                                {m.part?.description || 'Material'}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {m.part?.internal_code || 'S/C'}
                              </div>
                            </td>
                          )}

                          {/* Qtd */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <span
                              className={`font-black ${
                                isEntry
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isExit
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {isEntry ? `+${m.quantity}` : isExit ? `-${m.quantity}` : `${m.quantity}`}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
                            </span>
                          </td>

                          {/* Saldo */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap font-mono text-[11px]">
                            <span className="text-slate-400">{m.previous_stock}</span>
                            <span className="mx-1 text-slate-300 dark:text-slate-600">→</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {m.new_stock}
                            </span>
                          </td>

                          {/* Origem / Referência */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {m.reference_type === 'NFE_IMPORT' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-black font-mono">
                                  <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                                  {m.reference_label || 'NF-e'}
                                </span>
                              ) : m.reference_type === 'SERVICE_ORDER' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[10px] font-black font-mono">
                                  <span className="material-symbols-outlined text-[12px]">build</span>
                                  {m.reference_label || 'OS'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                  {m.reference_label || 'Ajuste'}
                                </span>
                              )}
                            </div>
                            {m.notes && (
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs" title={m.notes}>
                                {m.notes}
                              </p>
                            )}
                          </td>

                          {/* Responsável */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-slate-400 text-sm">
                                person
                              </span>
                              <span className="truncate max-w-[120px]" title={m.creator?.full_name || m.created_by || 'Sistema'}>
                                {m.creator?.full_name || 'Sistema / Auto'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-medium">
            Exibindo {filteredMovements.length} de {movements.length} registro(s)
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StockMovementsModal;

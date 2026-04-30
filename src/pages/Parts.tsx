import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import type { Part } from '../types';

const Parts: React.FC = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/parts');
        setParts(data);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao buscar peças:', err);
        setError('Não foi possível carregar o estoque de peças.');
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, []);

  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        const match = (p.description || '').toLowerCase().includes(q)
          || (p.internal_code || '').toLowerCase().includes(q)
          || (p.part_number || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [parts, search]);

  const totalQuantity = useMemo(() => {
    return filteredParts.reduce((acc, part) => acc + (part.quantity || 0), 0);
  }, [filteredParts]);

  const clearFilters = () => {
    setSearch('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Estoque de Peças</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Gerencie o estoque de peças e suprimentos para manutenção.</p>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/pecas/novo')}
            className="bg-mustard-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-mustard-600 active:scale-[0.98] transition-all shadow-lg shadow-mustard-500/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Nova Peça</span>
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Buscar por descrição, código ou PN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 w-full md:w-auto">
          <div className="w-8 h-8 rounded-full bg-mustard-100 dark:bg-mustard-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-mustard-600 dark:text-mustard-400 text-[18px]">inventory</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Total na Busca</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-300 leading-none">{totalQuantity} un</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4"
          >
            <div className="w-12 h-12 border-4 border-mustard-500/10 border-t-mustard-500 rounded-full animate-spin" />
            <p className="font-bold text-xs uppercase tracking-widest">Carregando estoque...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-6 rounded-2xl text-center font-medium flex flex-col items-center gap-2 border border-red-100 dark:border-red-500/20"
          >
            <span className="material-symbols-outlined text-4xl">error</span>
            {error}
          </motion.div>
        ) : filteredParts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed"
          >
            <span className="material-symbols-outlined text-6xl mb-4 text-slate-300 dark:text-slate-800">inventory_2</span>
            <p className="font-bold text-lg text-slate-600 dark:text-slate-300">Nenhuma peça encontrada</p>
            <p className="text-sm mt-1 dark:text-slate-500 font-medium">Ajuste os filtros ou cadastre uma nova peça.</p>
            {search && (
              <button onClick={clearFilters} className="mt-4 text-mustard-600 dark:text-mustard-400 font-bold hover:underline">
                Limpar Busca
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Código</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Descrição</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Part Number</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Qtd</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Valor Un.</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredParts.map((part) => (
                      <tr key={part.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[11px] font-mono">{part.internal_code}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white group-hover:text-mustard-600 dark:group-hover:text-mustard-400 transition-colors">
                          {part.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{part.part_number || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold ${part.quantity > 0 ? 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-700 dark:text-mustard-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                            {part.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right">
                          {part.unit_value ? `R$ ${part.unit_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedPart(part)}
                              className="p-2 text-slate-400 hover:text-mustard-600 dark:hover:text-mustard-400 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 rounded-lg transition-all"
                              title="Ver Detalhes"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPart(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{selectedPart.internal_code}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedPart.quantity > 0 ? 'bg-mustard-100 dark:bg-mustard-500/20 text-mustard-800 dark:text-mustard-400' : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'}`}>
                        {selectedPart.quantity > 0 ? 'Em Estoque' : 'Sem Estoque'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedPart.description}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedPart(null)}
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Part Number</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedPart.part_number || '-'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Quantidade</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedPart.quantity} un</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Valor Unitário</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {selectedPart.unit_value ? `R$ ${selectedPart.unit_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2 md:col-span-3">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Valor Total em Estoque</span>
                    <span className="text-lg font-black text-mustard-600 dark:text-mustard-500">
                      {selectedPart.total_value ? `R$ ${selectedPart.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Notas/Observações */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">notes</span>
                    Observações
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-slate-300 dark:border-slate-700">
                    {selectedPart.notes || 'Nenhuma observação cadastrada para esta peça.'}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedPart(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Fechar
                </button>
                <button className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-mustard-500 hover:bg-mustard-600 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-mustard-500/20">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Editar Peça
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Parts;

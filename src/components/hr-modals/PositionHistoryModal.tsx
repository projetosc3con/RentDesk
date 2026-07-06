import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../services/api';

interface PositionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PositionHistoryModal: React.FC<PositionHistoryModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [period, setPeriod] = React.useState('Todos os períodos');
  const [typeFilter, setTypeFilter] = React.useState('Todos os tipos');

  React.useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const res = await api.get('/hr/position-history');
          setHistory(res.data);
        } catch (error) {
          console.error('Failed to fetch history', error);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen]);

  const filteredHistory = history.filter(item => {
    // Search text match
    if (search && !item.employee.toLowerCase().includes(search.toLowerCase())) return false;

    // Type match
    if (typeFilter !== 'Todos os tipos' && item.type !== typeFilter) return false;

    // Period match
    if (period !== 'Todos os períodos') {
      const itemDate = new Date(item.date);
      const now = new Date();
      if (period === 'Últimos 30 dias') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (itemDate < thirtyDaysAgo) return false;
      } else if (period === 'Últimos 6 meses') {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        if (itemDate < sixMonthsAgo) return false;
      } else if (period === 'Este ano') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        if (itemDate < startOfYear) return false;
      }
    }
    
    return true;
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
          className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Histórico de Alterações</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Consulta de movimentações de cargos e salários.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="p-4 bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Período</label>
              <select 
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-mustard-500 transition-all appearance-none dark:text-white"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option>Todos os períodos</option>
                <option>Últimos 30 dias</option>
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tipo</label>
              <select 
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-mustard-500 transition-all appearance-none dark:text-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option>Todos os tipos</option>
                <option>Nova Atribuição</option>
                <option>Promoção</option>
                <option>Ajuste Salarial</option>
                <option>Transferência</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pesquisa Rápida</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-sm">search</span>
                <input 
                  type="text" 
                  placeholder="Nome do colaborador..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-mustard-500 transition-all dark:text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Colaborador</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cargo Anterior</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Transição</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Novo Cargo</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-8 text-center text-sm text-slate-500">
                      Carregando histórico...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-8 text-center text-sm text-slate-500">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-500">
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-3 text-sm font-black text-slate-900 dark:text-white">{item.employee}</td>
                    <td className="px-6 py-3 text-xs text-slate-500 dark:text-slate-400 font-medium">{item.oldPos}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="material-symbols-outlined text-mustard-500/40 text-sm">trending_flat</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-black text-mustard-600 dark:text-mustard-400 px-3 py-1 bg-mustard-50 dark:bg-mustard-500/10 border border-mustard-100 dark:border-mustard-500/20 rounded-full">
                        {item.newPos}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase rounded tracking-tighter">
                        {item.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">Mostrando {filteredHistory.length} registros encontrados.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              Fechar Consulta
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PositionHistoryModal;

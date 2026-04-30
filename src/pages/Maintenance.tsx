import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import type { ServiceOrder } from '../types';

const Maintenance: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/service-orders');
        setOrders(data);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao buscar manutenções:', err);
        setError('Não foi possível carregar as ordens de serviço. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(os => {
      if (search) {
        const q = search.toLowerCase();
        const match = (os.os_number?.toString() || '').includes(q)
          || (os.equipment_asset_number || '').toLowerCase().includes(q)
          || (os.equipment_name || '').toLowerCase().includes(q)
          || (os.description || '').toLowerCase().includes(q)
          || (os.status || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [orders, search]);

  const clearFilters = () => {
    setSearch('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberta':
        return 'bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'Em Andamento':
        return 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'Aguardando Peças':
        return 'bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-500/20';
      case 'Concluída':
        return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'Cancelada':
        return 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manutenções</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Acompanhe e gerencie as ordens de serviço de equipamentos.</p>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/manutencoes/nova')}
            className="bg-mustard-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-mustard-600 active:scale-[0.98] transition-all shadow-lg shadow-mustard-500/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Nova OS</span>
          </button>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

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
              placeholder="Buscar por OS, equipamento ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            {search && (
              <button onClick={clearFilters} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 w-full md:w-auto transition-colors">
          <div className="w-8 h-8 rounded-full bg-mustard-100 dark:bg-mustard-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-mustard-600 dark:text-mustard-400 text-[18px]">build</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Ordens Encontradas</span>
            <span className="text-sm font-black text-slate-700 dark:text-slate-300 leading-none">{filteredOrders.length}</span>
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
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-10 h-10 border-4 border-mustard-500/10 border-t-mustard-500 rounded-full animate-spin" />
            <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Carregando ordens de serviço...</p>
          </motion.div>
        ) : filteredOrders.length > 0 ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider transition-colors">
                  <tr>
                    <th className="px-6 py-4">OS</th>
                    <th className="px-6 py-4">Equipamento</th>
                    <th className="px-6 py-4">Data/Local</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Problema Relatado</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((os) => (
                    <tr key={os.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 dark:text-white">#{os.os_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{os.equipment_name || 'Desconhecido'}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-500">Frota: {os.equipment_asset_number || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {os.execution_date ? new Date(os.execution_date).toLocaleDateString('pt-BR') : '-'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-500">{os.execution_location || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-colors ${getStatusColor(os.status)}`}>
                          {os.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate dark:text-slate-400" title={os.description}>
                        {os.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/manutencoes/editar/${os.id}`)}
                            className="p-1.5 text-slate-400 hover:text-mustard-600 dark:hover:text-mustard-400 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 rounded transition-colors"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors"
          >
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-3xl">build</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhuma ordem encontrada</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm font-medium">
              {search
                ? 'Sua busca não retornou resultados. Tente limpar os filtros.'
                : 'Não há manutenções cadastradas. Clique em "Nova OS" para criar.'}
            </p>
            {search && (
              <button
                onClick={clearFilters}
                className="mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Limpar Busca
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Maintenance;

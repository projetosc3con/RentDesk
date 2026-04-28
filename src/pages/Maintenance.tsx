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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Em Andamento':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Aguardando Peças':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Concluída':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manutenções</h1>
          <p className="text-slate-500 mt-1">Acompanhe e gerencie as ordens de serviço de equipamentos.</p>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/manutencoes/nova')}
            className="bg-emerald-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-md shadow-emerald-900/20"
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
          className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex items-center gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Buscar por OS, equipamento ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 transition-all text-sm"
            />
            {search && (
              <button onClick={clearFilters} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 w-full md:w-auto">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-emerald-700 text-[18px]">build</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Ordens Encontradas</span>
            <span className="text-sm font-black text-slate-700 leading-none">{filteredOrders.length}</span>
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
            <div className="w-10 h-10 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin" />
            <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">Carregando ordens de serviço...</p>
          </motion.div>
        ) : filteredOrders.length > 0 ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">OS</th>
                    <th className="px-6 py-4">Equipamento</th>
                    <th className="px-6 py-4">Data/Local</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Problema Relatado</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((os) => (
                    <tr key={os.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">#{os.os_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{os.equipment_name || 'Desconhecido'}</span>
                          <span className="text-xs text-slate-500">Frota: {os.equipment_asset_number || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">
                            {os.execution_date ? new Date(os.execution_date).toLocaleDateString('pt-BR') : '-'}
                          </span>
                          <span className="text-xs text-slate-500">{os.execution_location || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(os.status)}`}>
                          {os.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate" title={os.description}>
                        {os.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/manutencoes/editar/${os.id}`)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
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
            className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-400 text-3xl">build</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhuma ordem encontrada</h3>
            <p className="text-slate-500 mt-1 max-w-sm">
              {search
                ? 'Sua busca não retornou resultados. Tente limpar os filtros.'
                : 'Não há manutenções cadastradas. Clique em "Nova OS" para criar.'}
            </p>
            {search && (
              <button
                onClick={clearFilters}
                className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors"
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

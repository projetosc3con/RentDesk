import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import type { RentalInvoice } from '../types';

const Rentals: React.FC = () => {
  const [rentals, setRentals] = useState<RentalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/rentals');
        setRentals(data);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao buscar locações:', err);
        setError('Não foi possível carregar a lista de locações.');
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Locações</h1>
          <p className="text-slate-500 mt-1">Acompanhe contratos, faturamentos e períodos de locação.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-emerald-900 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-emerald-800 transition-all font-bold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nova Locação
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Locações Ativas', value: rentals.filter(r => r.billing_status !== 'Cancelada').length.toString(), color: 'bg-emerald-100 text-emerald-800', icon: 'sync' },
          { label: 'Aguardando Faturamento', value: '12', color: 'bg-amber-100 text-amber-800', icon: 'pending_actions' },
          { label: 'Total do Mês', value: 'R$ 185.000', color: 'bg-blue-100 text-blue-800', icon: 'payments' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 text-sm bg-white transition-all"
              placeholder="Buscar por cliente, equipamento ou contrato..."
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros
            </button>
            <button className="px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Exportar
            </button>
          </div>
        </div>

        {/* Rentals Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[11px] uppercase font-bold tracking-widest border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4">Cliente / Obra</th>
                <th className="px-6 py-4">Equipamento</th>
                <th className="px-6 py-4 whitespace-nowrap">Período</th>
                <th className="px-6 py-4 text-right">Valor Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.tr
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-sm font-medium mt-4">Carregando locações...</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : error ? (
                  <motion.tr
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500 font-medium">
                      {error}
                    </td>
                  </motion.tr>
                ) : rentals.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      Nenhuma locação encontrada.
                    </td>
                  </motion.tr>
                ) : (
                  rentals.map((rental, index) => (
                    <motion.tr
                      key={rental.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="hover:bg-slate-50/80 transition-colors text-sm"
                    >
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          {rental.client_name}
                        </div>
                        {rental.invoice_number && <span className="px-2 py-0.5 mb-1 bg-slate-100 text-slate-500 rounded text-[10px] font-mono border border-slate-200 shrink-0">{rental.invoice_number}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{rental.equipment_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{rental.asset_number}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap min-w-[180px]">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">date_range</span>
                          {rental.billing_period_start ? new Date(rental.billing_period_start).toLocaleDateString() : 'N/A'} - {rental.billing_period_end ? new Date(rental.billing_period_end).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-900">
                        {Number(rental.total_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${rental.billing_status === 'Faturado'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {rental.billing_status === 'Faturado' ? 'check_circle' : 'schedule'}
                          </span>
                          {rental.billing_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-emerald-900 hover:bg-emerald-50 rounded-md transition-all">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Mock */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/20 flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>Mostrando {rentals.length} locações</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed">Anterior</button>
            <button className="px-2 py-1 rounded border border-emerald-900 bg-emerald-900 text-white font-bold">1</button>
            <button className="px-2 py-1 rounded border border-slate-200 bg-white hover:border-slate-300 transition-colors">2</button>
            <button className="px-2 py-1 rounded border border-slate-200 bg-white hover:border-slate-300 transition-colors">Próximo</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Rentals;

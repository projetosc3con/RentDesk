import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

interface DashboardData {
  kpis: {
    currentMonthTotal: number;
    prevMonthTotal: number;
    variation: number;
    pendingReconciliationCount: number;
    rentedEquipmentCount: number;
    serviceOrderCount: number;
  };
  revenueByMonth: { month: string; label: string; total: number }[];
  fleetStatus: {
    disponivel: number;
    locado: number;
    manutencao: number;
    inativo: number;
    total: number;
  };
  recentInvoices: {
    id: string;
    client_name: string;
    equipment_name: string;
    asset_number: string;
    due_date: string;
    total_value: number;
    billing_status: string;
  }[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const maxRevenue = useMemo(() => {
    if (!data) return 1;
    return Math.max(...data.revenueByMonth.map(m => m.total), 1);
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin" />
        <p className="font-bold text-xs uppercase tracking-widest">Carregando dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <p className="font-bold text-sm">Não foi possível carregar os dados do dashboard.</p>
      </div>
    );
  }

  const { kpis, revenueByMonth, fleetStatus, recentInvoices } = data;

  const variationLabel = kpis.variation > 0
    ? `+${kpis.variation}% vs mês anterior`
    : kpis.variation < 0
      ? `${kpis.variation}% vs mês anterior`
      : 'Sem variação';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          index={0}
          title="Total Faturado"
          value={kpis.currentMonthTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          trend={variationLabel}
          trendPositive={kpis.variation >= 0}
          icon="payments"
          color="bg-emerald-50 text-emerald-900"
        />
        <KpiCard
          index={1}
          title="Conciliação Pendente"
          value={String(kpis.pendingReconciliationCount)}
          trend="Aguardando ação"
          icon="receipt_long"
          color="bg-amber-50 text-amber-800"
        />
        <KpiCard
          index={2}
          title="Equipamentos em Campo"
          value={String(kpis.rentedEquipmentCount)}
          trend="Com status Locado"
          icon="agriculture"
          color="bg-blue-50 text-blue-800"
        />
        <KpiCard
          index={3}
          title="Ordens de Serviço"
          value={String(kpis.serviceOrderCount)}
          trend="Total registradas"
          icon="build"
          color="bg-slate-100 text-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Faturamento Mensal</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 border-b border-slate-100 pb-2 relative">
            {revenueByMonth.map((month, i) => {
              const heightPct = maxRevenue > 0 ? (month.total / maxRevenue) * 100 : 0;
              return (
                <div key={month.month} className="w-full h-full flex flex-col justify-end items-center gap-1 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10">
                    {month.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, 2)}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                    whileHover={{ backgroundColor: '#012d1d' }}
                    className="w-full bg-emerald-900/20 rounded-t-sm cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">
            {revenueByMonth.map(m => <span key={m.month}>{m.label}</span>)}
          </div>
        </motion.div>

        {/* Fleet Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Status da Frota</h3>
          <div className="flex flex-col items-center justify-center h-48 mb-6">
            <div className="relative w-32 h-32 rounded-full border-[12px] border-slate-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{fleetStatus.total}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total</p>
              </div>
              {/* Visual ring proportional to "Locado" */}
              {fleetStatus.total > 0 && (
                <motion.div
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={{ rotate: (fleetStatus.locado / fleetStatus.total) * 360, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="absolute inset-[-12px] rounded-full border-[12px] border-emerald-900 border-t-transparent border-l-transparent"
                />
              )}
            </div>
          </div>
          <div className="space-y-3">
            <StatusRow label={`Locado (${fleetStatus.locado})`} value={fleetStatus.total > 0 ? `${Math.round((fleetStatus.locado / fleetStatus.total) * 100)}%` : '0%'} color="bg-emerald-900" />
            <StatusRow label={`Disponível (${fleetStatus.disponivel})`} value={fleetStatus.total > 0 ? `${Math.round((fleetStatus.disponivel / fleetStatus.total) * 100)}%` : '0%'} color="bg-emerald-400" />
            <StatusRow label={`Manutenção (${fleetStatus.manutencao})`} value={fleetStatus.total > 0 ? `${Math.round((fleetStatus.manutencao / fleetStatus.total) * 100)}%` : '0%'} color="bg-amber-400" />
            <StatusRow label={`Inativo (${fleetStatus.inativo})`} value={fleetStatus.total > 0 ? `${Math.round((fleetStatus.inativo / fleetStatus.total) * 100)}%` : '0%'} color="bg-slate-300" />
          </div>
        </motion.div>
      </div>

      {/* Recent Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Faturas Recentes</h3>
          <button onClick={() => navigate('/locacoes')} className="text-emerald-700 text-sm font-semibold hover:underline">Ver tudo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[11px] uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Equipamento</th>
                <th className="px-6 py-3">Vencimento</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors text-sm"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">{invoice.client_name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{invoice.equipment_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{invoice.asset_number}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {Number(invoice.total_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        invoice.billing_status === 'Faturado' || invoice.billing_status === 'Emitida'
                          ? 'bg-emerald-100 text-emerald-800'
                          : invoice.billing_status === 'Cancelada'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {invoice.billing_status === 'Faturado' || invoice.billing_status === 'Emitida' ? 'check_circle' : invoice.billing_status === 'Cancelada' ? 'cancel' : 'schedule'}
                        </span>
                        {invoice.billing_status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">Nenhuma fatura encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

const KpiCard = ({ title, value, trend, trendPositive, icon, color, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
    className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm cursor-pointer"
  >
    <div className="flex justify-between items-start mb-4">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendPositive === true ? 'text-emerald-600' : trendPositive === false ? 'text-red-500' : 'text-slate-500'}`}>
        {trendPositive === true && <span className="material-symbols-outlined text-[14px]">trending_up</span>}
        {trendPositive === false && <span className="material-symbols-outlined text-[14px]">trending_down</span>}
        {trend}
      </div>
    </div>
  </motion.div>
);

const StatusRow = ({ label, value, color }: any) => (
  <div className="flex justify-between items-center text-xs">
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-slate-600 font-medium">{label}</span>
    </div>
    <span className="font-bold text-slate-900">{value}</span>
  </div>
);

export default Dashboard;

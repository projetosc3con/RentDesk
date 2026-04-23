import { motion } from 'framer-motion';
import { mockInvoices } from '../data/mock';

const Dashboard: React.FC = () => {
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
          value="R$ 450.000"
          trend="+12% vs last month"
          icon="payments"
          color="bg-primary-container text-on-primary-container"
        />
        <KpiCard
          index={1}
          title="Faturas Pendentes"
          value="12"
          trend="Requiring action"
          icon="receipt_long"
          color="bg-surface-container-high text-on-surface"
        />
        <KpiCard
          index={2}
          title="Equipamentos em Campo"
          value="28"
          trend="75% utilization rate"
          icon="agriculture"
          color="bg-inverse-primary text-primary"
        />
        <KpiCard
          index={3}
          title="Ordens de Serviço"
          value="5"
          trend="2 critical"
          icon="build"
          color="bg-tertiary-fixed text-on-tertiary-fixed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts simulation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Monthly Revenue</h3>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
            {/* Simple bar chart mock */}
            {[40, 45, 60, 55, 70, 85, 95].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                whileHover={{ backgroundColor: '#012d1d', opacity: 1 }}
                className="w-full bg-emerald-900/20 rounded-t-sm cursor-pointer"
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(m => <span key={m}>{m}</span>)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Fleet Status</h3>
          <div className="flex flex-col items-center justify-center h-48 mb-6">
            <div className="relative w-32 h-32 rounded-full border-[12px] border-slate-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">42</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total</p>
              </div>
              {/* Visual ring mock */}
              <motion.div
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 45, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="absolute inset-[-12px] rounded-full border-[12px] border-emerald-900 border-t-transparent border-l-transparent"
              ></motion.div>
            </div>
          </div>
          <div className="space-y-3">
            <StatusRow label="Rented (28)" value="66%" color="bg-emerald-900" />
            <StatusRow label="Available (9)" value="21%" color="bg-emerald-400" />
            <StatusRow label="Maintenance (5)" value="13%" color="bg-amber-400" />
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
          <button className="text-emerald-700 text-sm font-semibold hover:underline">Ver tudo</button>
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
              {mockInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors text-sm"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">{invoice.client_name}</td>
                  <td className="px-6 py-4 text-slate-600">{invoice.equipment_name}</td>
                  <td className="px-6 py-4 text-slate-600">{invoice.due_date}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">R$ {invoice.total_value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${invoice.billing_status === 'Paga'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                      }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {invoice.billing_status === 'Paga' ? 'check_circle' : 'schedule'}
                      </span>
                      {invoice.billing_status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

const KpiCard = ({ title, value, trend, icon, color, index }: any) => (
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
      <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
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

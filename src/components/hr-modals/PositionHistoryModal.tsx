import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PositionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_HISTORY = [
  { id: '1', employee: 'João Silva', oldPos: 'Técnico I', newPos: 'Técnico II', date: '15/04/2026', type: 'Promoção', author: 'Admin' },
  { id: '2', employee: 'Maria Santos', oldPos: 'Estagiária', newPos: 'Assistente', date: '01/04/2026', type: 'Efetivação', author: 'Admin' },
  { id: '3', employee: 'Pedro Oliveira', oldPos: 'Analista Jr', newPos: 'Analista Pl', date: '20/03/2026', type: 'Promoção', author: 'Sist.' },
  { id: '4', employee: 'Ana Costa', oldPos: 'Vendedora', newPos: 'Sup. Vendas', date: '10/03/2026', type: 'Promoção', author: 'Admin' },
];

const PositionHistoryModal: React.FC<PositionHistoryModalProps> = ({ isOpen, onClose }) => {
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
          className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Histórico de Alterações</h2>
                <p className="text-sm text-slate-500">Consulta de movimentações de cargos e salários.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="p-6 bg-slate-50/30 border-b border-slate-100 grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Período</label>
              <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-900 transition-all appearance-none">
                <option>Últimos 30 dias</option>
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
                <option>Personalizado...</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
              <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-900 transition-all appearance-none">
                <option>Todos os tipos</option>
                <option>Promoção</option>
                <option>Ajuste Salarial</option>
                <option>Transferência</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pesquisa Rápida</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm">search</span>
                <input 
                  type="text" 
                  placeholder="Nome do colaborador..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-900 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo Anterior</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Transição</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Novo Cargo</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_HISTORY.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{item.date}</td>
                    <td className="px-8 py-5 text-sm font-black text-slate-900">{item.employee}</td>
                    <td className="px-8 py-5 text-xs text-slate-500 font-medium">{item.oldPos}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="material-symbols-outlined text-emerald-900/40 text-sm">trending_flat</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-emerald-900 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                        {item.newPos}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded tracking-tighter">
                        {item.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium italic">Mostrando {MOCK_HISTORY.length} registros encontrados.</p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
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

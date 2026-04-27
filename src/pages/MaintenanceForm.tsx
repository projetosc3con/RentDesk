import React from 'react';
import { motion } from 'framer-motion';

const MaintenanceForm: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manutenções</h1>
          <p className="text-slate-500 mt-1">Gerencie ordens de serviço e manutenção preventiva.</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wider border border-slate-200">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">pending</span>
            Rascunho
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-4 gap-8">
          <button className="pb-3 border-b-2 border-emerald-900 text-emerald-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            Informações Gerais
          </button>
          <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Estado do Equipamento
          </button>
          <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            Peças Utilizadas
          </button>
        </div>

        <div className="p-8 flex-1 flex flex-col gap-8">
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selecionar Equipamento</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input 
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all text-sm" 
                  placeholder="Busque por modelo, ID ou número de série..." 
                  type="text" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Técnico Responsável</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">person</span>
                <select className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all text-sm appearance-none">
                  <option>Carlos Silva</option>
                  <option>Roberto Mendes</option>
                  <option>Ana Costa</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Local da Execução</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">location_on</span>
                <select className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all text-sm appearance-none">
                  <option>Oficina Central - Zona A</option>
                  <option>Reparo em Campo (Unidade Móvel)</option>
                  <option>Instalação do Parceiro</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">description</span>
              Descrição do Problema
            </label>
            <textarea 
              className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all text-sm resize-none" 
              placeholder="Descreva o problema relatado, sintomas ou tarefas de manutenção solicitadas..." 
              rows={4}
            />
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">build_circle</span>
                Peças Utilizadas
              </h3>
              <button className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold text-xs px-2 py-1 rounded transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Adicionar Peça
              </button>
            </div>
            <div className="p-12 text-center border-b border-slate-200 border-dashed m-4 rounded-xl bg-white/50">
              <span className="material-symbols-outlined text-slate-300 text-[48px] mb-3 block">inventory</span>
              <p className="text-sm font-medium text-slate-400">Nenhuma peça adicionada ainda. Use esta seção para alocar itens do estoque a esta OS.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">close</span>
            Cancelar
          </button>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-white transition-all font-bold text-xs uppercase tracking-wider shadow-sm">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Gerar PDF
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 transition-all font-bold text-xs uppercase tracking-wider shadow-md">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar OS
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MaintenanceForm;

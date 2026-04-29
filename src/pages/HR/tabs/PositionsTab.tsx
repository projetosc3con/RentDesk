import React, { useState } from 'react';
import NewPositionModal from '../../../components/hr-modals/NewPositionModal';
import ChangePositionModal from '../../../components/hr-modals/ChangePositionModal';
import PositionHistoryModal from '../../../components/hr-modals/PositionHistoryModal';

const PositionsTab: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const mockPositions = [
    { id: '1', name: 'Técnico de Campo I', levels: ['Júnior', 'Pleno', 'Sênior'], employees: 12 },
    { id: '2', name: 'Analista Administrativo', levels: ['Júnior', 'Pleno'], employees: 4 },
    { id: '3', name: 'Supervisor de Logística', levels: ['Sênior'], employees: 2 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content: Positions List */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-900 shadow-sm">
                <span className="material-symbols-outlined text-3xl">work</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Cargos e Funções</h3>
                <p className="text-sm text-slate-500">Gestão de estrutura hierárquica e ocupacional.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/10"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Novo Cargo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Níveis Disponíveis</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Colaboradores</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockPositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900">{pos.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {pos.levels.map(level => (
                          <span key={level} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-tighter">
                            {level}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-slate-700">{pos.employees}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-900 hover:border-emerald-900 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotion Timeline Mock */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">timeline</span>
            Atividades Recentes
          </h3>
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
            {[1, 2].map((_, i) => (
              <div key={i} className="relative pl-10">
                <div className="absolute left-[-33px] top-1 w-10 h-10 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center z-10 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">João Silva foi promovido a Técnico II</p>
                  <p className="text-xs text-slate-500 mt-1">Realizado em 15/04/2026 • Motivo: Promoção Vertical</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar: Job Levels & Salary Ranges Config */}
      <div className="space-y-6">
        <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/5 text-9xl">badge</span>
          <h3 className="text-lg font-bold mb-1">Gestão de Pessoal</h3>
          <p className="text-emerald-100/60 text-xs uppercase tracking-widest font-bold mb-6">Movimentações</p>
          
          <div className="space-y-4 relative z-10">
            <button 
              onClick={() => setIsChangeModalOpen(true)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">person_edit</span>
              Alterar Cargo
            </button>
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">manage_search</span>
              Histórico
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo de Níveis</h4>
          <div className="space-y-3">
            {['Júnior', 'Pleno', 'Sênior', 'Especialista'].map((level) => (
              <div key={level} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-700">{level}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewPositionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <ChangePositionModal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
      />

      <PositionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
};

export default PositionsTab;

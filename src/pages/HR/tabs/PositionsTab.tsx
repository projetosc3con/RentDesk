import React, { useState } from 'react';
import NewPositionModal from '../../../components/hr-modals/NewPositionModal';
import ChangePositionModal from '../../../components/hr-modals/ChangePositionModal';
import PositionHistoryModal from '../../../components/hr-modals/PositionHistoryModal';
import JobLevelModal from '../../../components/hr-modals/JobLevelModal';

const PositionsTab: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Job Level States
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<{ id: string; name: string; description: string } | null>(null);

  const mockPositions = [
    { id: '1', name: 'Técnico de Campo I', levels: ['Júnior', 'Pleno', 'Sênior'], employees: 12 },
    { id: '2', name: 'Analista Administrativo', levels: ['Júnior', 'Pleno'], employees: 4 },
    { id: '3', name: 'Supervisor de Logística', levels: ['Sênior'], employees: 2 },
  ];

  const mockLevels = [
    { id: '1', name: 'Júnior', description: 'Nível inicial de carreira' },
    { id: '2', name: 'Pleno', description: 'Profissional com autonomia' },
    { id: '3', name: 'Sênior', description: 'Especialista e referência' },
    { id: '4', name: 'Especialista', description: 'Foco técnico profundo' },
  ];

  const handleEditLevel = (level: typeof mockLevels[0]) => {
    setSelectedLevel(level);
    setIsLevelModalOpen(true);
  };

  const handleAddLevel = () => {
    setSelectedLevel(null);
    setIsLevelModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content: Positions List */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-mustard-100 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-500 shadow-sm">
                <span className="material-symbols-outlined text-3xl">work</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cargos e Funções</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gestão de estrutura hierárquica e ocupacional.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/10"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Novo Cargo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cargo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Níveis Disponíveis</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Colaboradores</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockPositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{pos.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {pos.levels.map(level => (
                          <span key={level} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-tighter">
                            {level}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pos.employees}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-500 dark:hover:text-mustard-500 hover:border-mustard-500 dark:hover:border-mustard-500 transition-all flex items-center justify-center ml-auto">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-mustard-500">timeline</span>
            Atividades Recentes
          </h3>
          <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
            {[1, 2].map((_, i) => (
              <div key={i} className="relative pl-10">
                <div className="absolute left-[-33px] top-1 w-10 h-10 bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-800 rounded-full flex items-center justify-center z-10 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-mustard-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">João Silva foi promovido a Técnico II</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Realizado em 15/04/2026 • Motivo: Promoção Vertical</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar: Job Levels & Salary Ranges Config */}
      <div className="space-y-6">
        <div className="bg-mustard-500 rounded-3xl p-8 text-white shadow-xl shadow-mustard-500/20 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/5 text-9xl">badge</span>
          <h3 className="text-lg font-bold mb-1">Gestão de Pessoal</h3>
          <p className="text-mustard-100/60 text-xs uppercase tracking-widest font-bold mb-6">Movimentações</p>
          
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

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Resumo de Níveis</h4>
            <button 
              onClick={handleAddLevel}
              className="w-7 h-7 rounded-lg bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 flex items-center justify-center hover:bg-mustard-500 hover:text-white transition-all shadow-sm shadow-mustard-500/5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <div className="space-y-3">
            {mockLevels.map((level) => (
              <div key={level.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-mustard-600 dark:group-hover:text-mustard-400">{level.name}</span>
                <button 
                  onClick={() => handleEditLevel(level)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-mustard-500 dark:group-hover:text-mustard-400 hover:bg-white dark:hover:bg-slate-700 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
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

      <JobLevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        levelData={selectedLevel}
      />
    </div>
  );
};

export default PositionsTab;

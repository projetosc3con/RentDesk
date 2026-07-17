import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewPositionModal from '../../../components/hr-modals/NewPositionModal';
import ChangePositionModal from '../../../components/hr-modals/ChangePositionModal';
import PositionHistoryModal from '../../../components/hr-modals/PositionHistoryModal';
import api from '../../../services/api';

const PositionsTab: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);

  const [positions, setPositions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [posRes, empRes, actRes] = await Promise.all([
        api.get('/hr/positions'),
        api.get('/hr/employees'),
        api.get('/hr/recent-activities')
      ]);
      setPositions(posRes.data);
      setEmployees(empRes.data);
      setActivities(actRes.data);
    } catch (error) {
      console.error('Failed to fetch HR data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
              onClick={() => {
                setSelectedPosition(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/10"
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
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-500">Carregando...</td></tr>
                ) : positions.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-500">Nenhum cargo cadastrado.</td></tr>
                ) : positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{pos.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        {pos.levels.map((level: string) => (
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
                      <button
                        onClick={() => {
                          setSelectedPosition(pos);
                          setIsModalOpen(true);
                        }}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-500 dark:hover:text-mustard-500 hover:border-mustard-500 dark:hover:border-mustard-500 transition-all flex items-center justify-center ml-auto"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Colaboradores / Onboard */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-mustard-500">groups</span>
            Colaboradores Cadastrados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-8 text-slate-500">Carregando colaboradores...</div>
            ) : employees.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-slate-500">Nenhum colaborador encontrado.</div>
            ) : employees.map(emp => (
              <div key={emp.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  {emp.photo_url ? (
                    <img src={emp.photo_url} alt={emp.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold shrink-0">
                      {emp.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{emp.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{emp.email}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {emp.positionTitle ? (
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Cargo Atual</p>
                        <p className="text-sm font-bold text-mustard-600 dark:text-mustard-400 truncate">{emp.positionTitle} - {emp.levelName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{emp.department}</p>
                      </div>
                      {emp.missingDocsCount !== null && (
                        <div
                          className="relative group cursor-pointer shrink-0 mt-2"
                          title={emp.missingDocsCount > 0 ? `Faltam ${emp.missingDocsCount} documentos obrigatórios` : 'Documentação completa'}
                        >
                          {emp.missingDocsCount > 0 ? (
                            <>
                              <span className="material-symbols-outlined text-[22px] text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors">
                                attachment
                              </span>
                              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-slate-800">
                                {emp.missingDocsCount}
                              </span>
                            </>
                          ) : (
                            <span className="material-symbols-outlined text-[22px] text-emerald-500">
                              check_circle
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/rh/colaboradores/${emp.id}`)}
                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-mustard-500 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 rounded-lg transition-all shrink-0 mt-1.5"
                        title="Ver detalhes do colaborador"
                      >
                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">Nenhum cargo associado</p>
                      <button className="px-3 py-1.5 bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 rounded-lg text-xs font-bold hover:bg-mustard-500 hover:text-white transition-colors">
                        Iniciar Onboard
                      </button>
                    </div>
                  )}
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

        {/* Promotion Timeline Mock (Moved to Sidebar) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-mustard-500 text-lg">timeline</span>
            Atividades Recentes
          </h3>
          <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
            {loading ? (
              <div className="text-center py-4 text-slate-500 text-xs">Carregando...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs">Nenhuma atividade recente.</div>
            ) : activities.map((activity) => (
              <div key={activity.id} className="relative pl-6">
                <div className="absolute left-[-40px] top-1 w-8 h-8 bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-800 rounded-full flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-mustard-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{activity.employeeName} foi atribuído(a) a {activity.positionTitle} {activity.levelName ? `- ${activity.levelName}` : ''}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{new Date(activity.date).toLocaleDateString('pt-BR')} • {activity.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewPositionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPosition(null);
          fetchData();
        }}
        initialData={selectedPosition}
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

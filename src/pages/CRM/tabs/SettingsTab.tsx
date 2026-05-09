import React, { useState, useEffect } from 'react';
import NewPipelineModal from '../../../components/crm-modals/NewPipelineModal';
import EditPipelineModal from '../../../components/crm-modals/EditPipelineModal';
import { crmService, type CRMPipeline, type CRMPipelineStage, type CRMTaskType } from '../../../services/crm';

type PipelineWithDetails = CRMPipeline & { stages?: number; activeDeals?: number; stageList?: CRMPipelineStage[] };

const SettingsTab: React.FC = () => {
  const [pipelines, setPipelines] = useState<PipelineWithDetails[]>([]);
  const [taskTypes, setTaskTypes] = useState<CRMTaskType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pipelinesData, taskTypesData] = await Promise.all([
        crmService.getPipelines(),
        crmService.getTaskTypes()
      ]);
      setPipelines(pipelinesData);
      setTaskTypes(taskTypesData);
      
      if (pipelinesData.length > 0 && !activePipelineId) {
        setActivePipelineId(pipelinesData[0].id);
      }
    } catch (error) {
      console.error('Error loading CRM settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditPipeline = (pipeline: PipelineWithDetails) => {
    const stages = (pipeline.stageList || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      probability: s.probability_pct,
      isWon: s.is_won,
      isLost: s.is_lost,
    }));
    
    setSelectedPipeline({
      id: pipeline.id,
      name: pipeline.name,
      description: pipeline.description || '',
      active: pipeline.active,
      stages,
    });
    setIsEditModalOpen(true);
  };

  const handleModalClose = (wasSaved: boolean = false) => {
    setIsNewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedPipeline(null);
    if (wasSaved) {
      loadData();
    }
  };

  // Helper to map DB task types to icons since icons aren't stored in DB yet
  const getTaskIcon = (name: string) => {
    const map: Record<string, string> = {
      'Nota': 'sticky_note_2',
      'Ligação': 'call',
      'E-mail': 'mail',
      'Reunião': 'groups',
      'Mudança de Etapa': 'swap_horiz',
      'Proposta Enviada': 'description',
      'Visita Técnica': 'engineering'
    };
    return map[name] || 'task';
  };

  const activePipeline = pipelines.find(p => p.id === activePipelineId);
  const currentStages = activePipeline?.stageList || [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        {/* Main: Pipelines Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  <div className="w-48 h-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
                </div>
              </div>
              <div className="w-32 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
            <div className="p-8 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="w-40 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                      <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="w-12 h-4 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    <div className="w-12 h-4 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stages Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="w-20 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl p-8 h-64 shadow-xl"></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
            <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main: Pipelines */}
      <div className="lg:col-span-2 space-y-8">
        {/* Pipelines Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-600 dark:text-mustard-400 shadow-sm">
                <span className="material-symbols-outlined text-3xl">view_kanban</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Funis de Venda</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pipelines configurados para gerenciar negociações.</p>
              </div>
            </div>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/10"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Novo Funil
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Funil</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Etapas</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Deals Ativos</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pipelines.map((pipeline) => (
                  <tr
                    key={pipeline.id}
                    onClick={() => setActivePipelineId(pipeline.id)}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer ${activePipelineId === pipeline.id ? 'bg-mustard-50/30 dark:bg-mustard-500/5' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {activePipelineId === pipeline.id && (
                          <div className="w-1.5 h-8 bg-mustard-500 rounded-full" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{pipeline.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{pipeline.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pipeline.stages}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-mustard-600 dark:text-mustard-400">{pipeline.activeDeals}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${pipeline.active
                        ? 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 border-mustard-100 dark:border-mustard-500/20'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pipeline.active ? 'bg-mustard-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                        {pipeline.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPipeline(pipeline);
                        }}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 hover:border-mustard-300 dark:hover:border-mustard-500 transition-all flex items-center justify-center ml-auto"
                      >
                        <span className="material-symbols-outlined text-sm">settings</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stages Detail */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-mustard-600 dark:text-mustard-400">account_tree</span>
              Etapas — {activePipeline?.name || 'Selecione um funil'}
            </h3>
            <button
              onClick={() => activePipeline && handleEditPipeline(activePipeline)}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-mustard-600 dark:text-mustard-400 bg-mustard-50 dark:bg-mustard-500/10 hover:bg-mustard-100 dark:hover:bg-mustard-500/20 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Editar
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Configure a sequência de etapas e probabilidades do funil.</p>

          <div className="space-y-3">
            {currentStages.map((stage: any) => (
              <div key={stage.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all">
                <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-600">
                  {stage.position}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{stage.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  {stage.is_won && (
                    <span className="px-2 py-0.5 bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-mustard-100 dark:border-mustard-500/20">Ganho</span>
                  )}
                  {stage.is_lost && (
                    <span className="px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-100 dark:border-red-500/20">Perdido</span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-2 py-1 rounded-lg">{stage.probability_pct}%</span>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-mustard-600 dark:group-hover:text-mustard-400 hover:bg-white dark:hover:bg-slate-700 transition-all">
                    <span className="material-symbols-outlined text-sm">drag_indicator</span>
                  </button>
                </div>
              </div>
            ))}
            {currentStages.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Nenhuma etapa configurada.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-mustard-500 rounded-3xl p-8 text-white shadow-xl shadow-mustard-500/20 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/5 text-9xl">tune</span>
          <h3 className="text-lg font-bold mb-1">Configurações</h3>
          <p className="text-mustard-100/60 text-xs uppercase tracking-widest font-bold mb-6">CRM</p>

          <div className="space-y-4 relative z-10">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Novo Funil
            </button>
            <button
              onClick={() => activePipeline && handleEditPipeline(activePipeline)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">view_kanban</span>
              Gerenciar Funil Selecionado
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tipos de Atividade</h4>
          <div className="space-y-3">
            {taskTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-hover:text-mustard-600 dark:group-hover:text-mustard-400 text-[18px]">
                  {getTaskIcon(type.name)}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-mustard-600 dark:group-hover:text-mustard-400">{type.name}</span>
                {!type.active && (
                  <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg">Inativo</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewPipelineModal
        isOpen={isNewModalOpen}
        onClose={() => handleModalClose(false)}
      />

      <EditPipelineModal
        isOpen={isEditModalOpen}
        onClose={() => handleModalClose(false)}
        pipeline={selectedPipeline}
      />
    </div>
  );
};

export default SettingsTab;

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { crmService, type CRMPipeline, type CRMPipelineStage } from '../../../services/crm';
import NewDealModal from '../../../components/crm-modals/NewDealModal';
import EditDealModal from '../../../components/crm-modals/EditDealModal';
import { useAuth } from '../../../contexts/AuthContext';

const getStageColor = (index: number) => {
  const colors = [
    { bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400' },
    { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
    { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-100 dark:border-green-500/20', text: 'text-green-600 dark:text-green-400' },
    { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-500/20', text: 'text-red-600 dark:text-red-400' },
  ];
  return colors[index % colors.length];
};

const PipelineTab: React.FC = () => {
  const [, setPipelines] = useState<(CRMPipeline & { stageList: CRMPipelineStage[] })[]>([]);
  const [activePipeline, setActivePipeline] = useState<(CRMPipeline & { stageList: CRMPipelineStage[] }) | null>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { profile } = useAuth();

  const isUserComercial = profile?.access_level === 'Comercial';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pipelinesData, dealsData, activitiesData] = await Promise.all([
        crmService.getPipelines(),
        crmService.getDeals(),
        crmService.getDealActivities()
      ]);

      setPipelines(pipelinesData);

      const active = pipelinesData.find((p: any) => p.active) || pipelinesData[0];
      setActivePipeline(active || null);
      setDeals(dealsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Erro ao carregar dados do pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceStageId = result.source.droppableId;
    const destStageId = result.destination.droppableId;
    const dealId = result.draggableId;

    if (sourceStageId === destStageId) return; // No change in stage

    // Find the new stage to get its probability
    const newStage = activePipeline?.stageList.find(s => s.id === destStageId);
    if (!newStage) return;

    // Optimistically update the UI
    const updatedDeals = deals.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          stage_id: destStageId,
          probability_pct: newStage.probability_pct
        };
      }
      return d;
    });
    setDeals(updatedDeals);

    // Persist to backend
    try {
      await crmService.updateDeal(dealId, {
        stage_id: destStageId,
        probability_pct: newStage.probability_pct
      });
      // Recarrega as atividades para mostrar a mudança no log
      const activitiesData = await crmService.getDealActivities();
      setActivities(activitiesData);
    } catch (error) {
      console.error('Erro ao atualizar etapa do negócio:', error);
      // Revert if error
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mustard-500"></div>
      </div>
    );
  }

  if (!activePipeline) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">view_kanban</span>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum pipeline ativo</h3>
        <p className="text-slate-500">Configure um pipeline nas configurações do CRM.</p>
      </div>
    );
  }

  const pipelineDeals = deals.filter(d => d.pipeline_id === activePipeline.id);
  const totalValue = pipelineDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activePipeline.name}</h2>
          {activePipeline.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activePipeline.description}</p>
          )}
        </div>
        <button
          onClick={() => setIsNewDealModalOpen(true)}
          className="flex items-center gap-2 bg-mustard-500 hover:bg-mustard-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-mustard-500/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Novo Negócio
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Negociações Ativas', value: pipelineDeals.length.toString(), icon: 'handshake', accent: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
          { label: 'Valor no Pipeline', value: totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: 'payments', accent: 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400' },
          { label: 'Taxa de Conversão', value: '34%', icon: 'trending_up', accent: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
          { label: 'Ciclo Médio', value: '18 dias', icon: 'schedule', accent: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.accent} rounded-xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board Area */}
      <div className="w-full">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x custom-scrollbar">
            {activePipeline.stageList.map((stage, index) => {
              const colors = getStageColor(index);
              const stageDeals = pipelineDeals.filter(d => d.stage_id === stage.id);

              return (
                <div key={stage.id} className="w-80 shrink-0 snap-center">
                  <div className="space-y-3">
                    {/* Stage Header */}
                    <div className={`rounded-2xl p-4 border ${colors.bg} ${colors.border} flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>{stage.name}</h3>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {stageDeals.length}
                      </span>
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`min-h-[200px] space-y-3 rounded-2xl transition-colors ${snapshot.isDraggingOver ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                            }`}
                        >
                          {stageDeals.map((deal, index) => {
                            const isOwner = deal.owner_id === profile?.id;
                            const canEditOrDrag = !isUserComercial || isOwner;

                            return (
                              <Draggable 
                                key={deal.id} 
                                draggableId={deal.id} 
                                index={index}
                                isDragDisabled={!canEditOrDrag}
                              >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white dark:bg-slate-900 rounded-2xl border ${snapshot.isDragging ? 'border-mustard-500 shadow-xl' : 'border-slate-200 dark:border-slate-800'} p-5 shadow-sm hover:shadow-md transition-all ${canEditOrDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} group select-none relative`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-mustard-500 dark:group-hover:text-mustard-400 transition-colors leading-tight">{deal.title}</h4>
                                    {canEditOrDrag && (
                                      <button
                                        onClick={() => {
                                          setSelectedDeal(deal);
                                          setIsEditModalOpen(true);
                                        }}
                                        className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-mustard-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                      >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                                    {deal.client?.company_name || deal.lead?.company_name || 'Sem Empresa Vinculada'}
                                  </p>

                                  <div className="flex items-center justify-between mt-4">
                                    <span className="text-xs font-black text-mustard-600 dark:text-mustard-400">
                                      {(Number(deal.value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{deal.probability_pct || 0}%</span>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-mustard-500 rounded-full transition-all duration-500" style={{ width: `${deal.probability_pct || 0}%` }} />
                                  </div>

                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                                      <div className="w-7 h-7 bg-mustard-100 dark:bg-mustard-500/20 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                                        {deal.owner?.photo_url ? (
                                          <img
                                            src={deal.owner.photo_url}
                                            alt={deal.owner.full_name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-[8px] font-black text-mustard-700 dark:text-mustard-400">
                                            {(deal.owner?.full_name || 'U').charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                                        {deal.owner?.full_name || 'Sem Dono'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-300 dark:text-slate-600 font-bold shrink-0">
                                      {Math.floor((new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 3600 * 24))}d
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Recent Activities Section - Full Width below Kanban */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 flex flex-col mt-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-600 dark:text-mustard-400">
              <span className="material-symbols-outlined text-2xl">history</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Histórico de Atividades
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Últimas movimentações do pipeline</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6 max-h-[600px] overflow-y-auto p-4 custom-scrollbar">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400">Nenhuma atividade recente.</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className={`relative pl-8 pb-6 ${index !== activities.length - 1 ? 'border-l-2 border-slate-100 dark:border-slate-800' : ''}`}>
                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-mustard-500 z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-mustard-500" />
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800/50 hover:border-mustard-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-mustard-100 dark:bg-mustard-500/20 flex items-center justify-center overflow-hidden shrink-0">
                        {activity.performer?.photo_url ? (
                          <img src={activity.performer.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] font-black text-mustard-600">{(activity.performer?.full_name || 'U').charAt(0)}</span>
                        )}
                      </div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider truncate max-w-[120px]">
                        {activity.performer?.full_name || 'Usuário'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 shadow-sm">
                      <span className="material-symbols-outlined text-[12px] text-slate-400">schedule</span>
                      <span className="text-[9px] font-bold text-slate-500">
                        {new Date(activity.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                    {activity.activity_type === 'stage_change' ? (
                      <div className="flex flex-col gap-2">
                        <p className="truncate">
                          Moveu <span className="font-bold text-slate-900 dark:text-white">{activity.deal?.title}</span>
                        </p>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm self-start">
                          <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-500">{activity.stage_from?.name || 'Início'}</span>
                          <span className="material-symbols-outlined text-[14px] text-mustard-500">trending_flat</span>
                          <span className="px-1.5 py-0.5 bg-mustard-500 text-white rounded text-[9px] font-black">{activity.stage_to?.name}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="font-medium">{activity.description}</p>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NewDealModal
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
        onSuccess={() => loadData()}
        pipelineId={activePipeline.id}
        stages={activePipeline.stageList}
      />

      {selectedDeal && (
        <EditDealModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDeal(null);
          }}
          onSuccess={() => loadData()}
          deal={selectedDeal}
          stages={activePipeline.stageList}
        />
      )}
    </div>
  );
};

export default PipelineTab;

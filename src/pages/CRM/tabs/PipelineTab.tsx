import React from 'react';

const mockDeals = [
  { id: '1', title: 'Locação 4x PS12 — Obra Paulínia', company: 'Condor S.A', value: 'R$ 48.000/mês', probability: 80, owner: 'Carlos M.', daysInStage: 3 },
  { id: '2', title: 'Contrato Anual Plataforma Tesoura', company: 'Tuper S.A', value: 'R$ 156.000/ano', probability: 60, owner: 'Ana L.', daysInStage: 7 },
  { id: '3', title: 'Locação Emergencial Guindaste', company: 'Buddemeyer S.A', value: 'R$ 22.500/mês', probability: 90, owner: 'Carlos M.', daysInStage: 1 },
  { id: '4', title: '2x PTA Articulada — Manutenção Fachada', company: 'Oxford Porcelanas', value: 'R$ 18.000/mês', probability: 40, owner: 'Marcos T.', daysInStage: 12 },
  { id: '5', title: 'Projeto Expansão Galpão Industrial', company: 'Grossl Indústria', value: 'R$ 85.000', probability: 30, owner: 'Ana L.', daysInStage: 5 },
  { id: '6', title: 'Locação Mensal PTA — Evento', company: 'Focolight Image', value: 'R$ 7.200', probability: 95, owner: 'Marcos T.', daysInStage: 2 },
];

const stages = [
  { id: 's1', name: 'Prospecção', color: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', textColor: 'text-slate-600 dark:text-slate-400', dealIds: ['5'] },
  { id: 's2', name: 'Proposta Enviada', color: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20', textColor: 'text-blue-600 dark:text-blue-400', dealIds: ['4', '2'] },
  { id: 's3', name: 'Negociação', color: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20', textColor: 'text-amber-600 dark:text-amber-400', dealIds: ['1'] },
  { id: 's4', name: 'Fechamento', color: 'bg-mustard-50 dark:bg-mustard-500/10 border-mustard-100 dark:border-mustard-500/20', textColor: 'text-mustard-600 dark:text-mustard-400', dealIds: ['3', '6'] },
];

const PipelineTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Negociações Ativas', value: '6', icon: 'handshake', accent: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
          { label: 'Valor no Pipeline', value: 'R$ 336.7k', icon: 'payments', accent: 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400' },
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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stages.map((stage) => {
          const stageDeals = mockDeals.filter(d => stage.dealIds.includes(d.id));
          return (
            <div key={stage.id} className="space-y-3">
              {/* Stage Header */}
              <div className={`rounded-2xl p-4 border ${stage.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-black uppercase tracking-widest ${stage.textColor}`}>{stage.name}</h3>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${stage.color} ${stage.textColor}`}>
                  {stageDeals.length}
                </span>
              </div>

              {/* Deal Cards */}
              {stageDeals.map((deal) => (
                <div key={deal.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-mustard-200 dark:hover:border-mustard-500/30 transition-all cursor-pointer group">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-mustard-500 dark:group-hover:text-mustard-400 transition-colors leading-tight">{deal.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{deal.company}</p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-black text-mustard-600 dark:text-mustard-400">{deal.value}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{deal.probability}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-3">
                    <div className="h-1 bg-mustard-500 rounded-full transition-all" style={{ width: `${deal.probability}%` }} />
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-mustard-100 dark:bg-mustard-500/20 rounded-full flex items-center justify-center">
                        <span className="text-[8px] font-black text-mustard-700 dark:text-mustard-400">{deal.owner.charAt(0)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{deal.owner}</span>
                    </div>
                    <span className="text-[10px] text-slate-300 dark:text-slate-600 font-bold">{deal.daysInStage}d</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-mustard-600 dark:text-mustard-400">history</span>
          Atividades Recentes do Pipeline
        </h3>
        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
          {[
            { text: 'Proposta enviada para Condor S.A — Locação 4x PS12', time: 'Há 2 horas', type: 'Proposta Enviada' },
            { text: 'Reunião realizada com Tuper S.A — Contrato Anual', time: 'Há 5 horas', type: 'Reunião' },
            { text: 'Deal "Locação Emergencial Guindaste" movido para Fechamento', time: 'Ontem', type: 'Mudança de Etapa' },
          ].map((activity, i) => (
            <div key={i} className="relative pl-10">
              <div className="absolute left-[-33px] top-1 w-10 h-10 bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-800 rounded-full flex items-center justify-center z-10 shadow-sm">
                <div className="w-2.5 h-2.5 bg-mustard-500 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.text}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.time} • {activity.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineTab;

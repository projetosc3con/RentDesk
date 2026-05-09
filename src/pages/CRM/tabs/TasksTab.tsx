import React from 'react';

const mockTasks = [
  { id: '1', title: 'Ligar para Ricardo — follow-up proposta PS12', type: 'Ligação de Follow-up', deal: 'Locação 4x PS12 — Obra Paulínia', assignee: 'Carlos M.', dueDate: '06/05/2026', priority: 'Alta', status: 'Pendente' },
  { id: '2', title: 'Enviar proposta revisada Contrato Anual', type: 'Enviar Proposta', deal: 'Contrato Anual Plataforma Tesoura', assignee: 'Ana L.', dueDate: '07/05/2026', priority: 'Urgente', status: 'Em Andamento' },
  { id: '3', title: 'Visita técnica — avaliar terreno obra', type: 'Visita Técnica', deal: 'Projeto Expansão Galpão Industrial', assignee: 'Marcos T.', dueDate: '09/05/2026', priority: 'Normal', status: 'Pendente' },
  { id: '4', title: 'Reunião comercial com diretoria Tuper', type: 'Reunião Comercial', deal: 'Contrato Anual Plataforma Tesoura', assignee: 'Ana L.', dueDate: '05/05/2026', priority: 'Alta', status: 'Concluída' },
  { id: '5', title: 'Enviar documentação técnica equipamentos', type: 'Enviar Proposta', deal: 'Locação Emergencial Guindaste', assignee: 'Carlos M.', dueDate: '08/05/2026', priority: 'Normal', status: 'Pendente' },
  { id: '6', title: 'Apresentar portfólio para lead mineração', type: 'Reunião Comercial', deal: null, assignee: 'Ana L.', dueDate: '04/05/2026', priority: 'Baixa', status: 'Cancelada' },
];

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'Urgente': return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20';
    case 'Alta': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
    case 'Normal': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
    case 'Baixa': return 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700';
    default: return 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700';
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Pendente': return 'text-amber-600 dark:text-amber-400';
    case 'Em Andamento': return 'text-blue-600 dark:text-blue-400';
    case 'Concluída': return 'text-mustard-600 dark:text-mustard-400';
    case 'Cancelada': return 'text-slate-400 dark:text-slate-500 line-through';
    default: return 'text-slate-400 dark:text-slate-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pendente': return 'radio_button_unchecked';
    case 'Em Andamento': return 'pending';
    case 'Concluída': return 'check_circle';
    case 'Cancelada': return 'cancel';
    default: return 'radio_button_unchecked';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Ligação de Follow-up': return 'call';
    case 'Enviar Proposta': return 'description';
    case 'Visita Técnica': return 'engineering';
    case 'Reunião Comercial': return 'groups';
    default: return 'task_alt';
  }
};

const TasksTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main: Tasks Table */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-600 dark:text-mustard-400 shadow-sm">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Tarefas Comerciais</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Agenda de atividades da equipe comercial.</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/10">
              <span className="material-symbols-outlined text-[20px]">add_task</span>
              Nova Tarefa
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockTasks.map((task) => (
              <div key={task.id} className="px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group flex items-start gap-4">
                {/* Status Icon */}
                <button className={`mt-0.5 ${getStatusStyle(task.status)}`}>
                  <span className="material-symbols-outlined text-xl">{getStatusIcon(task.status)}</span>
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-sm font-bold text-slate-900 dark:text-white group-hover:text-mustard-500 dark:group-hover:text-mustard-400 transition-colors ${task.status === 'Cancelada' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[14px]">{getTypeIcon(task.type)}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{task.type}</span>
                        </div>
                        {task.deal && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[14px]">handshake</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[200px]">{task.deal}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border whitespace-nowrap ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-mustard-100 dark:bg-mustard-500/20 rounded-full flex items-center justify-center">
                        <span className="text-[8px] font-black text-mustard-700 dark:text-mustard-400">{task.assignee.charAt(0)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[14px]">event</span>
                      <span className={`text-[10px] font-bold ${task.status === 'Pendente' && task.dueDate < '06/05/2026' ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar: Summary */}
      <div className="space-y-6">
        <div className="bg-mustard-500 rounded-3xl p-8 text-white shadow-xl shadow-mustard-500/20 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/5 text-9xl">task_alt</span>
          <h3 className="text-lg font-bold mb-1">Agenda Comercial</h3>
          <p className="text-mustard-100/60 text-xs uppercase tracking-widest font-bold mb-6">Resumo do Dia</p>

          <div className="space-y-4 relative z-10">
            {[
              { label: 'Pendentes', value: '3', icon: 'schedule' },
              { label: 'Em Andamento', value: '1', icon: 'pending' },
              { label: 'Concluídas Hoje', value: '1', icon: 'check_circle' },
              { label: 'Vencidas', value: '1', icon: 'warning' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-mustard-300">{item.icon}</span>
                  <span className="text-xs font-bold text-white/80">{item.label}</span>
                </div>
                <span className="text-lg font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tipos de Tarefa</h4>
          <div className="space-y-3">
            {[
              { name: 'Ligação de Follow-up', icon: 'call' },
              { name: 'Enviar Proposta', icon: 'description' },
              { name: 'Visita Técnica', icon: 'engineering' },
              { name: 'Reunião Comercial', icon: 'groups' },
            ].map((type) => (
              <div key={type.name} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-hover:text-mustard-600 dark:group-hover:text-mustard-400 text-[18px]">{type.icon}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-mustard-600 dark:group-hover:text-mustard-400">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksTab;

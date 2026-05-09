import React, { useState, useEffect, useMemo } from 'react';
import { crmService } from '../../../services/crm';
import { useAuth } from '../../../contexts/AuthContext';
import NewTaskModal from '../../../components/crm-modals/NewTaskModal';
import EditTaskModal from '../../../components/crm-modals/EditTaskModal';

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

const getTypeIcon = (typeName: string) => {
  if (typeName.includes('Ligação')) return 'call';
  if (typeName.includes('Proposta') || typeName.includes('E-mail')) return 'description';
  if (typeName.includes('Visita')) return 'engineering';
  if (typeName.includes('Reunião')) return 'groups';
  return 'task_alt';
};

const TasksTab: React.FC = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, typesRes] = await Promise.all([
        crmService.getTasks(),
        crmService.getTaskTypes()
      ]);
      setTasks(tasksRes);
      setTaskTypes(typesRes);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      pending: tasks.filter(t => t.status === 'Pendente').length,
      inProgress: tasks.filter(t => t.status === 'Em Andamento').length,
      completedToday: tasks.filter(t => {
        if (t.status !== 'Concluída' || !t.completed_at) return false;
        const compDate = new Date(t.completed_at);
        compDate.setHours(0, 0, 0, 0);
        return compDate.getTime() === today.getTime();
      }).length,
      overdue: tasks.filter(t => {
        if (t.status === 'Concluída' || t.status === 'Cancelada') return false;
        return new Date(t.due_date) < new Date();
      }).length
    };
  }, [tasks]);

  const canEdit = (task: any) => {
    if (profile?.access_level === 'Administrador' || profile?.access_level === 'Gerente') return true;
    return task.assigned_to === profile?.id;
  };

  const handleToggleStatus = async (e: React.MouseEvent, task: any) => {
    e.stopPropagation(); // Previne abrir o modal ao clicar no ícone de status
    if (!canEdit(task)) return;

    try {
      const nextStatus: Record<string, string> = {
        'Pendente': 'Em Andamento',
        'Em Andamento': 'Concluída',
        'Concluída': 'Pendente'
      };

      const newStatus = nextStatus[task.status] || 'Pendente';
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'Concluída') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      await crmService.updateTask(task.id, updateData);
      fetchTasks();
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-mustard-500/20 border-t-mustard-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <button 
              onClick={() => setIsNewTaskModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/10"
            >
              <span className="material-symbols-outlined text-[20px]">add_task</span>
              Nova Tarefa
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                <p className="text-slate-400 font-medium">Nenhuma tarefa agendada.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => handleTaskClick(task)}
                  className="px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group flex items-start gap-4 cursor-pointer"
                >
                  {/* Status Icon */}
                  <button 
                    onClick={(e) => handleToggleStatus(e, task)}
                    disabled={!canEdit(task)}
                    className={`mt-0.5 ${getStatusStyle(task.status)} ${!canEdit(task) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 transition-transform'}`}
                  >
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
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[14px]">{getTypeIcon(task.type?.name || '')}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{task.type?.name || 'Geral'}</span>
                          </div>
                          {task.deal && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[14px]">handshake</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[200px]">{task.deal.title}</span>
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
                          {task.assignee?.photo_url ? (
                            <img src={task.assignee.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-[8px] font-black text-mustard-700 dark:text-mustard-400">{(task.assignee?.full_name || '?').charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{task.assignee?.full_name || 'Não atribuído'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[14px]">event</span>
                        <span className={`text-[10px] font-bold ${task.status === 'Pendente' && new Date(task.due_date) < new Date() ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          {new Date(task.due_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar: Summary */}
      <div className="space-y-6">
        <div className="bg-mustard-500 rounded-3xl p-8 text-white shadow-xl shadow-mustard-500/20 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/5 text-9xl">task_alt</span>
          <h3 className="text-lg font-bold mb-1">Agenda Comercial</h3>
          <p className="text-mustard-100/60 text-xs uppercase tracking-widest font-bold mb-6">Resumo da Equipe</p>

          <div className="space-y-4 relative z-10">
            {[
              { label: 'Pendentes', value: stats.pending, icon: 'schedule' },
              { label: 'Em Andamento', value: stats.inProgress, icon: 'pending' },
              { label: 'Concluídas Hoje', value: stats.completedToday, icon: 'check_circle' },
              { label: 'Vencidas', value: stats.overdue, icon: 'warning' },
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
            {taskTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-hover:text-mustard-600 dark:group-hover:text-mustard-400 text-[18px]">{getTypeIcon(type.name)}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-mustard-600 dark:group-hover:text-mustard-400">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSuccess={fetchTasks}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={fetchTasks}
        task={selectedTask}
      />
    </div>
  );
};

export default TasksTab;

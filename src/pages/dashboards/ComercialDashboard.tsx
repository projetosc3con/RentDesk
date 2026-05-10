import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import EditTaskModal from '../../components/crm-modals/EditTaskModal';

interface ComercialDashboardData {
  tasks: any[];
  closedDeals: {
    totalValue: number;
    totalCount: number;
    userValue: number;
    userCount: number;
    userPercentage: number;
  };
  leadSources: { name: string; count: number }[];
  activities: any[];
}

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const ComercialDashboard: React.FC<{ data: ComercialDashboardData }> = ({ data }) => {
  const { tasks, closedDeals, leadSources, activities } = data;
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Edit Task State
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ── Calendar logic ──
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { day: number | null; tasks: any[] }[] = [];

    // Leading empties
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, tasks: [] });
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => {
        const taskDate = t.due_date ? t.due_date.substring(0, 10) : '';
        return taskDate === dateStr;
      });
      days.push({ day: d, tasks: dayTasks });
    }

    return days;
  }, [calendarDate, tasks]);

  const today = new Date();
  const isCurrentMonth = calendarDate.getFullYear() === today.getFullYear() && calendarDate.getMonth() === today.getMonth();

  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // ── Pie chart logic ──
  const totalLeads = leadSources.reduce((acc, s) => acc + s.count, 0);
  const pieSegments = useMemo(() => {
    if (totalLeads === 0) return [];
    let cumulative = 0;
    return leadSources.map((src, i) => {
      const pct = (src.count / totalLeads) * 100;
      const start = cumulative;
      cumulative += pct;
      return { ...src, pct, start, color: PIE_COLORS[i % PIE_COLORS.length] };
    });
  }, [leadSources, totalLeads]);

  // CSS conic-gradient for pie
  const pieGradient = useMemo(() => {
    if (pieSegments.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)';
    const stops = pieSegments.map(s => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(', ');
    return `conic-gradient(${stops})`;
  }, [pieSegments]);

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'bg-red-500';
      case 'Alta': return 'bg-amber-500';
      case 'Normal': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
    >
      {/* Row 1: Calendar + Deals KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-mustard-500 text-lg">calendar_month</span>
              Agenda de Tarefas
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 text-slate-400 hover:text-mustard-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[160px] text-center">
                {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 text-slate-400 hover:text-mustard-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isToday = isCurrentMonth && cell.day === today.getDate();
              return (
                <div
                  key={idx}
                  className={`min-h-[72px] rounded-xl p-1.5 border transition-colors ${cell.day === null
                    ? 'border-transparent'
                    : isToday
                      ? 'border-mustard-500 bg-mustard-50/50 dark:bg-mustard-500/5'
                      : 'border-slate-100 dark:border-slate-800 hover:border-mustard-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  {cell.day !== null && (
                    <>
                      <span className={`text-[11px] font-bold block mb-1 ${isToday ? 'text-mustard-600 dark:text-mustard-400' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        {cell.day}
                      </span>
                      <div className="space-y-0.5">
                        {cell.tasks.slice(0, 2).map((t: any) => (
                          <div 
                            key={t.id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                              setIsEditModalOpen(true);
                            }}
                            className="flex items-center gap-1 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded transition-colors" 
                            title={t.title}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getTaskPriorityColor(t.priority)}`} />
                            <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
                              {t.title}
                            </span>
                          </div>
                        ))}
                        {cell.tasks.length > 2 && (
                          <span className="text-[8px] font-black text-mustard-600 dark:text-mustard-400">
                            +{cell.tasks.length - 2} mais
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Deals KPI Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-mustard-500 rounded-2xl p-6 text-white shadow-xl shadow-mustard-500/20 relative overflow-hidden flex flex-col justify-between"
        >
          <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-white/5 text-[160px]">handshake</span>

          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">Negócios Fechados</h3>
            <p className="text-mustard-100/60 text-[10px] uppercase tracking-widest font-bold mb-6">Pipeline Ativo</p>

            <div className="space-y-5">
              <div>
                <p className="text-mustard-100/80 text-[10px] font-bold uppercase tracking-widest mb-1">Valor Total (seus deals)</p>
                <p className="text-3xl font-black tracking-tight">
                  {closedDeals.userValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-mustard-100/60 text-[9px] font-bold uppercase tracking-widest mb-1">Seus Deals</p>
                  <p className="text-2xl font-black">{closedDeals.userCount}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-mustard-100/60 text-[9px] font-bold uppercase tracking-widest mb-1">Participação</p>
                  <p className="text-2xl font-black">{closedDeals.userPercentage}%</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                <span className="text-mustard-100/80 text-[10px] font-bold uppercase tracking-widest">Total da Equipe</span>
                <span className="font-bold text-sm">
                  {closedDeals.totalCount} deals · {closedDeals.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Pie Chart + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources Pie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-mustard-500 text-lg">donut_large</span>
            Origem dos Leads
          </h3>

          <div className="flex flex-col items-center justify-center mb-6">
            <div
              className="w-40 h-40 rounded-full shadow-inner relative"
              style={{ background: pieGradient }}
            >
              <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalLeads}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Leads</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {pieSegments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center">Nenhum lead cadastrado.</p>
            ) : (
              pieSegments.map((src) => (
                <div key={src.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: src.color }} />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{src.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">{src.count}</span>
                    <span className="text-[9px] text-slate-400 font-bold">({Math.round(src.pct)}%)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Activities Timeline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-mustard-500 text-lg">history</span>
              Histórico de Atividades
            </h3>
          </div>

          <div className="flex flex-col space-y-6 max-h-[500px] overflow-y-auto p-4 custom-scrollbar">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400">Nenhuma atividade recente.</p>
              </div>
            ) : (
              activities.map((activity: any, index: number) => (
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
        </motion.div>
      </div>

      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
            window.location.reload();
          }}
          task={selectedTask}
        />
      )}
    </motion.div>
  );
};

export default ComercialDashboard;

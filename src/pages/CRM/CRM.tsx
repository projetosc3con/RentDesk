import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CRM: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const isComercial = profile?.access_level === 'Comercial';

  const tabs = [
    { id: 'pipeline', label: 'Pipeline', icon: 'view_kanban', path: '/crm/pipeline' },
    { id: 'leads', label: 'Leads', icon: 'person_search', path: '/crm/leads' },
    { id: 'contatos', label: 'Contatos', icon: 'contacts', path: '/crm/contatos' },
    { id: 'tarefas', label: 'Tarefas', icon: 'task_alt', path: '/crm/tarefas' },
    { id: 'configuracoes', label: 'Config.', icon: 'tune', path: '/crm/configuracoes' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Tabs Navigation - Hidden for Comercial profile */}
      {!isComercial && (
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) => `flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${isActive
                ? 'bg-mustard-500 text-white shadow-lg shadow-mustard-500/20'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CRM;

import React, { useState } from 'react';
import NewEmployeeIntegrationModal from '../../../components/hr-modals/NewEmployeeIntegrationModal';
import IntegrationTypeModal from '../../../components/hr-modals/IntegrationTypeModal';

const IntegrationsTab: React.FC = () => {
  const [isNewIntegrationOpen, setIsNewIntegrationOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const mockIntegrations = [
    { id: '1', employee: 'João Silva', client: 'Vale S.A.', type: 'Integração SST', date: '10/01/2026', expiry: '10/01/2027', status: 'Válida' },
    { id: '2', employee: 'Maria Santos', client: 'Petrobras', type: 'Segurança Industrial', date: '05/04/2025', expiry: '05/04/2026', status: 'Vencida' },
    { id: '3', employee: 'Pedro Oliveira', client: 'Gerdau', type: 'Integração Operacional', date: '15/03/2026', expiry: '15/09/2026', status: 'A Vencer' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-mustard-100 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-500 shadow-sm">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Controle de Integrações</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhamento de acessos e permissões em clientes.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsNewIntegrationOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/10"
          >
            <span className="material-symbols-outlined text-[20px]">add_moderator</span>
            Nova Integração
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Colaborador</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cliente / Obra</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tipo de Integração</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Validade</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockIntegrations.map((int) => (
                <tr key={int.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold">
                        {int.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{int.employee}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{int.client}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-slate-500 font-medium">{int.type}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{int.expiry}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Realizada em {int.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                      int.status === 'Válida' ? 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 border border-mustard-200 dark:border-mustard-500/20' :
                      int.status === 'Vencida' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20' :
                      'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                    }`}>
                      {int.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-500 dark:hover:text-mustard-400 hover:border-mustard-500 dark:hover:border-mustard-500 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Types Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Catálogo de Integrações</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure os tipos de integração exigidos por cada cliente.</p>
          </div>
          <button 
            onClick={() => setIsTypeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Novo Tipo
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['NR-10 (Elétrica)', 'NR-35 (Altura)', 'SST Geral', 'Direção Defensiva', 'Espaço Confinado'].map((type) => (
            <div key={type} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-mustard-200 dark:hover:border-mustard-500 transition-all">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{type}</span>
              <span className="text-[9px] bg-white dark:bg-slate-900 px-2 py-1 rounded-lg text-slate-400 dark:text-slate-500 font-bold group-hover:text-mustard-600 dark:group-hover:text-mustard-400 group-hover:border-mustard-200 dark:group-hover:border-mustard-500 border border-transparent dark:border-slate-700 transition-all">12 MESES</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <NewEmployeeIntegrationModal
        isOpen={isNewIntegrationOpen}
        onClose={() => setIsNewIntegrationOpen(false)}
      />

      <IntegrationTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
      />
    </div>
  );
};

export default IntegrationsTab;

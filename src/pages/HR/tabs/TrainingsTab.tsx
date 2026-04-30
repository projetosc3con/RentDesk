import React, { useState } from 'react';
import TrainingCatalogModal from '../../../components/hr-modals/TrainingCatalogModal';
import NewEmployeeTrainingModal from '../../../components/hr-modals/NewEmployeeTrainingModal';

const TrainingsTab: React.FC = () => {
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isNewTrainingOpen, setIsNewTrainingOpen] = useState(false);

  const mockTrainings = [
    { id: '1', employee: 'João Silva', training: 'Operação de Plataforma Elevatória (PTA)', date: '12/03/2026', workload: '8h', status: 'Válido' },
    { id: '2', employee: 'Maria Santos', training: 'Liderança e Gestão de Equipes', date: '20/02/2026', workload: '16h', status: 'Válido' },
    { id: '3', employee: 'Pedro Oliveira', training: 'Manutenção Preventiva de Motores', date: '10/01/2026', workload: '24h', status: 'Válido' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Training Catalog List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-mustard-500 text-lg">school</span>
              Catálogo de T&D
            </h3>
            <button 
              onClick={() => setIsCatalogModalOpen(true)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <div className="p-4 space-y-3">
            {[
              { name: 'NR-11 PTA', cat: 'Operação' },
              { name: 'NR-10 Elétrica', cat: 'Segurança' },
              { name: 'Gestão Ágil', cat: 'Gestão' },
              { name: 'Excel Avançado', cat: 'Técnico' },
              { name: 'Direção Defensiva', cat: 'Segurança' }
            ].map((t) => (
              <div key={t.name} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-mustard-200 dark:hover:border-mustard-500 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all group cursor-pointer">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase group-hover:text-mustard-600 dark:group-hover:text-mustard-400">{t.cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Training History */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Histórico de Capacitações</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Registro de todos os treinamentos concluídos pela equipe.</p>
            </div>
            <button 
              onClick={() => setIsNewTrainingOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/10"
            >
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
              Lançar Conclusão
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Colaborador</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Treinamento</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Conclusão</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Carga Horária</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Certificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockTrainings.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t.employee}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t.training}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-500 dark:text-slate-500 font-bold">{t.date}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400">{t.workload}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-mustard-600 hover:underline text-xs font-bold flex items-center justify-end gap-1 ml-auto">
                        <span className="material-symbols-outlined text-sm">download</span>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investment Summary Mock */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-mustard-50 dark:bg-mustard-500/10 rounded-full flex items-center justify-center text-mustard-600 dark:text-mustard-400">
              <span className="material-symbols-outlined text-4xl">analytics</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Resumo de Treinamento e Desenvolvimento</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Métricas acumuladas do trimestre atual.</p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Horas Treinadas</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">342h</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Investimento</p>
              <p className="text-xl font-black text-mustard-600 dark:text-mustard-400">R$ 12.450,00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TrainingCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
      />

      <NewEmployeeTrainingModal
        isOpen={isNewTrainingOpen}
        onClose={() => setIsNewTrainingOpen(false)}
      />
    </div>
  );
};

export default TrainingsTab;

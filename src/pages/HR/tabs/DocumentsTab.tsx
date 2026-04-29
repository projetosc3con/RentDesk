import React, { useState } from 'react';
import UploadDocumentModal from '../../../components/hr-modals/UploadDocumentModal';
import DocumentTypeModal from '../../../components/hr-modals/DocumentTypeModal';

const DocumentsTab: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const mockDocuments = [
    { id: '1', employee: 'João Silva', type: 'CNH - Categoria D', expiry: '20/05/2026', status: 'A Vencer' },
    { id: '2', employee: 'Maria Santos', type: 'ASO - Periódico', expiry: '10/04/2026', status: 'Vencido' },
    { id: '3', employee: 'Pedro Oliveira', type: 'CTPS', expiry: '-', status: 'Válido' },
    { id: '4', employee: 'Ana Costa', type: 'Certificado NR-35', expiry: '15/12/2027', status: 'Válido' },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Documentos', value: '142', icon: 'folder', color: 'bg-blue-500' },
          { label: 'Vencidos', value: '12', icon: 'error', color: 'bg-red-500' },
          { label: 'A Vencer (30 dias)', value: '8', icon: 'warning', color: 'bg-amber-500' },
          { label: 'Pendentes Envio', value: '5', icon: 'pending', color: 'bg-slate-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-current/20`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-emerald-900 text-xl">folder_shared</span>
                Documentação de Colaboradores
              </h3>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-emerald-900 transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  Lançar Documento
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{doc.employee}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600">{doc.type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-slate-500">{doc.expiry}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          doc.status === 'Válido' ? 'bg-emerald-100 text-emerald-700' :
                          doc.status === 'Vencido' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-300 hover:text-emerald-900 transition-colors">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Config: Document Types */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-emerald-900 text-xl">settings</span>
                Tipos de Documento
              </h3>
              <button 
                onClick={() => setIsTypeModalOpen(true)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {['CNH', 'ASO', 'CTPS', 'Certificado NR', 'RG/CPF'].map((type) => (
                <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-sm group-hover:text-emerald-600">article</span>
                    <span className="text-xs font-bold text-slate-700">{type}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <UploadDocumentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <DocumentTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
      />
    </div>
  );
};

export default DocumentsTab;

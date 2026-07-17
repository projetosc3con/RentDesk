import React, { useState, useEffect } from 'react';
import UploadDocumentModal from '../../../components/hr-modals/UploadDocumentModal';
import DocumentTypeModal from '../../../components/hr-modals/DocumentTypeModal';
import api from '../../../services/api';

const DocumentsTab: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<any>(null);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [employeeDocuments, setEmployeeDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, docsRes] = await Promise.all([
        api.get('/hr/document-types'),
        api.get('/hr/employee-documents')
      ]);
      setDocumentTypes(typesRes.data);
      setEmployeeDocuments(docsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    total: employeeDocuments.length,
    vencidos: employeeDocuments.filter(d => d.status === 'Vencido').length,
    aVencer: employeeDocuments.filter(d => d.status === 'A Vencer').length,
    pendentes: employeeDocuments.filter(d => d.status === 'Pendente').length,
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Documentos', value: stats.total, icon: 'folder', color: 'bg-blue-500' },
          { label: 'Vencidos', value: stats.vencidos, icon: 'error', color: 'bg-red-500' },
          { label: 'A Vencer (30 dias)', value: stats.aVencer, icon: 'warning', color: 'bg-amber-500' },
          { label: 'Pendentes Envio', value: stats.pendentes, icon: 'pending', color: 'bg-slate-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-mustard-500 text-xl">folder_shared</span>
                Documentação de Colaboradores
              </h3>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-mustard-500 transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  Lançar Documento
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Colaborador</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Documento</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vencimento</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Carregando documentos...
                      </td>
                    </tr>
                  ) : employeeDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Nenhum documento de colaborador encontrado.
                      </td>
                    </tr>
                  ) : (
                    employeeDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.employee}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-600 dark:text-slate-400">{doc.type}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-500">{doc.expiry}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${doc.status === 'Válido' ? 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400' :
                              doc.status === 'Vencido' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                                'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className={`p-2 transition-colors ${doc.file_url ? 'text-slate-300 dark:text-slate-600 hover:text-mustard-500' : 'text-slate-200 dark:text-slate-700 cursor-not-allowed opacity-50'}`}
                            onClick={() => doc.file_url && window.open(doc.file_url, '_blank')}
                            title={doc.file_url ? "Visualizar Documento" : "Documento não anexado"}
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Config: Document Types */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-mustard-500 text-xl">settings</span>
                Tipos de Documento
              </h3>
              <button
                onClick={() => {
                  setSelectedDocumentType(null);
                  setIsTypeModalOpen(true);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="text-center py-6 text-xs text-slate-500">Carregando tipos...</div>
              ) : documentTypes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 italic">Nenhum tipo de documento cadastrado.</div>
              ) : documentTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl group hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-sm group-hover:text-mustard-600 dark:group-hover:text-mustard-400">article</span>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{type.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {type.mandatory && (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Obrigatório</span>
                        )}
                        {type.requires_expiry && (
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Tem Validade</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDocumentType(type);
                      setIsTypeModalOpen(true);
                    }}
                    className="p-1"
                  >
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <UploadDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />

      <DocumentTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => {
          setIsTypeModalOpen(false);
          setSelectedDocumentType(null);
          fetchData();
        }}
        initialData={selectedDocumentType}
      />
    </div>
  );
};

export default DocumentsTab;

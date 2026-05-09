import React, { useState, useEffect } from 'react';
import { crmService, type CRMLead } from '../../../services/crm';
import NewLeadModal from '../../../components/crm-modals/NewLeadModal';
import EditLeadModal from '../../../components/crm-modals/EditLeadModal';
import ConvertLeadModal from '../../../components/crm-modals/ConvertLeadModal';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Novo': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
    case 'Em Contato': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
    case 'Qualificado': return 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 border-mustard-100 dark:border-mustard-500/20';
    case 'Desqualificado': return 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-100 dark:border-red-500/20';
    case 'Convertido': return 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20';
    default: return 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700';
  }
};

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'Indicação': return 'recommend';
    case 'Site': return 'language';
    case 'Evento': return 'event';
    case 'Cold Call': return 'call';
    case 'Rede Social': return 'share';
    case 'Parceiro': return 'handshake';
    default: return 'more_horiz';
  }
};

const LeadsTab: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<(CRMLead & { owner_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem('rentdesk_leads_view_mode') as 'list' | 'grid') || 'list';
  });

  useEffect(() => {
    localStorage.setItem('rentdesk_leads_view_mode', viewMode);
  }, [viewMode]);

  const canManageLead = (leadOwnerId: string | undefined) => {
    if (profile?.access_level === 'Comercial') {
      return user?.id === leadOwnerId;
    }
    return true; // Admin and others can manage all
  };

  const fetchLeads = async () => {
    try {
      const data = await crmService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.segment && lead.segment.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`flex flex-col lg:grid ${profile?.access_level === 'Comercial' ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-8`}>
      {/* 1. Mobile Search & Action (New Section) */}
      <div className="lg:hidden space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Pesquisar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 text-sm dark:text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['Todos', 'Novo', 'Em Contato', 'Qualificado', 'Convertido'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === status ? 'bg-mustard-500 text-white shadow-lg shadow-mustard-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Mobile View Toggle */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-1 w-full">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-mustard-600 dark:text-mustard-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
              Lista
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-mustard-600 dark:text-mustard-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              Cards
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 bg-mustard-500 hover:bg-mustard-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-mustard-500/20"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Novo Lead
          </button>
        </div>
      </div>

      {/* 2. Main: Leads Table */}
      <div className={`${profile?.access_level === 'Comercial' ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-6 order-2 lg:order-2`}>

        {/* Desktop Header & Filters (Outside Table Card) */}
        <div className="hidden lg:flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-600 dark:text-mustard-400 shadow-sm">
              <span className="material-symbols-outlined text-3xl">person_search</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Leads Cadastrados</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Empresas em prospecção e qualificação comercial.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-mustard-600 dark:text-mustard-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Visualização em Lista"
              >
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-mustard-600 dark:text-mustard-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Visualização em Cards"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 text-xs dark:text-white w-48 transition-all"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-mustard-500 hover:bg-mustard-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-mustard-500/20"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Novo Lead
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-mustard-500/10 border-t-mustard-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando leads...</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Empresa</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:table-cell">Segmento</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:table-cell">Origem</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Potencial</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-mustard-500 dark:group-hover:text-mustard-400 transition-colors">{lead.company_name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{lead.owner_name} • {new Date(lead.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6 hidden md:table-cell">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{lead.segment || '—'}</span>
                        </td>
                        <td className="px-8 py-6 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[16px]">{getSourceIcon(lead.source || '')}</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{lead.source}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-black text-mustard-600 dark:text-mustard-400">
                            {Number(lead.estimated_potential).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canManageLead(lead.owner_id) ? (
                              <>
                                <button
                                  onClick={() => { setSelectedLead(lead); setIsEditModalOpen(true); }}
                                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 hover:border-mustard-300 dark:hover:border-mustard-500 transition-all flex items-center justify-center"
                                  title="Editar Lead"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                {lead.status !== 'Convertido' && (
                                  <button
                                    onClick={() => { setSelectedLead(lead); setIsConvertModalOpen(true); }}
                                    className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-500 transition-all flex items-center justify-center"
                                    title="Converter em Cliente"
                                  >
                                    <span className="material-symbols-outlined text-sm">published_with_changes</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">Somente Leitura</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">Nenhum lead encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <div key={lead.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border mb-3 ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-mustard-500 transition-colors">{lead.company_name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{lead.segment || 'Sem segmento definido'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Responsável</span>
                        <span className="font-medium">{lead.owner_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Potencial</span>
                        <span className="font-black text-mustard-600 dark:text-mustard-400">
                          {Number(lead.estimated_potential).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">{getSourceIcon(lead.source || '')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Origem</span>
                        <span className="font-medium">{lead.source}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                    {canManageLead(lead.owner_id) ? (
                      <>
                        <button
                          onClick={() => { setSelectedLead(lead); setIsEditModalOpen(true); }}
                          className="flex-1 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs hover:text-mustard-600 dark:hover:text-mustard-400 hover:border-mustard-300 dark:hover:border-mustard-500 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Editar
                        </button>
                        {lead.status !== 'Convertido' && (
                          <button
                            onClick={() => { setSelectedLead(lead); setIsConvertModalOpen(true); }}
                            className="flex-1 py-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 font-bold text-xs hover:bg-green-100 dark:hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
                            Converter
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Somente Leitura</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">
                Nenhum lead encontrado.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Sidebar: Lead Sources & Stats */}
      {profile?.access_level !== 'Comercial' && (
        <div className="lg:col-span-1 space-y-6 order-3 lg:order-1">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Origens dos Leads</h4>
            <div className="space-y-3">
              {['Indicação', 'Site', 'Evento', 'Cold Call', 'Parceiro', 'Rede Social'].map((source) => (
                <div key={source} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-hover:text-mustard-600 dark:group-hover:text-mustard-400 text-[18px]">{getSourceIcon(source)}</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-mustard-600 dark:group-hover:text-mustard-400">{source}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                    {leads.filter(l => l.source === source).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <NewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLeads}
      />

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedLead(null); }}
        onSuccess={fetchLeads}
        lead={selectedLead}
      />

      <ConvertLeadModal
        isOpen={isConvertModalOpen}
        onClose={() => { setIsConvertModalOpen(false); setSelectedLead(null); }}
        onSuccess={(client) => {
          fetchLeads();
          if (confirm('Lead convertido com sucesso! Deseja acessar o cadastro do cliente agora?')) {
            navigate(`/clientes/${client.id}`);
          }
        }}
        lead={selectedLead}
      />
    </div>
  );
};

export default LeadsTab;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import UploadDocumentModal from '../../components/hr-modals/UploadDocumentModal';

const TABS = [
  { id: 'perfil', label: 'Perfil', icon: 'person' },
  { id: 'documentacao', label: 'Documentação', icon: 'description' },
  { id: 'folha-de-ponto', label: 'Folha de Ponto', icon: 'schedule' },
  { id: 'ferias', label: 'Férias', icon: 'beach_access' },
  { id: 'epis', label: 'EPIs', icon: 'health_and_safety' },
];

const EmployeeDocumentsTab: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const [data, setData] = useState<{ checklist: any[]; uploadedDocs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string>('');

  const fetchDocs = async () => {
    try {
      const res = await api.get(`/hr/employees/${employeeId}/documents`);
      setData(res.data);
    } catch (error) {
      console.error('Error fetching employee documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Checklist */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-mustard-500 text-xl">fact_check</span>
            Documentos Obrigatórios do Cargo
          </h3>
        </div>
        <div className="p-0">
          {!data?.checklist || data.checklist.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhum documento obrigatório vinculado ao cargo atual.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.checklist.map((item: any) => (
                <div key={item.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className={`material-symbols-outlined text-[24px] ${item.uploaded ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
                      {item.uploaded ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.mandatory && (
                      <span className="px-2.5 py-1 bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        Obrigatório
                      </span>
                    )}
                    {!item.uploaded && (
                      <button
                        onClick={() => {
                          setSelectedDocTypeId(item.id);
                          setUploadModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-mustard-500 hover:text-white transition-colors"
                      >
                        Anexar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-mustard-500 text-xl">folder_open</span>
            Documentos Anexados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-black">Tipo de Documento</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black">Data de Vencimento</th>
                <th className="px-6 py-4 font-black">Data de Inclusão</th>
                <th className="px-6 py-4 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!data?.uploadedDocs || data.uploadedDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Nenhum documento anexado.
                  </td>
                </tr>
              ) : (
                data.uploadedDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.type_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${doc.status === 'Válido' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        doc.status === 'Vencido' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                          'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-500">
                        {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className={`p-2 transition-colors ${doc.file_url ? 'text-slate-300 dark:text-slate-600 hover:text-mustard-500' : 'text-slate-200 dark:text-slate-700 cursor-not-allowed opacity-50'}`}
                        onClick={() => doc.file_url && window.open(doc.file_url, '_blank')}
                        title={doc.file_url ? "Visualizar Documento" : "Documento não anexado"}
                        disabled={!doc.file_url}
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

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        initialEmployeeId={employeeId}
        initialDocTypeId={selectedDocTypeId}
        onSuccess={() => {
          setUploadModalOpen(false);
          fetchDocs();
        }}
      />
    </div>
  );
};

// ============================================================
// FOLHA DE PONTO TAB
// ============================================================
const STATUS_TIMESHEET_COLORS: Record<string, string> = {
  'Gerada': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  'Aprovada': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Contestada': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
};

const EmployeeTimesheetTab: React.FC<{
  employeeId: string;
  viewerProfile: any;
  isOwnProfile: boolean;
}> = ({ employeeId, viewerProfile, isOwnProfile }) => {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [timeRecords, setTimeRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Generate report modal state (RH/Admin only)
  const canGenerate = ['Administrador', 'Gerente', 'Recursos Humanos'].includes(viewerProfile?.access_level);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genForm, setGenForm] = useState({ period_start: '', period_end: '', notes: '' });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Status update state (own profile only)
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [contestModal, setContestModal] = useState<{ id: string } | null>(null);
  const [contestNotes, setContestNotes] = useState('');

  const fetchTimesheets = () => {
    api.get(`/hr/employees/${employeeId}/timesheets`)
      .then(r => setTimesheets(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTimesheets(); }, [employeeId]);

  useEffect(() => {
    setRecordsLoading(true);
    api.get(`/hr/employees/${employeeId}/time-records?month=${selectedMonth}&year=${selectedYear}`)
      .then(r => setTimeRecords(r.data))
      .catch(e => console.error(e))
      .finally(() => setRecordsLoading(false));
  }, [employeeId, selectedMonth, selectedYear]);

  const handleGenerate = async () => {
    if (!genForm.period_start || !genForm.period_end) {
      setGenError('Preencha o período completo.'); return;
    }
    if (genForm.period_start > genForm.period_end) {
      setGenError('A data de início deve ser anterior à data de fim.'); return;
    }
    setGenerating(true);
    setGenError(null);
    try {
      await api.post(`/hr/employees/${employeeId}/timesheets`, genForm);
      setShowGenerateModal(false);
      setGenForm({ period_start: '', period_end: '', notes: '' });
      setLoading(true);
      fetchTimesheets();
    } catch (e: any) {
      setGenError(e?.response?.data?.error || 'Erro ao gerar folha.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (tsId: string) => {
    setUpdatingId(tsId);
    try {
      await api.patch(`/hr/timesheets/${tsId}/status`, { status: 'Aprovada' });
      setTimesheets(prev => prev.map(t => t.id === tsId ? { ...t, status: 'Aprovada' } : t));
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Erro ao aprovar.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleContest = async () => {
    if (!contestModal) return;
    setUpdatingId(contestModal.id);
    try {
      await api.patch(`/hr/timesheets/${contestModal.id}/status`, { status: 'Contestada', notes: contestNotes || undefined });
      setTimesheets(prev => prev.map(t => t.id === contestModal.id ? { ...t, status: 'Contestada' } : t));
      setContestModal(null);
      setContestNotes('');
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Erro ao contestar.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Group records by date
  const recordsByDate = timeRecords.reduce((acc: any, rec: any) => {
    const d = rec.record_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(rec);
    return acc;
  }, {});

  const RECORD_TYPE_COLORS: Record<string, string> = {
    'Entrada': 'text-emerald-600 dark:text-emerald-400',
    'Saída Almoço': 'text-amber-600 dark:text-amber-400',
    'Retorno Almoço': 'text-blue-600 dark:text-blue-400',
    'Saída': 'text-red-600 dark:text-red-400',
  };

  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
  ];
  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  if (loading) return (
    <div className="space-y-4">
      <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Folhas Geradas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-mustard-500 text-xl">summarize</span>
            Folhas de Ponto Geradas
          </h3>
          {canGenerate && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Gerar Folha de Ponto
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-black">Período</th>
                <th className="px-6 py-4 font-black">Dias Trabalhados</th>
                <th className="px-6 py-4 font-black">Total de Horas</th>
                <th className="px-6 py-4 font-black">H. Extras</th>
                <th className="px-6 py-4 font-black">Faltas</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black">Gerada por</th>
                <th className="px-6 py-4 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {timesheets.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-500 text-sm">Nenhuma folha de ponto gerada.</td></tr>
              ) : timesheets.map((ts: any) => (
                <tr key={ts.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {new Date(ts.period_start + 'T00:00:00').toLocaleDateString('pt-BR')} — {new Date(ts.period_end + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </td>
                  <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{ts.total_days_worked} dias</p></td>
                  <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{Number(ts.total_hours_worked).toFixed(1)}h</p></td>
                  <td className="px-6 py-4"><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{Number(ts.total_overtime_hours).toFixed(1)}h</p></td>
                  <td className="px-6 py-4"><p className="text-sm font-semibold text-red-600 dark:text-red-400">{ts.total_absence_days}</p></td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${STATUS_TIMESHEET_COLORS[ts.status] || STATUS_TIMESHEET_COLORS['Gerada']}`}>{ts.status}</span>
                  </td>
                  <td className="px-6 py-4"><p className="text-xs text-slate-500">{ts.generated_by_profile?.full_name || '-'}</p></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Owner can approve or contest a Gerada timesheet */}
                      {isOwnProfile && ts.status === 'Gerada' && (
                        <>
                          <button
                            onClick={() => handleApprove(ts.id)}
                            disabled={updatingId === ts.id}
                            title="Aprovar folha"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Aprovar
                          </button>
                          <button
                            onClick={() => { setContestModal({ id: ts.id }); setContestNotes(''); }}
                            disabled={updatingId === ts.id}
                            title="Contestar folha"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">error</span>
                            Contestar
                          </button>
                        </>
                      )}
                      {ts.file_url && (
                        <button onClick={() => window.open(ts.file_url, '_blank')} className="p-2 text-slate-400 hover:text-mustard-500 transition-colors" title="Visualizar PDF">
                          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registros de Ponto por Mês */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-mustard-500 text-xl">punch_clock</span>
            Registros do Período
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="p-6">
          {recordsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
            </div>
          ) : Object.keys(recordsByDate).length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-8">Nenhum registro neste período.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(recordsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, records]: [string, any]) => (
                  <div key={date} className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-24 shrink-0">
                      {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                    </p>
                    <div className="flex flex-wrap gap-3 flex-1">
                      {(records as any[]).map((rec: any) => (
                        <div key={rec.id} className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-sm ${RECORD_TYPE_COLORS[rec.record_type] || 'text-slate-500'}`}>fiber_manual_record</span>
                          <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${RECORD_TYPE_COLORS[rec.record_type] || 'text-slate-500'}`}>{rec.record_type}</p>
                            <p className="text-xs font-mono text-slate-700 dark:text-slate-200">
                              {new Date(rec.recorded_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {rec.origin === 'Manual' && (
                            <span className="ml-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[9px] font-black uppercase" title={rec.justification}>Manual</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowGenerateModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Gerar Folha de Ponto</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A folha será calculada automaticamente com base nos registros de ponto do colaborador no período selecionado.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Início do Período *</p>
                  <input
                    type="date"
                    value={genForm.period_start}
                    onChange={e => setGenForm(p => ({ ...p, period_start: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fim do Período *</p>
                  <input
                    type="date"
                    value={genForm.period_end}
                    onChange={e => setGenForm(p => ({ ...p, period_end: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Observações</p>
                <textarea
                  rows={2}
                  value={genForm.notes}
                  onChange={e => setGenForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Opcional..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500"
                />
              </div>
              {genError && (
                <p className="text-red-500 text-xs font-medium">{genError}</p>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 py-3 bg-mustard-500 text-white rounded-xl font-bold text-sm hover:bg-mustard-600 transition-all disabled:opacity-50"
              >
                {generating ? 'Gerando...' : 'Gerar Folha'}
              </button>
              <button onClick={() => setShowGenerateModal(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Contest Modal */}
      {contestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setContestModal(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Contestar Folha de Ponto</h3>
              <button onClick={() => setContestModal(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Informe o motivo da contestação (opcional):</p>
              <textarea
                rows={3}
                value={contestNotes}
                onChange={e => setContestNotes(e.target.value)}
                placeholder="Ex.: Divergência nos horários de entrada do dia 10..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              />
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button
                onClick={handleContest}
                disabled={updatingId === contestModal.id}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {updatingId === contestModal.id ? 'Salvando...' : 'Confirmar Contestação'}
              </button>
              <button onClick={() => setContestModal(null)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// FÉRIAS TAB
// ============================================================
const STATUS_VACATION_COLORS: Record<string, string> = {
  'Pendente': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Em Aprovação': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'Aprovada': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Rejeitada': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  'Cancelada': 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
};

const EmployeeVacationTab: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    entitlement_period_start: '', entitlement_period_end: '',
    total_entitled_days: 30, installments_count: 1, days_sold: 0,
    notes: '',
    installments: [{ start_date: '', end_date: '', duration_days: 30 }],
  });
  const [saving, setSaving] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    api.get(`/hr/employees/${employeeId}/vacation-requests`)
      .then(r => setRequests(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [employeeId]);

  const totalDaysRequested = form.installments.reduce((s, i) => s + (Number(i.duration_days) || 0), 0);

  const handleInstallmentChange = (idx: number, field: string, value: string | number) => {
    setForm(prev => {
      const inst = [...prev.installments];
      inst[idx] = { ...inst[idx], [field]: value };
      return { ...prev, installments: inst };
    });
  };

  const handleInstallmentCountChange = (count: number) => {
    const current = form.installments;
    const next = Array.from({ length: count }, (_, i) => current[i] || { start_date: '', end_date: '', duration_days: 15 });
    setForm(prev => ({ ...prev, installments_count: count, installments: next }));
  };

  const handleSave = async () => {
    if (!form.entitlement_period_start || !form.entitlement_period_end) {
      alert('Preencha o período aquisitivo.'); return;
    }
    if (totalDaysRequested + Number(form.days_sold) > form.total_entitled_days) {
      alert('Total de dias solicitados + vendidos excede o direito.'); return;
    }
    setSaving(true);
    try {
      await api.post(`/hr/employees/${employeeId}/vacation-requests`, {
        user_id: employeeId,
        ...form,
        total_days_requested: totalDaysRequested,
      });
      setShowModal(false);
      fetchRequests();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1, 2].map(i => <div key={i} className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-mustard-500">beach_access</span>
          Histórico de Férias
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nova Solicitação
        </button>
      </div>

      {/* Requests */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">beach_access</span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma solicitação de férias registrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Período Aquisitivo</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {new Date(req.entitlement_period_start + 'T00:00:00').toLocaleDateString('pt-BR')} → {new Date(req.entitlement_period_end + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{req.total_days_requested} dias de descanso</span>
                  {req.days_sold > 0 && <span className="text-xs text-amber-600 dark:text-amber-400">{req.days_sold} dias vendidos</span>}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_VACATION_COLORS[req.status] || ''}`}>{req.status}</span>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(req.installments || []).sort((a: any, b: any) => a.installment_number - b.installment_number).map((inst: any) => (
                  <div key={inst.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-black text-mustard-500 uppercase tracking-widest mb-2">{inst.installment_number}ª Parcela</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {new Date(inst.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} → {new Date(inst.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{inst.duration_days} dias</p>
                  </div>
                ))}
              </div>
              {(req.approvals || []).length > 0 && (
                <div className="px-5 pb-5">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Aprovações</p>
                  <div className="flex flex-wrap gap-2">
                    {req.approvals.map((ap: any) => (
                      <span key={ap.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${ap.status === 'Aprovado' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ap.status === 'Rejeitado' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <span className="material-symbols-outlined text-[14px]">{ap.status === 'Aprovado' ? 'check_circle' : ap.status === 'Rejeitado' ? 'cancel' : 'schedule'}</span>
                        {ap.approver?.full_name || 'Aprovador'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {req.rejection_reason && (
                <div className="mx-5 mb-5 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400"><span className="font-black">Motivo:</span> {req.rejection_reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Nova Solicitação de Férias</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Início Período Aquisitivo</p>
                  <input type="date" value={form.entitlement_period_start} onChange={e => setForm(p => ({ ...p, entitlement_period_start: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fim Período Aquisitivo</p>
                  <input type="date" value={form.entitlement_period_end} onChange={e => setForm(p => ({ ...p, entitlement_period_end: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direito (dias)</p>
                  <input type="number" min={1} max={30} value={form.total_entitled_days} onChange={e => setForm(p => ({ ...p, total_entitled_days: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parcelas</p>
                  <select value={form.installments_count} onChange={e => handleInstallmentCountChange(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none">
                    {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dias Vendidos</p>
                  <input type="number" min={0} max={10} value={form.days_sold} onChange={e => setForm(p => ({ ...p, days_sold: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Parcelas</p>
                <div className="space-y-3">
                  {form.installments.map((inst, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <p className="text-[10px] font-black text-mustard-500 uppercase tracking-widest">{idx + 1}ª Parcela</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-1">Início</p>
                          <input type="date" value={inst.start_date} onChange={e => handleInstallmentChange(idx, 'start_date', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-1">Fim</p>
                          <input type="date" value={inst.end_date} onChange={e => handleInstallmentChange(idx, 'end_date', e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold mb-1">Dias</p>
                          <input type="number" min={5} value={inst.duration_days} onChange={e => handleInstallmentChange(idx, 'duration_days', Number(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Observações</p>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500" />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-sm">
                <span className="text-slate-500">Total dias descanso:</span>
                <span className={`font-bold ${totalDaysRequested + form.days_sold > form.total_entitled_days ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {totalDaysRequested} dias
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-mustard-500 text-white rounded-xl font-bold text-sm hover:bg-mustard-600 transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : 'Enviar Solicitação'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// EPI TAB
// ============================================================
const EmployeeEpiTab: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<{
    delivery_date: string;
    notes: string;
    file_url: string;
    file_name: string;
    items: { epi_id: string; quantity: number; notes: string }[];
  }>({
    delivery_date: '',
    notes: '',
    file_url: '',
    file_name: '',
    items: [],
  });

  const fetchRecords = () => {
    setLoading(true);
    api.get(`/hr/employees/${employeeId}/epi-records`)
      .then(r => setRecords(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
    api.get('/hr/epi-catalog').then(r => setCatalog(r.data)).catch(console.error);
  }, [employeeId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${form.delivery_date || new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`;
      const filePath = `${employeeId}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('hr-epi-records').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = await supabase.storage.from('hr-epi-records').createSignedUrl(filePath, 3600);
      setForm(p => ({ ...p, file_url: data?.signedUrl || '', file_name: file.name }));
    } catch (err) {
      console.error(err);
      alert('Erro ao fazer upload do arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const toggleEpi = (epi_id: string) => {
    setForm(prev => {
      const exists = prev.items.find(i => i.epi_id === epi_id);
      if (exists) return { ...prev, items: prev.items.filter(i => i.epi_id !== epi_id) };
      return { ...prev, items: [...prev.items, { epi_id, quantity: 1, notes: '' }] };
    });
  };

  const handleSave = async () => {
    if (!form.delivery_date) { alert('Informe a data de entrega.'); return; }
    if (!form.file_url) { alert('Faça o upload da ficha de EPI assinada.'); return; }
    setSaving(true);
    try {
      await api.post(`/hr/employees/${employeeId}/epi-records`, form);
      setShowModal(false);
      setForm({ delivery_date: '', notes: '', file_url: '', file_name: '', items: [] });
      fetchRecords();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1, 2].map(i => <div key={i} className="w-full h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-mustard-500">health_and_safety</span>
          Fichas de EPI
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20"
        >
          <span className="material-symbols-outlined text-sm">attach_file</span>
          Anexar Ficha de EPI
        </button>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">health_and_safety</span>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma ficha de EPI registrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec: any) => (
            <div key={rec.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data de Entrega</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {new Date(rec.delivery_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">por {rec.uploaded_by_profile?.full_name || '-'}</span>
                  {rec.file_url && (
                    <button onClick={() => window.open(rec.file_url, '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 rounded-lg text-xs font-bold hover:bg-mustard-100 transition-colors">
                      <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                      Ver Ficha
                    </button>
                  )}
                </div>
              </div>
              {(rec.items || []).length > 0 && (
                <div className="p-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">EPIs Entregues</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.items.map((item: any) => (
                      <span key={item.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="material-symbols-outlined text-sm text-mustard-500">verified_user</span>
                        {item.epi?.name}
                        {item.quantity > 1 && <span className="text-slate-400 ml-1">×{item.quantity}</span>}
                        {item.epi?.ca_number && <span className="text-slate-400 font-normal">· CA {item.epi.ca_number}</span>}
                      </span>
                    ))}
                  </div>
                  {rec.notes && <p className="mt-3 text-xs text-slate-500 italic">{rec.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Anexar Ficha de EPI</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data de Entrega *</p>
                <input type="date" value={form.delivery_date} onChange={e => setForm(p => ({ ...p, delivery_date: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500" />
              </div>

              {/* File Upload */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ficha Assinada (PDF) *</p>
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-500 hover:border-mustard-400 hover:text-mustard-500 transition-all"
                >
                  <span className="material-symbols-outlined">{uploading ? 'hourglass_empty' : 'upload_file'}</span>
                  {uploading ? 'Fazendo upload...' : form.file_name ? form.file_name : 'Selecionar PDF'}
                </button>
                {form.file_url && !uploading && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Arquivo carregado com sucesso
                  </p>
                )}
              </div>

              {/* EPIs do catálogo */}
              {catalog.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">EPIs Entregues (selecione)</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {catalog.map((epi: any) => {
                      const selected = form.items.find(i => i.epi_id === epi.id);
                      return (
                        <button
                          key={epi.id}
                          onClick={() => toggleEpi(epi.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all text-sm ${selected
                              ? 'border-mustard-400 bg-mustard-50 dark:bg-mustard-500/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-mustard-300'
                            }`}
                        >
                          <span className={`material-symbols-outlined text-sm ${selected ? 'text-mustard-500' : 'text-slate-400'}`}>
                            {selected ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{epi.name}</p>
                            {epi.ca_number && <p className="text-[10px] text-slate-400">CA {epi.ca_number}</p>}
                          </div>
                          {selected && (
                            <input
                              type="number" min={1} value={selected.quantity}
                              onClick={e => e.stopPropagation()}
                              onChange={e => setForm(prev => ({ ...prev, items: prev.items.map(i => i.epi_id === epi.id ? { ...i, quantity: Number(e.target.value) } : i) }))}
                              className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold outline-none"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Observações</p>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Ex.: Substituição por desgaste, Admissão..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button onClick={handleSave} disabled={saving || uploading} className="flex-1 py-3 bg-mustard-500 text-white rounded-xl font-bold text-sm hover:bg-mustard-600 transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar Ficha'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile: viewerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Inline editing states
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [personalForm, setPersonalForm] = useState<any>({});
  const [addressForm, setAddressForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/hr/employees/${id}`);
        setEmployee(res.data);
      } catch (error) {
        console.error('Error fetching employee:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEmployee();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const startEditPersonal = () => {
    setPersonalForm({
      full_name: employee.full_name || '',
      cpf: employee.cpf || '',
      birth_date: employee.birth_date || '',
      phone: employee.phone || '',
    });
    setEditingPersonal(true);
  };

  const startEditAddress = () => {
    setAddressForm({
      address_street: employee.address_street || '',
      address_number: employee.address_number || '',
      address_complement: employee.address_complement || '',
      address_city: employee.address_city || '',
      address_state: employee.address_state || '',
      address_zip: employee.address_zip || '',
    });
    setEditingAddress(true);
  };

  const handleSave = async (section: 'personal' | 'address') => {
    setSaving(true);
    try {
      const payload = section === 'personal' ? personalForm : addressForm;
      const res = await api.put(`/hr/employees/${id}`, payload);
      setEmployee((prev: any) => ({ ...prev, ...res.data }));
      if (section === 'personal') setEditingPersonal(false);
      else setEditingAddress(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Erro ao salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setPhotoLoading(true);
    try {
      // 1. Upload to Storage (same bucket/pattern as Profile.tsx)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update in DB via existing users API
      await api.put(`/users/${id}`, { photo_url: publicUrl });

      // 4. Update local state
      setEmployee((prev: any) => ({ ...prev, photo_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erro ao carregar a foto.');
    } finally {
      setPhotoLoading(false);
      // Reset input so re-selecting the same file triggers onChange
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          <div className="w-48 h-5 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-700 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-8 pb-20">
        <button onClick={() => navigate('/rh/cargos')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-mustard-500 transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar ao RH
        </button>
        <div className="text-center py-12 text-slate-500">Colaborador não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/rh/cargos" className="text-slate-400 dark:text-slate-500 hover:text-mustard-500 transition-colors font-medium">
            Recursos Humanos
          </Link>
          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-sm">chevron_right</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">Colaborador</span>
        </div>
        <button
          onClick={() => navigate('/rh/cargos')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-mustard-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Voltar
        </button>
      </div>

      {/* Employee Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <div className="flex items-center gap-6">
          {/* Clickable avatar for photo upload */}
          <input
            type="file"
            ref={photoInputRef}
            className="hidden"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
          <button
            onClick={() => photoInputRef.current?.click()}
            className="relative group shrink-0"
            disabled={photoLoading}
            title="Alterar foto de perfil"
          >
            {employee.photo_url ? (
              <img src={employee.photo_url} alt={employee.full_name} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mustard-400 to-mustard-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {employee.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-2xl">
                {photoLoading ? 'hourglass_empty' : 'photo_camera'}
              </span>
            </div>
            {photoLoading && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">{employee.full_name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{employee.email}</p>
            <div className="flex items-center gap-4 mt-3">
              {employee.position ? (
                <>
                  <span className="px-3 py-1 bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 rounded-lg text-xs font-bold">
                    {employee.position.title} - {employee.position.level}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold">
                    {employee.position.department}
                  </span>
                </>
              ) : (
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold italic">
                  Sem cargo associado
                </span>
              )}
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${employee.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                {employee.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'bg-mustard-500 text-white shadow-lg shadow-mustard-500/20'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'perfil' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Dados Pessoais */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <span className="material-symbols-outlined text-mustard-500 text-xl">badge</span>
                      Dados Pessoais
                    </h3>
                    {!editingPersonal && (
                      <button onClick={startEditPersonal} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-mustard-500 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 rounded-lg transition-all" title="Editar">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    )}
                  </div>
                  <div className="p-6 space-y-5">
                    {editingPersonal ? (
                      <>
                        {[
                          { label: 'Nome Completo', key: 'full_name', type: 'text' },
                          { label: 'CPF', key: 'cpf', type: 'text' },
                          { label: 'Data de Nascimento', key: 'birth_date', type: 'date' },
                          { label: 'Telefone', key: 'phone', type: 'text' },
                        ].map((field) => (
                          <div key={field.key}>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{field.label}</p>
                            <input
                              type={field.type}
                              value={personalForm[field.key] || ''}
                              onChange={(e) => setPersonalForm({ ...personalForm, [field.key]: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                            />
                          </div>
                        ))}
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">E-mail</p>
                          <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 italic">{employee.email}</p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleSave('personal')}
                            disabled={saving}
                            className="px-5 py-2 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50"
                          >
                            {saving ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={() => setEditingPersonal(false)}
                            className="px-5 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {[
                          { label: 'Nome Completo', value: employee.full_name },
                          { label: 'CPF', value: employee.cpf || '-' },
                          { label: 'Data de Nascimento', value: formatDate(employee.birth_date) },
                          { label: 'Telefone', value: employee.phone || '-' },
                          { label: 'E-mail', value: employee.email },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <span className="material-symbols-outlined text-mustard-500 text-xl">location_on</span>
                      Endereço
                    </h3>
                    {!editingAddress && (
                      <button onClick={startEditAddress} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-mustard-500 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 rounded-lg transition-all" title="Editar">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    )}
                  </div>
                  <div className="p-6 space-y-5">
                    {editingAddress ? (
                      <>
                        {[
                          { label: 'Rua', key: 'address_street' },
                          { label: 'Número', key: 'address_number' },
                          { label: 'Complemento', key: 'address_complement' },
                          { label: 'Cidade', key: 'address_city' },
                          { label: 'Estado', key: 'address_state' },
                          { label: 'CEP', key: 'address_zip' },
                        ].map((field) => (
                          <div key={field.key}>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{field.label}</p>
                            <input
                              type="text"
                              value={addressForm[field.key] || ''}
                              onChange={(e) => setAddressForm({ ...addressForm, [field.key]: e.target.value })}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                            />
                          </div>
                        ))}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleSave('address')}
                            disabled={saving}
                            className="px-5 py-2 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50"
                          >
                            {saving ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={() => setEditingAddress(false)}
                            className="px-5 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {[
                          { label: 'Rua', value: employee.address_street || '-' },
                          { label: 'Número', value: employee.address_number || '-' },
                          { label: 'Complemento', value: employee.address_complement || '-' },
                          { label: 'Cidade', value: employee.address_city || '-' },
                          { label: 'Estado', value: employee.address_state || '-' },
                          { label: 'CEP', value: employee.address_zip || '-' },
                        ].map((item) => (
                          <div key={item.label}>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Cargo & Acesso */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <span className="material-symbols-outlined text-mustard-500 text-xl">work</span>
                      Cargo e Acesso
                    </h3>
                  </div>
                  <div className="p-6 space-y-5">
                    {[
                      { label: 'Cargo', value: employee.position?.title || employee.role_title || '-' },
                      { label: 'Departamento', value: employee.position?.department || '-' },
                      { label: 'Nível', value: employee.position?.level || '-' },
                      { label: 'Remuneração', value: formatCurrency(employee.position?.salary) },
                      { label: 'Início no Cargo', value: formatDate(employee.position?.start_date) },
                      { label: 'Nível de Acesso', value: employee.access_level || '-' },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações do Sistema */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <span className="material-symbols-outlined text-mustard-500 text-xl">info</span>
                      Informações do Sistema
                    </h3>
                  </div>
                  <div className="p-6 space-y-5">
                    {[
                      { label: 'Status', value: employee.active ? 'Ativo' : 'Inativo' },
                      { label: 'Senha Definida', value: employee.password_set ? 'Sim' : 'Não' },
                      { label: 'Criado em', value: employee.created_at ? new Date(employee.created_at).toLocaleDateString('pt-BR') : '-' },
                      { label: 'Última Atualização', value: employee.updated_at ? new Date(employee.updated_at).toLocaleDateString('pt-BR') : '-' },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'documentacao' && <EmployeeDocumentsTab employeeId={id || ''} />}
            {activeTab === 'folha-de-ponto' && (
              <EmployeeTimesheetTab
                employeeId={id || ''}
                viewerProfile={viewerProfile}
                isOwnProfile={viewerProfile?.id === id}
              />
            )}
            {activeTab === 'ferias' && <EmployeeVacationTab employeeId={id || ''} />}
            {activeTab === 'epis' && <EmployeeEpiTab employeeId={id || ''} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeDetail;

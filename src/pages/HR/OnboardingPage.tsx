import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';

// Types
interface Employee {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  birth_date?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  positionTitle?: string;
  levelName?: string;
  department?: string;
  salary?: number;
}

interface Position {
  id: string;
  name: string;
  department: string;
  level: string;
  levelId: string;
  range?: { min: number; mid: number; max: number };
}

interface DocumentType {
  id: string;
  document_type_id: string;
  name: string;
  mandatory: boolean;
  notes?: string;
}

export default function OnboardingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  // Step 1: Personal Data form
  const [personalData, setPersonalData] = useState({
    phone: '',
    birth_date: '',
    address_zip: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_city: '',
    address_state: ''
  });

  // Step 2: Position
  const [availablePositions, setAvailablePositions] = useState<Position[]>([]);
  const [newPositionId, setNewPositionId] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [changeReason] = useState('Onboarding - Contratação');

  // Step 3: Documents
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      fetchInitialData();
    }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [empRes, posRes] = await Promise.all([
        api.get(`/hr/employees/${id}`),
        api.get('/hr/positions')
      ]);

      const emp = empRes.data;
      setEmployee(emp);
      setPersonalData({
        phone: emp.phone || '',
        birth_date: emp.birth_date ? emp.birth_date.split('T')[0] : '',
        address_zip: emp.address_zip || '',
        address_street: emp.address_street || '',
        address_number: emp.address_number || '',
        address_complement: emp.address_complement || '',
        address_city: emp.address_city || '',
        address_state: emp.address_state || ''
      });

      // Flatten positions to include levels for selection
      const flattenedPos: Position[] = [];
      posRes.data.forEach((p: any) => {
        if (!p.levels || p.levels.length === 0) {
          flattenedPos.push({
            id: p.id,
            name: p.name,
            department: p.department,
            level: '',
            levelId: '' // Without level
          });
        } else {
          // Simplification: the backend returns levels and ranges. 
          // We need the levelId for the API but the endpoint /hr/positions might only return names.
          // Let's rely on how ChangePositionModal handles it:
          // Wait, ChangePositionModal uses /hr/positions but then we need levelId.
          // The backend /hr/positions returns ranges array with level names, but we might need levelId.
          // For now, let's just pass what we can or adapt to ChangePositionModal logic.
          p.ranges.forEach((r: any) => {
            flattenedPos.push({
              id: p.id, // position_id
              name: p.name,
              department: p.department,
              level: r.level,
              levelId: r.levelId || r.level, // fallback to name if levelId is missing
              range: { min: r.min, mid: r.mid, max: r.max }
            });
          });
        }
      });
      setAvailablePositions(flattenedPos);
      
    } catch (err: any) {
      console.error(err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hr/employees/${id}/documents`);
      // Assuming res.data contains a list of required documents for the employee's current position
      setDocuments(res.data.mandatory || res.data); // Adjust according to API response format
    } catch (err) {
      console.error('Failed to fetch docs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.put(`/hr/employees/${id}`, personalData);
      setCurrentStep(2);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPositionId || !newSalary) {
      setError('Por favor, selecione um cargo e informe o salário.');
      return;
    }

    const selectedPos = availablePositions.find(p => p.id === newPositionId || p.id + p.level === newPositionId);
    if (!selectedPos) return;

    setSaving(true);
    setError(null);
    try {
      // The API might expect position_id and level_id (or name if that's what it accepts).
      // We will assume position_id and level_name for this example based on existing UI.
      const salaryNumber = parseFloat(newSalary.replace(/[^0-9,.-]/g, '').replace(',', '.'));
      
      await api.post('/hr/employee-positions', {
        user_id: id,
        position_id: selectedPos.id,
        level_id: selectedPos.levelId !== selectedPos.level ? selectedPos.levelId : undefined, // pass undefined if it's just the name fallback
        level_name: selectedPos.level,
        salary: salaryNumber,
        start_date: new Date().toISOString().split('T')[0],
        change_reason: changeReason
      });
      
      // Fetch documents for step 3 now that the position is saved
      await fetchDocuments();
      setCurrentStep(3);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docTypeId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingFiles(prev => ({ ...prev, [docTypeId]: true }));
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type_id', docTypeId);
    formData.append('user_id', id as string);

    try {
      await api.post('/hr/employee-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedDocs(prev => [...prev, docTypeId]);
    } catch (err: any) {
      setError(`Falha ao enviar documento: ${getApiErrorMessage(err)}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [docTypeId]: false }));
    }
  };

  const handleFinish = () => {
    navigate('/rh/cargos');
  };

  if (loading && currentStep === 1) {
    return <div className="p-8 text-center text-slate-500">Carregando dados do colaborador...</div>;
  }

  if (!employee) {
    return <div className="p-8 text-center text-red-500">Colaborador não encontrado.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/rh/cargos')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Onboarding de Colaborador</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Conclua o cadastro, defina o cargo e os documentos.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          {[
            { step: 1, title: 'Dados Cadastrais', icon: 'person' },
            { step: 2, title: 'Cargo e Salário', icon: 'work' },
            { step: 3, title: 'Documentação', icon: 'folder' }
          ].map((s, idx) => (
            <div key={s.step} className="flex flex-col items-center gap-3 relative flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all shadow-lg ${
                currentStep === s.step 
                  ? 'bg-mustard-500 text-white shadow-mustard-500/30 scale-110' 
                  : currentStep > s.step 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-none'
              }`}
              onClick={() => {
                if (currentStep > s.step) setCurrentStep(s.step);
              }}>
                {currentStep > s.step ? <span className="material-symbols-outlined">check</span> : <span className="material-symbols-outlined">{s.icon}</span>}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${
                currentStep === s.step ? 'text-mustard-600 dark:text-mustard-400' : 'text-slate-400'
              }`}>{s.title}</span>
              
              {/* Connector Line */}
              {idx < 2 && (
                <div className={`absolute top-7 left-1/2 w-full h-[2px] -z-10 ${
                  currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                }`} style={{ width: 'calc(100% - 3.5rem)', marginLeft: '1.75rem' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Forms */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-mustard-100 dark:bg-mustard-900/30 flex items-center justify-center text-mustard-600 dark:text-mustard-400">
                  <span className="material-symbols-outlined text-3xl">badge</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{employee.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400">Preencha os dados complementares do colaborador.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={personalData.phone}
                    onChange={e => setPersonalData({ ...personalData, phone: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={personalData.birth_date}
                    onChange={e => setPersonalData({ ...personalData, birth_date: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Endereço Residencial</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">CEP</label>
                    <input
                      type="text"
                      required
                      value={personalData.address_zip}
                      onChange={e => setPersonalData({ ...personalData, address_zip: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Logradouro (Rua/Av)</label>
                    <input
                      type="text"
                      required
                      value={personalData.address_street}
                      onChange={e => setPersonalData({ ...personalData, address_street: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Número</label>
                    <input
                      type="text"
                      required
                      value={personalData.address_number}
                      onChange={e => setPersonalData({ ...personalData, address_number: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Complemento</label>
                    <input
                      type="text"
                      value={personalData.address_complement}
                      onChange={e => setPersonalData({ ...personalData, address_complement: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Cidade</label>
                    <input
                      type="text"
                      required
                      value={personalData.address_city}
                      onChange={e => setPersonalData({ ...personalData, address_city: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Estado (UF)</label>
                    <input
                      type="text"
                      required
                      value={personalData.address_state}
                      onChange={e => setPersonalData({ ...personalData, address_state: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-4 bg-mustard-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-mustard-600 shadow-xl shadow-mustard-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar e Avançar'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Selecione o Cargo e Nível</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Defina a posição que este colaborador irá ocupar na empresa.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Seleção de Cargo */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Posição Disponível</label>
                  <select
                    required
                    value={newPositionId}
                    onChange={(e) => setNewPositionId(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-bold dark:text-white appearance-none"
                  >
                    <option value="" disabled>Selecione um cargo e nível...</option>
                    {availablePositions.map(pos => (
                      <option key={pos.id + pos.level} value={pos.id + pos.level}>
                        {pos.name} {pos.level ? `- Nível ${pos.level}` : ''} ({pos.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info do Cargo e Remuneração */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-center relative">
                  {newPositionId ? (() => {
                    const selectedPos = availablePositions.find(p => p.id + p.level === newPositionId);
                    return (
                      <>
                        <h4 className="text-lg font-black text-mustard-600 dark:text-mustard-400 mb-1">{selectedPos?.name}</h4>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{selectedPos?.level ? `Nível ${selectedPos.level}` : 'Nível Único'} • {selectedPos?.department}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                           {selectedPos?.range ? (
                              <div className="flex gap-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Piso: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPos.range.min || 0)}</span>
                                <span>Teto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPos.range.max || 0)}</span>
                              </div>
                           ) : <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-widest">Sem faixa cadastrada</p>}
                           
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Remuneração Base (R$)</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                <input
                                  type="text"
                                  required
                                  value={newSalary}
                                  onChange={e => setNewSalary(e.target.value)}
                                  placeholder="0,00"
                                  className="w-full pl-10 pr-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-bold dark:text-white"
                                />
                              </div>
                           </div>
                        </div>
                      </>
                    );
                  })() : (
                    <div className="text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">work_outline</span>
                      <p className="text-xs font-bold uppercase tracking-widest">Selecione uma posição ao lado</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={saving || !newPositionId || !newSalary}
                  className="flex items-center gap-2 px-8 py-4 bg-mustard-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-mustard-600 shadow-xl shadow-mustard-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Atribuindo...' : 'Salvar Cargo e Avançar'}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
               <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-3xl">task</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Documentos Obrigatórios</h3>
                  <p className="text-slate-500 dark:text-slate-400">Envie a documentação exigida para o cargo de {employee.name}.</p>
                </div>
              </div>

              {loading ? (
                 <div className="text-center py-8 text-slate-500">Buscando documentos necessários...</div>
              ) : documents.length === 0 ? (
                 <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center border border-slate-200 dark:border-slate-700">
                   <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">task_alt</span>
                   <p className="text-slate-600 dark:text-slate-400 font-medium">Nenhum documento é obrigatório para este cargo.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc: any) => {
                    const isUploaded = uploadedDocs.includes(doc.id || doc.document_type_id);
                    const isUploading = uploadingFiles[doc.id || doc.document_type_id];

                    return (
                      <div key={doc.id || doc.document_type_id} className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-40 ${
                        isUploaded 
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
                          : 'border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}>
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-slate-900 dark:text-white">{doc.name || doc.document_type?.name || 'Documento'}</h5>
                            {isUploaded && <span className="material-symbols-outlined text-emerald-500">check_circle</span>}
                          </div>
                          {doc.mandatory && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-black uppercase tracking-widest">Obrigatório</span>}
                        </div>

                        <div className="mt-4">
                          {isUploaded ? (
                             <p className="text-xs font-bold text-emerald-600">Documento Enviado</p>
                          ) : isUploading ? (
                             <p className="text-xs font-bold text-mustard-500 flex items-center gap-1">
                               <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                               Enviando...
                             </p>
                          ) : (
                            <div>
                              <input 
                                type="file" 
                                id={`doc-${doc.id}`}
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, doc.id || doc.document_type_id)}
                              />
                              <label 
                                htmlFor={`doc-${doc.id}`}
                                className="cursor-pointer flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                Anexar
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all"
                >
                  <span className="material-symbols-outlined">how_to_reg</span>
                  Finalizar Onboarding
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

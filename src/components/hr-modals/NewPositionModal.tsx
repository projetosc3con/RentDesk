import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface NewPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

const NewPositionModal: React.FC<NewPositionModalProps> = ({ isOpen, onClose, initialData }) => {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    cbo_code: '',
    description: '',
  });

  const [jobLevels, setJobLevels] = useState<any[]>([]);
  const [availableDocs, setAvailableDocs] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [salaryRanges, setSalaryRanges] = useState<Record<string, { min: string; mid: string; max: string }>>({});

  const isEditMode = !!initialData?.id;

  // Fetch levels, documents on open + fetch position details if editing
  useEffect(() => {
    if (isOpen) {
      fetchLevels();
      fetchDocuments();
      if (initialData?.id) {
        fetchPositionDetails(initialData.id);
      } else {
        // Reset form for create mode
        setFormData({ title: '', department: '', cbo_code: '', description: '' });
        setSelectedLevels([]);
        setSalaryRanges({});
        setSelectedDocs([]);
      }
    }
  }, [isOpen, initialData]);

  const fetchLevels = async () => {
    try {
      const res = await api.get('/hr/levels');
      setJobLevels(res.data);
    } catch (error) {
      console.error('Failed to fetch job levels', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/hr/document-types');
      setAvailableDocs(res.data);
      // Auto-select mandatory docs (merge with any existing selections)
      const mandatoryIds = res.data
        .filter((d: any) => d.mandatory)
        .map((d: any) => d.id);
      setSelectedDocs(prev => [...new Set([...prev, ...mandatoryIds])]);
    } catch (error) {
      console.error('Failed to fetch document types', error);
    }
  };

  const fetchPositionDetails = async (positionId: string) => {
    try {
      const res = await api.get(`/hr/positions/${positionId}`);
      const pos = res.data;

      setFormData({
        title: pos.title || '',
        department: pos.department || '',
        cbo_code: pos.cbo_code || '',
        description: pos.description || '',
      });

      // Map salary ranges back using the real level_id UUIDs
      const levelIds: string[] = [];
      const rangesMap: Record<string, { min: string; mid: string; max: string }> = {};

      (pos.salaryRanges || []).forEach((sr: any) => {
        const levelId = sr.level_id;
        if (levelId) {
          levelIds.push(levelId);
          rangesMap[levelId] = {
            min: sr.salary_min?.toString() || '',
            mid: sr.salary_mid?.toString() || '',
            max: sr.salary_max?.toString() || '',
          };
        }
      });

      setSelectedLevels(levelIds);
      setSalaryRanges(rangesMap);

      // Map document associations
      const docIds = (pos.documentTypes || []).map((d: any) => d.document_type_id);
      setSelectedDocs(docIds);
    } catch (error) {
      console.error('Failed to fetch position details', error);
    }
  };

  const toggleDoc = (docId: string) => {
    // Don't allow unchecking mandatory docs
    const doc = availableDocs.find((d: any) => d.id === docId);
    if (doc?.mandatory && selectedDocs.includes(docId)) return;
    setSelectedDocs(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const toggleLevel = (levelId: string) => {
    setSelectedLevels(prev => {
      if (prev.includes(levelId)) {
        const newLevels = prev.filter(id => id !== levelId);
        const newRanges = { ...salaryRanges };
        delete newRanges[levelId];
        setSalaryRanges(newRanges);
        return newLevels;
      }
      return [...prev, levelId];
    });
  };

  const handleSalaryChange = (levelId: string, field: 'min' | 'mid' | 'max', value: string) => {
    setSalaryRanges(prev => ({
      ...prev,
      [levelId]: {
        ...(prev[levelId] || { min: '', mid: '', max: '' }),
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.department || selectedLevels.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        cbo_code: formData.cbo_code,
        description: formData.description,
        salaryRanges: selectedLevels.map(levelId => ({
          level_id: levelId,
          salary_min: parseFloat(salaryRanges[levelId]?.min) || 0,
          salary_mid: parseFloat(salaryRanges[levelId]?.mid) || null,
          salary_max: parseFloat(salaryRanges[levelId]?.max) || 0,
        })),
        documentTypes: selectedDocs.map(docId => ({
          document_type_id: docId,
          mandatory: true,
        })),
      };

      if (isEditMode) {
        await api.put(`/hr/positions/${initialData.id}`, payload);
      } else {
        await api.post('/hr/positions', payload);
      }

      // Reset form
      setFormData({ title: '', department: '', cbo_code: '', description: '' });
      setSelectedLevels([]);
      setSalaryRanges({});
      setSelectedDocs([]);

      onClose();
    } catch (error) {
      console.error('Error saving position', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                <span className="material-symbols-outlined">work</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isEditMode ? 'Editar Cargo' : 'Novo Cargo'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isEditMode ? 'Atualize os dados deste cargo.' : 'Defina o título, departamento e faixas salariais.'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* General Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Título do Cargo</label>
                <input
                  type="text"
                  placeholder="Ex: Técnico de Manutenção"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium appearance-none dark:text-white"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Logística">Logística</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">CBO</label>
                <input
                  type="text"
                  placeholder="Ex: 9511-05"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium font-mono dark:text-white"
                  value={formData.cbo_code}
                  onChange={e => setFormData({ ...formData, cbo_code: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descrição e Responsabilidades</label>
                <textarea
                  rows={3}
                  placeholder="Descreva as principais atividades deste cargo..."
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium resize-none dark:text-white"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Job Levels Selection */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Níveis Hierárquicos Aplicáveis</label>
              <div className="flex flex-wrap gap-2">
                {jobLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => toggleLevel(level.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedLevels.includes(level.id)
                      ? 'bg-mustard-500 text-white border-mustard-500'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-mustard-500 hover:text-mustard-500'
                      }`}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Required Documents Selection */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Documentos Exigidos</label>
              {availableDocs.length === 0 ? (
                <p className="text-xs text-slate-500 italic ml-1">Nenhum tipo de documento cadastrado. Você pode criá-los na aba Documentos.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {availableDocs.map(doc => {
                    const isMandatory = doc.mandatory;
                    const isChecked = selectedDocs.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isMandatory ? 'cursor-default' : 'cursor-pointer'
                          } ${isChecked
                            ? 'border-mustard-500 bg-mustard-50 dark:bg-mustard-500/10'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-mustard-300'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isChecked ? 'bg-mustard-500 text-white' : 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                          }`}>
                          {isChecked && <span className="material-symbols-outlined text-[14px]">{isMandatory ? 'lock' : 'check'}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isChecked ? 'text-mustard-700 dark:text-mustard-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {doc.name}
                          </span>
                          {isMandatory && (
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Obrigatório</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Salary Ranges Table */}
            {selectedLevels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Definição de Faixas Salariais</label>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-1/4">Nível</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Piso (Mín)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Médio</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Teto (Máx)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {selectedLevels.map(levelId => {
                        const level = jobLevels.find(l => l.id === levelId);
                        return (
                          <tr key={levelId} className="bg-white/50 dark:bg-slate-800/30">
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{level?.name}</span>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                placeholder="0,00"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-mustard-500 text-sm font-mono dark:text-white"
                                value={salaryRanges[levelId]?.min || ''}
                                onChange={e => handleSalaryChange(levelId, 'min', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                placeholder="0,00"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-mustard-500 text-sm font-mono dark:text-white"
                                value={salaryRanges[levelId]?.mid || ''}
                                onChange={e => handleSalaryChange(levelId, 'mid', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                placeholder="0,00"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-mustard-500 text-sm font-mono dark:text-white"
                                value={salaryRanges[levelId]?.max || ''}
                                onChange={e => handleSalaryChange(levelId, 'max', e.target.value)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-400 italic px-2">
                  * Os valores devem ser preenchidos em Reais (BRL). A data de vigência será definida como a data atual.
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!formData.title || !formData.department || selectedLevels.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Salvando...
                </>
              ) : (
                isEditMode ? 'Atualizar Cargo' : 'Salvar Cargo'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewPositionModal;

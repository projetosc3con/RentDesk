import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JOB_LEVELS = [
  { id: '1', name: 'Estagiário' },
  { id: '2', name: 'Auxiliar' },
  { id: '3', name: 'Assistente' },
  { id: '4', name: 'Júnior' },
  { id: '5', name: 'Pleno' },
  { id: '6', name: 'Sênior' },
  { id: '7', name: 'Especialista' },
  { id: '8', name: 'Coordenador' },
  { id: '9', name: 'Gerente' },
];

const NewPositionModal: React.FC<NewPositionModalProps> = ({ isOpen, onClose }) => {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    cbo_code: '',
    description: '',
  });

  const [salaryRanges, setSalaryRanges] = useState<Record<string, { min: string; mid: string; max: string }>>({});

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
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                <span className="material-symbols-outlined">work</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Cargo</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Defina o título, departamento e faixas salariais.</p>
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
                  <option value="Operações">Operações</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Financeiro">Financeiro</option>
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
                {JOB_LEVELS.map(level => (
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
                        const level = JOB_LEVELS.find(l => l.id === levelId);
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
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              className="px-8 py-3 bg-mustard-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.title || !formData.department || selectedLevels.length === 0}
            >
              Salvar Cargo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewPositionModal;

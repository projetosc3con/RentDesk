import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewEmployeeTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_EMPLOYEES = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
  { id: '4', name: 'Ana Costa' },
];

const MOCK_TRAININGS = [
  { id: '1', name: 'NR-11 Operação de Empilhadeiras', category: 'Operação', defaultHours: 16 },
  { id: '2', name: 'NR-35 Trabalho em Altura', category: 'Segurança', defaultHours: 8 },
  { id: '3', name: 'Gestão de Tempo', category: 'Gestão', defaultHours: 4 },
];



const NewEmployeeTrainingModal: React.FC<NewEmployeeTrainingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    trainingId: '',
    provider: '',
    instructor: '',
    completionDate: '',
    workloadHours: '',
    expiryDate: '',
    status: 'Válido',
    cost: '',
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
          className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                <span className="material-symbols-outlined">history_edu</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lançar Treinamento</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Registre a conclusão de um treinamento para um colaborador.</p>
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
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Colaborador</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium appearance-none dark:text-white"
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                >
                  <option value="">Selecione o colaborador...</option>
                  {MOCK_EMPLOYEES.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {/* Training Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Treinamento (Catálogo)</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium appearance-none dark:text-white"
                  value={formData.trainingId}
                  onChange={e => {
                    const t = MOCK_TRAININGS.find(x => x.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      trainingId: e.target.value,
                      workloadHours: t?.defaultHours.toString() || ''
                    });
                  }}
                >
                  <option value="">Selecione o treinamento...</option>
                  {MOCK_TRAININGS.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Provider */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Instituição Fornecedora</label>
                <input
                  type="text"
                  placeholder="Ex: SENAI, SEBRAE, Consultoria X"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.provider}
                  onChange={e => setFormData({ ...formData, provider: e.target.value })}
                />
              </div>

              {/* Instructor */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Instrutor</label>
                <input
                  type="text"
                  placeholder="Nome do instrutor (opcional)"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.instructor}
                  onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                />
              </div>

              {/* Completion Date */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Data de Conclusão</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.completionDate}
                  onChange={e => setFormData({ ...formData, completionDate: e.target.value })}
                />
              </div>

              {/* Workload Hours */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Carga Horária Efetiva (h)</label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium font-mono dark:text-white"
                  value={formData.workloadHours}
                  onChange={e => setFormData({ ...formData, workloadHours: e.target.value })}
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Data de Validade</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Custo do Investimento (R$)</label>
                <input
                  type="number"
                  placeholder="0,00"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium font-mono dark:text-white"
                  value={formData.cost}
                  onChange={e => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
            </div>

            {/* Certificate Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Certificado (PDF, Imagem)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selectedFile ? 'border-mustard-500 bg-mustard-50/50 dark:bg-mustard-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-mustard-500'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf,image/*"
                  onChange={handleFileSelect}
                />
                <span className={`material-symbols-outlined text-3xl mb-2 ${selectedFile ? 'text-mustard-600 dark:text-mustard-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {selectedFile ? 'workspace_premium' : 'upload_file'}
                </span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {selectedFile ? selectedFile.name : 'Anexar certificado de conclusão'}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Observações</label>
              <textarea
                rows={2}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium resize-none dark:text-white"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
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
              disabled={!formData.employeeId || !formData.trainingId || !formData.completionDate}
            >
              Lançar Registro
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewEmployeeTrainingModal;

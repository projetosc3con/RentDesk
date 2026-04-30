import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_EMPLOYEES = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
  { id: '4', name: 'Ana Costa' },
];

const MOCK_DOC_TYPES = [
  { id: '1', name: 'CNH', requiresExpiry: true },
  { id: '2', name: 'ASO (Atestado de Saúde Ocupacional)', requiresExpiry: true },
  { id: '3', name: 'CTPS', requiresExpiry: false },
  { id: '4', name: 'RG/CPF', requiresExpiry: false },
  { id: '5', name: 'Certificado de Treinamento', requiresExpiry: true },
];

const STATUS_OPTIONS = [
  'Válido',
  'Vencido',
  'A Vencer',
  'Pendente',
  'Dispensado'
];

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    docTypeId: '',
    docNumber: '',
    issueDate: '',
    expiryDate: '',
    status: 'Válido',
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDocType = MOCK_DOC_TYPES.find(t => t.id === formData.docTypeId);

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
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lançar Documento</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Registre e anexe documentos de colaboradores.</p>
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

              {/* Document Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tipo de Documento</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium appearance-none dark:text-white"
                  value={formData.docTypeId}
                  onChange={e => setFormData({ ...formData, docTypeId: e.target.value })}
                >
                  <option value="">Selecione o tipo...</option>
                  {MOCK_DOC_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Document Number */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Número do Documento</label>
                <input
                  type="text"
                  placeholder="Ex: 123.456.789-00"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.docNumber}
                  onChange={e => setFormData({ ...formData, docNumber: e.target.value })}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium appearance-none dark:text-white"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Issue Date */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Data de Emissão</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.issueDate}
                  onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                />
              </div>

              {/* Expiry Date (Conditional but clearer) */}
              <div className="space-y-2">
                <label className={`text-xs font-black uppercase tracking-widest ml-1 ${selectedDocType?.requiresExpiry ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  Data de Validade {selectedDocType?.requiresExpiry ? '*' : '(Opcional)'}
                </label>
                <input
                  type="date"
                  className={`w-full px-5 py-4 border rounded-2xl outline-none transition-all text-sm font-medium dark:text-white ${
                    selectedDocType?.requiresExpiry 
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 opacity-60'
                  }`}
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  disabled={!formData.docTypeId}
                />
              </div>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Arquivo (PDF, JPG, PNG)</label>
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
                  {selectedFile ? 'task' : 'cloud_upload'}
                </span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {selectedFile ? selectedFile.name : 'Clique para selecionar ou arraste o arquivo'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Tamanho máximo: 10MB</p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Observações</label>
              <textarea
                rows={2}
                placeholder="Alguma informação adicional importante..."
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
              disabled={!formData.employeeId || !formData.docTypeId || !selectedFile}
            >
              Salvar Documento
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadDocumentModal;

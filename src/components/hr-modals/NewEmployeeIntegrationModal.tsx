import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewEmployeeIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_EMPLOYEES = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Oliveira' },
  { id: '4', name: 'Ana Costa' },
];

const MOCK_CLIENTS = [
  { id: '1', name: 'Petrobras' },
  { id: '2', name: 'Vale S.A.' },
  { id: '3', name: 'Shell' },
  { id: '4', name: 'Gerdau' },
];

const MOCK_INTEGRATION_TYPES = [
  { id: '1', name: 'Integração SST', requiresExpiry: true },
  { id: '2', name: 'Acesso Planta Sul', requiresExpiry: true },
  { id: '3', name: 'Treinamento Segurança', requiresExpiry: false },
];

const STATUS_OPTIONS = ['Válida', 'Vencida', 'A Vencer', 'Cancelada'];

const NewEmployeeIntegrationModal: React.FC<NewEmployeeIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    integrationTypeId: '',
    clientId: '',
    location: '',
    completionDate: '',
    expiryDate: '',
    status: 'Válida',
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedType = MOCK_INTEGRATION_TYPES.find(t => t.id === formData.integrationTypeId);

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
          className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                <span className="material-symbols-outlined">assignment_ind</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Nova Integração</h2>
                <p className="text-sm text-slate-500">Registre a realização de integração para um colaborador.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Colaborador</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium appearance-none"
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                >
                  <option value="">Selecione o colaborador...</option>
                  {MOCK_EMPLOYEES.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {/* Integration Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Integração</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium appearance-none"
                  value={formData.integrationTypeId}
                  onChange={e => setFormData({ ...formData, integrationTypeId: e.target.value })}
                >
                  <option value="">Selecione o tipo...</option>
                  {MOCK_INTEGRATION_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Client Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cliente / Empresa</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium appearance-none"
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Selecione o cliente (opcional)...</option>
                  {MOCK_CLIENTS.map(cli => (
                    <option key={cli.id} value={cli.id}>{cli.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Local / Obra</label>
                <input
                  type="text"
                  placeholder="Ex: Refinaria Replan, Obra 02"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              {/* Integration Date */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data da Integração</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium"
                  value={formData.completionDate}
                  onChange={e => setFormData({ ...formData, completionDate: e.target.value })}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium appearance-none"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Expiry Date */}
              <div className="md:col-span-2 space-y-2">
                <label className={`text-xs font-black uppercase tracking-widest ml-1 ${selectedType?.requiresExpiry ? 'text-amber-600' : 'text-slate-400'}`}>
                  Data de Vencimento {selectedType?.requiresExpiry ? '*' : '(Se aplicável)'}
                </label>
                <input
                  type="date"
                  className={`w-full px-5 py-4 border rounded-2xl outline-none transition-all text-sm font-medium ${
                    selectedType?.requiresExpiry 
                      ? 'bg-amber-50 border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500' 
                      : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 opacity-60'
                  }`}
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  disabled={!formData.integrationTypeId}
                />
              </div>
            </div>

            {/* Certificate Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Certificado / Crachá (PDF, Imagem)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selectedFile ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50 hover:border-emerald-900'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf,image/*"
                  onChange={handleFileSelect}
                />
                <span className={`material-symbols-outlined text-3xl mb-2 ${selectedFile ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {selectedFile ? 'verified' : 'upload_file'}
                </span>
                <p className="text-sm font-bold text-slate-700">
                  {selectedFile ? selectedFile.name : 'Anexar comprovante de integração'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Formatos aceitos: PDF, JPG, PNG</p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Observações</label>
              <textarea
                rows={2}
                placeholder="Informações adicionais importantes..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 outline-none transition-all text-sm font-medium resize-none"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              className="px-8 py-3 bg-emerald-900 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.employeeId || !formData.integrationTypeId || !formData.completionDate}
            >
              Salvar Registro
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewEmployeeIntegrationModal;

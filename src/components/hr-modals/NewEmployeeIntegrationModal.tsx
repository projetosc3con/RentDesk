import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { supabase } from '../../lib/supabase';

interface NewEmployeeIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = ['Válida', 'Vencida', 'A Vencer', 'Cancelada'];

const NewEmployeeIntegrationModal: React.FC<NewEmployeeIntegrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    integrationTypeId: '',
    location: '',
    completionDate: '',
    expiryDate: '',
    status: 'Válida',
    notes: '',
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [integrationTypes, setIntegrationTypes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [empRes, typesRes] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/hr/integrations/types')
      ]);
      const activeEmployees = (empRes.data || []).filter((emp: any) => emp.positionTitle !== null);
      setEmployees(activeEmployees);
      setIntegrationTypes(typesRes.data?.filter((t: any) => t.active) || []);
    } catch (err) {
      console.error('Error fetching data for modal', err);
    }
  };

  const selectedType = integrationTypes.find(t => t.id === formData.integrationTypeId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.integrationTypeId || !formData.completionDate) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      let fileUrl = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${formData.employeeId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('employee-documents')
          .upload(filePath, selectedFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = await supabase.storage.from('employee-documents').createSignedUrl(filePath, 31536000); // 1 year
        fileUrl = urlData?.signedUrl;
      }

      const payload = {
        user_id: formData.employeeId,
        integration_type_id: formData.integrationTypeId,
        location: formData.location,
        integration_date: formData.completionDate,
        expiry_date: formData.expiryDate || null,
        status: formData.status,
        notes: formData.notes,
        file_url: fileUrl
      };

      await api.post('/hr/integrations', payload);
      
      if (onSuccess) onSuccess();
      onClose();
      // reset form
      setFormData({
        employeeId: '', integrationTypeId: '', location: '', completionDate: '',
        expiryDate: '', status: 'Válida', notes: '',
      });
      setSelectedFile(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'Erro ao lançar integração');
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
          className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                <span className="material-symbols-outlined">assignment_ind</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nova Integração</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Registre a realização de integração para um colaborador.</p>
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
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
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
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {/* Integration Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tipo de Integração</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium appearance-none dark:text-white"
                  value={formData.integrationTypeId}
                  onChange={e => {
                    const type = integrationTypes.find(t => t.id === e.target.value);
                    const hasValidity = type?.validity_days !== null && type?.validity_days > 0;
                    
                    let defaultExpiry = '';
                    if (hasValidity && formData.completionDate) {
                      const date = new Date(formData.completionDate);
                      date.setDate(date.getDate() + type.validity_days);
                      defaultExpiry = date.toISOString().split('T')[0];
                    }

                    setFormData({ 
                      ...formData, 
                      integrationTypeId: e.target.value,
                      expiryDate: defaultExpiry
                    });
                  }}
                >
                  <option value="">Selecione o tipo...</option>
                  {integrationTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Local / Obra</label>
                <input
                  type="text"
                  placeholder="Ex: Refinaria Replan, Obra 02"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              {/* Integration Date */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Data da Integração</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.completionDate}
                  onChange={e => {
                    const newDate = e.target.value;
                    let newExpiry = formData.expiryDate;
                    if (selectedType?.validity_days) {
                      const d = new Date(newDate);
                      d.setDate(d.getDate() + selectedType.validity_days);
                      newExpiry = d.toISOString().split('T')[0];
                    }
                    setFormData({ ...formData, completionDate: newDate, expiryDate: newExpiry });
                  }}
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

              {/* Expiry Date */}
              <div className="md:col-span-2 space-y-2">
                <label className={`text-xs font-black uppercase tracking-widest ml-1 ${selectedType?.validity_days ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  Data de Vencimento {selectedType?.validity_days ? '*' : '(Se aplicável)'}
                </label>
                <input
                  type="date"
                  className={`w-full px-5 py-4 border rounded-2xl outline-none transition-all text-sm font-medium dark:text-white ${
                    selectedType?.validity_days 
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500' 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 opacity-60'
                  }`}
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  disabled={!formData.integrationTypeId}
                />
              </div>
            </div>

            {/* Certificate Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Certificado / Crachá (PDF, Imagem)</label>
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
                  {selectedFile ? 'verified' : 'upload_file'}
                </span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {selectedFile ? selectedFile.name : 'Anexar comprovante de integração'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Formatos aceitos: PDF, JPG, PNG</p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Observações</label>
              <textarea
                rows={2}
                placeholder="Informações adicionais importantes..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium resize-none dark:text-white"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
            {errorMsg ? (
              <p className="text-red-500 text-xs font-bold">{errorMsg}</p>
            ) : <div />}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-mustard-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.employeeId || !formData.integrationTypeId || !formData.completionDate || isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewEmployeeIntegrationModal;

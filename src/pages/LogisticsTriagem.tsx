import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { logisticsService, type LogisticsContract, type TriagePhoto } from '../services/logistics';
import SearchableSelect from '../components/SearchableSelect';
import type { Equipment } from '../types';
import { TriageChecklistDocument } from '../components/logistics/TriageChecklistDocument';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

const STEPS = [
  { key: 'triagem', label: 'Triagem', icon: 'fact_check' },
  { key: 'documentacao', label: 'Documentação', icon: 'photo_camera' },
  { key: 'emissao', label: 'Emissão', icon: 'receipt_long' },
];

const CHECKLIST_ITEMS = [
  { position: 1, label: 'Dianteira' },
  { position: 2, label: 'Traseira' },
  { position: 3, label: 'Lateral direita' },
  { position: 4, label: 'Lateral esquerda' },
  { position: 5, label: 'Tanque hidráulico' },
  { position: 6, label: 'Bloco hidráulico' },
  { position: 7, label: 'Baterias' },
  { position: 8, label: 'Roda lateral direita dianteira' },
  { position: 9, label: 'Roda lateral direita traseira' },
  { position: 10, label: 'Roda lateral esquerda dianteira' },
  { position: 11, label: 'Roda lateral esquerda traseira' },
  { position: 12, label: 'Deck dianteira' },
  { position: 13, label: 'Deck traseira' },
  { position: 14, label: 'Barra deck direita' },
  { position: 15, label: 'Barra deck esquerda' },
  { position: 16, label: 'Porta manual' },
  { position: 17, label: 'Joystick' },
  { position: 18, label: 'Painel de solo' },
  { position: 19, label: 'Horimetro' },
  { position: 20, label: 'Patrimonio' },
  { position: 21, label: 'Plugue tomada' },
  { position: 22, label: 'Placa de identificação' },
];

const LogisticsTriagem: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<LogisticsContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Triage form data
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [workSite, setWorkSite] = useState('');
  const [equipmentDescription, setEquipmentDescription] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCnpj, setClientCnpj] = useState('');

  // Checklist Photos State
  const [triagePhotos, setTriagePhotos] = useState<TriagePhoto[]>([]);
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null);

  // UI View Mode for checklist
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Emission data
  const [rentalInvoiceId, setRentalInvoiceId] = useState('');

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  // Save step 1 draft changes to localStorage
  useEffect(() => {
    if (!id || loading) return;
    const draft = {
      selectedEquipmentId,
      workSite
    };
    localStorage.setItem(`triage_draft_${id}`, JSON.stringify(draft));
  }, [id, selectedEquipmentId, workSite, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contractData, equipmentsRes, photosRes] = await Promise.all([
        logisticsService.getContractById(id!),
        api.get('/equipments'),
        logisticsService.getTriagePhotos(id!)
      ]);

      setContract(contractData);
      setEquipments(equipmentsRes.data);
      setTriagePhotos(photosRes);

      // Check localStorage for saved draft first
      const draftStr = localStorage.getItem(`triage_draft_${id}`);
      let savedEquipmentId = '';
      let savedWorkSite = '';
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          savedEquipmentId = draft.selectedEquipmentId || '';
          savedWorkSite = draft.workSite || '';
        } catch (e) {
          console.error('Erro ao fazer parse do localStorage draft:', e);
        }
      }

      // Pre-fill from contract_form data or draft
      const form = contractData.contract_form;
      
      let initialWorkSite = savedWorkSite;
      if (!initialWorkSite) {
        if (form) initialWorkSite = form.work_site || '';
        else if (contractData.snapshot) initialWorkSite = contractData.snapshot.work_site || '';
      }
      setWorkSite(initialWorkSite);
      setSelectedEquipmentId(savedEquipmentId);

      let initialClientName = '';
      let initialClientCnpj = '';

      if (form) {
        setEquipmentDescription(form.equipment_description || '');
        setEquipmentModel(form.equipment_model || '');
        initialClientName = form.locatario_company_name || '';
        initialClientCnpj = form.locatario_cnpj || '';
      } else if (contractData.snapshot) {
        setEquipmentDescription(contractData.snapshot.equipment?.description || '');
        setEquipmentModel(contractData.snapshot.equipment?.model || '');
        initialClientName = contractData.snapshot.locatario?.company_name || '';
        initialClientCnpj = contractData.snapshot.locatario?.cnpj || '';
      }

      // Pre-fill from deal client if still empty
      if (contractData.deal?.client) {
        if (!initialClientName) initialClientName = contractData.deal.client.company_name || '';
        if (!initialClientCnpj) initialClientCnpj = contractData.deal.client.cnpj || '';
      }

      setClientName(initialClientName);
      setClientCnpj(initialClientCnpj);
    } catch (err) {
      console.error('Erro ao carregar contrato:', err);
      setError('Erro ao carregar dados do contrato.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, position: number, label: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPosition(position);
      setError(null);

      const newPhoto = await logisticsService.uploadTriagePhoto(id!, position, label, file);

      setTriagePhotos(prev => {
        const filtered = prev.filter(p => p.position !== position);
        return [...filtered, newPhoto].sort((a, b) => a.position - b.position);
      });
    } catch (err: any) {
      console.error('Erro ao fazer upload da foto:', err);
      setError('Erro ao enviar a foto do checklist.');
    } finally {
      setUploadingPosition(null);
    }
  };

  const handlePhotoDelete = async (photoId: string, filePath: string) => {
    try {
      setError(null);
      await logisticsService.deleteTriagePhoto(id!, photoId, filePath);
      setTriagePhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err: any) {
      console.error('Erro ao deletar foto:', err);
      setError('Erro ao excluir a foto do checklist.');
    }
  };

  const handleFinish = async () => {
    if (!contract) return;
    try {
      setSubmitting(true);
      setError(null);
      await logisticsService.finishProcessing(contract.id, {
        rental_invoice_id: rentalInvoiceId || undefined,
        equipment_id: selectedEquipmentId || undefined
      });
      // Clear localStorage draft upon successful completion
      localStorage.removeItem(`triage_draft_${id}`);
      setSuccess(true);
      setTimeout(() => navigate('/logistica'), 2000);
    } catch (err: any) {
      console.error('Erro ao finalizar processamento:', err);
      setError(err.response?.data?.error || 'Erro ao finalizar processamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const isStepValid = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      return !!selectedEquipmentId && !!workSite.trim();
    }
    if (stepIndex === 1) {
      return triagePhotos.length === CHECKLIST_ITEMS.length;
    }
    return true;
  };

  const nextStep = () => {
    if (!isStepValid(currentStep)) {
      setError(`Por favor, preencha todos os dados obrigatórios da Etapa ${currentStep + 1} antes de avançar.`);
      return;
    }
    setError(null);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mustard-500"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <span className="material-symbols-outlined text-4xl text-slate-300">error</span>
        <p className="text-slate-500">Contrato não encontrado.</p>
        <button onClick={() => navigate('/logistica')} className="text-mustard-500 font-bold text-sm underline">
          Voltar para Logística
        </button>
      </div>
    );
  }

  const isProcessed = contract.status === 'Processado';
  const isTriage = contract.status === 'Triagem';

  const getContractValue = (): number => {
    if (contract.contract_form?.cost_total) return contract.contract_form.cost_total;
    if (contract.snapshot?.costs?.total) return contract.snapshot.costs.total;
    return contract.deal?.value || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/logistica')}
          className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isProcessed ? 'Detalhes do Contrato' : 'Triagem de Contrato'}
            </h1>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${contract.status === 'Assinado' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                contract.status === 'Triagem' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' :
                  'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              }`}>
              {contract.status}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Contrato #{contract.contract_number} — {clientName || 'Cliente'}
          </p>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-5 py-4 rounded-2xl text-sm flex items-center gap-3 font-medium"
          >
            <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
            Contrato processado com sucesso! Redirecionando...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 px-5 py-4 rounded-2xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          {error}
        </div>
      )}

      {/* Stepper */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.key}>
              <div
                className={`flex items-center gap-3 cursor-pointer group ${index <= currentStep ? '' : 'opacity-40'}`}
                onClick={() => {
                  if (isProcessed) return;
                  if (index > currentStep) {
                    for (let i = currentStep; i < index; i++) {
                      if (!isStepValid(i)) {
                        setError(`Por favor, preencha todos os dados obrigatórios da Etapa ${i + 1} antes de avançar.`);
                        return;
                      }
                    }
                  }
                  setError(null);
                  setCurrentStep(index);
                }}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${index < currentStep
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : index === currentStep
                      ? 'bg-mustard-500 text-white shadow-lg shadow-mustard-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                  {index < currentStep ? (
                    <span className="material-symbols-outlined text-xl">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-xl">{step.icon}</span>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Etapa {index + 1}
                  </p>
                  <p className={`text-sm font-bold ${index <= currentStep ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                    {step.label}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className={`h-0.5 rounded-full transition-all ${index < currentStep
                      ? 'bg-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800'
                    }`} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="triagem"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Client & Equipment Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-mustard-500 text-xl">person_pin_circle</span>
                  Dados do Contrato
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Confira as informações do contrato pré-preenchidas do formulário.</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Name - read only */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cliente</label>
                  <div className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium">
                    {clientName || 'Não informado'}
                  </div>
                </div>

                {/* Client CNPJ - read only */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">CNPJ</label>
                  <div className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium font-mono">
                    {clientCnpj || 'Não informado'}
                  </div>
                </div>

                {/* Equipment Description - read only */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descrição do Equipamento (do contrato)</label>
                  <div className="w-full px-4 py-2.5 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 rounded-xl text-sm text-slate-900 dark:text-white">
                    {equipmentDescription || 'Não informado'}{equipmentModel ? ` | ${equipmentModel}` : ''}
                  </div>
                </div>

                {/* Equipment Select */}
                <div className="md:col-span-2">
                  <SearchableSelect
                    label="Equipamento do Estoque"
                    placeholder="Selecione o equipamento correspondente"
                    items={equipments}
                    selectedId={selectedEquipmentId}
                    onSelect={(id) => setSelectedEquipmentId(id)}
                    getDisplayValue={(eq) => `${eq.asset_number} - ${eq.name}`}
                    getSearchValue={(eq) => `${eq.name} ${eq.asset_number}`}
                    disabled={isProcessed}
                  />
                </div>

                {/* Work Site */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Obra / Local de Uso</label>
                  <input
                    type="text"
                    value={workSite}
                    onChange={(e) => setWorkSite(e.target.value)}
                    disabled={isProcessed}
                    placeholder="Ex: Condomínio Solar das Águas"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            key="documentacao"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Photo Upload Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-mustard-500 text-xl">photo_camera</span>
                    Documentação Fotográfica
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Checklist de fotos de conferência do estado do equipamento antes da entrega.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg flex items-center transition-all ${viewMode === 'grid'
                          ? 'bg-white dark:bg-slate-700 text-mustard-500 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      title="Visualização em Grade"
                    >
                      <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg flex items-center transition-all ${viewMode === 'list'
                          ? 'bg-white dark:bg-slate-700 text-mustard-500 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      title="Visualização em Lista"
                    >
                      <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                    </button>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300">
                    Progresso: {triagePhotos.length} / {CHECKLIST_ITEMS.length}
                  </div>
                </div>
              </div>
              <div className="p-6">
                {viewMode === 'grid' ? (
                  /* Photo Checklist Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CHECKLIST_ITEMS.map((item) => {
                      const photo = triagePhotos.find(p => p.position === item.position);
                      const isUploading = uploadingPosition === item.position;

                      return (
                        <div
                          key={item.position}
                          className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
                        >
                          {/* Title and Badge */}
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Item {item.position}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                {item.label}
                              </h4>
                            </div>
                            <div>
                              {photo ? (
                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100/50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                  <span className="material-symbols-outlined text-[12px] font-black">check</span>
                                  Concluído
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  Pendente
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Image Preview / Placeholder */}
                          <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-700/40 mb-4">
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-2 border-mustard-500/30 border-t-mustard-500 rounded-full animate-spin" />
                                <span className="text-[11px] font-medium text-slate-500">Enviando...</span>
                              </div>
                            ) : photo ? (
                              <>
                                <img
                                  src={photo.file_url}
                                  alt={item.label}
                                  className="w-full h-full object-cover"
                                />
                                {!isProcessed && (
                                  <button
                                    type="button"
                                    onClick={() => handlePhotoDelete(photo.id, photo.file_path)}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-600">
                                <span className="material-symbols-outlined text-3xl">photo_camera</span>
                                <span className="text-[11px]">Nenhuma foto registrada</span>
                              </div>
                            )}
                          </div>

                          {/* Upload Controls */}
                          {!isProcessed && !photo && !isUploading && (
                            <div className="flex gap-2">
                              {/* Option 1: Direct Camera Capture (Mobile) */}
                              <label className="flex-1 py-2 px-3 bg-mustard-500 hover:bg-mustard-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest text-center cursor-pointer transition-all flex items-center justify-center gap-1 shadow-md shadow-mustard-500/10">
                                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                Câmera
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(e, item.position, item.label)}
                                />
                              </label>

                              {/* Option 2: Gallery Upload (Desktop/Fallback) */}
                              <label className="py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest text-center cursor-pointer transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined text-[16px]">file_upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(e, item.position, item.label)}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Photo Checklist List */
                  <div className="space-y-3">
                    {CHECKLIST_ITEMS.map((item) => {
                      const photo = triagePhotos.find(p => p.position === item.position);
                      const isUploading = uploadingPosition === item.position;

                      return (
                        <div
                          key={item.position}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          {/* Left side: Check status + Item position and Label */}
                          <div className="flex items-center gap-4 min-w-0">
                            {photo ? (
                              <span className="material-symbols-outlined text-emerald-500 text-xl font-bold shrink-0">check_box</span>
                            ) : (
                              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-xl shrink-0">check_box_outline_blank</span>
                            )}
                            <div className="min-w-0">
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                                Item {item.position}
                              </span>
                              <span className="text-sm font-bold text-slate-750 dark:text-slate-200 truncate block">
                                {item.label}
                              </span>
                            </div>
                          </div>

                          {/* Right side: Photo icon/thumbnail + Actions */}
                          <div className="flex items-center gap-4 shrink-0">
                            {/* Image icon/thumbnail when uploaded */}
                            {isUploading ? (
                              <div className="w-10 h-10 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-mustard-500/30 border-t-mustard-500 rounded-full animate-spin" />
                              </div>
                            ) : photo ? (
                              <div className="relative group/thumb w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
                                <img
                                  src={photo.file_url}
                                  alt={item.label}
                                  className="w-full h-full object-cover"
                                />
                                <div
                                  onClick={() => window.open(photo.file_url, '_blank')}
                                  className="absolute inset-0 bg-black/45 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-white text-xs font-black">visibility</span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600 shrink-0">
                                <span className="material-symbols-outlined text-lg">image</span>
                              </div>
                            )}

                            {/* Actions on opposite right side */}
                            <div className="flex items-center gap-2">
                              {isUploading ? null : photo ? (
                                !isProcessed && (
                                  <button
                                    type="button"
                                    onClick={() => handlePhotoDelete(photo.id, photo.file_path)}
                                    className="w-9 h-9 bg-red-50 hover:bg-red-500 dark:bg-red-500/10 dark:hover:bg-red-600 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                                    title="Excluir foto"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                )
                              ) : (
                                !isProcessed && (
                                  <div className="flex items-center gap-2">
                                    {/* Mobile Camera capture */}
                                    <label className="py-2 px-3 bg-mustard-500 hover:bg-mustard-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-mustard-500/10 active:scale-[0.97]">
                                      <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                                      Câmera
                                      <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={(e) => handlePhotoUpload(e, item.position, item.label)}
                                      />
                                    </label>

                                    {/* Desktop Gallery Picker */}
                                    <label className="py-2 px-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center active:scale-[0.97]">
                                      <span className="material-symbols-outlined text-[14px]">file_upload</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handlePhotoUpload(e, item.position, item.label)}
                                      />
                                    </label>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="emissao"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-mustard-500 text-xl">receipt_long</span>
                  Resumo para Emissão
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Confira todas as informações antes de emitir.</p>
              </div>
              <div className="p-6">
                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Contrato', value: `#${contract.contract_number}`, icon: 'description' },
                    { label: 'Versão', value: `v${contract.version}`, icon: 'history' },
                    { label: 'Cliente', value: clientName || 'N/A', icon: 'business' },
                    { label: 'CNPJ', value: clientCnpj || 'N/A', icon: 'badge' },
                    { label: 'Equipamento', value: equipmentDescription || 'N/A', icon: 'precision_manufacturing' },
                    { label: 'Local de Uso', value: workSite || 'N/A', icon: 'location_on' },
                    { label: 'Valor Total', value: getContractValue().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: 'payments' },
                    { label: 'Fotos Anexadas', value: `${triagePhotos.length} / ${CHECKLIST_ITEMS.length} foto(s)`, icon: 'photo_camera' },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3">
                      <div className="w-9 h-9 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-mustard-500 text-lg">{item.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PDF Checklist Actions */}
                <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Relatório de Conferência de Estado</h4>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const blob = await pdf(
                            <TriageChecklistDocument
                              contract={contract}
                              photos={triagePhotos}
                              equipmentLabel={equipmentDescription}
                              clientName={clientName}
                              workSite={workSite}
                            />
                          ).toBlob();
                          const blobUrl = URL.createObjectURL(blob);
                          window.open(blobUrl, '_blank');
                        } catch (err) {
                          console.error('Erro ao gerar PDF', err);
                          alert('Erro ao abrir PDF.');
                        }
                      }}
                      className="px-5 py-3 border border-mustard-500 text-mustard-600 dark:text-mustard-400 rounded-xl text-sm font-bold hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      Visualizar PDF do Checklist
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const blob = await pdf(
                            <TriageChecklistDocument
                              contract={contract}
                              photos={triagePhotos}
                              equipmentLabel={equipmentDescription}
                              clientName={clientName}
                              workSite={workSite}
                            />
                          ).toBlob();
                          saveAs(blob, `CHECKLIST_TRIAGEM - Contrato ${contract.contract_number}.pdf`);
                        } catch (err) {
                          console.error('Erro ao gerar PDF', err);
                          alert('Erro ao baixar PDF.');
                        }
                      }}
                      className="px-5 py-3 bg-mustard-500 text-white rounded-xl text-sm font-bold hover:bg-mustard-600 transition-colors flex items-center gap-2 shadow-md shadow-mustard-500/10"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Download PDF do Checklist
                    </button>
                  </div>
                </div>

                {/* Rental Invoice ID */}
                {!isProcessed && isTriage && (
                  <div className="mt-6 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nº da Fatura de Locação (rental_invoice_id)</label>
                    <input
                      type="text"
                      value={rentalInvoiceId}
                      onChange={(e) => setRentalInvoiceId(e.target.value)}
                      placeholder="Ex: FAT-2026-0001"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                  </div>
                )}

                {/* Already processed info */}
                {isProcessed && contract.rental_invoice_id && (
                  <div className="mt-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-500">verified</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Fatura de Locação</p>
                      <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200 font-mono">{contract.rental_invoice_id}</p>
                    </div>
                  </div>
                )}

                {/* Notificação simulada — disparo real de e-mail/WhatsApp ainda não integrado no backend */}
                {(success || (isProcessed && contract.rental_invoice_id)) && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-500">mark_email_read</span>
                    <div>
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Notificação ao Cliente</p>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Cliente notificado com o boleto por e-mail/WhatsApp.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emit Button */}
            {!isProcessed && isTriage && (
              <div className="bg-mustard-600 dark:bg-mustard-500 rounded-2xl p-6 text-white shadow-xl shadow-mustard-500/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Pronto para Emitir?</h3>
                    <p className="text-sm opacity-70">O status será atualizado para "Processado".</p>
                  </div>
                </div>
                <button
                  onClick={handleFinish}
                  disabled={submitting}
                  className="w-full py-4 bg-white text-mustard-600 dark:text-mustard-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-mustard-500/30 border-t-mustard-500 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      Emitir e Finalizar Processamento
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${currentStep === 0
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]'
            }`}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Anterior
        </button>

        {currentStep < STEPS.length - 1 && (
          <button
            onClick={nextStep}
            disabled={!isStepValid(currentStep)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${isStepValid(currentStep)
                ? 'bg-mustard-500 hover:bg-mustard-600 text-white shadow-lg shadow-mustard-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none opacity-60'
              }`}
          >
            Próximo
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        )}

        {currentStep === STEPS.length - 1 && isProcessed && (
          <button
            onClick={() => navigate('/logistica')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Voltar para Logística
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default LogisticsTriagem;

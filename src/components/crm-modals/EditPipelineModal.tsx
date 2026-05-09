import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { crmService } from '../../services/crm';

interface PipelineData {
  id: string;
  name: string;
  description: string;
  active: boolean;
  stages: StageEntry[];
}

interface StageEntry {
  id: string;
  name: string;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

interface EditPipelineModalProps {
  isOpen: boolean;
  onClose: (wasSaved?: boolean) => void;
  pipeline: PipelineData | null;
}

const EditPipelineModal: React.FC<EditPipelineModalProps> = ({ isOpen, onClose, pipeline }) => {
  const [formData, setFormData] = useState({ name: '', description: '', active: true });
  const [stages, setStages] = useState<StageEntry[]>([]);
  const [activeSection, setActiveSection] = useState<'info' | 'stages'>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pipeline) {
      setFormData({ name: pipeline.name, description: pipeline.description, active: pipeline.active });
      setStages(pipeline.stages);
      setActiveSection('info');
      setShowDeleteConfirm(false);
    }
  }, [pipeline]);

  const handleSubmit = async () => {
    if (!pipeline) return;
    try {
      setIsSubmitting(true);
      await crmService.updatePipeline(pipeline.id, {
        name: formData.name,
        description: formData.description,
        active: formData.active,
        stages: stages
      });
      onClose(true);
    } catch (error) {
      console.error('Error updating pipeline:', error);
      alert('Erro ao atualizar funil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pipeline) return;
    try {
      setIsSubmitting(true);
      await crmService.deletePipeline(pipeline.id);
      onClose(true);
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      alert('Erro ao excluir funil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStage = () => {
    setStages(prev => [...prev, {
      id: `new-${Date.now()}`,
      name: '',
      probability: 0,
      isWon: false,
      isLost: false,
    }]);
  };

  const handleRemoveStage = (index: number) => {
    setStages(prev => prev.filter((_, i) => i !== index));
  };

  const handleStageChange = (index: number, field: keyof StageEntry, value: string | number | boolean) => {
    setStages(prev => prev.map((stage, i) => {
      if (i !== index) return stage;
      const updated = { ...stage, [field]: value };
      if (field === 'isWon' && value === true) updated.isLost = false;
      if (field === 'isLost' && value === true) updated.isWon = false;
      return updated;
    }));
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStages.length) return;
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    setStages(newStages);
  };

  const isValid = formData.name.trim() !== '' && stages.length >= 2 && stages.every(s => s.name.trim() !== '');

  if (!isOpen || !pipeline) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Funil</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{pipeline.name}</p>
              </div>
            </div>
            <button
              onClick={() => onClose(false)}
              className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Section Tabs */}
          <div className="px-8 pt-6 flex items-center gap-2">
            {[
              { id: 'info' as const, label: 'Informações', icon: 'info' },
              { id: 'stages' as const, label: 'Etapas', icon: 'account_tree' },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeSection === section.id
                  ? 'bg-mustard-500 text-white shadow-md shadow-mustard-500/20'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeSection === 'info' ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Pipeline Info Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome do Funil *</label>
                      <input
                        type="text"
                        placeholder="Ex: Locação Operacional"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
                      <input
                        type="text"
                        placeholder="Descrição do funil..."
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${formData.active ? 'text-mustard-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        {formData.active ? 'toggle_on' : 'toggle_off'}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Funil Ativo</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Funis inativos não aparecem na seleção de pipeline ao criar deals.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                      className={`w-12 h-7 rounded-full transition-all relative ${formData.active ? 'bg-mustard-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.active ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-2 border-dashed border-red-100 dark:border-red-500/20 rounded-2xl p-6">
                    <h4 className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-widest mb-2">Zona de Perigo</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Excluir este funil removerá permanentemente todas as etapas associadas. Deals vinculados não serão excluídos, mas perderão a referência ao pipeline.</p>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-5 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20"
                      >
                        Excluir Funil
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleDelete}
                          disabled={isSubmitting}
                          className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-5 py-2.5 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="stages"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Etapas do Funil ({stages.length})</label>
                    <button
                      onClick={handleAddStage}
                      className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-mustard-600 dark:text-mustard-400 bg-mustard-50 dark:bg-mustard-500/10 hover:bg-mustard-100 dark:hover:bg-mustard-500/20 rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Nova Etapa
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100/50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-10">#</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nome da Etapa</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-24 text-center">Prob. %</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-20 text-center">Ganho</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-20 text-center">Perdido</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-28 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {stages.map((stage, index) => (
                          <tr key={stage.id} className="bg-white/50 dark:bg-slate-800/30 group">
                            <td className="px-4 py-3">
                              <span className="text-xs font-black text-slate-300 dark:text-slate-600">{index + 1}</span>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                placeholder="Nome da etapa..."
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-mustard-500 text-sm font-medium dark:text-white"
                                value={stage.name}
                                onChange={e => handleStageChange(index, 'name', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-mustard-500 text-sm font-mono text-center dark:text-white"
                                value={stage.probability}
                                onChange={e => handleStageChange(index, 'probability', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => handleStageChange(index, 'isWon', !stage.isWon)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${stage.isWon
                                  ? 'bg-mustard-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600 hover:text-mustard-500'}`}
                              >
                                <span className="material-symbols-outlined text-sm">emoji_events</span>
                              </button>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => handleStageChange(index, 'isLost', !stage.isLost)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${stage.isLost
                                  ? 'bg-red-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600 hover:text-red-500'}`}
                              >
                                <span className="material-symbols-outlined text-sm">block</span>
                              </button>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => moveStage(index, 'up')}
                                  disabled={index === 0}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-mustard-500 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                                </button>
                                <button
                                  onClick={() => moveStage(index, 'down')}
                                  disabled={index === stages.length - 1}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-mustard-500 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                                </button>
                                <button
                                  onClick={() => handleRemoveStage(index)}
                                  disabled={stages.length <= 2}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic px-2">
                    * Use as setas para reordenar. O mínimo é 2 etapas por funil.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
            <button
              onClick={() => onClose(false)}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-mustard-500 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditPipelineModal;

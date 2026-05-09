import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { crmService } from '../../services/crm';
import type { CRMPipelineStage } from '../../types';

interface NewPipelineModalProps {
  isOpen: boolean;
  onClose: (wasSaved?: boolean) => void;
}

type StageEntry = Omit<CRMPipelineStage, 'id' | 'pipeline_id' | 'created_at'>;

const DEFAULT_STAGES: StageEntry[] = [
  { name: 'Prospecção', probability_pct: 10, is_won: false, is_lost: false, position: 1 },
  { name: 'Proposta Enviada', probability_pct: 40, is_won: false, is_lost: false, position: 2 },
  { name: 'Negociação', probability_pct: 70, is_won: false, is_lost: false, position: 3 },
  { name: 'Fechado Ganho', probability_pct: 100, is_won: true, is_lost: false, position: 4 },
  { name: 'Fechado Perdido', probability_pct: 0, is_won: false, is_lost: true, position: 5 },
];

const NewPipelineModal: React.FC<NewPipelineModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [stages, setStages] = useState<StageEntry[]>(DEFAULT_STAGES);
  const [useTemplate, setUseTemplate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await crmService.createPipeline({
        name: formData.name,
        description: formData.description,
        stages: stages
      });
      handleReset();
      onClose(true);
    } catch (error) {
      console.error('Error creating pipeline:', error);
      alert('Erro ao criar funil. Verifique se o nome já existe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStage = () => {
    setStages(prev => [...prev, { name: '', probability_pct: 0, is_won: false, is_lost: false, position: prev.length + 1 }]);
  };

  const handleRemoveStage = (index: number) => {
    setStages(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, position: i + 1 })));
  };

  const handleStageChange = (index: number, field: keyof StageEntry, value: string | number | boolean) => {
    setStages(prev => prev.map((stage, i) => {
      if (i !== index) return stage;
      const updated = { ...stage, [field]: value };
      // Mutual exclusion: if setting is_won, unset is_lost and vice versa
      if (field === 'is_won' && value === true) updated.is_lost = false;
      if (field === 'is_lost' && value === true) updated.is_won = false;
      return updated;
    }));
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStages.length) return;
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    // Update positions
    setStages(newStages.map((s, i) => ({ ...s, position: i + 1 })));
  };

  const handleReset = () => {
    setFormData({ name: '', description: '' });
    setStages(DEFAULT_STAGES);
    setUseTemplate(true);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isValid = formData.name.trim() !== '' && stages.length >= 2 && stages.every(s => s.name.trim() !== '');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
                <span className="material-symbols-outlined">view_kanban</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Funil de Venda</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Defina o nome, descrição e as etapas do pipeline.</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Pipeline Info */}
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
                  placeholder="Ex: Funil para contratos de locação de plataformas"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none transition-all text-sm font-medium dark:text-white"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Template Toggle */}
            <div className="flex items-center justify-between p-4 bg-mustard-50 dark:bg-mustard-500/5 rounded-2xl border border-mustard-100 dark:border-mustard-500/10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-mustard-500 text-[20px]">auto_awesome</span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Usar modelo padrão</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Etapas pré-configuradas: Prospecção → Proposta → Negociação → Ganho/Perdido</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !useTemplate;
                  setUseTemplate(next);
                  if (next) setStages(DEFAULT_STAGES);
                  else setStages([{ name: '', probability_pct: 0, is_won: false, is_lost: false, position: 1 }]);
                }}
                className={`w-12 h-7 rounded-full transition-all relative ${useTemplate ? 'bg-mustard-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${useTemplate ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* Stages Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Etapas do Funil ({stages.length})</label>
                <button
                  onClick={handleAddStage}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-mustard-600 dark:text-mustard-400 bg-mustard-50 dark:bg-mustard-500/10 hover:bg-mustard-100 dark:hover:bg-mustard-500/20 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Etapa
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
                      <tr key={index} className="bg-white/50 dark:bg-slate-800/30 group">
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
                            value={stage.probability_pct}
                            onChange={e => handleStageChange(index, 'probability_pct', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleStageChange(index, 'is_won', !stage.is_won)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${stage.is_won
                              ? 'bg-mustard-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600 hover:text-mustard-500'}`}
                          >
                            <span className="material-symbols-outlined text-sm">emoji_events</span>
                          </button>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleStageChange(index, 'is_lost', !stage.is_lost)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${stage.is_lost
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
                * O funil deve ter no mínimo 2 etapas. Marque uma etapa como "Ganho" e outra como "Perdido" para controlar o ciclo de vendas.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-4">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-widest transition-colors"
              disabled={isSubmitting}
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
                'Criar Funil'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewPipelineModal;

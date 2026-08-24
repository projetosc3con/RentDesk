import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import type { MaterialCategory, MaterialUnit, Part } from '../../types';

const CATEGORY_OPTIONS: { value: MaterialCategory; label: string; prefix: string; icon: string; desc: string }[] = [
  { value: 'Peça', label: 'Peça de Reposição', prefix: 'P', icon: 'build', desc: 'Peças para manutenção de máquinas e equipamentos' },
  { value: 'Consumo', label: 'Material de Consumo', prefix: 'C', icon: 'science', desc: 'Óleos, graxas, estopas, fitas, filtros rápidos' },
  { value: 'EPI', label: 'EPI / Segurança', prefix: 'E', icon: 'health_and_safety', desc: 'Luvas, capacetes, óculos, protetores auriculares' },
  { value: 'Outros', label: 'Outros Insumos', prefix: 'O', icon: 'category', desc: 'Ferramentas de uso geral e suprimentos diversos' },
];

const UNIT_OPTIONS: { value: MaterialUnit; label: string }[] = [
  { value: 'UN', label: 'UN - Unidade' },
  { value: 'L', label: 'L - Litros' },
  { value: 'KG', label: 'KG - Quilogramas' },
  { value: 'M', label: 'M - Metros' },
  { value: 'PAR', label: 'PAR - Pares' },
  { value: 'CX', label: 'CX - Caixa' },
  { value: 'RL', label: 'RL - Rolo' },
  { value: 'JG', label: 'JG - Jogo / Kit' },
  { value: 'PCT', label: 'PCT - Pacote' },
];

interface PartCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPart: Part) => void;
}

export const PartCreateModal: React.FC<PartCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchingCode, setFetchingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'Peça' as MaterialCategory,
    unit: 'UN' as MaterialUnit,
    internal_code: '',
    description: '',
    part_number: '',
    quantity: '1',
    unit_value: '',
    total_value: '',
    notes: '',
  });

  const fetchNextCode = async (cat: MaterialCategory) => {
    try {
      setFetchingCode(true);
      const { data } = await api.get(`/parts/next-code?category=${encodeURIComponent(cat)}`);
      if (data && data.next_code) {
        setFormData(prev => ({ ...prev, internal_code: data.next_code }));
      }
    } catch (err) {
      console.error('Erro ao sugerir código interno:', err);
    } finally {
      setFetchingCode(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFormData({
        category: 'Peça',
        unit: 'UN',
        internal_code: '',
        description: '',
        part_number: '',
        quantity: '1',
        unit_value: '',
        total_value: '',
        notes: '',
      });
      fetchNextCode('Peça');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (newCat: MaterialCategory) => {
    setFormData(prev => ({ ...prev, category: newCat }));
    fetchNextCode(newCat);
  };

  useEffect(() => {
    const q = parseFloat(formData.quantity);
    const u = parseFloat(formData.unit_value);
    if (!isNaN(q) && !isNaN(u)) {
      setFormData(prev => ({ ...prev, total_value: (q * u).toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, total_value: '' }));
    }
  }, [formData.quantity, formData.unit_value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.description.trim()) {
        setError('A descrição do material é obrigatória.');
        setLoading(false);
        return;
      }

      const { total_value, ...restData } = formData;
      const payload = {
        ...restData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : 0,
        unit_value: formData.unit_value ? parseFloat(formData.unit_value) : 0,
      };

      const { data: newPart } = await api.post<Part>('/parts', payload);
      onSuccess(newPart);
      onClose();
    } catch (err: any) {
      console.error('Erro ao cadastrar material:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao cadastrar material.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 z-10"
        >
          {/* Cabeçalho */}
          <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-mustard-50 dark:bg-mustard-500/10 text-mustard-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-2xl">build</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cadastrar Nova Peça / Insumo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cadastre e inclua diretamente na ordem de serviço</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-xs flex items-center gap-3 font-medium">
                <span className="material-symbols-outlined text-base">error</span>
                <span className="whitespace-pre-line">{error}</span>
              </div>
            )}

            {/* Seletor de Categoria */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Categoria do Material *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                        isSelected
                          ? 'border-mustard-500 bg-mustard-50/40 dark:bg-mustard-500/10 ring-2 ring-mustard-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-mustard-600' : 'text-slate-400'}`}>
                          {cat.icon}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {cat.prefix}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white mt-1">{cat.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Código Interno e Referência */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Código Interno *</label>
                  {fetchingCode && (
                    <span className="text-[10px] text-mustard-500 flex items-center gap-1 font-medium">
                      <span className="w-3 h-3 border border-mustard-500 border-t-transparent rounded-full animate-spin" />
                      Sugerindo...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  name="internal_code"
                  value={formData.internal_code}
                  onChange={handleChange}
                  placeholder="Ex: P0001"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-mustard-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Part Number / Referência</label>
                <input
                  type="text"
                  name="part_number"
                  value={formData.part_number}
                  onChange={handleChange}
                  placeholder="Ex: 502283-A"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-mustard-500"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descrição do Material *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ex: Filtro de Óleo Hidráulico 10 Microns"
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-mustard-500"
              />
            </div>

            {/* Unidade, Quantidade Inicial e Valor Unitário */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Unidade *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-mustard-500"
                >
                  {UNIT_OPTIONS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Qtd. no Estoque *</label>
                <input
                  type="number"
                  name="quantity"
                  step="any"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="1"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-mustard-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valor Unitário (R$)</label>
                <input
                  type="number"
                  name="unit_value"
                  step="0.01"
                  min="0"
                  value={formData.unit_value}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-mustard-500"
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Observações Adicionais</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Observações opcionais sobre compatibilidade, aplicação ou fornecedor..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-mustard-500 resize-none"
              />
            </div>

            {/* Rodapé / Botões */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-mustard-500 hover:bg-mustard-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-mustard-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">check</span>
                    Salvar e Incluir na OS
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

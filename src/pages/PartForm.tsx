import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const PartForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    internal_code: '',
    description: '',
    part_number: '',
    quantity: '',
    unit_value: '',
    total_value: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Auto-calculate total_value
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
      const payload = {
        ...formData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : 0,
        unit_value: formData.unit_value ? parseFloat(formData.unit_value) : 0,
        total_value: formData.total_value ? parseFloat(formData.total_value) : 0,
      };

      await api.post('/parts', payload);
      navigate('/pecas');
    } catch (err: any) {
      console.error('Erro ao cadastrar peça:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao cadastrar peça.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pecas')}
          className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nova Peça</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Cadastre uma nova peça no estoque de manutenção.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-medium">
          <span className="material-symbols-outlined text-red-500">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Descrição da Peça *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Ex: Filtro de Óleo Diesel"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Código Interno *</label>
              <input
                type="text"
                name="internal_code"
                value={formData.internal_code}
                onChange={handleChange}
                required
                placeholder="Ex: P0001"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Part Number (PN)</label>
              <input
                type="text"
                name="part_number"
                value={formData.part_number}
                onChange={handleChange}
                placeholder="Ex: 211751"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Quantidade *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Valor Unitário (R$)</label>
              <input
                type="number"
                name="unit_value"
                value={formData.unit_value}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Valor Total Estimado (R$)</label>
              <input
                type="number"
                name="total_value"
                value={formData.total_value}
                readOnly
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-bold transition-colors"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Calculado automaticamente com base na quantidade e valor unitário.</p>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 ml-1">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px]">notes</span>
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Anotações sobre a peça, fornecedores ou uso geral..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/pecas')}
              className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 font-bold text-white bg-mustard-500 hover:bg-mustard-600 rounded-xl transition-all shadow-lg shadow-mustard-500/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Cadastrar Peça
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default PartForm;

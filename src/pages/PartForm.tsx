import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { formatDate } from '../utils/date';
import type { MaterialCategory, MaterialUnit, Part } from '../types';

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

const PartForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);
  const [fetchingCode, setFetchingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawPart, setRawPart] = useState<Part | null>(null);

  const [formData, setFormData] = useState({
    category: 'Peça' as MaterialCategory,
    unit: 'UN' as MaterialUnit,
    internal_code: '',
    description: '',
    part_number: '',
    quantity: '',
    unit_value: '',
    total_value: '',
    notes: '',
  });

  // Fetch next code for new material based on category
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

  // On mount: fetch existing data if edit mode, or fetch next code for default category if create mode
  useEffect(() => {
    if (isEdit && id) {
      const loadPart = async () => {
        try {
          setFetchingData(true);
          const { data } = await api.get(`/parts/${id}`);
          setRawPart(data);
          setFormData({
            category: (data.category || 'Peça') as MaterialCategory,
            unit: (data.unit || 'UN') as MaterialUnit,
            internal_code: data.internal_code || '',
            description: data.description || '',
            part_number: data.part_number || '',
            quantity: data.quantity != null ? String(data.quantity) : '',
            unit_value: data.unit_value != null ? String(data.unit_value) : '',
            total_value: data.total_value != null ? String(data.total_value) : '',
            notes: data.notes || '',
          });
          setError(null);
        } catch (err: any) {
          console.error('Erro ao carregar material:', err);
          setError('Não foi possível carregar os dados do material.');
        } finally {
          setFetchingData(false);
        }
      };
      loadPart();
    } else {
      fetchNextCode('Peça');
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (newCat: MaterialCategory) => {
    setFormData(prev => ({ ...prev, category: newCat }));
    if (!isEdit) {
      fetchNextCode(newCat);
    }
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
      const { total_value, ...restData } = formData;
      const payload = {
        ...restData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : 0,
        unit_value: formData.unit_value ? parseFloat(formData.unit_value) : 0,
      };

      if (isEdit && id) {
        await api.put(`/parts/${id}`, payload);
      } else {
        await api.post('/parts', payload);
      }

      navigate('/materiais');
    } catch (err: any) {
      console.error('Erro ao salvar material:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao salvar material.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-mustard-500/10 border-t-mustard-500 rounded-full animate-spin" />
        <p className="font-bold text-xs uppercase tracking-widest">Carregando dados do material...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/materiais')}
          className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEdit ? 'Editar Material' : 'Novo Material'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isEdit
              ? 'Atualize as informações do material no estoque.'
              : 'Cadastre peças, materiais de consumo, EPIs ou insumos gerais no estoque.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-medium">
          <span className="material-symbols-outlined text-red-500">error</span>
          <span className="whitespace-pre-line">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          {/* Seletor de Categoria */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Categoria do Material *</span>
              {!isEdit && (
                <span className="text-xs font-normal text-slate-400">
                  O código interno será gerado automaticamente com base na categoria
                </span>
              )}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = formData.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-mustard-500 bg-mustard-50/50 dark:bg-mustard-500/10 shadow-sm ring-2 ring-mustard-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`material-symbols-outlined text-[24px] ${
                          isSelected ? 'text-mustard-600 dark:text-mustard-400' : 'text-slate-400'
                        }`}
                      >
                        {cat.icon}
                      </span>
                      <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        Prefixo: {cat.prefix}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`block text-sm font-bold ${
                          isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {cat.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Dados Gerais do Material */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Descrição do Material *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Ex: Filtro de Óleo Lubrificante Motor Diesel 15W40"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
              />
            </div>

            {/* Código Interno */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center justify-between">
                <span>Código Interno *</span>
                {fetchingCode && (
                  <span className="text-xs text-mustard-600 animate-pulse font-normal">Sugerindo...</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="internal_code"
                  value={formData.internal_code}
                  onChange={handleChange}
                  required
                  placeholder="Ex: P0001, C0001, E0001"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white font-mono font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => fetchNextCode(formData.category)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-mustard-600 hover:text-mustard-700 bg-mustard-50 dark:bg-mustard-500/10 px-2 py-1 rounded-lg"
                    title="Recalcular próximo código"
                  >
                    Auto
                  </button>
                )}
              </div>
            </div>

            {/* Unidade de Medida */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Unidade de Medida *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white font-medium"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Part Number / Referência */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Part Number / Referência
              </label>
              <input
                type="text"
                name="part_number"
                value={formData.part_number}
                onChange={handleChange}
                placeholder="Ex: 211751, CA-4001"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Quantidade Inicial */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Quantidade em Estoque *
              </label>
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

            {/* Valor Unitário */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Valor Unitário (R$)
              </label>
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

            {/* Valor Total Estimado */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Valor Total Estimado (R$)
              </label>
              <input
                type="number"
                name="total_value"
                value={formData.total_value}
                readOnly
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-bold transition-colors"
              />
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 ml-1">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px]">
                notes
              </span>
              Observações & Detalhes Adicionais
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Informações sobre fornecedor padrão, especificações técnicas, aplicação ou armazenamento..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 transition-all text-slate-900 dark:text-white resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Dados de Auditoria e Importação (Apenas Modo Edição) */}
          {isEdit && rawPart && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-mustard-500">history</span>
                Auditoria & Registro
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Data de Cadastro / Importação
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatDate(rawPart.created_at)}
                    {rawPart.created_at ? ` às ${new Date(rawPart.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Chave / UID do Responsável
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 select-all block truncate" title={rawPart.created_by}>
                    {rawPart.created_by || 'Sistema / Importação'}
                  </span>
                </div>
                {rawPart.invoice_number && (
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      NF-e Vinculada
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                      Nº {rawPart.invoice_number}
                    </span>
                    {rawPart.supplier_name && (
                      <span className="text-[11px] text-slate-500 block truncate" title={rawPart.supplier_name}>
                        {rawPart.supplier_name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/materiais')}
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
                  {isEdit ? 'Salvar Alterações' : 'Cadastrar Material'}
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

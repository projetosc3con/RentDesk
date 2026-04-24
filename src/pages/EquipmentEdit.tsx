import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import api from '../services/api';

const EQUIPMENT_TYPES = [
  'Elétrica',
  'Diesel',
];

const EquipmentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    asset_number: '',
    name: '',
    type: '',
    model: '',
    serial_number: '',
    height: '',
    manufacture_year: '',
    value: '',
    unit: 'un',
    notes: '',
    status: '',
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setFetching(true);
        const { data } = await api.get(`/equipments/${id}`);
        setFormData({
          asset_number: data.asset_number || '',
          name: data.name || '',
          type: data.type || '',
          model: data.model || '',
          serial_number: data.serial_number || '',
          height: data.height?.toString() || '',
          manufacture_year: data.manufacture_year?.toString() || '',
          value: data.value?.toString() || '',
          unit: data.unit || 'un',
          notes: data.notes || '',
          status: data.status || 'Disponível',
        });
        if (data.photo_url) setPhotoPreview(data.photo_url);
      } catch (err: any) {
        console.error('Erro ao buscar equipamento:', err);
        setError('Equipamento não encontrado ou erro de conexão.');
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchEquipment();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let photo_url = photoPreview;

      // Upload de nova foto se selecionada
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('equipments')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('equipments')
          .getPublicUrl(filePath);

        photo_url = publicUrl;
      }

      const payload = {
        ...formData,
        height: formData.height ? parseFloat(formData.height) : null,
        manufacture_year: formData.manufacture_year ? parseInt(formData.manufacture_year) : null,
        value: formData.value ? parseFloat(formData.value) : null,
        photo_url,
      };

      await api.put(`/equipments/${id}`, payload);
      navigate('/equipamentos');
    } catch (err: any) {
      console.error('Erro ao atualizar equipamento:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao atualizar equipamento.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium mt-4">Buscando dados da máquina...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/equipamentos')}
          className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Editar Máquina</h1>
          <p className="text-slate-500 mt-1">Atualize as informações do patrimônio <span className="font-bold text-emerald-900">{formData.asset_number}</span></p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Foto */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-emerald-900 text-xl">photo_camera</span>
                Foto da Máquina
              </h3>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-900/30 hover:bg-emerald-50/30 transition-all overflow-hidden group"
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <span className="material-symbols-outlined text-3xl">edit</span>
                      <span className="text-xs font-bold uppercase mt-1">Trocar Foto</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-slate-300">add_photo_alternate</span>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Clique para adicionar</p>
                  </>
                )}
              </div>

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full mt-3 py-2 text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors"
                >
                  Remover Foto
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-emerald-900 text-xl">settings</span>
                Status Operacional
              </h3>
              <div className="space-y-1.5">
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm appearance-none cursor-pointer"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Locado">Locado</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-900 text-xl">precision_manufacturing</span>
                  Dados Gerais
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nº Patrimônio</label>
                    <input disabled value={formData.asset_number} className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome do Equipamento *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none">
                      {EQUIPMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Modelo</label>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-900 text-xl">payments</span>
                  Financeiro e Notas
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Valor Patrimonial (R$)</label>
                    <input type="number" step="0.01" name="value" value={formData.value} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Ano</label>
                    <input type="number" name="manufacture_year" value={formData.manufacture_year} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Observações</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm resize-none outline-none" />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => navigate('/equipamentos')} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-xs uppercase tracking-widest">Descartar</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default EquipmentEdit;

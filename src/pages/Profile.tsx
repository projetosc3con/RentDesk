import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import api from '../services/api';

const Profile: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    birth_date: '',
    phone: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    photo_url: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await api.get('/users/me');
        setFormData({
          full_name: data.full_name || '',
          cpf: data.cpf || '',
          birth_date: data.birth_date || '',
          phone: data.phone || '',
          address_street: data.address_street || '',
          address_number: data.address_number || '',
          address_complement: data.address_complement || '',
          address_city: data.address_city || '',
          address_state: data.address_state || '',
          address_zip: data.address_zip || '',
          photo_url: data.photo_url || '',
        });
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setPhotoLoading(true);
    setMessage(null);

    try {
      // 1. Upload para o Storage (Usando ID do usuário como pasta para RLS)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obter URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Atualizar no Banco via API
      await api.put(`/users/${profile.id}`, { photo_url: publicUrl });
      
      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
      await refreshProfile();
      setMessage({ type: 'success', text: 'Foto de perfil atualizada!' });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar foto' });
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profile) return;
    setPhotoLoading(true);

    try {
      await api.put(`/users/${profile.id}`, { photo_url: null });
      setFormData(prev => ({ ...prev, photo_url: '' }));
      await refreshProfile();
      setMessage({ type: 'success', text: 'Foto removida com sucesso' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao remover foto' });
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.put(`/users/${profile?.id}`, formData);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Meu Perfil</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Gerencie suas informações pessoais e de contato.</p>
        </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-2xl border flex items-center gap-3",
            message.type === 'success' ? "bg-mustard-50 dark:bg-mustard-500/10 border-mustard-100 dark:border-mustard-500/20 text-mustard-800 dark:text-mustard-400" : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-400"
          )}
        >
          <span className="material-symbols-outlined">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-sm font-bold tracking-tight">{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Foto e Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-mustard-500 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl shadow-mustard-500/20 overflow-hidden border-4 border-slate-50 dark:border-slate-800">
                {photoLoading ? (
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : formData.photo_url ? (
                  <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{formData.full_name ? formData.full_name.substring(0, 2).toUpperCase() : 'U'}</span>
                )}
              </div>
              
              {/* Overlay de Edição de Foto */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
                className="absolute inset-0 w-32 h-32 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">photo_camera</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Alterar</span>
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload}
              />
            </div>

            {formData.photo_url && (
              <button 
                onClick={handleRemovePhoto}
                className="text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 uppercase tracking-widest transition-colors mb-4"
              >
                Remover Foto
              </button>
            )}

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{profile?.full_name}</h3>
            <p className="text-xs font-bold text-mustard-600 dark:text-mustard-400 uppercase tracking-widest mt-1.5">{profile?.access_level}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">E-mail de acesso</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate mt-1">{profile?.email}</p>
            </div>
          </div>

          {/* Card de Segurança */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-mustard-500 text-xl">shield_person</span>
              Segurança
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              Mantenha sua conta segura alterando sua senha regularmente ou definindo uma nova credencial.
            </p>
            <button
              onClick={() => navigate('/definir-senha')}
              className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">lock_reset</span>
              Alterar Minha Senha
            </button>
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                <span className="material-symbols-outlined text-mustard-500 text-xl">person_edit</span>
                Dados Pessoais
              </h3>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                  />
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 dark:bg-slate-800"></div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 uppercase text-xs tracking-widest">
                  <span className="material-symbols-outlined text-mustard-500 text-xl">home</span>
                  Endereço
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                    <input
                      type="text"
                      name="address_street"
                      value={formData.address_street}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Número</label>
                    <input
                      type="text"
                      name="address_number"
                      value={formData.address_number}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                    <input
                      type="text"
                      name="address_city"
                      value={formData.address_city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                    <input
                      type="text"
                      name="address_state"
                      value={formData.address_state}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                    <input
                      type="text"
                      name="address_zip"
                      value={formData.address_zip}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-mustard-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-mustard-600 active:scale-[0.98] transition-all shadow-lg shadow-mustard-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Salvar Alterações
                    <span className="material-symbols-outlined text-[20px]">save</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper para classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default Profile;

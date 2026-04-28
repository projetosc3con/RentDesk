import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { supabase } from '../lib/supabase';

const maskCnpj = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const ClientForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    cnpj: '',
    state_subscription: '',
    contact_name: '',
    phone: '',
    email: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    documentation_url: '',
    active: true,
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchClient = async () => {
        try {
          setFetching(true);
          const { data } = await api.get(`/clients/${id}`);
          setFormData({
            company_name: data.company_name || '',
            cnpj: data.cnpj || '',
            state_subscription: data.state_subscription || '',
            contact_name: data.contact_name || '',
            phone: data.phone || '',
            email: data.email || '',
            address_street: data.address_street || '',
            address_number: data.address_number || '',
            address_complement: data.address_complement || '',
            address_city: data.address_city || '',
            address_state: data.address_state || '',
            address_zip: data.address_zip || '',
            documentation_url: data.documentation_url || '',
            active: data.active ?? true,
          });
        } catch (err: any) {
          console.error('Erro ao buscar cliente:', err);
          setError('Não foi possível carregar os dados do cliente.');
        } finally {
          setFetching(false);
        }
      };
      fetchClient();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleCnpjChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCnpj(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: masked }));

    const unmasked = masked.replace(/\D/g, '');
    if (unmasked.length === 14) {
      try {
        const response = await fetch(`https://api.opencnpj.org/${unmasked}`);
        if (!response.ok) return;
        const data = await response.json();

        const company_name = data.razao_scoial || data.razao_social || '';
        const tel = data.telefones?.[0];
        const phone = tel ? `(${tel.ddd}) ${tel.numero}` : '';
        const email = data.email || '';

        const tipo_logradouro = data.tipo_logradouro || '';
        const logradouro = data.logradouro || '';
        const numero = data.numero || '';
        const bairro = data.bairro || '';
        const municipio = data.municipio || '';
        const uf = data.uf || '';

        const cepStr = (data.cep || '').replace(/\D/g, '');
        const cep_formatado = cepStr.length === 8 ? `${cepStr.slice(0, 5)}-${cepStr.slice(5)}` : data.cep || '';

        const address_street = `${tipo_logradouro} ${logradouro}`.trim();
        const address_complement = `${tipo_logradouro} ${logradouro} Nº ${numero}, ${bairro}, ${municipio} - ${uf} CEP: ${cep_formatado}`.trim();

        setFormData(prev => ({
          ...prev,
          company_name: company_name || prev.company_name,
          phone: phone || prev.phone,
          email: email || prev.email,
          address_street: address_street || prev.address_street,
          address_number: numero || prev.address_number,
          address_complement: address_complement || prev.address_complement,
          address_city: municipio || prev.address_city,
          address_state: uf || prev.address_state,
          address_zip: cep_formatado || prev.address_zip
        }));
      } catch (err) {
        // não fazer nada se a api falhar
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'xlsx', 'docx'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      setError('Tipo de arquivo não suportado. Use PDF, PNG, JPG, JPEG, XLSX ou DOCX.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('client-documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, documentation_url: publicUrl }));
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError('Falha ao enviar arquivo. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await api.put(`/clients/${id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      navigate('/clientes');
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao salvar os dados do cliente.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium mt-4">Carregando dados do cliente...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clientes')}
          className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isEdit ? 'Atualize as informações do cliente industrial.' : 'Cadastre um novo cliente na sua base comercial.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção: Identificação da Empresa */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-900 text-xl">business</span>
              Identificação da Empresa
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Razão Social *</label>
                <input
                  required
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Ex: Indústrias Metalúrgicas S.A."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">CNPJ *</label>
                <input
                  required
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleCnpjChange}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Inscrição Estadual</label>
                <input
                  type="text"
                  name="state_subscription"
                  value={formData.state_subscription}
                  onChange={handleChange}
                  placeholder="Isento ou Nº"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center h-5">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <div className="ml-1 text-sm">
                <label htmlFor="active" className="font-bold text-slate-700 cursor-pointer">Cliente Ativo</label>
                <p className="text-xs text-slate-500">Desative para suspender novas locações para este cliente.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Contato */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-900 text-xl">contact_phone</span>
              Informações de Contato
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contato Principal</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="comercial@empresa.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Endereço de Faturamento */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-900 text-xl">location_on</span>
              Endereço de Faturamento
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                <input
                  type="text"
                  name="address_street"
                  value={formData.address_street}
                  onChange={handleChange}
                  placeholder="Av. Industrial"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Número</label>
                <input
                  type="text"
                  name="address_number"
                  value={formData.address_number}
                  onChange={handleChange}
                  placeholder="123"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Complemento</label>
                <input
                  type="text"
                  name="address_complement"
                  value={formData.address_complement}
                  onChange={handleChange}
                  placeholder="Sala 01, Bloco B"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cidade</label>
                  <input
                    type="text"
                    name="address_city"
                    value={formData.address_city}
                    onChange={handleChange}
                    placeholder="São Paulo"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">UF</label>
                  <input
                    type="text"
                    name="address_state"
                    value={formData.address_state}
                    onChange={handleChange}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">CEP</label>
                <input
                  type="text"
                  name="address_zip"
                  value={formData.address_zip}
                  onChange={handleChange}
                  placeholder="00000-000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Anexos e Documentação */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-900 text-xl">description</span>
              Anexos e Documentação
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500 mb-2">
              Anexe documentos de identificação ou outros arquivos relevantes (PDF, PNG, JPG, JPEG, XLSX, DOCX).
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <label className="relative flex flex-col items-center justify-center w-full md:w-64 h-32 border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {uploading ? (
                    <div className="w-8 h-8 border-2 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin mb-2"></div>
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-600 text-3xl mb-2">cloud_upload</span>
                  )}
                  <p className="text-xs font-bold text-slate-500 group-hover:text-emerald-900">
                    {uploading ? 'Enviando...' : 'Clique para anexar'}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx"
                />
              </label>

              {formData.documentation_url && (
                <div className="flex-1 w-full bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-emerald-600">attachment</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Documento Anexado</p>
                      <a
                        href={formData.documentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        Visualizar arquivo
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, documentation_url: '' }))}
                    className="p-2 text-emerald-900/40 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-xs uppercase tracking-wider"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-emerald-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-800 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  {isEdit ? 'save' : 'person_add'}
                </span>
                {isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ClientForm;

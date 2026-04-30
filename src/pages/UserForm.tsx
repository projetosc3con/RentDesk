import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api'; // Importando a API Axios
import type { AccessLevel } from '../types';

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    cpf: '',
    phone: '',
    role_title: '',
    access_level: 'Visualizador' as AccessLevel,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Agora chamamos o nosso próprio Backend Node.js
      await api.post('/users/invite', {
        ...formData,
        redirectTo: window.location.origin
      });

      setSuccess(true);
      setTimeout(() => navigate('/usuarios'), 5000);
    } catch (err: any) {
      console.error('Error inviting user:', err);
      setError(err.response?.data?.error || 'Ocorreu um erro ao enviar o convite.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center max-w-sm"
        >
          <div className="w-20 h-20 bg-mustard-50 dark:bg-mustard-500/10 rounded-full flex items-center justify-center mb-6 text-mustard-600 dark:text-mustard-400">
            <span className="material-symbols-outlined text-5xl">mail</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Convite Enviado!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Um e-mail de convite foi enviado para <strong className="text-slate-900 dark:text-white">{formData.email}</strong>. O usuário poderá finalizar o cadastro através do link recebido.
          </p>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 5 }}
              className="h-full bg-mustard-500"
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 uppercase font-bold tracking-widest">Redirecionando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto space-y-8 pb-20"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/usuarios')}
          className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Novo Colaborador</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Convide um novo membro para a equipe do RentDesk.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-medium">
              <span className="material-symbols-outlined text-red-500">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input
                required
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="Ex: João da Silva"
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <input
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="email@empresa.com"
                type="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">CPF</label>
              <input
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono"
                placeholder="000.000.000-00"
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Cargo / Atribuição</label>
              <input
                name="role_title"
                value={formData.role_title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="Ex: Técnico de Manutenção"
                type="text"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nível de Acesso</label>
              <div className="relative">
                <select
                  name="access_level"
                  value={formData.access_level}
                  onChange={handleChange}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Usuário">Usuário padrão</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none text-lg">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-xs uppercase tracking-wider"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-mustard-500 text-white hover:bg-mustard-600 transition-all font-bold text-sm uppercase tracking-wider shadow-lg shadow-mustard-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Enviando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                Enviar Convite
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl p-6 border border-mustard-100 dark:border-mustard-500/20 flex gap-4 shadow-sm">
        <div className="w-10 h-10 bg-mustard-100 dark:bg-mustard-500/20 rounded-xl flex items-center justify-center shrink-0 text-mustard-600 dark:text-mustard-400">
          <span className="material-symbols-outlined">info</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-mustard-900 dark:text-mustard-400 uppercase tracking-widest">Como funciona o convite?</h4>
          <p className="text-xs text-mustard-800/70 dark:text-slate-400 mt-1 leading-relaxed">
            Ao clicar em "Enviar Convite", o sistema enviará um e-mail para o colaborador através do nosso backend. Ele precisará clicar no link do e-mail para definir sua senha e ativar sua conta. O perfil de acesso que você definiu será aplicado automaticamente após a confirmação.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default UserForm;

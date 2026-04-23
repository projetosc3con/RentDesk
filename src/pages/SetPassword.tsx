import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const SetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Atualizar a senha no Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // 2. Marcar password_set como true no perfil
      if (user) {
        const { error: profileError } = await supabase
          .from('users_profiles')
          .update({ password_set: true })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // 3. Atualizar o perfil no contexto para desbloquear o PasswordGuard
      await refreshProfile();

      // 4. Redirecionar para o dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao definir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 pb-6 text-emerald-900 text-center border-b border-slate-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 p-2">
              <img src={logo} alt="RentDesk Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Defina sua Senha</h1>
            <p className="text-slate-500 text-sm mt-2">Bem-vindo ao RentDesk! Para começar, crie uma senha segura para sua conta.</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSetPassword} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-xs font-medium">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nova Senha</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirmar Senha</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">enhanced_encryption</span>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all outline-none text-sm"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-800 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Ativar Minha Conta
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetPassword;

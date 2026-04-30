import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import wallpaper from '../assets/login-wallpaper.jpeg';
import logoLight from '../../config_files/logo-completo.png';
import logoDark from '../../config_files/logo-completo-dark.png';

const SetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { theme } = useTheme();

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 font-sans">
      {/* Wallpaper background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-tr from-slate-950 via-slate-900/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-20 p-4"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden">
          <div className="p-10 pb-6 text-center border-b border-slate-100 dark:border-slate-800">
            <div className="w-full px-8 mb-6">
              <img 
                src={theme === 'dark' ? logoDark : logoLight} 
                alt="RentDesk Logo" 
                className="w-full h-auto object-contain transition-all duration-300" 
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Defina sua Senha</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Bem-vindo ao RentDesk! Crie uma senha segura para começar.</p>
          </div>

          <div className="p-10">
            <form onSubmit={handleSetPassword} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-3 text-red-700 dark:text-red-400 text-xs font-medium">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Nova Senha</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mustard-500 transition-colors text-[20px]">lock</span>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Confirmar Senha</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mustard-500 transition-colors text-[20px]">enhanced_encryption</span>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-mustard-500 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.15em] hover:bg-mustard-600 active:scale-[0.98] transition-all shadow-xl shadow-mustard-500/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none mt-2"
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

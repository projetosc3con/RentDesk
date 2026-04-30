import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import wallpaper from '../assets/login-wallpaper.jpeg';
import logoLight from '../../config_files/logo-completo.png';
import logoDark from '../../config_files/logo-completo-dark.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuth();
  const { theme } = useTheme();

  // Redirect if already logged in
  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
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
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-20 p-4"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden">
          <div className="p-10 pb-6 text-center">
            <div className="w-full px-8 mb-6">
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="RentDesk Logo"
                className="w-full h-auto object-contain transition-all duration-300"
              />
            </div>
            <div className="h-[1px] w-12 bg-mustard-500 mx-auto rounded-full mb-4 opacity-50" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Faça login para acessar sua conta</p>
          </div>

          <div className="p-10 pt-4">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-3"
                >
                  <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">E-mail Corporativo</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mustard-500 transition-colors text-[20px]">mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="nome@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Senha de Acesso</label>
                  <a href="#" className="text-[11px] font-bold text-mustard-600 dark:text-mustard-400 hover:text-mustard-700 transition-colors">Esqueceu?</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mustard-500 transition-colors text-[20px]">lock</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-mustard-500 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.15em] hover:bg-mustard-600 active:scale-[0.98] transition-all shadow-xl shadow-mustard-500/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Acessar
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                © 2026 - C3LOC ERP
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import wallpaper from '../assets/login-wallpaper.jpeg';
import logoLight from '../../config_files/logo-completo.png';
import logoDark from '../../config_files/logo-completo-dark.png';

const API_BASE = import.meta.env.VITE_API_ADDRESS;

type View = 'login' | 'first-access';

const LoginPage: React.FC = () => {
  const [view, setView] = useState<View>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First access state
  const [faEmail, setFaEmail] = useState('');
  const [faFullName, setFaFullName] = useState('');
  const [faPassword, setFaPassword] = useState('');
  const [faPasswordConfirm, setFaPasswordConfirm] = useState('');
  const [faAcceptTerms, setFaAcceptTerms] = useState(false);
  const [faLoading, setFaLoading] = useState(false);
  const [faError, setFaError] = useState<string | null>(null);
  const [faSuccess, setFaSuccess] = useState(false);
  const [faStep, setFaStep] = useState<'email' | 'complete'>('email');
  const [faCheckingEmail, setFaCheckingEmail] = useState(false);

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

  const handleCheckEmail = async () => {
    if (!faEmail || !faEmail.includes('@')) return;

    setFaCheckingEmail(true);
    setFaError(null);

    try {
      const res = await axios.post(`${API_BASE}/auth/check-email`, { email: faEmail });
      const data = res.data;

      if (!data.authorized) {
        setFaError(data.message || 'E-mail não autorizado no sistema.');
        setFaStep('email');
        return;
      }

      // Email autorizado — preencher dados
      setFaFullName(data.profile.full_name || '');
      setFaStep('complete');
    } catch (err: any) {
      setFaError(err.response?.data?.error || 'Erro ao verificar e-mail.');
    } finally {
      setFaCheckingEmail(false);
    }
  };

  const handleEmailBlur = () => {
    if (faEmail && faEmail.includes('@')) {
      handleCheckEmail();
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaError(null);

    if (faPassword.length < 6) {
      setFaError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (faPassword !== faPasswordConfirm) {
      setFaError('As senhas não coincidem.');
      return;
    }

    if (!faAcceptTerms) {
      setFaError('Você deve aceitar os termos de uso.');
      return;
    }

    setFaLoading(true);

    try {
      await axios.post(`${API_BASE}/auth/complete-signup`, {
        email: faEmail,
        password: faPassword,
        full_name: faFullName
      });

      setFaSuccess(true);

      // Aguarda um momento e redireciona para o login
      setTimeout(() => {
        setView('login');
        setEmail(faEmail);
        setFaSuccess(false);
        setFaStep('email');
        setFaEmail('');
        setFaPassword('');
        setFaPasswordConfirm('');
        setFaAcceptTerms(false);
        setFaFullName('');
      }, 3000);
    } catch (err: any) {
      setFaError(err.response?.data?.error || 'Erro ao completar cadastro.');
    } finally {
      setFaLoading(false);
    }
  };

  const switchToFirstAccess = () => {
    setView('first-access');
    setError(null);
    setFaError(null);
    setFaStep('email');
    setFaSuccess(false);
  };

  const switchToLogin = () => {
    setView('login');
    setFaError(null);
    setError(null);
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
            <AnimatePresence mode="wait">
              <motion.p
                key={view}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-slate-500 dark:text-slate-400 text-sm font-medium"
              >
                {view === 'login' ? 'Faça login para acessar sua conta' : 'Complete seu primeiro acesso'}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="p-10 pt-4">
            <AnimatePresence mode="wait">
              {/* ====== LOGIN VIEW ====== */}
              {view === 'login' && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
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

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={switchToFirstAccess}
                      className="text-[12px] font-bold text-mustard-600 dark:text-mustard-400 hover:text-mustard-700 dark:hover:text-mustard-300 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_add</span>
                      Primeiro Acesso
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ====== FIRST ACCESS VIEW ====== */}
              {view === 'first-access' && (
                <motion.div
                  key="first-access-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {faSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-mustard-50 dark:bg-mustard-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-mustard-600 dark:text-mustard-400">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cadastro Concluído!</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Você será redirecionado para o login...</p>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-6">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3 }}
                          className="h-full bg-mustard-500"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={faStep === 'email' ? (e) => { e.preventDefault(); handleCheckEmail(); } : handleCompleteSignup} className="space-y-5">
                      {faError && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-3"
                        >
                          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
                          <p className="text-xs text-red-700 dark:text-red-400 font-medium leading-relaxed">{faError}</p>
                        </motion.div>
                      )}

                      {/* Step 1: Email */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">E-mail Cadastrado</label>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mustard-500 transition-colors text-[20px]">mail</span>
                          <input
                            type="email"
                            required
                            value={faEmail}
                            onChange={(e) => {
                              setFaEmail(e.target.value);
                              setFaError(null);
                              // Reset step if email changed after validation
                              if (faStep === 'complete') setFaStep('email');
                            }}
                            onBlur={handleEmailBlur}
                            disabled={faStep === 'complete'}
                            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-70"
                            placeholder="Insira o e-mail cadastrado pelo gestor"
                          />
                          {faCheckingEmail && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <div className="w-5 h-5 border-2 border-mustard-500/30 border-t-mustard-500 rounded-full animate-spin" />
                            </div>
                          )}
                          {faStep === 'complete' && (
                            <button
                              type="button"
                              onClick={() => { setFaStep('email'); setFaError(null); }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-mustard-500 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Step 2: Complete form (shown after email verification) */}
                      <AnimatePresence>
                        {faStep === 'complete' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-5 overflow-hidden"
                          >
                            <div className="p-3 rounded-xl bg-mustard-50 dark:bg-mustard-500/10 border border-mustard-100 dark:border-mustard-500/20 flex items-center gap-2">
                              <span className="material-symbols-outlined text-mustard-600 dark:text-mustard-400 text-[16px]">verified</span>
                              <p className="text-[11px] text-mustard-800 dark:text-mustard-300 font-bold">E-mail autorizado. Complete seu cadastro abaixo.</p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                              <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mustard-500 transition-colors text-[20px]">person</span>
                                <input
                                  type="text"
                                  required
                                  value={faFullName}
                                  onChange={(e) => setFaFullName(e.target.value)}
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                  placeholder="Seu nome completo"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Criar Senha</label>
                              <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mustard-500 transition-colors text-[20px]">lock</span>
                                <input
                                  type="password"
                                  required
                                  minLength={6}
                                  value={faPassword}
                                  onChange={(e) => setFaPassword(e.target.value)}
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                  placeholder="Mínimo 6 caracteres"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Confirmar Senha</label>
                              <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-mustard-500 transition-colors text-[20px]">lock_reset</span>
                                <input
                                  type="password"
                                  required
                                  minLength={6}
                                  value={faPasswordConfirm}
                                  onChange={(e) => setFaPasswordConfirm(e.target.value)}
                                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                  placeholder="Repita a senha"
                                />
                              </div>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-1">
                              <input
                                type="checkbox"
                                checked={faAcceptTerms}
                                onChange={(e) => setFaAcceptTerms(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded-md border-slate-300 dark:border-slate-600 text-mustard-500 focus:ring-mustard-500/20 cursor-pointer"
                              />
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Li e aceito os <a href="#" className="text-mustard-600 dark:text-mustard-400 font-bold hover:underline">Termos de Uso</a> e a <a href="#" className="text-mustard-600 dark:text-mustard-400 font-bold hover:underline">Política de Privacidade</a> do sistema RentDesk.
                              </span>
                            </label>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={faLoading || faCheckingEmail || (faStep === 'complete' && (!faAcceptTerms || !faPassword || !faPasswordConfirm))}
                        className="w-full py-4 bg-mustard-500 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.15em] hover:bg-mustard-600 active:scale-[0.98] transition-all shadow-xl shadow-mustard-500/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none mt-2"
                      >
                        {faLoading || faCheckingEmail ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : faStep === 'email' ? (
                          <>
                            Verificar E-mail
                            <span className="material-symbols-outlined text-[20px]">search</span>
                          </>
                        ) : (
                          <>
                            Completar Cadastro
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </>
                        )}
                      </button>

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={switchToLogin}
                          className="text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-mustard-600 dark:hover:text-mustard-400 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                          Voltar ao Login
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

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

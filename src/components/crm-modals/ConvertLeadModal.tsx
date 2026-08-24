import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { crmService, type CRMLead } from '../../services/crm';
import { financeiroService } from '../../services/financeiro';
import { useAuth } from '../../contexts/AuthContext';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: any) => void;
  lead: CRMLead | null;
}

const maskDocumento = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const ConvertLeadModal: React.FC<ConvertLeadModalProps> = ({ isOpen, onClose, onSuccess, lead }) => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [documento, setDocumento] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [convertedClient, setConvertedClient] = useState<any>(null);

  useEffect(() => {
    if (lead) {
      setDocumento(lead.cnpj ? maskDocumento(lead.cnpj) : '');
      setScore(null);
      setScoreError(null);
      setSuccess(false);
      setConvertedClient(null);
    }
  }, [lead, isOpen]);

  if (!lead) return null;

  const cleanDocument = documento.replace(/\D/g, '');
  const isValidDocument = cleanDocument.length === 11 || cleanDocument.length === 14;

  const stars = score !== null ? Math.min(5, Math.max(0, score / 200)) : null;
  const isScoreBelowThreshold = stars !== null && stars < 3.5;

  const userAccessLevel = profile?.access_level || '';
  const isPrivilegedUser = ['Administrador', 'Diretoria', 'Gerente'].includes(userAccessLevel);

  // Regra de negócio:
  // - Se o score ainda não foi consultado: bloqueia conversão
  // - Se score >= 3.5 estrelas: qualquer usuário com acesso ao CRM pode converter
  // - Se score < 3.5 estrelas: somente Administrador, Diretoria ou Gerente pode converter
  const canConvert = score !== null && (!isScoreBelowThreshold || isPrivilegedUser);

  const handleConsultarScore = async () => {
    if (!isValidDocument) return;
    setScoreLoading(true);
    setScoreError(null);
    try {
      const res = await financeiroService.consultarScore(cleanDocument);
      if (res.sucesso) {
        setScore(res.score);
      } else {
        setScoreError(res.mensagem || 'Não foi possível obter o score do cliente.');
      }
    } catch (err: any) {
      console.error('Erro ao consultar score:', err);
      setScoreError('Falha ao conectar com o serviço de score.');
    } finally {
      setScoreLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!canConvert) return;
    setLoading(true);
    try {
      const result = await crmService.convertLead(lead.id, {
        score: score ?? undefined,
        average_score: stars ?? undefined,
      });
      setConvertedClient(result.client);
      setSuccess(true);
      onSuccess(result.client);
    } catch (err) {
      console.error('Erro ao converter lead:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setConvertedClient(null);
    setScore(null);
    setScoreError(null);
    onClose();
  };

  const renderStars = (starsValue: number | null) => {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          if (starsValue === null) {
            return (
              <span
                key={starIndex}
                className="material-symbols-outlined text-3xl text-slate-200 dark:text-slate-700 select-none"
              >
                star
              </span>
            );
          }

          const fillLevel = Math.max(0, Math.min(1, starsValue - (starIndex - 1)));

          if (fillLevel >= 0.75) {
            return (
              <span
                key={starIndex}
                className="material-symbols-outlined text-3xl text-amber-400 select-none"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            );
          } else if (fillLevel >= 0.25) {
            return (
              <span
                key={starIndex}
                className="material-symbols-outlined text-3xl text-amber-400 select-none"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star_half
              </span>
            );
          } else {
            return (
              <span
                key={starIndex}
                className="material-symbols-outlined text-3xl text-slate-200 dark:text-slate-700 select-none"
              >
                star
              </span>
            );
          }
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
          >
            {success ? (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-green-500/30 mb-6">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="material-symbols-outlined text-4xl"
                  >
                    verified
                  </motion.span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lead Convertido!</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                  O lead <strong>{lead.company_name}</strong> foi convertido em cliente com sucesso na base.
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={() => {
                      handleClose();
                      navigate(`/clientes/${convertedClient?.id}`);
                    }}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Acessar Cadastro do Cliente
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all"
                  >
                    Permanecer no CRM
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-mustard-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mustard-500/20">
                        <span className="material-symbols-outlined text-2xl">swap_horiz</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Converter Lead</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[260px] sm:max-w-xs font-medium">
                          {lead.company_name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
                  {/* Campo CNPJ / CPF e Botão Consultar */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                      CNPJ / CPF do Cliente
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={documento}
                        onChange={(e) => {
                          setDocumento(maskDocumento(e.target.value));
                          setScore(null);
                          setScoreError(null);
                        }}
                        placeholder="00.000.000/0000-00"
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 outline-none text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleConsultarScore}
                        disabled={!isValidDocument || scoreLoading}
                        className="px-5 py-3 bg-mustard-500 hover:bg-mustard-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-mustard-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {scoreLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base">search</span>
                            Consultar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quadro de Estrelas e Score */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Classificação de Crédito (Score Serasa / Asaas)
                    </p>

                    {renderStars(stars)}

                    {stars !== null ? (
                      <div className="space-y-0.5">
                        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {score} pontos
                        </p>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {stars.toFixed(2)} de 5.0 estrelas
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic pt-1">
                        clique em &quot;Consultar&quot; para obter o score
                      </p>
                    )}
                  </div>

                  {/* Mensagem de Erro na Consulta */}
                  {scoreError && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-xs font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg shrink-0">error</span>
                      <span>{scoreError}</span>
                    </div>
                  )}

                  {/* Feedback de Validação e Permissão */}
                  {score !== null && (
                    <>
                      {isScoreBelowThreshold ? (
                        isPrivilegedUser ? (
                          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl p-4 text-xs flex items-start gap-3">
                            <span className="material-symbols-outlined text-xl text-amber-500 shrink-0">warning</span>
                            <div className="space-y-0.5">
                              <p className="font-bold">Score abaixo de 3.5 estrelas ({stars?.toFixed(2)}★)</p>
                              <p className="text-amber-700 dark:text-amber-400">
                                Como <strong>{userAccessLevel}</strong>, você possui autorização especial para prosseguir com a conversão deste lead.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 rounded-2xl p-4 text-xs flex items-start gap-3">
                            <span className="material-symbols-outlined text-xl text-red-500 shrink-0">gpp_bad</span>
                            <div className="space-y-0.5">
                              <p className="font-bold">Conversão Bloqueada ({stars?.toFixed(2)}★)</p>
                              <p className="text-red-600 dark:text-red-400">
                                O score do lead está abaixo de 3.5 estrelas. Apenas usuários com perfil <strong>Administrador</strong>, <strong>Diretoria</strong> ou <strong>Gerente</strong> podem prosseguir.
                              </p>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-2xl p-4 text-xs flex items-start gap-3">
                          <span className="material-symbols-outlined text-xl text-emerald-500 shrink-0">verified</span>
                          <div className="space-y-0.5">
                            <p className="font-bold">Score Aprovado ({stars?.toFixed(2)}★)</p>
                            <p className="text-emerald-700 dark:text-emerald-400">
                              Lead com pontuação satisfatória (acima de 3.5 estrelas). Conversão liberada.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {score === null && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                      É necessário realizar a consulta do score para habilitar a conversão.
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={!canConvert || loading}
                    className="flex-[2] py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
                        Confirmar Conversão
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConvertLeadModal;

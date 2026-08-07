import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { financeiroService } from '../../../services/financeiro';
import { getApiErrorMessage } from '../../../utils/apiError';
import type { AsaasCompanyType, AsaasSubaccountPayload } from '../../../types';

type StatusState = 'loading' | 'connected' | 'not_configured' | 'error';

const emptyForm = {
  name: '',
  email: '',
  cpfCnpj: '',
  companyType: '' as AsaasCompanyType | '',
  mobilePhone: '',
  address: '',
  addressNumber: '',
  province: '',
  postalCode: '',
  incomeValue: '',
};

const SubaccountTab: React.FC = () => {
  const [status, setStatus] = useState<StatusState>('loading');
  const [accountStatus, setAccountStatus] = useState<string | undefined>();
  const [statusErrorMsg, setStatusErrorMsg] = useState<string>('');

  const [formData, setFormData] = useState(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const checkStatus = async () => {
    setStatus('loading');
    try {
      const data = await financeiroService.verificarSubconta();
      setAccountStatus(data.account?.status as string | undefined);
      setStatus('connected');
    } catch (err: any) {
      if (err.response?.data?.error === 'Locadora sem chave Asaas configurada') {
        setStatus('not_configured');
      } else {
        setStatusErrorMsg(getApiErrorMessage(err));
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setConfirmOpen(true);
  };

  const handleConfirmCriar = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const payload: AsaasSubaccountPayload = {
        name: formData.name,
        email: formData.email,
        cpfCnpj: formData.cpfCnpj,
        mobilePhone: formData.mobilePhone,
        address: formData.address,
        addressNumber: formData.addressNumber,
        province: formData.province,
        postalCode: formData.postalCode,
        incomeValue: parseFloat(formData.incomeValue) || 0,
        ...(formData.companyType ? { companyType: formData.companyType } : {}),
      };
      await financeiroService.criarSubconta(payload);
      setFormSuccess('Subconta criada com sucesso! Chave de integração atualizada.');
      setConfirmOpen(false);
      setFormData(emptyForm);
      checkStatus();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Card de status */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
            status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' :
            status === 'not_configured' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600' :
            status === 'error' ? 'bg-red-100 dark:bg-red-500/10 text-red-600' :
            'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <span className="material-symbols-outlined text-3xl">
              {status === 'connected' ? 'check_circle' : status === 'loading' ? 'sync' : 'link_off'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {status === 'loading' && 'Verificando integração...'}
              {status === 'connected' && `Financeiro Conectado — Status: ${accountStatus || 'ATIVO'}`}
              {status === 'not_configured' && 'Financeiro não configurado'}
              {status === 'error' && 'Erro ao verificar integração'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {status === 'connected' && 'A subconta Asaas da locadora está ativa e pronta para gerar cobranças.'}
              {status === 'not_configured' && 'Preencha o formulário abaixo para criar a subconta da locadora no Asaas.'}
              {status === 'error' && statusErrorMsg}
              {status === 'loading' && 'Consultando o status da subconta no Asaas.'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de criação de subconta — só aparece quando ainda não configurado */}
      {(status === 'not_configured' || status === 'error') && (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center gap-4">
          <div className="w-14 h-14 bg-mustard-100 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-500 shadow-sm">
            <span className="material-symbols-outlined text-3xl">account_balance</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Configurar Subconta Asaas</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Uso único — normalmente feito uma vez, por um Admin/Diretoria/Gerente.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {formError && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm font-medium">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl p-4 text-sm font-medium">
              {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Razão Social *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Locadora Exemplo LTDA"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">E-mail *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="financeiro@locadoraexemplo.com.br"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">CNPJ *</label>
              <input required type="text" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange}
                placeholder="12345678000190"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tipo de Empresa</label>
              <select name="companyType" value={formData.companyType} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm">
                <option value="">Selecione (opcional)</option>
                <option value="MEI">MEI</option>
                <option value="LIMITED">Limitada (LTDA)</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="ASSOCIATION">Associação</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Telefone Celular *</label>
              <input required type="text" name="mobilePhone" value={formData.mobilePhone} onChange={handleChange}
                placeholder="11999999999"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Endereço *</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange}
                placeholder="Rua Exemplo"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Número *</label>
              <input required type="text" name="addressNumber" value={formData.addressNumber} onChange={handleChange}
                placeholder="100"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Bairro *</label>
              <input required type="text" name="province" value={formData.province} onChange={handleChange}
                placeholder="Centro"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">CEP *</label>
              <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleChange}
                placeholder="01310930"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Renda/Faturamento Mensal *</label>
              <input required type="number" step="0.01" min="0" name="incomeValue" value={formData.incomeValue} onChange={handleChange}
                placeholder="50000"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-mustard-500 hover:bg-mustard-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-mustard-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">account_balance</span>
            Criar Subconta
          </button>
        </form>
      </div>
      )}

      {status === 'connected' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Subconta já configurada</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                A integração com o Asaas já foi feita. Não é necessário preencher o formulário novamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      <AnimatePresence>
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !submitting && setConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Atenção</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                Criar uma nova subconta irá reconfigurar a chave de integração financeira da empresa.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmCriar}
                  className="flex-1 py-3 rounded-xl bg-mustard-500 hover:bg-mustard-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-mustard-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirmar'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubaccountTab;

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { financeiroService, type AsaasScoreInfo } from '../../../services/financeiro';
import SearchableSelect from '../../../components/SearchableSelect';
import type { Client, ScoreConsultaResponse } from '../../../types';

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

const formatCurrency = (val: number) => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ScoreTab: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreConsultaResponse | null>(null);

  // Asaas Account Info (Balance & Fee)
  const [asaasInfo, setAsaasInfo] = useState<AsaasScoreInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const fetchAsaasInfo = async () => {
    try {
      setLoadingInfo(true);
      const info = await financeiroService.getAsaasScoreInfo();
      setAsaasInfo(info);
    } catch (err) {
      console.warn('Erro ao carregar dados da conta Asaas:', err);
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/clients');
        setClients(data.filter((c: Client) => c.active));
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      }
    };
    fetchClients();
    fetchAsaasInfo();
  }, []);

  const digits = documento.replace(/\D/g, '');
  const isValidDocumento = digits.length === 11 || digits.length === 14;
  const showLengthHint = digits.length > 0 && !isValidDocumento;

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    setResult(null);
    const client = clients.find((c) => c.id === id);
    if (client?.cnpj) {
      setDocumento(maskDocumento(client.cnpj));
    }
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumento(maskDocumento(e.target.value));
    setResult(null);
  };

  const handleConsultar = async () => {
    if (!isValidDocumento) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await financeiroService.consultarScore(digits);
      setResult(response);
      // Atualiza o saldo após a consulta
      fetchAsaasInfo();
    } catch (err) {
      console.error('Erro ao consultar score:', err);
      setResult({ sucesso: false, mensagem: 'Não foi possível consultar o score. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const estimatedQueries = asaasInfo?.feePerQuery && asaasInfo.feePerQuery > 0
    ? Math.floor(asaasInfo.balance / asaasInfo.feePerQuery)
    : 0;

  const isLowBalance = asaasInfo !== null && (asaasInfo.balance < (asaasInfo.feePerQuery || 16.99));
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const pixKeyToDisplay = asaasInfo?.bankPixKey || asaasInfo?.companyCnpj || '48.477.385/0001-09';

  const handleCopyPix = () => {
    if (pixKeyToDisplay) {
      navigator.clipboard.writeText(pixKeyToDisplay.replace(/\D/g, ''));
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Alerta de Saldo Insuficiente quando aplicável */}
      {isLowBalance && !loadingInfo && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-base">
                Saldo Insuficiente para Novas Consultas
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Seu saldo Asaas ({formatCurrency(asaasInfo?.balance ?? 0)}) é inferior à tarifa por consulta ({formatCurrency(asaasInfo?.feePerQuery ?? 16.99)}). Realize uma recarga para continuar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRechargeModalOpen(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 self-end sm:self-center"
          >
            <span className="material-symbols-outlined text-base">add_card</span>
            Recarregar Saldo
          </button>
        </div>
      )}

      {/* Cards de Métricas do Asaas (Grid de 3 Colunas 100% Largura) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Saldo Asaas */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRechargeModalOpen(true)}
                  title="Recarregar saldo no Asaas"
                  className="px-3 py-1.5 rounded-xl bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 hover:bg-mustard-100 dark:hover:bg-mustard-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Recarregar
                </button>
                <button
                  type="button"
                  onClick={fetchAsaasInfo}
                  disabled={loadingInfo}
                  title="Atualizar saldo do Asaas"
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-lg ${loadingInfo ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                </button>
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Saldo em Conta Asaas
            </p>
            <p className={`text-3xl font-black mt-1 tracking-tight ${isLowBalance ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
              {loadingInfo && !asaasInfo ? 'Carregando...' : formatCurrency(asaasInfo?.balance ?? 0)}
            </p>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLowBalance ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            {isLowBalance ? 'Saldo insuficiente para novas consultas' : 'Disponível para consultas de score'}
          </p>
        </div>

        {/* Card 2: Custo por Consulta */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-mustard-50 dark:bg-mustard-500/10 text-mustard-500 flex items-center justify-center mb-4 shadow-sm">
              <span className="material-symbols-outlined text-2xl">sell</span>
            </div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Tarifa por Consulta
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {formatCurrency(asaasInfo?.feePerQuery ?? 16.99)}
            </p>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Tarifa fixa Credit Bureau Serasa (PF / PJ)
          </p>
        </div>

        {/* Card 3: Consultas Estimadas */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 shadow-sm">
              <span className="material-symbols-outlined text-2xl">fact_check</span>
            </div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Capacidade de Consultas
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              ~{estimatedQueries} <span className="text-sm font-bold text-slate-400">consultas</span>
            </p>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Estimativa calculada com base no saldo atual
          </p>
        </div>
      </div>

      {/* Grid Principal Orgânico: Formulário (2 colunas) + Painel de Recarga & Info (1 coluna) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Coluna Esquerda: Formulário de Consulta de Score */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center gap-4">
            <div className="w-14 h-14 bg-mustard-100 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-500 shadow-sm">
              <span className="material-symbols-outlined text-3xl">credit_score</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Consultar Score de Crédito</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Dado informativo de apoio à decisão — a aprovação do cliente continua manual.
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <SearchableSelect
              label="Cliente cadastrado (opcional)"
              placeholder="Selecione um cliente para preencher o CNPJ"
              items={clients}
              selectedId={selectedClientId}
              onSelect={handleSelectClient}
              getDisplayValue={(c) => c.company_name}
              getSearchValue={(c) => `${c.company_name} ${c.cnpj}`}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                CPF ou CNPJ *
              </label>
              <input
                type="text"
                value={documento}
                onChange={handleDocumentoChange}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              {showLengthHint && (
                <p className="text-xs text-red-500 dark:text-red-400 ml-1">
                  Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleConsultar}
              disabled={!isValidDocumento || loading}
              className="w-full py-4 bg-mustard-500 hover:bg-mustard-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-mustard-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">search</span>
                  Consultar Score
                </>
              )}
            </button>

            {result && result.sucesso && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                    Score consultado
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{result.score}</p>
                </div>
                <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                  {result.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </span>
              </div>
            )}

            {result && !result.sucesso && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm font-medium">
                {result.mensagem}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Painel Lateral de Recarga Rápida Asaas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-mustard-50 dark:bg-mustard-500/10 text-mustard-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-xl">qr_code_2</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Recarga Asaas (PIX)</h4>
                <p className="text-xs text-slate-400">Adicione saldo para consultas</p>
              </div>
            </div>

            {/* Chave PIX Rápida */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transfira qualquer valor para a chave PIX da conta Asaas da empresa:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                  {pixKeyToDisplay}
                </div>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-3.5 py-2.5 bg-mustard-500 hover:bg-mustard-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-md shadow-mustard-500/20 transition-all flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedPix ? 'check' : 'content_copy'}
                  </span>
                  {copiedPix ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Pacotes Rápidos */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Estimativa de Créditos</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 50, queries: Math.floor(50 / (asaasInfo?.feePerQuery || 16.99)) },
                  { value: 100, queries: Math.floor(100 / (asaasInfo?.feePerQuery || 16.99)) },
                  { value: 200, queries: Math.floor(200 / (asaasInfo?.feePerQuery || 16.99)) },
                  { value: 500, queries: Math.floor(500 / (asaasInfo?.feePerQuery || 16.99)) },
                ].map((pkg) => (
                  <div
                    key={pkg.value}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center"
                  >
                    <p className="font-bold text-slate-900 dark:text-white text-xs">R$ {pkg.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium">~{pkg.queries} consultas</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={asaasInfo?.asaasPortalUrl || 'https://www.asaas.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 text-center"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                Acessar Portal Asaas
              </a>
              <button
                type="button"
                onClick={fetchAsaasInfo}
                disabled={loadingInfo}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span className={`material-symbols-outlined text-base ${loadingInfo ? 'animate-spin' : ''}`}>
                  sync
                </span>
                Atualizar Saldo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Recarga de Saldo Asaas */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-mustard-50 dark:bg-mustard-500/10 text-mustard-500 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recarga de Saldo Asaas</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Adicione créditos para consultas de score</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRechargeModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Saldo Atual */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Atual na Conta</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(asaasInfo?.balance ?? 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarifa por Consulta</p>
                  <p className="text-sm font-bold text-mustard-500">{formatCurrency(asaasInfo?.feePerQuery ?? 16.99)}</p>
                </div>
              </div>

              {/* Opção 1: Depósito via PIX */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-500">qr_code_2</span>
                  Recarga Instantânea via PIX
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transfira de qualquer banco para a Chave PIX cadastrada na conta Asaas da empresa. O saldo é disponibilizado na hora.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white truncate flex items-center">
                    {pixKeyToDisplay}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="px-4 py-3 bg-mustard-500 hover:bg-mustard-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-md shadow-mustard-500/20 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedPix ? 'check' : 'content_copy'}
                    </span>
                    {copiedPix ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Sugestões de Pacotes */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Sugestão de Valores</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 50, queries: Math.floor(50 / (asaasInfo?.feePerQuery || 16.99)) },
                    { value: 100, queries: Math.floor(100 / (asaasInfo?.feePerQuery || 16.99)) },
                    { value: 200, queries: Math.floor(200 / (asaasInfo?.feePerQuery || 16.99)) },
                    { value: 500, queries: Math.floor(500 / (asaasInfo?.feePerQuery || 16.99)) },
                  ].map((pkg) => (
                    <div
                      key={pkg.value}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center"
                    >
                      <p className="font-bold text-slate-900 dark:text-white text-xs">R$ {pkg.value}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">~{pkg.queries} consultas</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão Acessar Painel Asaas */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={asaasInfo?.asaasPortalUrl || 'https://www.asaas.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Painel do Asaas
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await fetchAsaasInfo();
                    setIsRechargeModalOpen(false);
                  }}
                  disabled={loadingInfo}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span className={`material-symbols-outlined text-base ${loadingInfo ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  Já Recarreguei (Atualizar)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreTab;

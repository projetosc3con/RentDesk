import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { financeiroService } from '../../../services/financeiro';
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

const ScoreTab: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreConsultaResponse | null>(null);

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
    } catch (err) {
      console.error('Erro ao consultar score:', err);
      setResult({ sucesso: false, mensagem: 'Não foi possível consultar o score. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
            className="w-full py-3.5 bg-mustard-500 hover:bg-mustard-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-mustard-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default ScoreTab;

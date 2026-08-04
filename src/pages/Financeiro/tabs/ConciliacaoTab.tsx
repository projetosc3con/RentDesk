import React, { useEffect, useState, useCallback } from 'react';
import api from '../../../services/api';
import { financeiroService } from '../../../services/financeiro';
import { getApiErrorMessage } from '../../../utils/apiError';
import SearchableSelect from '../../../components/SearchableSelect';
import LancamentoManualModal from '../../../components/financeiro/LancamentoManualModal';
import type { Client, Bill, BillStatus, BillType } from '../../../types';

const STATUS_OPTIONS: BillStatus[] = ['Pendente', 'Atrasado', 'Recebido', 'Divergente', 'No prazo'];
const ORIGIN_OPTIONS = ['ASAAS', 'MANUAL'];

const statusBadgeClass = (status: string) => {
  if (status === 'Recebido' || status === 'No prazo') return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
  if (status === 'Atrasado' || status === 'Divergente') return 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20';
  return 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
};

const statusIcon = (status: string) => {
  if (status === 'Recebido' || status === 'No prazo') return 'check_circle';
  if (status === 'Atrasado' || status === 'Divergente') return 'cancel';
  return 'schedule';
};

const originBadgeClass = (origin: string) =>
  origin === 'ASAAS'
    ? 'bg-mustard-100 dark:bg-mustard-500/10 text-mustard-700 dark:text-mustard-400 border border-mustard-200 dark:border-mustard-500/20'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';

const ConciliacaoTab: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [status, setStatus] = useState('');
  const [origin, setOrigin] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lancamentoModal, setLancamentoModal] = useState<BillType | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/clients');
        setClients(data);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      }
    };
    fetchClients();
  }, []);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeiroService.listarConciliacaoBancaria({
        client_id: selectedClientId || undefined,
        status: status || undefined,
        origin: origin || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      setBills(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, status, origin, dateFrom, dateTo]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleClearFilters = () => {
    setSelectedClientId('');
    setStatus('');
    setOrigin('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = Boolean(selectedClientId || status || origin || dateFrom || dateTo);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 bg-mustard-100 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-500 shadow-sm">
            <span className="material-symbols-outlined text-3xl">account_balance</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Conciliação Bancária</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Obtenha o extrato atualizado das movimentações da conta bancária para conciliação com os registros do sistema.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setLancamentoModal('payable')}
              className="px-4 py-2.5 border border-mustard-500 text-mustard-600 dark:text-mustard-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
              Lançar Conta a Pagar
            </button>
            <button
              type="button"
              onClick={() => setLancamentoModal('receivable')}
              className="px-4 py-2.5 bg-mustard-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-colors flex items-center gap-2 shadow-md shadow-mustard-500/10"
            >
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              Lançar Conta a Receber
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <SearchableSelect
              label="Cliente"
              placeholder="Todos os clientes"
              items={clients}
              selectedId={selectedClientId}
              onSelect={setSelectedClientId}
              getDisplayValue={(c) => c.company_name}
              getSearchValue={(c) => `${c.company_name} ${c.cnpj}`}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm cursor-pointer"
              >
                <option value="">Todos</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Origem</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm cursor-pointer"
              >
                <option value="">Todas</option>
                {ORIGIN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">De</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Até</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-mustard-600 dark:text-mustard-400 uppercase tracking-widest hover:underline"
            >
              Limpar filtros
            </button>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Data do Repasse</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cliente / Fatura</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Origem</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Valor Bruto</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Taxa</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Valor Líquido (PIX)</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="w-8 h-8 border-4 border-mustard-500/20 border-t-mustard-500 rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-slate-500 italic">
                      Nenhum lançamento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  bills.map((b) => (
                    <tr key={b.id}>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {(b.bank_transaction_date || b.reconciled_at)
                          ? new Date((b.bank_transaction_date || b.reconciled_at) as string).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{b.invoice?.client_name || b.client?.company_name || b.counterparty_name || '—'}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {b.invoice?.invoice_number || b.pix_end_to_end_id || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${originBadgeClass(b.origin)}`}>
                          {b.origin}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                        {b.gross_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 dark:text-slate-500">
                        {b.fee_amount ? b.fee_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-mustard-500 dark:text-mustard-400">
                        {b.net_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadgeClass(b.status)}`}>
                          <span className="material-symbols-outlined text-[14px]">{statusIcon(b.status)}</span>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LancamentoManualModal
        isOpen={lancamentoModal !== null}
        type={lancamentoModal || 'receivable'}
        clients={clients}
        onClose={() => setLancamentoModal(null)}
        onCreated={(bill) => setBills((prev) => [bill, ...prev])}
      />
    </div>
  );
};

export default ConciliacaoTab;

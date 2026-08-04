import React, { useEffect, useState, useCallback } from 'react';
import api from '../../../services/api';
import { financeiroService } from '../../../services/financeiro';
import { getApiErrorMessage } from '../../../utils/apiError';
import SearchableSelect from '../../../components/SearchableSelect';
import LancamentoManualModal from '../../../components/financeiro/LancamentoManualModal';
import type { Client, StatementItem, BillType, Bill } from '../../../types';

const isSettled = (item: StatementItem) =>
  item.source === 'payment'
    ? item.status === 'RECEIVED' || item.status === 'CONFIRMED'
    : item.status === 'Recebido' || item.status === 'No prazo';

const isOverdueOrCancelled = (item: StatementItem) =>
  item.source === 'payment'
    ? item.status === 'OVERDUE' || item.status === 'CANCELLED'
    : item.status === 'Atrasado' || item.status === 'Divergente';

const statusBadgeClass = (item: StatementItem) => {
  if (isSettled(item)) return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
  if (isOverdueOrCancelled(item)) return 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20';
  return 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
};

const statusIcon = (item: StatementItem) => {
  if (isSettled(item)) return 'check_circle';
  if (isOverdueOrCancelled(item)) return 'cancel';
  return 'schedule';
};

const sourceBadge = (item: StatementItem) => {
  if (item.source === 'payment') {
    return { label: 'Aguardando pagamento', className: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' };
  }
  return item.origin === 'ASAAS'
    ? { label: 'ASAAS', className: 'bg-mustard-100 dark:bg-mustard-500/10 text-mustard-700 dark:text-mustard-400 border border-mustard-200 dark:border-mustard-500/20' }
    : { label: 'MANUAL', className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700' };
};

const ExtratoTab: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [items, setItems] = useState<StatementItem[]>([]);
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

  const fetchExtrato = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeiroService.listarExtratoBancario({
        client_id: selectedClientId || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, dateFrom, dateTo]);

  useEffect(() => {
    fetchExtrato();
  }, [fetchExtrato]);

  const handleClearFilters = () => {
    setSelectedClientId('');
    setDateFrom('');
    setDateTo('');
  };

  const handleBillCreated = (bill: Bill) => {
    /*     setItems((prev) => [
          {
            source: 'bill',
            id: bill.id,
            type: bill.type,
            status: bill.status,
            origin: bill.origin,
            gross_value: bill.gross_value,
            net_value: bill.net_value,
            fee_amount: bill.fee_amount,
            due_date: bill.due_date,
            settled_date: bill.reconciled_at,
            client_id: bill.client_id,
            client_name: bill.client?.company_name ?? null,
            counterparty_name: bill.counterparty_name,
            invoice_number: bill.invoice?.invoice_number ?? null,
            description: bill.description,
            invoice_url: null,
            bank_slip_url: null,
            raw: bill,
          },
          ...prev,
        ]); */
  };

  const hasActiveFilters = Boolean(selectedClientId || dateFrom || dateTo);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 bg-mustard-100 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-500 shadow-sm">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Extrato de lançamentos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Incluir, consultar e validar conciliações de lançamentos de contas
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vencimento</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cliente / Fatura</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Origem</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Valor Bruto</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Taxa</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Valor Líquido</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Asaas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="w-8 h-8 border-4 border-mustard-500/20 border-t-mustard-500 rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-slate-500 italic">
                      Nenhum lançamento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const badge = sourceBadge(item);
                    return (
                      <tr key={`${item.source}-${item.id}`}>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {item.client_name || item.counterparty_name || '—'}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            {item.invoice_number || '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                          {item.gross_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400 dark:text-slate-500">
                          {item.fee_amount ? item.fee_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-mustard-500 dark:text-mustard-400">
                          {(item.net_value ?? item.gross_value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadgeClass(item)}`}>
                            <span className="material-symbols-outlined text-[14px]">{statusIcon(item)}</span>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.invoice_url || item.bank_slip_url ? (
                            <a
                              href={item.invoice_url || item.bank_slip_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-mustard-600 dark:text-mustard-400 hover:underline whitespace-nowrap"
                            >
                              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              Ver no Asaas
                            </a>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
        onCreated={handleBillCreated}
      />
    </div>
  );
};

export default ExtratoTab;

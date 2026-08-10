import React, { useMemo, useState } from 'react';
import { financeiroService } from '../../../services/financeiro';
import { getApiErrorMessage } from '../../../utils/apiError';
import LancamentoManualModal from '../../../components/financeiro/LancamentoManualModal';
import VincularLancamentoModal from '../../../components/financeiro/VincularLancamentoModal';
import type { Bill, BankStatementMatchResult, ReconcileBankStatementResponse } from '../../../types';

const ITEMS_PER_PAGE = 20;

const dcBadgeClass = (dc: 'D' | 'C') =>
  dc === 'C'
    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
    : 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20';

const ConciliacaoTab: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reconciling, setReconciling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReconcileBankStatementResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [linkTarget, setLinkTarget] = useState<BankStatementMatchResult | null>(null);
  const [createTarget, setCreateTarget] = useState<BankStatementMatchResult | null>(null);

  const totalItems = result?.lines.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const paginatedLines = useMemo(() => {
    if (!result) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return result.lines.slice(start, start + ITEMS_PER_PAGE);
  }, [result, currentPage]);

  const handleReconcile = async () => {
    setReconciling(true);
    setError(null);
    try {
      const data = await financeiroService.reconciliarExtratoBancario({
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      setResult(data);
      setCurrentPage(1);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setReconciling(false);
    }
  };

  // Localiza a linha por referência de objeto — como cada linha vem do
  // mesmo array em memória (nunca refetch), isso basta pra achar a linha
  // certa depois de vincular/cadastrar, sem precisar de um id próprio.
  const replaceLine = (target: BankStatementMatchResult, bill: Bill) => {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lines: prev.lines.map((l) => (l === target ? {
          ...l,
          match_status: 'matched',
          matched_bill_id: bill.id,
          matched_bill: {
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
            is_reconciled: true,
            raw: bill,
          },
        } : l)),
        matched_count: prev.matched_count + 1,
        unmatched_count: prev.unmatched_count - 1,
      };
    });
  };

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
              Busca o extrato da conta no Banco do Brasil e confere com os lançamentos do sistema.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-wrap items-end gap-4">
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

            <button
              type="button"
              onClick={handleReconcile}
              disabled={reconciling}
              title="Reconciliar com o extrato bancário (padrão: últimos 30 dias)"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 hover:border-mustard-300 dark:hover:border-mustard-500 transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${reconciling ? 'animate-spin' : ''}`}>refresh</span>
            </button>

            {result && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {result.simulated && <span className="font-bold text-amber-500">[simulado] </span>}
                {result.matched_count} conciliado(s), {result.unmatched_count} pendente(s) — período {new Date(result.period.from).toLocaleDateString('pt-BR')} a {new Date(result.period.to).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Descrição</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Valor</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Conciliado</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!result ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-slate-500 italic">
                      Clique no ícone de atualizar para buscar o extrato bancário do período.
                    </td>
                  </tr>
                ) : result.lines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-slate-500 italic">
                      Nenhum lançamento encontrado no extrato para o período selecionado.
                    </td>
                  </tr>
                ) : (
                  paginatedLines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(line.bank_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${dcBadgeClass(line.dc_indicator)}`}>
                          {line.dc_indicator === 'C' ? 'Crédito' : 'Débito'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {line.match_status === 'matched'
                          ? (line.matched_bill?.counterparty_name || line.matched_bill?.client_name || line.description || '—')
                          : (line.description || '—')}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                        {line.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" checked={line.match_status === 'matched'} disabled readOnly className="w-4 h-4 rounded accent-emerald-500" />
                      </td>
                      <td className="px-6 py-4">
                        {line.match_status === 'unmatched' && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setLinkTarget(line)}
                              title="Vincular a lançamento existente"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">link</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCreateTarget(line)}
                              title="Cadastrar novo lançamento"
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalItems > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Mostrando {Math.min(totalItems, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(totalItems, currentPage * ITEMS_PER_PAGE)} de {totalItems}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-400 hover:text-mustard-600 dark:hover:text-mustard-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                          ? 'bg-mustard-500 text-white shadow-mustard-500/20'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-mustard-600 dark:text-mustard-400 hover:text-mustard-700 dark:hover:text-mustard-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <VincularLancamentoModal
        isOpen={linkTarget !== null}
        line={linkTarget}
        onClose={() => setLinkTarget(null)}
        onLinked={(bill) => {
          if (linkTarget) replaceLine(linkTarget, bill);
          setLinkTarget(null);
        }}
      />

      <LancamentoManualModal
        isOpen={createTarget !== null}
        type={createTarget?.type || 'receivable'}
        initialValues={createTarget ? {
          gross_value: createTarget.value,
          due_date: createTarget.bank_date,
          description: createTarget.description ?? undefined,
        } : undefined}
        presetSettlement={createTarget ? {
          settled_date: createTarget.bank_date,
          bank_transaction_date: createTarget.bank_date,
          bank_raw_snapshot: createTarget.raw,
        } : undefined}
        onClose={() => setCreateTarget(null)}
        onCreated={(bill) => {
          if (createTarget) replaceLine(createTarget, bill);
          setCreateTarget(null);
        }}
      />
    </div>
  );
};

export default ConciliacaoTab;

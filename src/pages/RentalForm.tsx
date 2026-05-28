import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import type { BillingStatus, ReconciliationStatus, Client, Equipment } from '../types';

const BILLING_STATUSES: BillingStatus[] = ['Pendente', 'Faturado', 'Emitida', 'Cancelada'];
const RECONCILIATION_STATUSES: ReconciliationStatus[] = ['Pendente', 'Atrasado', 'Recebido', 'Divergente', 'No prazo'];

const RentalForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedEquipmentId = searchParams.get('equipmentId');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);

  const [formData, setFormData] = useState({
    invoice_number: '',
    client_id: '',
    equipment_id: '',
    work_site: '',
    billing_period_start: '',
    billing_period_end: '',
    billing_status: 'Pendente' as BillingStatus,
    return_date: '',
    cost_rental: 0,
    cost_insurance: 0,
    cost_freight: 0,
    cost_rcd: 0,
    cost_third_party: 0,
    cost_training: 0,
    due_date: '',
    payment_method: '',
    reconciliation_status: 'Pendente' as ReconciliationStatus,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, equipmentsRes] = await Promise.all([
          api.get('/clients'),
          api.get('/equipments')
        ]);
        
        // Filter only active clients
        setClients(clientsRes.data.filter((c: Client) => c.active));
        
        // Filter only available equipments
        setEquipments(equipmentsRes.data.filter((eq: Equipment) => eq.status === 'Disponível'));

        // Pre-fill equipment if ID is in URL
        if (preSelectedEquipmentId) {
          setFormData(prev => ({ ...prev, equipment_id: preSelectedEquipmentId }));
        }
      } catch (err) {
        console.error('Erro ao buscar dados para o formulário:', err);
      }
    };
    fetchData();
  }, []);

  const totalValue = useMemo(() => {
    return (
      Number(formData.cost_rental) +
      Number(formData.cost_insurance) +
      Number(formData.cost_freight) +
      Number(formData.cost_rcd) +
      Number(formData.cost_third_party) +
      Number(formData.cost_training)
    );
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, id: string) => {
    setFormData(prev => ({ ...prev, [name]: id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.equipment_id) {
      setError('Por favor, selecione um cliente e um equipamento.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const selectedClient = clients.find(c => c.id === formData.client_id);
      const selectedEquip = equipments.find(eq => eq.id === formData.equipment_id);

      if (!selectedClient || !selectedEquip) {
        throw new Error('Selecione um cliente e um equipamento válidos.');
      }

      const payload = {
        ...formData,
        client_name: selectedClient.company_name,
        cnpj: selectedClient.cnpj,
        equipment_name: selectedEquip.name,
        equipment_type: selectedEquip.type,
        asset_number: selectedEquip.asset_number,
        total_value: totalValue,
      };

      await api.post('/rentals', payload);
      navigate('/locacoes');
    } catch (err: any) {
      console.error('Erro ao cadastrar locação:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao cadastrar locação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/locacoes')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Nova Locação</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Registre um novo faturamento ou contrato de locação.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Client & Equipment */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-mustard-500 text-xl">person_pin_circle</span>
                Vínculos Principais
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableSelect
                label="Cliente"
                placeholder="Selecione o cliente"
                items={clients}
                selectedId={formData.client_id}
                onSelect={(id) => handleSelectChange('client_id', id)}
                getDisplayValue={(c) => c.company_name}
                getSearchValue={(c) => `${c.company_name} ${c.cnpj}`}
                required
              />
              <SearchableSelect
                label="Equipamento"
                placeholder="Selecione o equipamento"
                items={equipments}
                selectedId={formData.equipment_id}
                onSelect={(id) => handleSelectChange('equipment_id', id)}
                getDisplayValue={(eq) => `${eq.asset_number} - ${eq.name}`}
                getSearchValue={(eq) => `${eq.name} ${eq.asset_number}`}
                required
              />
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Obra / Local de Uso</label>
                <input type="text" name="work_site" value={formData.work_site} onChange={handleChange} placeholder="Ex: Condomínio Solar das Águas" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600" />
              </div>
            </div>
          </div>

          {/* Section: Dates & Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-mustard-500 text-xl">event_available</span>
                Período e Status
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Início do Período *</label>
                <input required type="date" name="billing_period_start" value={formData.billing_period_start} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Fim do Período *</label>
                <input required type="date" name="billing_period_end" value={formData.billing_period_end} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Status Faturamento</label>
                <select name="billing_status" value={formData.billing_status} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/10 transition-all cursor-pointer dark:text-white">
                  {BILLING_STATUSES.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Data de Devolução (se houver)</label>
                <input type="date" name="return_date" value={formData.return_date} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all outline-none text-sm [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
            </div>
          </div>

          {/* Section: Costs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-mustard-500 text-xl">monetization_on</span>
                Composição de Valores (R$)
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'cost_rental', label: 'Valor Locação' },
                { name: 'cost_insurance', label: 'Seguro' },
                { name: 'cost_freight', label: 'Frete' },
                { name: 'cost_rcd', label: 'RCD' },
                { name: 'cost_third_party', label: 'Terceiros' },
                { name: 'cost_training', label: 'Treinamento' },
              ].map(cost => (
                <div key={cost.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">{cost.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-bold">R$</span>
                    <input type="number" step="0.01" name={cost.name} value={(formData as any)[cost.name]} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all dark:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-mustard-500 text-xl">description</span>
                Observações Internas
              </h3>
            </div>
            <div className="p-6">
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                rows={5} 
                placeholder="Detalhes sobre a negociação, descontos ou condições especiais..." 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-mustard-500/10 focus:border-mustard-500 transition-all resize-none outline-none dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Invoicing Summary */}
        <div className="space-y-6">
          <div className="bg-mustard-600 dark:bg-mustard-500 rounded-2xl p-6 text-white shadow-xl shadow-mustard-500/20 space-y-6 sticky top-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">Valor Total da Fatura</h3>
              <p className="text-4xl font-black mt-1">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nº Fatura / Contrato</label>
                <input type="text" name="invoice_number" value={formData.invoice_number} onChange={handleChange} placeholder="Gerado automaticamente" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white/20 transition-all placeholder:text-white/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Vencimento *</label>
                <input required type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white/20 transition-all [color-scheme:dark]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Forma de Pagamento</label>
                <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white/20 transition-all appearance-none cursor-pointer">
                  <option value="" className="text-slate-900">Selecione</option>
                  <option value="BOLETO" className="text-slate-900">BOLETO</option>
                  <option value="PIX" className="text-slate-900">PIX</option>
                  <option value="DEPÓSITO BANCÁRIO" className="text-slate-900">DEPÓSITO BANCÁRIO</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status Conciliação</label>
                <select name="reconciliation_status" value={formData.reconciliation_status} onChange={handleChange} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white/20 transition-all appearance-none cursor-pointer">
                  {RECONCILIATION_STATUSES.map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button type="submit" disabled={loading} className="w-full py-4 bg-white text-mustard-600 dark:text-mustard-500 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
                {loading ? <div className="w-5 h-5 border-2 border-mustard-500/30 border-t-mustard-500 rounded-full animate-spin" /> : 'Confirmar Lançamento'}
              </button>
              <button type="button" onClick={() => navigate('/locacoes')} className="w-full py-2 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                Cancelar e Voltar
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default RentalForm;

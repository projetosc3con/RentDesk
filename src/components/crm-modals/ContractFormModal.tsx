import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { crmService } from '../../services/crm';
import api from '../../services/api';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dealId: string;
  deal?: any;
  initialData?: any;
}

const ContractFormModal: React.FC<ContractFormModalProps> = ({ isOpen, onClose, onSuccess, dealId, deal, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {});
  const [contacts, setContacts] = useState<any[]>([]);
  const [addressFetched, setAddressFetched] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      // Prevent fetching if already fetched or if the form already has address data
      if (addressFetched || formData.locatario_address_full) return;

      if (deal?.client_id) {
        try {
          const { data } = await api.get(`/clients/${deal.client_id}`);
          if (data && data.address_complement) {
            setFormData((prev: any) => ({ ...prev, locatario_address_full: data.address_complement }));
          }
        } catch (err) {
          console.error('Erro ao buscar endereço do cliente', err);
        } finally {
          setAddressFetched(true);
        }
      } else if (deal?.lead_id && formData.locatario_cnpj) {
        try {
          const cleanCnpj = formData.locatario_cnpj.replace(/\D/g, '');
          if (cleanCnpj.length === 14) {
            const response = await fetch(`https://api.opencnpj.org/${cleanCnpj}`);
            if (response.ok) {
              const result = await response.json();
              console.log(result);
              const logradouro = result.logradouro || '';
              const numero = result.numero || 'S/N';
              const bairro = result.bairro || '';
              const municipio = result.municipio || result.cidade || '';
              const uf = result.uf || '';
              const cep = result.cep || '';

              const parts = [
                logradouro,
                numero,
                bairro,
                municipio || uf || cep ? `${municipio}/${uf} - CEP: ${cep}` : ''
              ].filter(Boolean);

              const fullAddress = parts.join(', ').replace(/^[,\s]+|[,\s]+$/g, '');

              setFormData((prev: any) => ({ ...prev, locatario_address_full: fullAddress }));
            }
          }
        } catch (err) {
          console.error('Erro ao buscar endereço do lead via CNPJ', err);
        } finally {
          setAddressFetched(true);
        }
      }
    };

    if (isOpen) {
      fetchAddress();
    }
  }, [deal, formData.locatario_cnpj, addressFetched, formData.locatario_address_full, isOpen]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!deal) return;
      try {
        const allContacts = await crmService.getAllContacts();
        const dealContacts = allContacts.filter((c: any) =>
          (deal.client_id && c.client_id === deal.client_id) ||
          (deal.lead_id && c.lead_id === deal.lead_id)
        );
        setContacts(dealContacts);
      } catch (err) {
        console.error('Erro ao carregar contatos', err);
      }
    };
    fetchContacts();
  }, [deal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
      // Recalculate total if cost changes
      cost_total: name.startsWith('cost_') && name !== 'cost_total'
        ? Number(prev.cost_rental || 0) + Number(prev.cost_insurance || 0) + Number(prev.cost_freight || 0) + Number(prev.cost_rcd || 0) + Number(prev.cost_third_party || 0) + Number(prev.cost_training || 0)
        : prev.cost_total
    }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let rawValue = value.replace(/\D/g, '');
    const numValue = Number(rawValue) / 100;

    setFormData((prev: any) => {
      const next = { ...prev, [name]: numValue };
      // Recalculate total if cost changes
      next.cost_total =
        Number(next.cost_rental || 0) +
        Number(next.cost_insurance || 0) +
        Number(next.cost_freight || 0) +
        Number(next.cost_rcd || 0) +
        Number(next.cost_third_party || 0) +
        Number(next.cost_training || 0);
      return next;
    });
  };

  const handleContactSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contactId = e.target.value;
    const selectedContact = contacts.find(c => c.id === contactId);
    if (selectedContact) {
      setFormData((prev: any) => ({
        ...prev,
        site_contact_name: selectedContact.full_name,
        site_contact_phone: selectedContact.phone || selectedContact.mobile || ''
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        site_contact_name: '',
        site_contact_phone: ''
      }));
    }
  };

  const handleSave = async (status: 'Rascunho' | 'Pronto para Gerar') => {
    try {
      setLoading(true);
      const dataToSave = { ...formData, form_status: status };

      // Basic validation if ready
      if (status === 'Pronto para Gerar') {
        if (!dataToSave.locatario_cnpj || !dataToSave.equipment_description || !dataToSave.period_start) {
          alert('Preencha os campos obrigatórios para gerar o contrato.');
          setLoading(false);
          return;
        }
      }

      // Sanitize data
      const cleanData = { ...dataToSave };
      if (!cleanData.contract_date) cleanData.contract_date = new Date().toISOString().split('T')[0];
      if (cleanData.period_start === '') cleanData.period_start = null;
      if (cleanData.period_end === '') cleanData.period_end = null;

      await crmService.saveContractForm(dealId, cleanData);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar formulário de contrato');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Dados do Contrato</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Empresa/Locatário *</label>
              <input type="text" name="locatario_company_name" value={formData.locatario_company_name || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">CNPJ *</label>
              <input type="text" name="locatario_cnpj" value={formData.locatario_cnpj || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Endereço Completo *</label>
              <input type="text" name="locatario_address_full" value={formData.locatario_address_full || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Equipamento *</label>
              <input type="text" name="equipment_description" value={formData.equipment_description || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Modelo</label>
              <input type="text" name="equipment_model" value={formData.equipment_model || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Data de Início *</label>
              <input type="date" name="period_start" value={formData.period_start || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Data de Fim</label>
              <input type="date" name="period_end" value={formData.period_end || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Duração (Dias)</label>
              <input type="number" name="contract_duration_days" value={formData.contract_duration_days || 0} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Valor Locação</label>
              <input type="text" name="cost_rental" value={formData.cost_rental ? Number(formData.cost_rental).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} onChange={handleCurrencyChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Descritivo do Valor</label>
              <textarea name="notes" rows={2} value={formData.notes || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none" placeholder="Ex: R$ 5.000,00 mensais referentes à locação do equipamento xpto..." />
            </div>
            <div className="col-span-2">
              <hr className="my-4 border-slate-200 dark:border-slate-700" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Local da Obra</label>
              <input type="text" name="work_site" value={formData.work_site || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Contato da Obra</label>
              <select onChange={handleContactSelect} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none cursor-pointer">
                <option value="">Selecione um contato...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id} selected={formData.site_contact_name === c.full_name}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">Telefone do Contato</label>
              <input type="text" name="site_contact_phone" value={formData.site_contact_phone || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Cancelar
          </button>
          <button disabled={loading} onClick={() => handleSave('Rascunho')} className="px-6 py-2.5 rounded-xl text-sm font-bold border border-mustard-500 text-mustard-600 hover:bg-mustard-50">
            Salvar Rascunho
          </button>
          <button disabled={loading} onClick={() => handleSave('Pronto para Gerar')} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-mustard-500 text-white hover:bg-mustard-600">
            {loading ? 'Salvando...' : 'Salvar e Pronto'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ContractFormModal;

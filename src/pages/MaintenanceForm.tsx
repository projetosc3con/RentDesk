import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import type { Equipment, UserProfile, Part, ServiceOrder, ServiceOrderStatus } from '../types';

// Reusable Searchable Select Component
interface SearchableSelectProps<T> {
  label: string;
  placeholder: string;
  items: T[];
  selectedId: string;
  onSelect: (id: string) => void;
  getDisplayValue: (item: T) => string;
  getSearchValue: (item: T) => string;
  required?: boolean;
}

function SearchableSelect<T extends { id: string }>({
  label,
  placeholder,
  items,
  selectedId,
  onSelect,
  getDisplayValue,
  getSearchValue,
  required
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item => 
      getSearchValue(item).toLowerCase().includes(lowerSearch)
    );
  }, [items, searchTerm, getSearchValue]);

  const selectedItem = useMemo(() => 
    items.find(i => i.id === selectedId),
  [items, selectedId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-emerald-900 ring-2 ring-emerald-900/10 bg-white' : 'border-slate-200 hover:border-slate-300'}`}
      >
        <span className={`text-sm ${selectedItem ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedItem ? getDisplayValue(selectedItem) : placeholder}
        </span>
        <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input 
                  autoFocus
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-900 transition-all"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      onSelect(item.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-4 py-2.5 text-xs cursor-pointer hover:bg-emerald-50 transition-colors flex flex-col gap-0.5 ${selectedId === item.id ? 'bg-emerald-50/50 border-l-4 border-emerald-900' : 'border-l-4 border-transparent'}`}
                  >
                    <span className="font-bold text-slate-900">{getDisplayValue(item)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{getSearchValue(item)}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 italic">Nenhum resultado encontrado.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OSPartItem {
  part_id: string;
  description: string;
  internal_code: string;
  quantity_used: number;
  unit_value_at_use: number;
  subtotal: number;
}

const MaintenanceForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'pecas' | 'relatorio'>('geral');

  // Form Data
  const [formData, setFormData] = useState<Partial<ServiceOrder>>({
    status: 'Aberta',
    execution_date: new Date().toISOString().split('T')[0],
    execution_location: 'Oficina Central',
  });

  const [partsUsed, setPartsUsed] = useState<OSPartItem[]>([]);

  // Master Data
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [technicians, setTechnicians] = useState<UserProfile[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);

  // Search/Selectors
  const [partSearch, setPartSearch] = useState('');
  const [showPartResults, setShowPartResults] = useState(false);
  const partContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eqRes, techRes, partsRes] = await Promise.all([
          api.get('/equipments'),
          api.get('/users'),
          api.get('/parts')
        ]);
        
        setEquipments(eqRes.data);
        // Filter users that are technicians or admins
        setTechnicians(techRes.data.filter((u: UserProfile) => 
          u.access_level === 'Manutenção' || u.access_level === 'Admin' || u.access_level === 'Diretoria'
        ));
        setAllParts(partsRes.data);

        if (isEdit && id) {
          const { data } = await api.get(`/service-orders/${id}`);
          setFormData({
            ...data,
            execution_date: data.execution_date ? new Date(data.execution_date).toISOString().split('T')[0] : ''
          });
          
          if (data.parts) {
            setPartsUsed(data.parts.map((p: any) => ({
              part_id: p.part_id,
              description: p.part_description,
              internal_code: p.internal_code,
              quantity_used: p.quantity_used,
              unit_value_at_use: p.unit_value_at_use,
              subtotal: p.subtotal
            })));
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar as informações necessárias.');
      } finally {
        setLoading(false);
        setFetching(false);
      }
    };
    fetchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (partContainerRef.current && !partContainerRef.current.contains(event.target as Node)) {
        setShowPartResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id, isEdit]);

  const filteredParts = useMemo(() => {
    const q = partSearch.toLowerCase();
    const items = !partSearch 
      ? allParts 
      : allParts.filter(p => 
          p.description.toLowerCase().includes(q) || 
          p.internal_code.toLowerCase().includes(q) ||
          p.part_number?.toLowerCase().includes(q)
        );
    return items.slice(0, 10);
  }, [allParts, partSearch]);

  const handleSelectEquipment = (eq: Equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment_id: eq.id,
      equipment_asset_number: eq.asset_number,
      equipment_name: eq.name,
      equipment_model: eq.model,
      equipment_serial_number: eq.serial_number
    }));
  };

  const handleAddPart = (part: Part) => {
    const existing = partsUsed.find(p => p.part_id === part.id);
    if (existing) {
      setPartsUsed(prev => prev.map(p => 
        p.part_id === part.id 
          ? { ...p, quantity_used: p.quantity_used + 1, subtotal: (p.quantity_used + 1) * p.unit_value_at_use }
          : p
      ));
    } else {
      setPartsUsed(prev => [...prev, {
        part_id: part.id,
        description: part.description,
        internal_code: part.internal_code,
        quantity_used: 1,
        unit_value_at_use: part.unit_value,
        subtotal: part.unit_value
      }]);
    }
    setPartSearch('');
    setShowPartResults(false);
  };

  const handleRemovePart = (partId: string) => {
    setPartsUsed(prev => prev.filter(p => p.part_id !== partId));
  };

  const handleUpdatePartQuantity = (partId: string, qty: number) => {
    if (qty < 1) return;
    setPartsUsed(prev => prev.map(p => 
      p.part_id === partId 
        ? { ...p, quantity_used: qty, subtotal: qty * p.unit_value_at_use }
        : p
    ));
  };

  const totalPartsValue = useMemo(() => {
    return partsUsed.reduce((acc, p) => acc + p.subtotal, 0);
  }, [partsUsed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipment_id) {
      setError('Por favor, selecione um equipamento.');
      setActiveTab('geral');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        parts: partsUsed
      };

      if (isEdit) {
        await api.put(`/service-orders/${id}`, payload);
      } else {
        await api.post('/service-orders', payload);
      }

      setSuccess(true);
      setTimeout(() => navigate('/manutencoes'), 1500);
    } catch (err: any) {
      console.error('Erro ao salvar OS:', err);
      setError(err.response?.data?.error || 'Erro ao salvar a ordem de serviço.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium mt-4">Carregando dados da OS...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manutencoes')}
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdit ? `Ordem de Serviço #${formData.os_number}` : 'Nova Ordem de Serviço'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isEdit ? 'Atualize os detalhes da manutenção executada.' : 'Registre uma nova atividade de manutenção.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/manutencoes')}
            className="px-6 py-2.5 bg-white text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 bg-emerald-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/10 flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                {isEdit ? 'Salvar OS' : 'Emitir OS'}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-500">check_circle</span>
          Ordem de serviço salva com sucesso! Redirecionando...
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('geral')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'geral' ? 'text-emerald-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Informações Gerais
          {activeTab === 'geral' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-900 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pecas')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'pecas' ? 'text-emerald-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Peças e Insumos
          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-[10px] rounded-md text-slate-500">{partsUsed.length}</span>
          {activeTab === 'pecas' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-900 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('relatorio')}
          className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'relatorio' ? 'text-emerald-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Relatório Técnico
          {activeTab === 'relatorio' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-900 rounded-full" />
          )}
        </button>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'geral' && (
            <motion.div
              key="geral"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-emerald-900 text-xl">construction</span>
                    Equipamento & Local
                  </h3>
                  
                  <SearchableSelect
                    label="Equipamento"
                    placeholder="Selecione o equipamento"
                    items={equipments}
                    selectedId={formData.equipment_id || ''}
                    onSelect={(id) => {
                      const eq = equipments.find(e => e.id === id);
                      if (eq) handleSelectEquipment(eq);
                    }}
                    getDisplayValue={(eq) => `${eq.asset_number} - ${eq.name}`}
                    getSearchValue={(eq) => `${eq.name} ${eq.asset_number}`}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Execução</label>
                      <input
                        type="date"
                        value={formData.execution_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, execution_date: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Local</label>
                      <input
                        type="text"
                        placeholder="Ex: Oficina, Campo..."
                        value={formData.execution_location}
                        onChange={(e) => setFormData(prev => ({ ...prev, execution_location: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-emerald-900 text-xl">settings</span>
                    Controle da OS
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status da OS</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ServiceOrderStatus }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                    >
                      <option value="Aberta">Aberta</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Aguardando Peças">Aguardando Peças</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Técnico Responsável</label>
                    <select
                      value={formData.executed_by}
                      onChange={(e) => setFormData(prev => ({ ...prev, executed_by: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    >
                      <option value="">Selecione o técnico</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pecas' && (
            <motion.div
              key="pecas"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Materiais Utilizados</h3>
                  <p className="text-sm text-slate-500">Adicione peças e insumos consumidos neste serviço.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total em Materiais</p>
                  <p className="text-2xl font-black text-emerald-900">{totalPartsValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </div>

              <div className="relative max-w-xl" ref={partContainerRef}>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">add_shopping_cart</span>
                  <input
                    type="text"
                    placeholder="Busque por código ou nome da peça..."
                    value={partSearch}
                    onChange={(e) => {
                      setPartSearch(e.target.value);
                      setShowPartResults(true);
                    }}
                    onFocus={() => setShowPartResults(true)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 outline-none transition-all"
                  />
                </div>

                <AnimatePresence>
                  {showPartResults && filteredParts.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      {filteredParts.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleAddPart(p)}
                          className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center justify-between group border-b border-slate-50 last:border-0 transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{p.internal_code} - {p.description}</p>
                            <p className="text-xs text-slate-500">Estoque Atual: {p.quantity} | {p.unit_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          </div>
                          <span className="material-symbols-outlined text-emerald-600 opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">add_circle</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {partsUsed.length > 0 ? (
                  partsUsed.map(part => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={part.part_id} 
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{part.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono">CÓD: {part.internal_code}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden h-10 shadow-sm">
                          <button 
                            type="button"
                            onClick={() => handleUpdatePartQuantity(part.part_id, part.quantity_used - 1)}
                            className="px-3 hover:bg-slate-50 transition-colors text-slate-400"
                          >
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>
                          <input 
                            type="number"
                            value={part.quantity_used}
                            onChange={(e) => handleUpdatePartQuantity(part.part_id, parseInt(e.target.value) || 0)}
                            className="w-12 text-center text-sm font-black text-slate-700 bg-transparent outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => handleUpdatePartQuantity(part.part_id, part.quantity_used + 1)}
                            className="px-3 hover:bg-slate-50 transition-colors text-slate-400"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                        <div className="w-28 text-right">
                          <p className="text-sm font-black text-slate-900">{part.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Un: {part.unit_value_at_use.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemovePart(part.part_id)}
                          className="p-2.5 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-slate-100"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <span className="material-symbols-outlined text-slate-300 text-3xl">inventory_2</span>
                    </div>
                    <h4 className="font-bold text-slate-600">Nenhum material listado</h4>
                    <p className="text-xs text-slate-400 mt-1">Busque peças acima para incluir nesta ordem de serviço.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'relatorio' && (
            <motion.div
              key="relatorio"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-900">description</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Relatório Técnico</h3>
                  <p className="text-sm text-slate-500">Descreva detalhadamente as intervenções realizadas.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Detalhada do Serviço</label>
                  <textarea
                    rows={12}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Relate aqui todos os procedimentos, problemas encontrados e soluções aplicadas..."
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm outline-none resize-none focus:bg-white focus:ring-4 focus:ring-emerald-900/5 focus:border-emerald-900 transition-all leading-relaxed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observações Internas / Próximos Passos</label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas para controle interno..."
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm outline-none resize-none focus:bg-white focus:ring-4 focus:ring-emerald-900/5 focus:border-emerald-900 transition-all leading-relaxed"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MaintenanceForm;

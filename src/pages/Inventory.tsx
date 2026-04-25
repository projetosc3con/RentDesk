import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const EQUIPMENT_TYPES = [
  'Elétrica',
  'Diesel'
];

interface Equipment {
  id: string;
  asset_number: string;
  name: string;
  type: string | null;
  model: string | null;
  serial_number: string | null;
  height: number | null;
  status: 'Disponível' | 'Locado' | 'Em Manutenção' | 'Inativo';
  manufacture_year: number | null;
  value: number;
  photo_url: string | null;
  notes?: string;
  unit?: string;
  created_at?: string;
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [valueMin, setValueMin] = useState(0);
  const [valueMax, setValueMax] = useState(0);

  const activeAdvancedCount = [search, typeFilter, yearMin, yearMax].filter(Boolean).length + (valueMin > 0 || valueMax > 0 ? 1 : 0);

  const maxEquipmentValue = useMemo(() => {
    if (equipments.length === 0) return 1000000;
    return Math.ceil(Math.max(...equipments.map(e => e.value || 0)) / 10000) * 10000 || 1000000;
  }, [equipments]);

  const filteredEquipments = useMemo(() => {
    return equipments.filter(eq => {
      if (statusFilter && eq.status !== statusFilter) return false;
      if (typeFilter && eq.type !== typeFilter) return false;
      if (yearMin && (eq.manufacture_year ?? 0) < parseInt(yearMin)) return false;
      if (yearMax && (eq.manufacture_year ?? 9999) > parseInt(yearMax)) return false;
      if (valueMin > 0 && (eq.value ?? 0) < valueMin) return false;
      if (valueMax > 0 && (eq.value ?? 0) > valueMax) return false;
      if (search) {
        const q = search.toLowerCase();
        const match = eq.name.toLowerCase().includes(q)
          || eq.asset_number.toLowerCase().includes(q)
          || (eq.model || '').toLowerCase().includes(q)
          || (eq.serial_number || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [equipments, statusFilter, typeFilter, yearMin, yearMax, search, valueMin, valueMax]);

  const clearAllFilters = () => {
    setStatusFilter(null);
    setSearch('');
    setTypeFilter('');
    setYearMin('');
    setYearMax('');
    setValueMin(0);
    setValueMax(0);
  };

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/equipments');
        setEquipments(data);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao buscar equipamentos:', err);
        setError('Não foi possível carregar o estoque.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipments();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Disponível': return 'bg-emerald-500 text-white border-emerald-400';
      case 'Locado': return 'bg-slate-800 text-white border-slate-700';
      case 'Em Manutenção': return 'bg-amber-500 text-white border-amber-400';
      default: return 'bg-slate-400 text-white border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Disponível': return 'check_circle';
      case 'Locado': return 'schedule';
      case 'Em Manutenção': return 'build';
      default: return 'help';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estoque de Máquinas</h1>
          <p className="text-slate-500 mt-1">Gerencie a frota de equipamentos, status e disponibilidade.</p>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-emerald-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-emerald-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/equipamentos/novo')}
            className="flex items-center gap-2 bg-emerald-900 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Equipamento
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
      >
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-2">Filtros:</span>
        <button
          onClick={() => setStatusFilter(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!statusFilter ? 'bg-emerald-900 text-white shadow-md' : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          Todos
        </button>
        {(['Disponível', 'Locado', 'Em Manutenção', 'Inativo'] as const).map(s => {
          const styles: Record<string, { active: string; inactive: string; icon: string }> = {
            'Disponível': { active: 'bg-emerald-600 text-white shadow-md', inactive: 'border border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100', icon: 'check_circle' },
            'Locado': { active: 'bg-slate-800 text-white shadow-md', inactive: 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100', icon: 'schedule' },
            'Em Manutenção': { active: 'bg-amber-500 text-white shadow-md', inactive: 'border border-amber-100 bg-amber-50 text-amber-800 hover:bg-amber-100', icon: 'build' },
            'Inativo': { active: 'bg-red-500 text-white shadow-md', inactive: 'border border-red-100 bg-red-50 text-red-700 hover:bg-red-100', icon: 'block' },
          };
          const st = styles[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${statusFilter === s ? st.active : st.inactive}`}>
              <span className="material-symbols-outlined text-[16px]">{st.icon}</span>
              {s}
            </button>
          );
        })}
        <button
          onClick={() => setShowFilters(true)}
          className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors ml-auto"
        >
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Mais Filtros
          {activeAdvancedCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeAdvancedCount}</span>
          )}
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-10 h-10 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Carregando estoque...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-100 text-red-800 p-8 rounded-2xl text-center"
          >
            <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
            <p className="font-bold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 rounded-xl text-sm font-bold transition-colors"
            >
              Tentar Novamente
            </button>
          </motion.div>
        ) : equipments.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-50 border border-dashed border-slate-200 p-20 rounded-3xl text-center"
          >
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">inventory_2</span>
            <h3 className="text-xl font-bold text-slate-900">Nenhum equipamento cadastrado</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">Comece adicionando uma nova máquina ao seu estoque operacional.</p>
            <button
              onClick={() => navigate('/equipamentos/novo')}
              className="mt-6 px-8 py-3 bg-emerald-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-800 transition-all"
            >
              Cadastrar Primeiro Equipamento
            </button>
          </motion.div>
        ) : filteredEquipments.length === 0 && equipments.length > 0 ? (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 border border-dashed border-slate-200 p-16 rounded-3xl text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">search_off</span>
            <h3 className="text-lg font-bold text-slate-900">Nenhum resultado encontrado</h3>
            <p className="text-slate-500 mt-1 text-sm">Tente alterar os filtros aplicados.</p>
            <button onClick={clearAllFilters} className="mt-4 px-6 py-2 bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all">Limpar Filtros</button>
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEquipments.map((equipment, index) => (
                  <motion.div
                    key={equipment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-48 relative overflow-hidden bg-slate-100">
                      {equipment.photo_url ? (
                        <img
                          src={equipment.photo_url}
                          alt={equipment.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <span className="material-symbols-outlined text-5xl">image</span>
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-lg border ${getStatusStyle(equipment.status)}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {getStatusIcon(equipment.status)}
                        </span>
                        {equipment.status}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-emerald-900 transition-colors line-clamp-1">{equipment.name}</h3>
                        <p className="text-sm font-medium text-slate-500">{equipment.model || 'Modelo não informado'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 mt-auto border-t border-slate-50 pt-4">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patrimônio</span>
                          <span className="text-sm font-bold text-slate-800">{equipment.asset_number}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ano</span>
                          <span className="text-sm font-bold text-slate-800">{equipment.manufacture_year || '-'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor de Mercado</span>
                          <span className="text-sm font-bold text-emerald-900">
                            {equipment.value ? `R$ ${equipment.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedEquipment(equipment)}
                          className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                        >
                          Detalhes
                        </button>
                        <button 
                          onClick={() => equipment.status === 'Disponível' && navigate(`/locacoes/novo?equipmentId=${equipment.id}`)}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${equipment.status === 'Disponível'
                          ? 'bg-emerald-900 text-white hover:bg-emerald-800'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}>
                          Locar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Equipamento</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patrimônio</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modelo</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEquipments.map((equipment) => (
                        <tr key={equipment.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                {equipment.photo_url ? (
                                  <img src={equipment.photo_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <span className="material-symbols-outlined text-xl">image</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">{equipment.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-[11px] font-mono">{equipment.asset_number}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{equipment.model || '-'}</td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${getStatusStyle(equipment.status)}`}>
                              <span className="material-symbols-outlined text-[14px]">
                                {getStatusIcon(equipment.status)}
                              </span>
                              {equipment.status}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                            {equipment.value ? `R$ ${equipment.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedEquipment(equipment)}
                                className="p-2 text-slate-400 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Ver Detalhes"
                              >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                              </button>
                              <button
                                onClick={() => equipment.status === 'Disponível' && navigate(`/locacoes/novo?equipmentId=${equipment.id}`)}
                                className={`p-2 rounded-lg transition-all ${equipment.status === 'Disponível' ? 'text-slate-400 hover:text-emerald-900 hover:bg-emerald-50' : 'text-slate-200 cursor-not-allowed'}`}
                                title="Locar Equipamento"
                                disabled={equipment.status !== 'Disponível'}
                              >
                                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedEquipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEquipment(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Lado Esquerdo: Imagem */}
              <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-slate-100">
                {selectedEquipment.photo_url ? (
                  <img
                    src={selectedEquipment.photo_url}
                    alt={selectedEquipment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-7xl">image</span>
                    <p className="text-xs font-bold uppercase tracking-widest mt-2">Sem foto cadastrada</p>
                  </div>
                )}

                {/* Status Badge flutuante na imagem */}
                <div className={`absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl border ${getStatusStyle(selectedEquipment.status)}`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {getStatusIcon(selectedEquipment.status)}
                  </span>
                  {selectedEquipment.status}
                </div>

                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="absolute top-6 right-6 md:hidden w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Lado Direito: Informações */}
              <div className="w-full md:w-1/2 flex flex-col p-8 md:p-10 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedEquipment.name}</h2>
                    <p className="text-slate-500 font-medium text-lg mt-1">{selectedEquipment.model || 'Modelo não informado'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEquipment(null)}
                    className="hidden md:flex w-10 h-10 hover:bg-slate-100 rounded-full items-center justify-center text-slate-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </div>

                {/* Grid de Especificações - Bento Style */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo</span>
                    <span className="text-sm font-bold text-slate-800">{selectedEquipment.type || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unidade</span>
                    <span className="text-sm font-bold text-slate-800">{selectedEquipment.unit || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patrimônio</span>
                    <span className="text-sm font-bold text-slate-800">{selectedEquipment.asset_number}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nº de Série</span>
                    <span className="text-sm font-bold text-slate-800">{selectedEquipment.serial_number || '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Altura Trabalho</span>
                    <span className="text-sm font-bold text-slate-800">{selectedEquipment.height ? `${selectedEquipment.height}m` : '-'}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fabricação</span>
                    <span className="text-sm font-bold text-slate-800">{selectedEquipment.manufacture_year || '-'}</span>
                  </div>
                  <div className="col-span-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                    <span className="block text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-1">Valor</span>
                    <span className="text-xl font-black text-emerald-900">
                      {selectedEquipment.value ? `R$ ${selectedEquipment.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sob Consulta'}
                    </span>
                  </div>
                </div>

                {/* Notas/Observações */}
                <div className="mb-8">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">notes</span>
                    Observações Internas
                  </h4>
                  <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-600 leading-relaxed italic border-l-4 border-emerald-900">
                    {selectedEquipment.notes || 'Nenhuma observação adicional cadastrada para este equipamento.'}
                  </div>
                </div>

                {/* Ações Inferiores */}
                <div className="mt-auto pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={() => navigate(`/equipamentos/editar/${selectedEquipment.id}`)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Editar Máquina
                  </button>
                  <button
                    disabled={selectedEquipment.status !== 'Disponível'}
                    onClick={() => navigate(`/locacoes/novo?equipmentId=${selectedEquipment.id}`)}
                    className={`flex-[2] px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${selectedEquipment.status === 'Disponível'
                      ? 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-emerald-900/20'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    Criar Locação
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Offcanvas Filtros Avançados */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Filtros Avançados</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Refine a busca no estoque</p>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Busca */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Busca por Nome, Patrimônio ou Modelo</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Digite para buscar..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tipo de Equipamento */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tipo de Equipamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${typeFilter === t ? 'bg-emerald-900 text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ano de Fabricação */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Ano de Fabricação</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={yearMin}
                      onChange={(e) => setYearMin(e.target.value)}
                      placeholder="De"
                      className="min-w-0 w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all"
                    />
                    <span className="text-slate-300 font-bold shrink-0">—</span>
                    <input
                      type="number"
                      value={yearMax}
                      onChange={(e) => setYearMax(e.target.value)}
                      placeholder="Até"
                      className="min-w-0 w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 transition-all"
                    />
                  </div>
                </div>

                {/* Faixa de Valor */}
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Faixa de Valor (R$)</label>
                  <div className="px-1">
                    <div className="relative h-2 bg-slate-200 rounded-full">
                      <div
                        className="absolute h-full bg-emerald-900 rounded-full"
                        style={{
                          left: `${(valueMin / maxEquipmentValue) * 100}%`,
                          right: `${100 - (valueMax > 0 ? valueMax : maxEquipmentValue) / maxEquipmentValue * 100}%`,
                        }}
                      />
                    </div>
                    <div className="relative mt-[-6px]">
                      <input
                        type="range"
                        min={0}
                        max={maxEquipmentValue}
                        step={1000}
                        value={valueMin}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          if (valueMax > 0 && v > valueMax) return;
                          setValueMin(v);
                        }}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-900 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                      />
                      <input
                        type="range"
                        min={0}
                        max={maxEquipmentValue}
                        step={1000}
                        value={valueMax > 0 ? valueMax : maxEquipmentValue}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          if (v < valueMin) return;
                          setValueMax(v >= maxEquipmentValue ? 0 : v);
                        }}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-900 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                      R$ {valueMin.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest">até</span>
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                      {valueMax > 0 ? `R$ ${valueMax.toLocaleString('pt-BR')}` : 'Máx'}
                    </span>
                  </div>
                </div>

                {/* Resumo */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-emerald-900 text-lg">info</span>
                    <span className="text-xs font-bold text-slate-700">Resultados</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-900">{filteredEquipments.length}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">equipamento(s) correspondente(s)</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Limpar Tudo
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-[2] py-3 bg-emerald-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20"
                >
                  Aplicar Filtros
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Inventory;

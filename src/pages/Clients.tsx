import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import type { Client } from '../types';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);



  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/clients');
        setClients(data);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao buscar clientes:', err);
        setError('Não foi possível carregar a base de clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filter by Status
      if (statusFilter === 'active' && !client.active) return false;
      if (statusFilter === 'inactive' && client.active) return false;

      // Filter by Search
      if (search) {
        const q = search.toLowerCase();
        const match = 
          client.company_name.toLowerCase().includes(q) ||
          client.cnpj.toLowerCase().includes(q) ||
          (client.contact_name || '').toLowerCase().includes(q) ||
          (client.email || '').toLowerCase().includes(q) ||
          (client.address_city || '').toLowerCase().includes(q);
        
        if (!match) return false;
      }

      return true;
    });
  }, [clients, statusFilter, search]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, itemsPerPage]);


  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.active).length,
      inactive: clients.filter(c => !c.active).length
    };
  }, [clients]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Base de Clientes</h1>
          <p className="text-slate-500 mt-1">Gerencie sua carteira de clientes e dados de contato.</p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => navigate('/clientes/novo')}
            className="flex items-center gap-2 bg-emerald-900 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Novo Cliente
          </button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Clientes', value: stats.total, icon: 'groups', color: 'bg-blue-50 text-blue-600' },
          { label: 'Clientes Ativos', value: stats.active, icon: 'check_circle', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Clientes Inativos', value: stats.inactive, icon: 'cancel', color: 'bg-slate-100 text-slate-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ, contato ou cidade..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-900/20 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          {[
            { label: 'Todos', value: 'all' },
            { label: 'Ativos', value: 'active' },
            { label: 'Inativos', value: 'inactive' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === option.value
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Clients List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-12 h-12 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium mt-4">Carregando clientes...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-red-100"
          >
            <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
            <p className="font-bold text-slate-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 rounded-xl text-sm font-bold transition-colors text-red-700"
            >
              Tentar novamente
            </button>
          </motion.div>
        ) : filteredClients.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200"
          >
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">groups</span>
            <h3 className="text-xl font-bold text-slate-900">Nenhum cliente encontrado</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto text-center">Tente ajustar seus filtros ou cadastre um novo cliente.</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empresa / Razão Social</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNPJ</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inscrição Estadual</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cidade/UF</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">{client.company_name}</p>
                          <p className="text-xs text-slate-500">{client.address_complement || 'Sem complemento'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{client.cnpj}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{client.state_subscription || 'ISENTO'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-300 text-[18px]">location_on</span>
                          <span className="text-sm font-medium text-slate-600">
                            {client.address_city ? `${client.address_city}/${client.address_state}` : 'Não informado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          client.active
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${client.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {client.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/clientes/${client.id}`)}
                            className="p-2 text-slate-400 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Ver Detalhes / Editar"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span>Itens por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-900/20 text-slate-600 transition-all cursor-pointer"
                  >
                    {[10, 25, 50, 100].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <span>
                  Mostrando {Math.min(filteredClients.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredClients.length, currentPage * itemsPerPage)} de {filteredClients.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-400 hover:text-emerald-900 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-emerald-900 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-400 hover:text-emerald-900 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Clients;

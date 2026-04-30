import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { UserProfile } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Colaboradores</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Gerencie os acessos e perfis de usuários do sistema.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-xs uppercase tracking-wider"
          >
            <span className={loading ? "animate-spin material-symbols-outlined" : "material-symbols-outlined"}>
              refresh
            </span>
          </button>
          <Link to="/usuarios/novo">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-mustard-500 text-white hover:bg-mustard-600 transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-mustard-500/20 active:scale-[0.98]">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Novo Usuário
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters & Search */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-mustard-500 focus:ring-2 focus:ring-mustard-500/10 focus:outline-none transition-all text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
              placeholder="Buscar por nome, e-mail ou CPF..."
              type="text"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <select className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-mustard-500 focus:ring-2 focus:ring-mustard-500/10 focus:outline-none transition-all text-sm font-medium appearance-none cursor-pointer">
                <option value="">Todos os Níveis</option>
                <option value="Admin">Admin</option>
                <option value="Gerente">Gerente</option>
                <option value="Operacional">Operacional</option>
                <option value="Técnico">Técnico</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Visualizador">Visualizador</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
            </div>
            <div className="relative">
              <select className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-mustard-500 focus:ring-2 focus:ring-mustard-500/10 focus:outline-none transition-all text-sm font-medium appearance-none cursor-pointer">
                <option value="">Todos os Status</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-4 border-mustard-500/10 border-t-mustard-500 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Carregando colaboradores...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-red-500 text-[48px] mb-3 block">error</span>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Ocorreu um erro ao carregar os data.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!error && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-widest border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Nível de Acesso</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-[48px] mb-3 block">person_off</span>
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Nenhum colaborador encontrado.</p>
                    </td>
                  </tr>
                )}
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-mustard-50 dark:bg-mustard-500/10 text-mustard-700 dark:text-mustard-400 flex items-center justify-center font-bold text-sm overflow-hidden border border-mustard-100 dark:border-mustard-500/20 shadow-sm transition-transform group-hover:scale-105">
                          {user.photo_url ? (
                            <img src={user.photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            user.full_name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">{user.full_name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user.cpf}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 dark:text-slate-300">{user.email}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{user.role_title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${user.access_level === 'Admin' ? 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-700 dark:text-mustard-400 border-mustard-100 dark:border-mustard-500/20' :
                        user.access_level === 'Diretoria' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20' :
                          user.access_level === 'Manutenção' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' :
                            'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                        {user.access_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.active
                        ? 'bg-mustard-100 dark:bg-mustard-500/20 text-mustard-800 dark:text-mustard-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-mustard-500' : 'bg-slate-400'}`}></span>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-mustard-600 dark:hover:text-mustard-400 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 rounded-lg transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Resetar Senha">
                          <span className="material-symbols-outlined text-[20px]">key</span>
                        </button>
                        {user.active ? (
                          <button className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Inativar">
                            <span className="material-symbols-outlined text-[20px]">block</span>
                          </button>
                        ) : (
                          <button className="p-2 text-slate-400 hover:text-mustard-600 dark:hover:text-mustard-400 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 rounded-lg transition-colors" title="Ativar">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
            Total de <span className="font-bold text-slate-900 dark:text-white">{users.length}</span> colaboradores cadastrados
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Users;

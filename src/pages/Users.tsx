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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Colaboradores</h1>
          <p className="text-slate-500 mt-1">Gerencie os acessos e perfis de usuários do sistema.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-xs uppercase tracking-wider"
          >
            <span className={loading ? "animate-spin material-symbols-outlined" : "material-symbols-outlined"}>
              refresh
            </span>
          </button>
          <Link to="/usuarios/novo">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 transition-all font-bold text-xs uppercase tracking-wider shadow-md">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Novo Usuário
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters & Search */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all text-sm"
              placeholder="Buscar por nome, e-mail ou CPF..."
              type="text"
            />
          </div>
          <div className="flex gap-4">
            <select className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all text-sm font-medium">
              <option value="">Todos os Níveis</option>
              <option value="Admin">Admin</option>
              <option value="Gerente">Gerente</option>
              <option value="Operacional">Operacional</option>
              <option value="Técnico">Técnico</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Visualizador">Visualizador</option>
            </select>
            <select className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 focus:outline-none transition-all text-sm font-medium">
              <option value="">Todos os Status</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-4 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-600">Carregando colaboradores...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-red-500 text-[48px] mb-3 block">error</span>
              <p className="text-sm font-medium text-slate-900">Ocorreu um erro ao carregar os dados.</p>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!error && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 text-[11px] uppercase font-bold tracking-widest border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Nível de Acesso</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-slate-300 text-[48px] mb-3 block">person_off</span>
                      <p className="text-sm font-medium text-slate-400">Nenhum colaborador encontrado.</p>
                    </td>
                  </tr>
                )}
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm overflow-hidden border border-slate-100 shadow-sm">
                          {user.photo_url ? (
                            <img src={user.photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            user.full_name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{user.full_name}</div>
                          <div className="text-xs text-slate-500">{user.cpf}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{user.email}</div>
                      <div className="text-xs text-slate-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 font-medium">{user.role_title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${user.access_level === 'Admin' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        user.access_level === 'Gerente' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          user.access_level === 'Manutenção' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                        {user.access_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${user.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                        }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors" title="Resetar Senha">
                          <span className="material-symbols-outlined text-[20px]">key</span>
                        </button>
                        {user.active ? (
                          <button className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors" title="Inativar">
                            <span className="material-symbols-outlined text-[20px]">block</span>
                          </button>
                        ) : (
                          <button className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors" title="Ativar">
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

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <span className="text-xs text-slate-500 font-medium">
            Total de <span className="font-bold text-slate-900">{users.length}</span> colaboradores cadastrados
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Users;

export const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard', allowedRoles: ['Administrador', 'Diretoria', 'Gerente', 'Comercial', 'Manutenção', 'Recursos Humanos'] },
  { name: 'Locações', path: '/locacoes', icon: 'contract', allowedRoles: ['Administrador', 'Diretoria', 'Gerente'] },
  { name: 'Financeiro', path: '/financeiro', icon: 'attach_money', allowedRoles: ['Administrador', 'Diretoria', 'Gerente'] },
  { name: 'Estoque', path: '/equipamentos', icon: 'precision_manufacturing', allowedRoles: ['Administrador', 'Diretoria', 'Gerente'] },
  { name: 'Clientes', path: '/clientes', icon: 'groups', allowedRoles: ['Administrador', 'Diretoria', 'Gerente', 'Comercial'] },
  { name: 'CRM', path: '/crm', icon: 'monitoring', allowedRoles: ['Administrador', 'Diretoria', 'Gerente'] }, // Removido 'Comercial' daqui
  
  // Sub-rotas do CRM como itens principais apenas para o Comercial
  { name: 'Pipeline', path: '/crm/pipeline', icon: 'view_kanban', allowedRoles: ['Comercial'] },
  { name: 'Leads', path: '/crm/leads', icon: 'person_search', allowedRoles: ['Comercial'] },
  { name: 'Contatos', path: '/crm/contatos', icon: 'contacts', allowedRoles: ['Comercial'] },
  { name: 'Tarefas', path: '/crm/tarefas', icon: 'task_alt', allowedRoles: ['Comercial'] },

  { name: 'Logística', path: '/logistica', icon: 'local_shipping', allowedRoles: ['Administrador', 'Diretoria', 'Gerente', 'Logística'] },

  { name: 'Materiais', path: '/materiais', icon: 'inventory_2', allowedRoles: ['Administrador', 'Diretoria', 'Gerente', 'Manutenção'] },
  { name: 'Manutenções', path: '/manutencoes', icon: 'build', allowedRoles: ['Administrador', 'Diretoria', 'Gerente', 'Manutenção'] },
  { name: 'Usuários', path: '/usuarios', icon: 'manage_accounts', allowedRoles: ['Administrador', 'Diretoria', 'Gerente'] },
  { name: 'Recursos Humanos', path: '/rh', icon: 'badge', allowedRoles: ['Administrador', 'Diretoria', 'Gerente', 'Recursos Humanos'] },
];
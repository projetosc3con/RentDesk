export const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard', allowedRoles: ['Admin', 'Diretoria', 'Gerente', 'Comercial', 'Manutenção', 'Recursos Humanos'] },
  { name: 'Locações', path: '/locacoes', icon: 'contract', allowedRoles: ['Admin', 'Diretoria', 'Gerente'] },
  { name: 'Estoque', path: '/equipamentos', icon: 'precision_manufacturing', allowedRoles: ['Admin', 'Diretoria', 'Gerente'] },
  { name: 'Clientes', path: '/clientes', icon: 'groups', allowedRoles: ['Admin', 'Diretoria', 'Gerente', 'Comercial'] },
  { name: 'CRM', path: '/crm', icon: 'monitoring', allowedRoles: ['Admin', 'Diretoria', 'Gerente'] }, // Removido 'Comercial' daqui
  
  // Sub-rotas do CRM como itens principais apenas para o Comercial
  { name: 'Pipeline', path: '/crm/pipeline', icon: 'view_kanban', allowedRoles: ['Comercial'] },
  { name: 'Leads', path: '/crm/leads', icon: 'person_search', allowedRoles: ['Comercial'] },
  { name: 'Contatos', path: '/crm/contatos', icon: 'contacts', allowedRoles: ['Comercial'] },
  { name: 'Tarefas', path: '/crm/tarefas', icon: 'task_alt', allowedRoles: ['Comercial'] },

  { name: 'Peças', path: '/pecas', icon: 'settings_input_component', allowedRoles: ['Admin', 'Diretoria', 'Gerente', 'Manutenção'] },
  { name: 'Manutenções', path: '/manutencoes', icon: 'build', allowedRoles: ['Admin', 'Diretoria', 'Gerente', 'Manutenção'] },
  { name: 'Usuários', path: '/usuarios', icon: 'manage_accounts', allowedRoles: ['Admin', 'Diretoria', 'Gerente'] },
  { name: 'Recursos Humanos', path: '/rh', icon: 'badge', allowedRoles: ['Admin', 'Diretoria', 'Gerente', 'Recursos Humanos'] },
  { name: 'Financeiro', path: '/financeiro', icon: 'attach_money', allowedRoles: ['Admin', 'Diretoria', 'Gerente'] },
];
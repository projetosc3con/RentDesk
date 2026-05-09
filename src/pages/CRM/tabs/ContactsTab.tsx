import React from 'react';

const mockContacts = [
  { id: '1', name: 'Ricardo Mendes', role: 'Gerente de Compras', company: 'Condor S.A', type: 'client', email: 'ricardo.mendes@condor.com.br', phone: '(47) 99812-3456', isPrimary: true },
  { id: '2', name: 'Fernanda Oliveira', role: 'Coord. SESMT', company: 'Tuper S.A', type: 'client', email: 'fernanda@tuper.com.br', phone: '(47) 99634-7890', isPrimary: true },
  { id: '3', name: 'José da Silva', role: 'Diretor de Operações', company: 'Engecorp Construções', type: 'lead', email: 'jose.silva@engecorp.com', phone: '(11) 98765-4321', isPrimary: true },
  { id: '4', name: 'Mariana Costa', role: 'Analista de Suprimentos', company: 'Condor S.A', type: 'client', email: 'mariana.costa@condor.com.br', phone: '(47) 99887-6543', isPrimary: false },
  { id: '5', name: 'Paulo Andrade', role: 'Engenheiro de Projetos', company: 'Siderúrgica Vale do Aço', type: 'lead', email: 'paulo.andrade@svaco.com', phone: '(31) 99123-4567', isPrimary: false },
  { id: '6', name: 'Claudia Reis', role: 'Gerente Financeira', company: 'Buddemeyer S.A', type: 'client', email: 'claudia.reis@buddemeyer.com', phone: '(47) 99234-8765', isPrimary: true },
];

const ContactsTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:min-w-[320px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500">search</span>
            <input
              type="text"
              placeholder="Buscar contato por nome, empresa ou e-mail..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-mustard-500/20 dark:focus:ring-mustard-500/20 transition-all outline-none"
            />
          </div>
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {['Todos', 'Clientes', 'Leads'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'Todos'
                  ? 'bg-mustard-500 text-white shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/10">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Novo Contato
        </button>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockContacts.map((contact) => (
          <div key={contact.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-mustard-200 dark:hover:border-mustard-500/30 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center">
                  <span className="text-lg font-black text-mustard-700 dark:text-mustard-400">{contact.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-mustard-500 dark:group-hover:text-mustard-400 transition-colors">{contact.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{contact.role}</p>
                </div>
              </div>
              {contact.isPrimary && (
                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-100 dark:border-amber-500/20">
                  Principal
                </span>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px]">apartment</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{contact.company}</span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${contact.type === 'client'
                  ? 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400'
                  : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                  {contact.type === 'client' ? 'Cliente' : 'Lead'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px]">mail</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px]">call</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{contact.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-mustard-600 dark:hover:text-mustard-400 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all">
                <span className="material-symbols-outlined text-sm">call</span>
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-mustard-600 dark:hover:text-mustard-400 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all">
                <span className="material-symbols-outlined text-sm">mail</span>
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-mustard-600 dark:hover:text-mustard-400 hover:bg-mustard-50 dark:hover:bg-mustard-500/10 transition-all">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsTab;

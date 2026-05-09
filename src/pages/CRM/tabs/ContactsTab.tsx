import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { crmService } from '../../../services/crm';
import NewContactModal from '../../../components/crm-modals/NewContactModal';
import EditContactModal from '../../../components/crm-modals/EditContactModal';

interface Contact {
  id: string;
  full_name: string;
  role_title?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  company_name: string;
  contact_type: 'client' | 'lead';
  lead_id?: string;
  client_id?: string;
  department?: string;
  notes?: string;
  active?: boolean;
}

const ContactsTab: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [whatsappConfirmModal, setWhatsappConfirmModal] = useState({ isOpen: false, phone: '', name: '' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Clientes' | 'Leads'>('Todos');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(
    (localStorage.getItem('rentdesk_contacts_view_mode') as 'list' | 'grid') || 'grid'
  );

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    localStorage.setItem('rentdesk_contacts_view_mode', viewMode);
  }, [viewMode]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await crmService.getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === 'Todos' ? true :
      activeFilter === 'Clientes' ? contact.contact_type === 'client' :
      contact.contact_type === 'lead';

    return matchesSearch && matchesFilter;
  });

  const handleWhatsApp = (contact: Contact) => {
    if (!contact.phone) return;
    setWhatsappConfirmModal({
      isOpen: true,
      phone: contact.phone,
      name: contact.full_name
    });
  };

  const confirmWhatsApp = () => {
    const cleanPhone = whatsappConfirmModal.phone.replace(/\D/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    }
    setWhatsappConfirmModal({ isOpen: false, phone: '', name: '' });
  };

  const handleEmail = (email?: string) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center text-mustard-600 dark:text-mustard-400 shadow-sm">
            <span className="material-symbols-outlined text-3xl">contacts</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Contatos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gerenciamento de contatos de leads e clientes.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['Todos', 'Clientes', 'Leads'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === filter
                  ? 'bg-white dark:bg-slate-700 text-mustard-600 dark:text-mustard-400 shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-mustard-600 dark:text-mustard-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Visualização em Lista"
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-mustard-600 dark:text-mustard-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Visualização em Cards"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
              className="w-48 pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-mustard-500/20 dark:focus:ring-mustard-500/20 transition-all outline-none"
            />
          </div>
          
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-mustard-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-mustard-600 transition-all shadow-lg shadow-mustard-500/20"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Novo Contato
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-mustard-500/10 border-t-mustard-500 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando contatos...</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contato</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Empresa</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contato Info</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-mustard-50 dark:bg-mustard-500/10 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-black text-mustard-700 dark:text-mustard-400">{contact.full_name?.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-mustard-500 transition-colors">{contact.full_name}</p>
                              {contact.is_primary && (
                                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-100 dark:border-amber-500/20">Principal</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-bold">{contact.role_title || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{contact.company_name}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{contact.email || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{contact.phone || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${contact.contact_type === 'client' ? 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 border-mustard-200 dark:border-mustard-500/20' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'}`}>
                          {contact.contact_type === 'client' ? 'Cliente' : 'Lead'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleWhatsApp(contact)}
                            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-green-500 dark:hover:text-green-400 transition-all flex items-center justify-center"
                            title="WhatsApp"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4">
                              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleEmail(contact.email)}
                            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 transition-all flex items-center justify-center"
                            title="Enviar E-mail"
                          >
                            <span className="material-symbols-outlined text-sm">mail</span>
                          </button>
                          <button 
                            onClick={() => handleEdit(contact)}
                            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 transition-all flex items-center justify-center"
                            title="Editar Contato"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">Nenhum contato encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div key={contact.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-mustard-50 dark:bg-mustard-500/10 rounded-2xl flex items-center justify-center">
                      <span className="text-lg font-black text-mustard-700 dark:text-mustard-400">{contact.full_name?.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-mustard-500 transition-colors">{contact.full_name}</h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mt-1">{contact.role_title || '—'}</p>
                    </div>
                  </div>
                  {contact.is_primary && (
                    <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-100 dark:border-amber-500/20">
                      Principal
                    </span>
                  )}
                </div>

                <div className="mt-2 pt-4 border-t border-slate-50 dark:border-slate-700 space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px]">apartment</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{contact.company_name}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${contact.contact_type === 'client'
                      ? 'bg-mustard-50 dark:bg-mustard-500/10 text-mustard-600 dark:text-mustard-400 border-mustard-200 dark:border-mustard-500/20'
                      : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'}`}>
                      {contact.contact_type === 'client' ? 'Cliente' : 'Lead'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px]">mail</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{contact.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[16px]">call</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{contact.phone || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                  <button 
                    onClick={() => handleWhatsApp(contact)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-green-500 dark:hover:text-green-400 transition-all"
                    title="WhatsApp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4 h-4">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleEmail(contact.email)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 transition-all"
                    title="Enviar E-mail"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </button>
                  <button 
                    onClick={() => handleEdit(contact)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-mustard-600 dark:hover:text-mustard-400 transition-all"
                    title="Editar Contato"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">
              Nenhum contato encontrado.
            </div>
          )}
        </div>
      )}

      <NewContactModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => {
          fetchContacts();
        }}
      />

      <EditContactModal
        isOpen={isEditModalOpen}
        contact={selectedContact}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          fetchContacts();
        }}
      />

      {/* WhatsApp Glassmorphism Confirm Modal */}
      <AnimatePresence>
        {whatsappConfirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWhatsappConfirmModal({ isOpen: false, phone: '', name: '' })}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-8 h-8">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                Iniciar Conversa
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Deseja abrir o WhatsApp para conversar com <br/><strong className="text-slate-700 dark:text-slate-300">{whatsappConfirmModal.name}</strong>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setWhatsappConfirmModal({ isOpen: false, phone: '', name: '' })}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmWhatsApp}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactsTab;

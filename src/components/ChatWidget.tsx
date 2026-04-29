import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ChatWidget: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for Admin access level
  if (profile?.access_level !== 'Admin') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="material-symbols-outlined">forum</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Assistente C3LOC</h3>
                  <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">{profile?.access_level}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-4">
              <div className="flex flex-col gap-1">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%]">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Olá <strong>{profile.full_name.split(' ')[0]}</strong>! Bem-vindo ao MCP C3Loc. Como posso ajudar hoje?
                  </p>
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">Assistente C3Loc • 15:30</span>
              </div>

              {/* Mock incoming message */}
              <div className="flex flex-col gap-1 items-end">
                <div className="bg-emerald-900 p-3 rounded-2xl rounded-tr-none shadow-md text-white max-w-[85%]">
                  <p className="text-xs leading-relaxed">
                    Gere um excel com todas as OS que estão em aberto.
                  </p>
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mr-1">Você • 15:32</span>
              </div>

              {/* Mock incoming message */}
              <div className="flex flex-col gap-1 items-end">
                <div className="bg-emerald-900 p-3 rounded-2xl rounded-tr-none shadow-md text-white max-w-[85%]">
                  <p className="text-xs leading-relaxed">
                    Altere o periodo da locação 566/2025 para 10/08/2026 a 10/12/2026.
                  </p>
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mr-1">Você • 15:32</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-900/10 focus:border-emerald-900 outline-none transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-emerald-900 text-white flex items-center justify-center hover:bg-emerald-800 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen
          ? 'bg-slate-100 text-slate-600 rotate-90'
          : 'bg-emerald-900 text-white hover:bg-emerald-800'
          }`}
      >
        <span className="material-symbols-outlined text-[28px]">
          {isOpen ? 'close' : 'forum'}
        </span>

        {/* {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
        )} */}
      </motion.button>
    </div>
  );
};

export default ChatWidget;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ChatWidget from '../components/ChatWidget';
import { motion, AnimatePresence } from 'framer-motion';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 lg:pb-8 bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
        <ChatWidget />
      </div>
    </div>
  );
};

export default AppLayout;

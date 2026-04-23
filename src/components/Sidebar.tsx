import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { motion } from 'framer-motion';
import { navItems } from '../constants/navigation';

const Sidebar: React.FC = () => {
  return (
    <motion.nav
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden md:flex flex-col gap-1 p-4 w-64 h-full bg-slate-50 border-r border-slate-200 z-50 shrink-0"
    >
      <div className="mb-8 px-4">
        <h2 className="text-emerald-900 tracking-widest text-2xl font-bold font-inter">RentDesk</h2>
        <p className="text-slate-500 text-[12px] font-normal">Gerenciamento de frotas</p>
      </div>

      <div className="flex flex-col gap-1">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200",
                  isActive
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-emerald-900 hover:bg-slate-200/50"
                )
              }
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
};

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { navItems } from '../constants/navigation';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BottomNav: React.FC = () => {
  return (
    <motion.nav 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group",
              isActive
                ? "text-emerald-900 bg-emerald-50 scale-110"
                : "text-slate-500 hover:text-emerald-700 hover:bg-slate-50"
            )
          }
        >
          <span className="material-symbols-outlined text-[24px]">
            {item.icon}
          </span>
          
          {/* Tooltip */}
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase tracking-tighter">
            {item.name}
            {/* Arrow */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></span>
          </span>
        </NavLink>
      ))}
    </motion.nav>
  );
};

export default BottomNav;

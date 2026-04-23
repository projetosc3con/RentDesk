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
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
    >
      {navItems.map((item, index) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
              isActive
                ? "text-emerald-900 bg-emerald-50 scale-110"
                : "text-slate-500 hover:text-emerald-700"
            )
          }
        >
          <span className="material-symbols-outlined text-[24px]">
            {item.icon}
          </span>
          {/* Label is hidden as requested */}
        </NavLink>
      ))}
    </motion.nav>
  );
};

export default BottomNav;

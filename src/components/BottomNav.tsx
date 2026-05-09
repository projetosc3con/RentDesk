import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { navItems } from '../constants/navigation';
import { useAuth } from '../contexts/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BottomNav: React.FC = () => {
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter(item =>
    !item.allowedRoles || (profile && item.allowedRoles.includes(profile.access_level))
  );

  // Limit to first 5 items on mobile to avoid overcrowding, or keep all as requested?
  // User asked for role management, I'll keep the ones the role allows.

  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.3)] transition-colors duration-300 overflow-x-auto"
    >
      {filteredNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group shrink-0",
              isActive
                ? "text-mustard-600 dark:text-mustard-500 bg-mustard-50 dark:bg-mustard-500/10 scale-110 shadow-sm"
                : "text-slate-400 dark:text-slate-500 hover:text-mustard-500 dark:hover:text-mustard-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )
          }
        >
          <span className="material-symbols-outlined text-[24px]">
            {item.icon}
          </span>


          {/* Tooltip */}
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 uppercase tracking-widest border border-white/10">
            {item.name}
            {/* Arrow */}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 border-r border-b border-white/10"></span>
          </span>
        </NavLink>
      ))}
    </motion.nav>
  );
};

export default BottomNav;

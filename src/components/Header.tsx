import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 bg-white border-b border-slate-200 shrink-0"
    >
      <div className="flex items-center gap-4 flex-1">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-md hidden md:block"
        >
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-900 focus:ring-1 focus:ring-emerald-900 text-sm bg-slate-50 transition-all"
            placeholder="Buscar equipamentos, clientes, ordens..."
          />
        </motion.div>
        
        {/* Mobile menu and logo */}
        <div className="flex items-center gap-3 md:hidden">
           <span className="material-symbols-outlined text-emerald-900 cursor-pointer p-2 hover:bg-slate-50 rounded-full">menu</span>
           <span className="text-xl font-black tracking-tighter text-emerald-900">RentDesk</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </motion.button>
        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-semibold text-slate-900 leading-none">Admin User</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Administrador</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center text-white text-xs font-bold border border-slate-200 shadow-sm overflow-hidden cursor-pointer"
          >
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

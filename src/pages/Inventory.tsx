import { motion } from 'framer-motion';
import { mockEquipments } from '../data/mock';

const Inventory: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estoque de Máquinas</h1>
          <p className="text-slate-500 mt-1">Gerencie a frota de equipamentos, status e disponibilidade.</p>
        </motion.div>
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="flex bg-white rounded-md border border-slate-200 p-1 shadow-sm">
            <button className="p-1.5 bg-slate-100 text-slate-800 rounded shadow-sm">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded">
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>
          <button className="flex items-center gap-2 bg-emerald-900 text-white px-4 py-2 rounded-md shadow-md hover:bg-emerald-800 transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Adicionar Equipamento
          </button>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
      >
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-2">Filtros:</span>
        <button className="px-4 py-1.5 rounded-full border border-slate-200 bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-colors">
          Todos
        </button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Disponível
        </button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-amber-100 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors">
          <span className="material-symbols-outlined text-[16px]">build</span>
          Em Manutenção
        </button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors ml-auto">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Mais Filtros
        </button>
      </motion.div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockEquipments.map((equipment, index) => (
          <motion.div 
            key={equipment.id} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="h-48 relative overflow-hidden bg-slate-100">
              <motion.img 
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
                src={equipment.photo_url} 
                alt={equipment.name} 
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-lg border ${
                equipment.status === 'Disponível' 
                  ? 'bg-emerald-500 text-white border-emerald-400' 
                  : equipment.status === 'Locado'
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-amber-500 text-white border-amber-400'
              }`}>
                <span className="material-symbols-outlined text-[14px]">
                  {equipment.status === 'Disponível' ? 'check_circle' : equipment.status === 'Locado' ? 'schedule' : 'build'}
                </span>
                {equipment.status}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-emerald-900 transition-colors">{equipment.name}</h3>
                <p className="text-sm font-medium text-slate-500">{equipment.model}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 mt-auto border-t border-slate-50 pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Patrimônio</span>
                  <span className="text-sm font-bold text-slate-800">{equipment.asset_number}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ano</span>
                  <span className="text-sm font-bold text-slate-800">{equipment.manufacture_year}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Valor de Mercado</span>
                  <span className="text-sm font-bold text-emerald-900">R$ {equipment.value.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors">Detalhes</button>
                <button className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors ${
                  equipment.status === 'Disponível' 
                    ? 'bg-emerald-900 text-white hover:bg-emerald-800' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}>
                  Locar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Inventory;
